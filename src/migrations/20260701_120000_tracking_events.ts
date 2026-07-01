import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Tabela de eventos de navegação (mapa de calor / jornada de leads).
 *
 * Cria `site.tracking_events`. IF NOT EXISTS + índices idempotentes → segura para
 * re-execução (push). Sem enums/FKs de propósito (event_type é texto livre) para
 * manter a migration simples e robusta em produção.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site"."tracking_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "event_type" varchar NOT NULL,
      "path" varchar,
      "session_id" varchar,
      "lead_hash" varchar,
      "referrer" varchar,
      "element" varchar,
      "x" numeric,
      "y" numeric,
      "viewport_w" numeric,
      "metadata" jsonb,
      "ip_address" varchar,
      "user_agent" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "tracking_events_event_type_idx" ON "site"."tracking_events" ("event_type");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "tracking_events_path_idx" ON "site"."tracking_events" ("path");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "tracking_events_session_id_idx" ON "site"."tracking_events" ("session_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "tracking_events_lead_hash_idx" ON "site"."tracking_events" ("lead_hash");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "tracking_events_created_at_idx" ON "site"."tracking_events" ("created_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "site"."tracking_events";`)
}
