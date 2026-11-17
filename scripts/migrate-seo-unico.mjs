/**
 * Migração da seção única de SEO + edição rápida (manual do desenvolvedor de
 * 13/11/2026; respostas do cliente em 17/11/2026).
 *
 * O que faz (só em registros com o campo VAZIO — nada preenchido é sobrescrito):
 *  1. posts.meta_title  ← o title que o Google recebe hoje: "<titulo> | Blog | Unfold Growth"
 *  2. posts.meta_description ← resumo (é o que sai hoje no <meta name="description">)
 *  3. cases.meta_title  ← "<title> | Cases | Unfold Growth"
 *  4. cases.meta_description ← excerpt / tagline / title (mesmo fallback da página)
 *  5. posts.revisor_id  ← null ("retira revisão, sem necessidade")
 *  6. posts.status pending_review → draft (status saiu do painel)
 *
 * Resultado no HTML: idêntico ao de hoje (os valores copiados são os que o fallback
 * já gerava). SQL direto, sem hooks do Payload: não mexe em content_updated_at nem
 * em updated_at (não é mudança editorial — o sitemap não muda).
 *
 * Uso:
 *   node scripts/migrate-seo-unico.mjs           # simulação: lista o que mudaria
 *   node scripts/migrate-seo-unico.mjs --apply   # grava (em transação)
 */
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local', override: true })
const APPLY = process.argv.includes('--apply')
const empty = (col) => `(${col} is null or btrim(${col}) = '')`

const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
await c.connect()
await c.query('set search_path to site')
const q = async (sql, params) => (await c.query(sql, params)).rows

const steps = [
  {
    name: 'posts.meta_title',
    preview: `select id, slug, titulo || ' | Blog | Unfold Growth' as novo from posts where ${empty('meta_title')}`,
    apply: `update posts set meta_title = titulo || ' | Blog | Unfold Growth' where ${empty('meta_title')}`,
  },
  {
    name: 'posts.meta_description',
    preview: `select id, slug, resumo as novo from posts where ${empty('meta_description')} and not ${empty('resumo')}`,
    apply: `update posts set meta_description = resumo where ${empty('meta_description')} and not ${empty('resumo')}`,
  },
  {
    name: 'cases.meta_title',
    preview: `select id, slug, title || ' | Cases | Unfold Growth' as novo from cases where ${empty('meta_title')}`,
    apply: `update cases set meta_title = title || ' | Cases | Unfold Growth' where ${empty('meta_title')}`,
  },
  {
    name: 'cases.meta_description',
    preview: `select id, slug, coalesce(nullif(btrim(excerpt), ''), nullif(btrim(tagline), ''), title) as novo from cases where ${empty('meta_description')}`,
    apply: `update cases set meta_description = coalesce(nullif(btrim(excerpt), ''), nullif(btrim(tagline), ''), title) where ${empty('meta_description')}`,
  },
  {
    name: 'posts.revisor_id → null',
    preview: `select id, slug, revisor_id as novo from posts where revisor_id is not null`,
    apply: `update posts set revisor_id = null where revisor_id is not null`,
  },
  {
    name: 'posts.status pending_review → draft',
    preview: `select id, slug, status as novo from posts where status = 'pending_review'`,
    apply: `update posts set status = 'draft' where status = 'pending_review'`,
  },
]

try {
  if (APPLY) await c.query('begin')
  for (const step of steps) {
    const rows = await q(step.preview)
    console.log(`\n── ${step.name}: ${rows.length} registro(s)`)
    for (const r of rows) console.log(`   #${r.id} ${r.slug} → ${String(r.novo).slice(0, 100)}`)
    if (APPLY && rows.length) {
      const res = await c.query(step.apply)
      console.log(`   gravado: ${res.rowCount}`)
    }
  }
  if (APPLY) await c.query('commit')
  console.log(APPLY ? '\nMigração aplicada.' : '\nSimulação — nada foi gravado. Rode com --apply para gravar.')
} catch (e) {
  if (APPLY) await c.query('rollback')
  console.error('Falhou (rollback):', e.message)
  process.exitCode = 1
} finally {
  await c.end()
}
