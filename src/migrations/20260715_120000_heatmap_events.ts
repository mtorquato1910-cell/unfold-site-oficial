import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Mapa de calor visual (overlay tipo Clarity/Hotjar) — armazenamento + agregação.
 *
 * Cria `site.heatmap_events` (schema rico: coordenadas relativas, seletor estável,
 * device, scroll depth, eventos derivados) e as funções de binning que agregam no
 * Postgres — nunca trazendo linhas cruas para o browser.
 *
 * Segurança: NÃO habilitamos RLS aqui de propósito. Todo acesso é server-side pelo
 * pool do Payload (dono do schema): a ingestão passa por /api/heatmap/ingest
 * (validada por Zod) e a leitura por /api/heatmap/points (protegida por getSession).
 * O Postgres nunca é exposto a cliente anônimo direto, então RLS não agregaria
 * segurança — e habilitá-lo sobre o role dono do pool poderia bloquear a ingestão
 * em produção. A defesa fica na camada de API.
 *
 * IF NOT EXISTS + CREATE OR REPLACE → idempotente, seguro para re-execução (push).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site"."heatmap_events" (
      "id"               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      "session_id"       varchar NOT NULL,
      "lead_hash"        varchar,
      "page_path"        varchar NOT NULL,
      "event_type"       varchar NOT NULL,
      "device"           varchar NOT NULL,
      "viewport_w"       integer NOT NULL,
      "viewport_h"       integer NOT NULL,
      "doc_w"            integer NOT NULL,
      "doc_h"            integer NOT NULL,
      "x_rel"            real,
      "y_abs"            integer,
      "y_rel"            real,
      "selector"         varchar,
      "el_tag"           varchar,
      "el_text"          varchar,
      "off_x_pct"        real,
      "off_y_pct"        real,
      "scroll_depth_pct" real,
      "created_at"       timestamptz NOT NULL DEFAULT now()
    );
  `)

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "heatmap_events_path_device_created_idx" ON "site"."heatmap_events" ("page_path", "device", "created_at" DESC);`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "heatmap_events_type_created_idx" ON "site"."heatmap_events" ("event_type", "created_at" DESC);`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "heatmap_events_session_idx" ON "site"."heatmap_events" ("session_id");`)

  // ── RPC: pontos agregados (binning) ──────────────────────────────────────
  // Agrupa por coluna do grid horizontal (x_rel * p_grid) e faixa vertical
  // NORMALIZADA (y_rel * 1000 → milésimos da altura). Usar y_rel (e não y_abs)
  // é o que faz o overlay escalar corretamente sobre a altura RENDERIZADA no
  // iframe, independente da altura do documento no browser do visitante.
  // O fator 1000 casa com Y_BINS no HeatmapCanvas.
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION "site".get_heatmap_points(
      p_path       text,
      p_device     text,
      p_from       timestamptz,
      p_to         timestamptz,
      p_event_type text DEFAULT 'click',
      p_grid       int  DEFAULT 200
    )
    RETURNS TABLE (gx int, gy int, weight int)
    LANGUAGE sql STABLE AS $$
      SELECT
        floor(x_rel * p_grid)::int   AS gx,
        floor(y_rel * 1000)::int      AS gy,
        count(*)::int                AS weight
      FROM "site"."heatmap_events"
      WHERE page_path = p_path
        AND device = p_device
        AND created_at >= p_from
        AND created_at <  p_to
        AND x_rel IS NOT NULL
        AND y_rel IS NOT NULL
        AND (
          (p_event_type = 'click' AND event_type IN ('click','rage_click','dead_click','error_click'))
          OR (p_event_type <> 'click' AND event_type = p_event_type)
        )
      GROUP BY 1, 2;
    $$;
  `)

  // ── RPC: agregado por seletor (para reancoragem no DOM renderizado) ───────
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION "site".get_heatmap_selectors(
      p_path       text,
      p_device     text,
      p_from       timestamptz,
      p_to         timestamptz,
      p_event_type text DEFAULT 'click'
    )
    RETURNS TABLE (selector text, off_x real, off_y real, weight int)
    LANGUAGE sql STABLE AS $$
      SELECT
        selector,
        avg(off_x_pct)::real AS off_x,
        avg(off_y_pct)::real AS off_y,
        count(*)::int        AS weight
      FROM "site"."heatmap_events"
      WHERE page_path = p_path
        AND device = p_device
        AND created_at >= p_from
        AND created_at <  p_to
        AND selector IS NOT NULL AND selector <> ''
        AND (
          (p_event_type = 'click' AND event_type IN ('click','rage_click','dead_click','error_click'))
          OR (p_event_type <> 'click' AND event_type = p_event_type)
        )
      GROUP BY selector;
    $$;
  `)

  // ── RPC: rotas com contagem de eventos (popular o seletor de página) ──────
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION "site".get_heatmap_pages(
      p_from       timestamptz,
      p_to         timestamptz,
      p_event_type text DEFAULT 'click'
    )
    RETURNS TABLE (page_path text, events int)
    LANGUAGE sql STABLE AS $$
      SELECT page_path, count(*)::int AS events
      FROM "site"."heatmap_events"
      WHERE created_at >= p_from
        AND created_at <  p_to
        AND (
          p_event_type IS NULL
          OR (p_event_type = 'click' AND event_type IN ('click','rage_click','dead_click','error_click'))
          OR (p_event_type <> 'click' AND event_type = p_event_type)
        )
      GROUP BY page_path
      ORDER BY events DESC;
    $$;
  `)

  // ── RPC: distribuição de rolagem (linha da dobra) ─────────────────────────
  // Para cada sessão, considera o MAIOR scroll_depth_pct na página; devolve
  // quantas sessões alcançaram cada faixa de 5% (0..100).
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION "site".get_heatmap_scroll(
      p_path   text,
      p_device text,
      p_from   timestamptz,
      p_to     timestamptz
    )
    RETURNS TABLE (depth_pct int, sessions int)
    LANGUAGE sql STABLE AS $$
      WITH per_session AS (
        SELECT session_id, max(scroll_depth_pct) AS max_depth
        FROM "site"."heatmap_events"
        WHERE page_path = p_path
          AND device = p_device
          AND created_at >= p_from
          AND created_at <  p_to
          AND scroll_depth_pct IS NOT NULL
        GROUP BY session_id
      ),
      buckets AS (
        SELECT generate_series(0, 100, 5) AS depth_pct
      )
      SELECT
        b.depth_pct,
        count(ps.session_id)::int AS sessions
      FROM buckets b
      LEFT JOIN per_session ps
        ON ps.max_depth * 100.0 >= b.depth_pct
      GROUP BY b.depth_pct
      ORDER BY b.depth_pct;
    $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP FUNCTION IF EXISTS "site".get_heatmap_points(text, text, timestamptz, timestamptz, text, int);`)
  await db.execute(sql`DROP FUNCTION IF EXISTS "site".get_heatmap_selectors(text, text, timestamptz, timestamptz, text);`)
  await db.execute(sql`DROP FUNCTION IF EXISTS "site".get_heatmap_pages(timestamptz, timestamptz, text);`)
  await db.execute(sql`DROP FUNCTION IF EXISTS "site".get_heatmap_scroll(text, text, timestamptz, timestamptz);`)
  await db.execute(sql`DROP TABLE IF EXISTS "site"."heatmap_events";`)
}
