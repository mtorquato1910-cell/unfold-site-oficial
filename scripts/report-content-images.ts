/**
 * S08 (épico seo-tecnico-2026-10) — relatório das imagens dentro dos posts publicados
 * sem texto alternativo (alt) ou sem width/height. Escrever o alt é tarefa de
 * conteúdo (Ferraz): o relatório diz em que post e qual imagem. Somente leitura.
 *
 * USO: npx tsx scripts/report-content-images.ts   → backups/imagens-conteudo-<data>.md
 */
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { auditContentImages } from '../src/lib/content-images'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true })
dotenv.config({ path: path.join(projectRoot, '.env') })

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
await client.connect()
const { rows } = await client.query<{ slug: string; titulo: string; conteudo_html: string }>(
  `select slug, titulo, conteudo_html from site.posts where status = 'published' and conteudo_html is not null order by slug`,
)
await client.end()

let semAlt = 0
let semTamanho = 0
const lines = ['# Imagens dos posts sem alt ou sem dimensões (S08)', '', `Gerado em ${new Date().toISOString()}`, '']
for (const r of rows) {
  const issues = auditContentImages(r.conteudo_html)
  if (!issues.length) continue
  lines.push(`## /blog/${r.slug}`, `_${r.titulo}_`, '')
  for (const i of issues) {
    if (i.missingAlt) semAlt++
    if (i.missingSize) semTamanho++
    const what = [i.missingAlt && 'sem alt', i.missingSize && 'sem width/height'].filter(Boolean).join(' · ')
    lines.push(`- ${what}: \`${i.src.split('/').pop()}\` (${i.src})`)
  }
  lines.push('')
}
lines.splice(3, 0, `**${semAlt} imagens sem alt** · **${semTamanho} sem width/height** em ${rows.length} posts publicados.`, '')
const file = path.join(projectRoot, 'backups', `imagens-conteudo-${new Date().toISOString().slice(0, 10)}.md`)
fs.mkdirSync(path.dirname(file), { recursive: true })
fs.writeFileSync(file, lines.join('\n'))
console.log(`${semAlt} sem alt · ${semTamanho} sem width/height · relatório: ${path.relative(projectRoot, file)}`)
