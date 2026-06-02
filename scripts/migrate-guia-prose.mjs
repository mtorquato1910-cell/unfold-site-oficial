/**
 * Converte o HTML diagramado do guia (37 páginas A4) em conteúdo estruturado
 * por seção, preservando 100% do texto/leis/fontes. Remove o "cromo de PDF"
 * (header/footer/numeração/estilos A4 inline) e mantém as classes semânticas
 * internas (.stat-card, .calendario-item, .funil-etapa, etc.) para o tema dark
 * (prose-guia-dark.css) re-estilizar.
 *
 * Uso: node scripts/migrate-guia-prose.mjs "<arquivo.html>"
 * Saída: src/app/guia-eleicoes-2026/_content/guia-prose-content.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = process.argv[2]
const OUT = 'src/app/guia-eleicoes-2026/_content/guia-prose-content.ts'

// Páginas institucionais que não fazem sentido no hotsite (capa/rosto/sumário).
const SKIP_PAGES = new Set([1, 2, 4])

const html = readFileSync(SRC, 'utf8')

// Cada página é delimitada por um comentário "<!-- PÁGINA N — TÍTULO -->".
const parts = html.split(/<!--\s*P[ÁA]GINA/i).slice(1)

const sections = []
for (const part of parts) {
  const commentEnd = part.indexOf('-->')
  if (commentEnd === -1) continue
  const label = part.slice(0, commentEnd).trim() // ex.: "6 — PANORAMA DIGITAL"
  const numMatch = label.match(/^(\d+)/)
  const pageNum = numMatch ? parseInt(numMatch[1], 10) : 0
  if (SKIP_PAGES.has(pageNum)) continue

  let body = part.slice(commentEnd + 3)

  // Corta qualquer resto após o fim do documento.
  body = body.replace(/<\/body>[\s\S]*$/i, '').replace(/<\/html>[\s\S]*$/i, '')

  const isNavy = /<div class="page navy"/.test(body)

  // Remove estilos embutidos e o cromo de PDF.
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '')
  body = body.replace(/<div class="page-header">[\s\S]*?<\/div>/gi, '')
  body = body.replace(/<div class="page-footer">[\s\S]*?<\/div>/gi, '')

  // Título da seção (h1.display* ou h2.section).
  const tMatch =
    body.match(/<h2[^>]*class="[^"]*section[^"]*"[^>]*>([\s\S]*?)<\/h2>/i) ||
    body.match(/<h1[^>]*class="[^"]*display[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
  const titulo = tMatch ? tMatch[1].replace(/<[^>]+>/g, '').trim() : ''

  // Remove estilos inline (margens em mm / cores do tema claro) — o dark controla.
  body = body.replace(/\sstyle="[^"]*"/gi, '')

  // Normaliza espaços/linhas em branco.
  body = body.replace(/\n{3,}/g, '\n\n').trim()

  sections.push({
    id: `pagina-${pageNum}`,
    surface: isNavy ? 'base' : 'elevated',
    titulo,
    html: body,
  })
}

const header = `/* GERADO por scripts/migrate-guia-prose.mjs — NÃO editar à mão.
   Conteúdo das ${sections.length} seções do guia, preservado 1:1 do material
   diagramado, sem o cromo A4. Re-tematizado para dark por prose-guia-dark.css. */

export interface GuiaProseSection {
  id: string
  surface: 'base' | 'elevated'
  titulo: string
  html: string
}

export const GUIA_PROSE: GuiaProseSection[] = ${JSON.stringify(sections, null, 2)}
`

writeFileSync(OUT, header, 'utf8')
console.log(`OK: ${sections.length} seções → ${OUT}`)
console.log('Páginas:', sections.map((s) => s.id).join(', '))
