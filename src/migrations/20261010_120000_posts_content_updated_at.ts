import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * S01 (épico seo-tecnico-2026-10) — data de atualização EDITORIAL dos posts.
 *
 * posts.content_updated_at → só muda quando título ou corpo mudam (hook em
 * Posts.ts + src/lib/content-date.ts). Alimenta o <lastmod> do sitemap e o
 * dateModified do schema Article, no lugar do updated_at (que qualquer script
 * altera — ex.: os 25 posts "atualizados" em 07/08/2026 21h23–21h24).
 *
 * Backfill (decisão D3 do cliente, 08/10/2026):
 *  - sdr, funil-de-vendas, processo-comercial, growth-marketing, vendas-b2b
 *    → 2026-10-01T00:00:00-03:00 (otimizações reais do Ferraz)
 *  - demais → data de publicação (fallback created_at)
 * Só preenche linhas ainda nulas → reexecução segura (idempotente).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql`ALTER TABLE "site"."posts" ADD COLUMN IF NOT EXISTS "content_updated_at" timestamp(3) with time zone;`,
  )
  await db.execute(sql`
    UPDATE "site"."posts"
       SET "content_updated_at" = '2026-10-01T00:00:00-03:00'::timestamptz
     WHERE "content_updated_at" IS NULL
       AND "slug" IN ('sdr', 'funil-de-vendas', 'processo-comercial', 'growth-marketing', 'vendas-b2b');
  `)
  await db.execute(sql`
    UPDATE "site"."posts"
       SET "content_updated_at" = COALESCE("publicado_em", "created_at")
     WHERE "content_updated_at" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site"."posts" DROP COLUMN IF EXISTS "content_updated_at";`)
}
