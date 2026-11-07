/**
 * Testa a migration 20261107_120000_blog_categories no banco REAL dentro de uma
 * transação com ROLLBACK (nada é gravado). Mostra o resultado esperado da Tarefa 3.
 *   npx tsx scripts/test-migration-categories.ts
 */
import dotenv from 'dotenv'
import pg from 'pg'
import { upStatements, CATEGORIES } from '../src/migrations/20261107_120000_blog_categories'

dotenv.config({ path: '.env.local', override: true, quiet: true })
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
await c.connect()
try {
  await c.query('BEGIN')
  for (const s of upStatements()) await c.query(s)
  // 2ª execução: tem que ser inócua (idempotente).
  for (const s of upStatements()) await c.query(s)
  const { rows } = await c.query(`
    select c.slug, c.nome, c.ordem, count(p.id) filter (where p.status = 'published') as publicados
      from site.categories c left join site.posts p on p.categoria_id = c.id
     group by c.id order by c.ordem`)
  console.table(rows)
  const sem = await c.query(`select slug from site.posts where status = 'published' and categoria_id is null`)
  const opt = await c.query(`select count(*)::int n from site.posts where llms_optional`)
  const esperado = CATEGORIES.reduce((n, x) => n + x.posts.length, 0)
  console.log({ postsSemCategoria: sem.rows.map((r) => r.slug), llmsOptional: opt.rows[0].n, postsNaTabela: esperado })
} finally {
  await c.query('ROLLBACK')
  await c.end()
  console.log('ROLLBACK — nada foi gravado.')
}
