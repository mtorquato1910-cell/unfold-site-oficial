import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Perguntas frequentes por post (item 1.4 da auditoria).
 *  - posts.faq (jsonb) → array de { pergunta, resposta }, gera FAQPage + seção visível.
 *
 * IF NOT EXISTS torna a migration idempotente.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site"."posts" ADD COLUMN IF NOT EXISTS "faq" jsonb;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site"."posts" DROP COLUMN IF EXISTS "faq";`)
}
