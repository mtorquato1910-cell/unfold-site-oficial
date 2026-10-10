/**
 * Trava de segurança do build (épico seo-tecnico-2026-10, achado do QA da S01).
 *
 * O `payload migrate` do vercel-build.sh roda com `|| echo [skip]` (por causa do
 * prompt interativo do dev push) e ENGOLE falhas. Se uma migration nova não for
 * aplicada, o código novo consulta colunas inexistentes: o sitemap sai sem posts
 * (o erro cai no catch e fica 1h no cache ISR) e as páginas de post quebram.
 *
 * Este script confere que as colunas/tabelas exigidas pelo código existem e, se
 * faltar alguma, FALHA o build — a Vercel mantém o deploy anterior no ar.
 * Somente leitura. Ao criar uma migration que o código passa a exigir, inclua aqui.
 */
import pg from 'pg'

/** [schema, tabela, coluna] — coluna `null` = só exige a tabela. */
const REQUIRED = [
  ['site', 'posts', 'content_updated_at'], // S01
  ['site', 'authors', null], // S07
  ['site', 'posts_rels', 'authors_id'], // S07
  ['site', 'posts', 'revisor_id'], // S07
  ['site', 'payload_locked_documents_rels', 'authors_id'], // S07 (obrigatória p/ toda collection)
  ['site', 'cases', 'conteudo_html'], // S10
  ['site', 'cases', 'content_updated_at'], // S10
  ['site', 'cases', 'faq'], // S10
]

const url = process.env.DATABASE_URL
if (!url) {
  console.warn('[verify-schema] DATABASE_URL ausente — verificação pulada.')
  process.exit(0)
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
try {
  await client.connect()
  const missing = []
  for (const [schema, table, column] of REQUIRED) {
    const { rowCount } = column
      ? await client.query(
          `select 1 from information_schema.columns where table_schema = $1 and table_name = $2 and column_name = $3`,
          [schema, table, column],
        )
      : await client.query(
          `select 1 from information_schema.tables where table_schema = $1 and table_name = $2`,
          [schema, table],
        )
    if (!rowCount) missing.push(column ? `${schema}.${table}.${column}` : `${schema}.${table}`)
  }
  if (missing.length) {
    console.error(`[verify-schema] FALTANDO no banco: ${missing.join(', ')}`)
    console.error('[verify-schema] A migration correspondente não foi aplicada. Abortando o build.')
    process.exit(1)
  }
  console.log(`[verify-schema] OK — ${REQUIRED.length} item(ns) conferido(s).`)
} catch (e) {
  console.error('[verify-schema] Não foi possível conferir o schema:', e.message)
  process.exit(1)
} finally {
  await client.end().catch(() => {})
}
