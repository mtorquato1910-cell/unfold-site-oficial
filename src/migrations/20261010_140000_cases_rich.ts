import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * S10 (épico seo-tecnico-2026-10) — cases publicados "da mesma forma dos posts".
 *
 * Novas colunas em site.cases: conteudo_html (texto corrido do editor), excerpt
 * (resumo), meta_title, meta_description, faq (jsonb) e content_updated_at (mesma
 * regra editorial dos posts — S01).
 *
 * Migração de dados (idempotente, só linhas ainda sem conteudo_html): Desafio,
 * Solução e Resultados viram seções H2 de um único texto; tagline → excerpt;
 * content_updated_at ← published_at (fallback created_at). Em 10/10/2026 a tabela
 * tinha 0 cases — a conversão fica pronta para qualquer case criado antes do deploy.
 * Os campos antigos continuam no banco (rollback seguro).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site"."cases" ADD COLUMN IF NOT EXISTS "conteudo_html" varchar;`)
  await db.execute(sql`ALTER TABLE "site"."cases" ADD COLUMN IF NOT EXISTS "excerpt" varchar;`)
  await db.execute(sql`ALTER TABLE "site"."cases" ADD COLUMN IF NOT EXISTS "meta_title" varchar;`)
  await db.execute(sql`ALTER TABLE "site"."cases" ADD COLUMN IF NOT EXISTS "meta_description" varchar;`)
  await db.execute(sql`ALTER TABLE "site"."cases" ADD COLUMN IF NOT EXISTS "faq" jsonb;`)
  await db.execute(
    sql`ALTER TABLE "site"."cases" ADD COLUMN IF NOT EXISTS "content_updated_at" timestamp(3) with time zone;`,
  )

  // Funções auxiliares temporárias: escapam texto puro para HTML e viram quebras de
  // linha em parágrafos (antes a página usava whitespace-pre-line). Removidas ao final.
  await db.execute(sql.raw(`
    CREATE OR REPLACE FUNCTION "site".pg_temp_esc(t text) RETURNS text LANGUAGE sql IMMUTABLE AS $f$
      SELECT replace(replace(replace(t, '&', '&amp;'), '<', '&lt;'), '>', '&gt;')
    $f$;
    CREATE OR REPLACE FUNCTION "site".pg_temp_text_to_html(t text) RETURNS text LANGUAGE sql IMMUTABLE AS $f$
      SELECT '<p>' || regexp_replace("site".pg_temp_esc(t), '[' || chr(13) || chr(10) || ']+', '</p><p>', 'g') || '</p>'
    $f$;
  `))

  // Desafio + Solução (HTML ou texto) + Resultados (lista) → conteudo_html.
  await db.execute(sql`
    UPDATE "site"."cases" c
       SET "conteudo_html" = NULLIF(CONCAT_WS('',
         CASE WHEN COALESCE(NULLIF(c."challenge_html", ''), c."challenge", '') <> ''
              THEN '<h2>Desafio</h2>' || COALESCE(NULLIF(c."challenge_html", ''), "site".pg_temp_text_to_html(c."challenge")) END,
         CASE WHEN COALESCE(NULLIF(c."solution_html", ''), c."solution", '') <> ''
              THEN '<h2>Solução</h2>' || COALESCE(NULLIF(c."solution_html", ''), "site".pg_temp_text_to_html(c."solution")) END,
         (SELECT '<h2>Resultados</h2><ul>' ||
                 STRING_AGG('<li><strong>' || "site".pg_temp_esc(r."valor") || '</strong> ' || "site".pg_temp_esc(r."metrica") ||
                            COALESCE(' — ' || "site".pg_temp_esc(NULLIF(r."contexto", '')), '') || '</li>', '' ORDER BY r."_order") ||
                 '</ul>'
            FROM "site"."cases_results" r
           WHERE r."_parent_id" = c."id")
       ), '')
     WHERE c."conteudo_html" IS NULL;
  `)
  await db.execute(sql.raw(`DROP FUNCTION IF EXISTS "site".pg_temp_text_to_html(text); DROP FUNCTION IF EXISTS "site".pg_temp_esc(text);`))
  await db.execute(sql`
    UPDATE "site"."cases" SET "excerpt" = "tagline"
     WHERE "excerpt" IS NULL AND COALESCE("tagline", '') <> '';
  `)
  await db.execute(sql`
    UPDATE "site"."cases" SET "content_updated_at" = COALESCE("published_at", "created_at")
     WHERE "content_updated_at" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const col of ['conteudo_html', 'excerpt', 'meta_title', 'meta_description', 'faq', 'content_updated_at']) {
    await db.execute(sql.raw(`ALTER TABLE "site"."cases" DROP COLUMN IF EXISTS "${col}";`))
  }
}
