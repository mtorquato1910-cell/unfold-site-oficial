import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Editor rico (TipTap) — campos HTML de conteúdo.
 *
 *  - posts.conteudo_html        → corpo do artigo com imagens/tabelas/YouTube
 *  - cases.challenge_html       → desafio formatado
 *  - cases.solution_html        → solução formatada
 *  - testimonials.depoimento_html → depoimento com formatação básica
 *
 * IF NOT EXISTS torna a migration idempotente — segura mesmo se o schema já foi
 * sincronizado via dev push contra o Supabase.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site"."posts" ADD COLUMN IF NOT EXISTS "conteudo_html" varchar;`)
  await db.execute(sql`ALTER TABLE "site"."cases" ADD COLUMN IF NOT EXISTS "challenge_html" varchar;`)
  await db.execute(sql`ALTER TABLE "site"."cases" ADD COLUMN IF NOT EXISTS "solution_html" varchar;`)
  await db.execute(sql`ALTER TABLE "site"."testimonials" ADD COLUMN IF NOT EXISTS "depoimento_html" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site"."posts" DROP COLUMN IF EXISTS "conteudo_html";`)
  await db.execute(sql`ALTER TABLE "site"."cases" DROP COLUMN IF EXISTS "challenge_html";`)
  await db.execute(sql`ALTER TABLE "site"."cases" DROP COLUMN IF EXISTS "solution_html";`)
  await db.execute(sql`ALTER TABLE "site"."testimonials" DROP COLUMN IF EXISTS "depoimento_html";`)
}
