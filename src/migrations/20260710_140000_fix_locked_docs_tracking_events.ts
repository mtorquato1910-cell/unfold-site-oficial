import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Fix: a migration 20260701_120000_tracking_events criou a tabela `tracking_events`
 * mas esqueceu de adicionar a coluna de vínculo `tracking_events_id` em
 * `payload_locked_documents_rels` (com FK + índice), obrigatória para toda collection.
 *
 * Sem essa coluna, a query de lock do Payload referencia `tracking_events_id`
 * (coluna inexistente) e FALHA em qualquer operação de escrita — inclusive o upload
 * de mídia, que subia o arquivo pro storage mas revertia o registro (id fantasma),
 * quebrando depois o INSERT de posts pela FK imagem_destaque.
 *
 * Idempotente (IF NOT EXISTS / guardas em DO block) → segura para push e re-execução.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site"."payload_locked_documents_rels"
    ADD COLUMN IF NOT EXISTS "tracking_events_id" integer;
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'site'
          AND table_name = 'payload_locked_documents_rels'
          AND constraint_name = 'payload_locked_documents_rels_tracking_events_fk'
      ) THEN
        ALTER TABLE "site"."payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_tracking_events_fk"
        FOREIGN KEY ("tracking_events_id")
        REFERENCES "site"."tracking_events"("id")
        ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tracking_events_id_idx"
    ON "site"."payload_locked_documents_rels" USING btree ("tracking_events_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "site"."payload_locked_documents_rels_tracking_events_id_idx";`)
  await db.execute(sql`
    ALTER TABLE "site"."payload_locked_documents_rels"
    DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_tracking_events_fk";
  `)
  await db.execute(sql`
    ALTER TABLE "site"."payload_locked_documents_rels"
    DROP COLUMN IF EXISTS "tracking_events_id";
  `)
}
