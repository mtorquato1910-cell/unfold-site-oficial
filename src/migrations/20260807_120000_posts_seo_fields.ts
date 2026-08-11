import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SEO / resumo de busca por post (item 1.5 da auditoria).
 *  - posts.meta_title       → título de busca (≤60, opcional; fallback = titulo)
 *  - posts.meta_description → resumo de busca (≤155, separado do resumo do card)
 *
 * Estes campos já eram coletados no form do painel, mas não existiam no schema
 * nem no mapPost — eram descartados no save. Agora são persistidos.
 * IF NOT EXISTS torna a migration idempotente (segura se o schema já foi via push).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site"."posts" ADD COLUMN IF NOT EXISTS "meta_title" varchar;`)
  await db.execute(sql`ALTER TABLE "site"."posts" ADD COLUMN IF NOT EXISTS "meta_description" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site"."posts" DROP COLUMN IF EXISTS "meta_title";`)
  await db.execute(sql`ALTER TABLE "site"."posts" DROP COLUMN IF EXISTS "meta_description";`)
}
