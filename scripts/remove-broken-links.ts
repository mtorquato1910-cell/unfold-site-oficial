/**
 * S03 (épico seo-tecnico-2026-10) — remove dos posts os links internos para URLs que
 * davam 404 (Anexo C do Plano de Ação do Ferraz + decisões D1/D2 do cliente).
 * Regras de transformação: src/lib/broken-links.ts.
 *
 * SEGURANÇA:
 *   - Padrão = DRY-RUN: lê direto do Postgres (somente leitura) e gera o relatório
 *     backups/broken-links-preview-<data>.md para APROVAÇÃO do dono. Não grava nada.
 *   - --apply: só depois do relatório aprovado E com a S01 em produção (coluna
 *     content_updated_at). Grava backup completo (com as datas) antes, num arquivo
 *     que nunca é sobrescrito, e atualiza via Payload com context.technicalEdit = true
 *     → NÃO altera a data de atualização dos posts (conferido ao final — AC3.9).
 *   - Erro num post não interrompe os demais; o script sai com código 1 e lista quem
 *     falhou. Rodar de novo é seguro (idempotente: só pega o que ainda tem link).
 *   - --rollback <arquivo-de-backup.json>: restaura o conteudo_html (também técnico).
 *   - O site reflete a mudança em até 60s (revalidate das páginas de post).
 *
 * USO:
 *   npx tsx scripts/remove-broken-links.ts                 # prévia (relatório)
 *   npx tsx scripts/remove-broken-links.ts --apply         # grava (após aprovação)
 *   npx tsx scripts/remove-broken-links.ts --rollback backups/posts-html-before-brokenlinks-<carimbo>.json
 */
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { JSDOM } from 'jsdom'
import { removeBrokenLinks, type LinkChange } from '../src/lib/broken-links'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true })
dotenv.config({ path: path.join(projectRoot, '.env') })

/**
 * URLs que retornavam 404 em 07/10/2026: as 11 do Anexo B (inclui /processo-comercial
 * e /blog/quanto-investir-para-vender-…, que viram redirect na S02 mas não devem
 * continuar linkadas — o Checklist M03 pede links internos para a URL final) +
 * /blog/receita-previsivel (D1). As duas citadas têm 0 ocorrências hoje.
 */
const BROKEN_TARGETS = new Set([
  '/blog/as-metricas-de-growth-que-importam',
  '/blog/previsibilidade-comercial-na-incorporadora',
  '/blog/geracao-de-demanda-x-geracao-de-leads',
  '/blog/receita-previsivel',
  '/blog/marketing-para-incorporadoras-e-construtoras',
  '/blog/por-que-incorporadora-gera-leads-e-nao-vende',
  '/blog/crm-para-incorporadora',
  '/blog/sales-enablement-incorporadora',
  '/calculadora',
  '/processo-comercial',
  '/blog/quanto-investir-para-vender-um-lancamento-imobiliario',
])

const APPLY = process.argv.includes('--apply')
const rbIdx = process.argv.indexOf('--rollback')
const ROLLBACK = rbIdx >= 0 ? process.argv[rbIdx + 1] : undefined
if (rbIdx >= 0 && !ROLLBACK) {
  console.error('Uso: --rollback <arquivo-de-backup.json>')
  process.exit(1)
}
const today = new Date().toISOString().slice(0, 10)
// Carimbo com hora: um segundo --apply no mesmo dia NÃO sobrescreve o backup anterior.
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const backupsDir = path.join(projectRoot, 'backups')

type Row = { id: number; slug: string; conteudo_html: string }
type BackupRow = Row & { content_updated_at: string | null; updated_at: string }
type Result = { id: number; slug: string; changes: LinkChange[]; nextHtml: string }

function transform(rows: Row[]): Result[] {
  const out: Result[] = []
  for (const r of rows) {
    if (!r.conteudo_html?.trim()) continue
    const doc: Document = new JSDOM(`<body>${r.conteudo_html}</body>`).window.document
    const changes = removeBrokenLinks(doc, BROKEN_TARGETS)
    if (changes.length) out.push({ id: r.id, slug: r.slug, changes, nextHtml: doc.body.innerHTML })
  }
  return out
}

