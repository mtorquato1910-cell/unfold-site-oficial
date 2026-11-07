/**
 * Tarefa 1 do relatório técnico de SEO (06/11/2026) — remove o nofollow dos links do
 * corpo dos posts. Regra única em src/lib/link-attrs.ts (a mesma aplicada no save):
 * interno → relativo, sem rel/target; externo → target=_blank + rel="noopener".
 *
 * SEGURANÇA (mesmo padrão do S03 — scripts/remove-broken-links.ts):
 *   - Padrão = DRY-RUN: só lê e imprime o resumo. Não grava nada.
 *   - --apply: grava backup completo (com as datas) num arquivo que nunca é
 *     sobrescrito e atualiza via Payload com context.technicalEdit = true → NÃO
 *     altera content_updated_at (conferido ao final).
 *   - Idempotente: rodar de novo só pega o que ainda estiver fora da regra.
 *   - --rollback <arquivo-de-backup.json>: restaura o conteudo_html.
 *
 * USO:
 *   npx tsx scripts/normalize-content-links.ts            # prévia
 *   npx tsx scripts/normalize-content-links.ts --apply    # grava
 *   npx tsx scripts/normalize-content-links.ts --rollback backups/posts-html-before-links-<carimbo>.json
 */
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { JSDOM } from 'jsdom'
import { linkKind, normalizeLinkAttribs } from '../src/lib/link-attrs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true, quiet: true })
dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true })

const APPLY = process.argv.includes('--apply')
const rbIdx = process.argv.indexOf('--rollback')
const ROLLBACK = rbIdx >= 0 ? process.argv[rbIdx + 1] : undefined
if (rbIdx >= 0 && !ROLLBACK) {
  console.error('Uso: --rollback <arquivo-de-backup.json>')
  process.exit(1)
}
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const backupsDir = path.join(projectRoot, 'backups')

type Row = { id: number; slug: string; conteudo_html: string }
type BackupRow = Row & { content_updated_at: string | null; updated_at: string }
type Stats = { internal: number; external: number; other: number }
type Result = { id: number; slug: string; stats: Stats; nextHtml: string }

/** Aplica a regra a cada <a>; devolve o HTML novo e quantos links mudaram, por tipo. */
function transformHtml(html: string): { html: string; stats: Stats } {
  const doc: Document = new JSDOM(`<body>${html}</body>`).window.document
  const stats: Stats = { internal: 0, external: 0, other: 0 }
  for (const a of Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    const before: Record<string, string> = {}
    for (const at of Array.from(a.attributes) as Attr[]) before[at.name] = at.value
    const after = normalizeLinkAttribs(before)
    const same =
      Object.keys(before).length === Object.keys(after).length &&
      Object.entries(after).every(([k, v]) => before[k] === v)
    if (same) continue
    for (const k of Object.keys(before)) if (!(k in after)) a.removeAttribute(k)
    for (const [k, v] of Object.entries(after)) a.setAttribute(k, v)
    const kind = linkKind(before.href ?? '')
    if (kind === 'internal') stats.internal++
    else if (kind === 'external') stats.external++
    else stats.other++
  }
  return { html: doc.body.innerHTML, stats }
}

async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    const { rows } = await client.query(sql, params)
    return rows as T[]
  } finally {
    await client.end()
  }
}

const readBackupRows = (ids: number[]) =>
  query<BackupRow>(
    `select id, slug, conteudo_html, content_updated_at, updated_at from site.posts where id = any($1::int[])`,
    [ids],
  )

let payloadPromise: Promise<any> | undefined
function getPayloadOnce(): Promise<any> {
  payloadPromise ??= (async () => {
    const { getPayload } = await import('payload')
    const { default: config } = await import('../payload.config')
    return getPayload({ config })
  })()
  return payloadPromise
}

async function payloadUpdate(id: number, conteudo_html: string) {
  const payload = await getPayloadOnce()
  await payload.update({
    collection: 'posts',
    id,
    data: { conteudo_html },
    // Ajuste técnico: NÃO altera content_updated_at (S01).
    context: { technicalEdit: true },
  })
}

fs.mkdirSync(backupsDir, { recursive: true })

if (ROLLBACK) {
  const backup = JSON.parse(fs.readFileSync(path.resolve(projectRoot, ROLLBACK), 'utf8')) as Row[]
  let failedCount = 0
  for (const b of backup) {
    try {
      await payloadUpdate(b.id, b.conteudo_html)
      console.log(`restaurado /blog/${b.slug}`)
    } catch (e: any) {
      failedCount++
      console.error(`FALHOU /blog/${b.slug}: ${e?.message}`)
    }
  }
  console.log(`\n${backup.length - failedCount}/${backup.length} posts restaurados a partir de ${ROLLBACK}.`)
  process.exit(failedCount ? 1 : 0)
}

const rows = await query<Row>(
  `select id, slug, conteudo_html from site.posts where conteudo_html is not null order by slug`,
)
const results: Result[] = []
for (const r of rows) {
  if (!r.conteudo_html?.trim()) continue
  const { html, stats } = transformHtml(r.conteudo_html)
  if (stats.internal + stats.external + stats.other > 0) results.push({ id: r.id, slug: r.slug, stats, nextHtml: html })
}
const sum = (k: keyof Stats) => results.reduce((n, r) => n + r.stats[k], 0)
const summary = `${results.length} posts · ${sum('internal')} links internos · ${sum('external')} externos · ${sum('other')} outros (âncora/mailto/tel)`

if (!APPLY) {
  for (const r of results) {
    console.log(`/blog/${r.slug}: internos=${r.stats.internal} externos=${r.stats.external} outros=${r.stats.other}`)
  }
  console.log(`\nDRY-RUN: ${summary}. Nada foi gravado. Para gravar: --apply`)
  process.exit(0)
}

if (results.length === 0) {
  console.log('Nenhum link fora da regra — nada a fazer (idempotente).')
  process.exit(0)
}

const ids = results.map((r) => r.id)
const backup = await readBackupRows(ids)
const backupFile = path.join(backupsDir, `posts-html-before-links-${stamp}.json`)
// flag 'wx': falha se o arquivo já existir — nunca sobrescreve um backup.
fs.writeFileSync(backupFile, JSON.stringify(backup, null, 1), { flag: 'wx' })
console.log(`Backup: ${path.relative(projectRoot, backupFile)}`)

const failed: string[] = []
for (const r of results) {
  try {
    await payloadUpdate(r.id, r.nextHtml)
    console.log(`OK /blog/${r.slug}`)
  } catch (e: any) {
    failed.push(r.slug)
    console.error(`FALHOU /blog/${r.slug}: ${e?.message}`)
  }
}

const after = await readBackupRows(ids)
const moved = after.filter((a) => {
  const b = backup.find((x) => x.id === a.id)
  return String(b?.content_updated_at) !== String(a.content_updated_at)
})
console.log(`\n${results.length - failed.length}/${results.length} posts atualizados · ${summary}.`)
if (moved.length) console.error(`ATENÇÃO: content_updated_at mudou em: ${moved.map((m) => m.slug).join(', ')}`)
else console.log('content_updated_at inalterado em todos os posts.')
if (failed.length) console.error(`Falharam (rode de novo — é idempotente): ${failed.join(', ')}`)
process.exit(failed.length || moved.length ? 1 : 0)
