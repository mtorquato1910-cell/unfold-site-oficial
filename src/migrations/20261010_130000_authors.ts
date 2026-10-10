import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * S07 (épico seo-tecnico-2026-10) — autores reais dos artigos.
 *
 *  - site.authors (collection `authors`)
 *  - site.posts_rels: tabela de relações hasMany de posts (posts.autores → authors).
 *    Ainda não existia (posts não tinha relação hasMany).
 *  - site.posts.revisor_id (relação simples → authors)
 *  - payload_locked_documents_rels.authors_id: OBRIGATÓRIO para toda collection nova —
 *    sem ela, qualquer escrita no Payload falha (ver 20260710_140000_fix_locked_docs…).
 *  - Seed: Gabriel Calheiros e Davi Brito + autoria dos posts conforme a planilha
 *    Autores_Artigos_Blog_Unfold.xlsx (09/10/2026): Davi assina mídia paga (6 posts),
 *    Gabriel os demais. Mexe só em posts_rels → updated_at/content_updated_at dos posts
 *    NÃO mudam (não é edição de conteúdo).
 *
 * Idempotente: IF NOT EXISTS, guardas em DO block, ON CONFLICT e NOT EXISTS.
 */
const DAVI_SLUGS = [
  'como-anunciar-minha-empresa-no-google',
  'black-friday-b2b',
  'linkedin-ads',
  'chatgpt-ads',
  'agencia-de-trafego-ou-assessoria-de-growth',
  'quanto-investir-em-trafego-pago-para-lancamento-imobiliario',
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site"."authors" (
      "id" serial PRIMARY KEY NOT NULL,
      "nome" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "cargo" varchar,
      "bio_curta" varchar,
      "bio_completa" varchar,
      "foto_id" integer,
      "foto_url" varchar,
      "linkedin" varchar,
      "perfis" jsonb,
      "formacao" varchar,
      "experiencia" varchar,
      "temas" jsonb,
      "registro_profissional" varchar,
      "ativo" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "site"."authors"
        ADD CONSTRAINT "authors_foto_id_media_id_fk"
        FOREIGN KEY ("foto_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "authors_slug_idx" ON "site"."authors" USING btree ("slug");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "authors_foto_idx" ON "site"."authors" USING btree ("foto_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "authors_updated_at_idx" ON "site"."authors" USING btree ("updated_at");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "authors_created_at_idx" ON "site"."authors" USING btree ("created_at");`)

  // ── posts_rels (relações hasMany de posts) ─────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site"."posts_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "authors_id" integer
    );
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "site"."posts_rels"
        ADD CONSTRAINT "posts_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "site"."posts"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "site"."posts_rels"
        ADD CONSTRAINT "posts_rels_authors_fk"
        FOREIGN KEY ("authors_id") REFERENCES "site"."authors"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "posts_rels_order_idx" ON "site"."posts_rels" USING btree ("order");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "posts_rels_parent_idx" ON "site"."posts_rels" USING btree ("parent_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "posts_rels_path_idx" ON "site"."posts_rels" USING btree ("path");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "posts_rels_authors_id_idx" ON "site"."posts_rels" USING btree ("authors_id");`)

  // ── posts.revisor_id ──────────────────────────────────────────────────
  await db.execute(sql`ALTER TABLE "site"."posts" ADD COLUMN IF NOT EXISTS "revisor_id" integer;`)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "site"."posts"
        ADD CONSTRAINT "posts_revisor_id_authors_id_fk"
        FOREIGN KEY ("revisor_id") REFERENCES "site"."authors"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "posts_revisor_idx" ON "site"."posts" USING btree ("revisor_id");`)

  // ── Lock de documentos (obrigatório para toda collection) ─────────────
  await db.execute(sql`ALTER TABLE "site"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "authors_id" integer;`)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "site"."payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_authors_fk"
        FOREIGN KEY ("authors_id") REFERENCES "site"."authors"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_authors_id_idx"
    ON "site"."payload_locked_documents_rels" USING btree ("authors_id");
  `)

  // ── Seed: autores (sem bio — P6 pendente do cliente; nada inventado) ───
  await db.execute(sql`
    INSERT INTO "site"."authors" ("nome", "slug", "foto_url", "ativo")
    VALUES
      ('Gabriel Calheiros', 'gabriel-calheiros', '/autores/gabriel-calheiros.webp', true),
      ('Davi Brito', 'davi-brito', '/autores/davi-brito.webp', true)
    ON CONFLICT ("slug") DO NOTHING;
  `)

  // ── Seed: autoria dos posts (só posts ainda sem autor) ────────────────
  await db.execute(sql`
    INSERT INTO "site"."posts_rels" ("order", "parent_id", "path", "authors_id")
    SELECT 1, p."id", 'autores', a."id"
      FROM "site"."posts" p
      JOIN "site"."authors" a
        ON a."slug" = CASE WHEN p."slug" IN (${sql.join(DAVI_SLUGS.map((s) => sql`${s}`), sql`, `)})
                           THEN 'davi-brito' ELSE 'gabriel-calheiros' END
     WHERE NOT EXISTS (
       SELECT 1 FROM "site"."posts_rels" r WHERE r."parent_id" = p."id" AND r."path" = 'autores'
     );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "site"."payload_locked_documents_rels_authors_id_idx";`)
  await db.execute(sql`ALTER TABLE "site"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_authors_fk";`)
  await db.execute(sql`ALTER TABLE "site"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "authors_id";`)
  await db.execute(sql`ALTER TABLE "site"."posts" DROP CONSTRAINT IF EXISTS "posts_revisor_id_authors_id_fk";`)
  await db.execute(sql`ALTER TABLE "site"."posts" DROP COLUMN IF EXISTS "revisor_id";`)
  await db.execute(sql`DROP TABLE IF EXISTS "site"."posts_rels";`)
  await db.execute(sql`DROP TABLE IF EXISTS "site"."authors";`)
}