function report(results: Result[]): string {
  const total = results.reduce((n, r) => n + r.changes.length, 0)
  const byAction: Record<string, number> = {}
  for (const r of results) for (const c of r.changes) byAction[c.action] = (byAction[c.action] || 0) + 1
  const lines = [
    `# Prévia — remoção de links quebrados (S03)`,
    ``,
    `Gerado em ${new Date().toISOString()} · ${results.length} posts · ${total} ocorrências`,
    ``,
    `Resumo por ação: ${Object.entries(byAction).map(([k, v]) => `${k}=${v}`).join(' · ')}`,
    ``,
    `- **UNWRAP**: tira só o link, mantém o texto.`,
    `- **REMOVE_BLOCK**: remove o item/parágrafo que era só o link (ex.: "Leia também").`,
    `- **REMOVE_SENTENCE / REMOVE_CLAUSE**: remove a frase/oração que só existia para indicar o link.`,
    `- **REVISAR**: caso ambíguo — foi aplicado só UNWRAP; confira se a frase ainda faz sentido.`,
    ``,
    `Para aprovar: revise os trechos abaixo. Ajustes pontuais podem ser feitos depois no painel.`,
    ``,
  ]
  for (const r of results) {
    lines.push(`## /blog/${r.slug}`, '')
    for (const c of r.changes) {
      lines.push(`**${c.action}** — \`${c.path}\` ("${c.anchorText}")`, '')
      lines.push('Antes:', '```html', c.before, '```', 'Depois:', '```html', c.after || '(removido)', '```', '')
    }
  }
  return lines.join('\n')
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

const readRows = () =>
  query<Row>(`select id, slug, conteudo_html from site.posts where conteudo_html is not null order by slug`)

/** Backup completo (inclui as datas, para conferir o AC3.9 antes/depois). Exige a S01. */
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
  // Restaura o conteudo_html INTEIRO do backup: edições feitas no painel depois do
  // --apply nesses posts seriam perdidas. Use logo após o apply, se necessário.
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

const rows = await readRows()
const results = transform(rows)
const total = results.reduce((n, r) => n + r.changes.length, 0)

if (!APPLY) {
  const file = path.join(backupsDir, `broken-links-preview-${today}.md`)
  fs.writeFileSync(file, report(results))
  console.log(`DRY-RUN: ${total} ocorrências em ${results.length} posts. Relatório: ${path.relative(projectRoot, file)}`)
  console.log('Nada foi gravado. Após aprovação do relatório (e com a S01 em produção): --apply')
  process.exit(0)
}

if (results.length === 0) {
  console.log('Nenhuma ocorrência — nada a fazer (idempotente).')
  process.exit(0)
}

const ids = results.map((r) => r.id)
const backup = await readBackupRows(ids)
const backupFile = path.join(backupsDir, `posts-html-before-brokenlinks-${stamp}.json`)
// flag 'wx': falha se o arquivo já existir — nunca sobrescreve um backup.
fs.writeFileSync(backupFile, JSON.stringify(backup, null, 1), { flag: 'wx' })
console.log(`Backup: ${path.relative(projectRoot, backupFile)}`)

const failed: string[] = []
for (const r of results) {
  try {
    await payloadUpdate(r.id, r.nextHtml)
    console.log(`OK /blog/${r.slug} — ${r.changes.length} link(s)`)
  } catch (e: any) {
    failed.push(r.slug)
    console.error(`FALHOU /blog/${r.slug}: ${e?.message}`)
  }
}

// AC3.9: content_updated_at NÃO pode ter mudado em nenhum post.
const after = await readBackupRows(ids)
const moved = after.filter((a) => {
  const b = backup.find((x) => x.id === a.id)
  return String(b?.content_updated_at) !== String(a.content_updated_at)
})
console.log(`\n${results.length - failed.length}/${results.length} posts atualizados · ${total} ocorrências.`)
if (moved.length) console.error(`ATENÇÃO: content_updated_at mudou em: ${moved.map((m) => m.slug).join(', ')}`)
else console.log('content_updated_at inalterado em todos os posts (AC3.9).')
if (failed.length) console.error(`Falharam (rode de novo — é idempotente): ${failed.join(', ')}`)
console.log('Confira com: npx tsx scripts/check-internal-links.ts')
process.exit(failed.length || moved.length ? 1 : 0)
