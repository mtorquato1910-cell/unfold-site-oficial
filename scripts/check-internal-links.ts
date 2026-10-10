/**
 * S03 (épico seo-tecnico-2026-10) — "rastrear de novo": confere TODOS os links
 * internos do conteúdo publicado (posts e cases) contra o site em produção.
 *
 * Critério da S03: zero 4xx. Links que redirecionam (301/308) são listados como
 * aviso — o Checklist (M03) pede que links internos apontem para a URL final.
 * Somente leitura (Postgres + requisições HTTP).
 *
 * USO:
 *   npx tsx scripts/check-internal-links.ts                     # contra https://unfoldgrowth.com.br
 *   npx tsx scripts/check-internal-links.ts --base https://preview.vercel.app
 */
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { JSDOM } from 'jsdom'
import { internalPath } from '../src/lib/broken-links'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true })
dotenv.config({ path: path.join(projectRoot, '.env') })

const baseIdx = process.argv.indexOf('--base')
const BASE = (baseIdx >= 0 ? process.argv[baseIdx + 1] : 'https://unfoldgrowth.com.br').replace(/\/$/, '')

type Source = { kind: 'post' | 'case'; slug: string; html: string }

async function readSources(): Promise<Source[]> {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    const posts = await client.query(
      `select slug, conteudo_html from site.posts where status = 'published' and conteudo_html is not null`,
    )
    const out: Source[] = posts.rows.map((r: any) => ({ kind: 'post', slug: r.slug, html: r.conteudo_html }))
    // Cases: colunas HTML variam entre versões do schema — junta as que existirem.
    const cols = await client.query(
      `select column_name from information_schema.columns
        where table_schema = 'site' and table_name = 'cases'
          and column_name in ('conteudo_html', 'challenge_html', 'solution_html')`,
    )
    const htmlCols = cols.rows.map((r: any) => `coalesce("${r.column_name}", '')`)
    if (htmlCols.length) {
      const cases = await client.query(
        `select slug, ${htmlCols.join(" || ' ' || ")} as html from site.cases where status = 'publicado'`,
      )
      for (const r of cases.rows) out.push({ kind: 'case', slug: r.slug, html: r.html })
    }
    return out
  } finally {
    await client.end()
  }
}

async function status(url: string): Promise<{ code: number; location?: string }> {
  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const res = await fetch(url, { method, redirect: 'manual' })
      if (method === 'HEAD' && res.status === 405) continue
      return { code: res.status, location: res.headers.get('location') || undefined }
    } catch {
      if (method === 'GET') return { code: 0 }
    }
  }
  return { code: 0 }
}

const sources = await readSources()
const occurrences = new Map<string, string[]>() // caminho → onde aparece
for (const s of sources) {
  const doc: Document = new JSDOM(`<body>${s.html}</body>`).window.document
  for (const a of Array.from(doc.querySelectorAll('a[href]'))) {
    const p = internalPath(a.getAttribute('href'))
    if (!p) continue
    const where = `${s.kind}:${s.slug}`
    occurrences.set(p, [...(occurrences.get(p) || []), where])
  }
}

const broken: string[] = []
const redirects: string[] = []
for (const [p, where] of occurrences) {
  const { code, location } = await status(`${BASE}${p}`)
  const line = `${code} ${p} ← ${[...new Set(where)].join(', ')}${location ? ` → ${location}` : ''}`
  if (code === 0 || code >= 400) broken.push(line)
  else if (code >= 300) redirects.push(line)
}

console.log(`Base: ${BASE} · ${sources.length} documentos · ${occurrences.size} caminhos internos distintos`)
console.log(`\n4xx/erro (${broken.length}):`)
broken.forEach((l) => console.log('  ' + l))
console.log(`\nRedirecionam — trocar pela URL final (${redirects.length}):`)
redirects.forEach((l) => console.log('  ' + l))
process.exit(broken.length ? 1 : 0)
