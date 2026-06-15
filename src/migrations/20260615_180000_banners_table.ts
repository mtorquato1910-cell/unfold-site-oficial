import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Banners internos do blog (ferramentas / diagnóstico / cases).
 *
 * Cria a tabela `site.banners` com FK opcional para `site.media` (imagem).
 * IF NOT EXISTS torna a migration idempotente (segura para re-execução / push).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site"."banners" (
      "id" serial PRIMARY KEY NOT NULL,
      "titulo" varchar NOT NULL,
      "tag" varchar,
      "descricao" varchar,
      "cta_label" varchar DEFAULT 'Saiba mais',
      "link" varchar NOT NULL,
      "imagem_id" integer,
      "ativo" boolean DEFAULT true,
      "ordem" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "site"."banners"
        ADD CONSTRAINT "banners_imagem_id_media_id_fk"
        FOREIGN KEY ("imagem_id") REFERENCES "site"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)

  await db.execute(sql`CREATE INDEX IF NOT EXISTS "banners_imagem_idx" ON "site"."banners" ("imagem_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "banners_ativo_idx" ON "site"."banners" ("ativo");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "banners_updated_at_idx" ON "site"."banners" ("updated_at");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "banners_created_at_idx" ON "site"."banners" ("created_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "site"."banners";`)
}
