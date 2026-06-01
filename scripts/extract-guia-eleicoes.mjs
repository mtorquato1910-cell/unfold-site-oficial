/**
 * Extrai e escopa o conteúdo do guia diagramado (HTML standalone) para o hotsite.
 *
 * Saídas:
 *  - src/app/guia-eleicoes-2026/_content/guia.css          → CSS do mockup, escopado sob `.guia-doc`
 *  - src/app/guia-eleicoes-2026/_content/guia-content.ts   → string HTML do <body> (sem .doc-intro)
 *
 * Estratégia de escopo (PostCSS):
 *  - `:root`, `html`, `body`            → `.guia-doc`           (variáveis/fundo no container do guia)
 *  - `*`                                → `.guia-doc *`
 *  - demais seletores                   → `.guia-doc <seletor>` (prefixo)
 *  - `@media print`                     → removido (irrelevante na web)
 *  - regra `.doc-intro`                 → removida
 *  - fontes via variáveis next/font     → mapeadas em `:root`/`.guia-doc`
 *
 * Conteúdo (RF-02): preservado integralmente, apenas removendo o bloco `.doc-intro`
 * (instrução de mockup, não faz parte do guia).
 *
 * Idempotente: rode sempre que o HTML-fonte mudar.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SRC_HTML = resolve(ROOT, 'Eleições', 'guia_eleicoes_2026_diagramado (1).html')
const OUT_DIR = resolve(ROOT, 'src', 'app', 'guia-eleicoes-2026', '_content')
const OUT_CSS = resolve(OUT_DIR, 'guia.css')
const OUT_HTML = resolve(OUT_DIR, 'guia-content.ts')

const SCOPE = '.guia-doc'

function extractBetween(html, openTag, closeTag) {
  const start = html.indexOf(openTag)
  const end = html.indexOf(closeTag, start)
  if (start === -1 || end === -1) throw new Error(`Tag não encontrada: ${openTag}`)
  return html.slice(start + openTag.length, end)
}

function scopeSelector(sel) {
  const s = sel.trim()
  if (!s) return s
  // Pseudo globais → o container do guia
  if (s === ':root' || s === 'html' || s === 'body' || s === 'html, body' || s === 'html,body') {
    return SCOPE
  }
  if (s === '*') return `${SCOPE} *`
  // Já escopado (evita duplicar em reprocessamento)
  if (s.startsWith(SCOPE)) return s
  return `${SCOPE} ${s}`
}

const scopePlugin = () => ({
  postcssPlugin: 'scope-guia',
  Once(root) {
    root.walkRules((rule) => {
      // Não tocar em rules dentro de @keyframes (seletores são "from/to/%")
      const parent = rule.parent
      if (parent && parent.type === 'atrule' && /keyframes/i.test(parent.name)) return

      // Remover .doc-intro (instrução de mockup)
      const selectors = rule.selectors || [rule.selector]
      const kept = selectors.filter((sel) => !/\.doc-intro\b/.test(sel))
      if (kept.length === 0) {
        rule.remove()
        return
      }
      // Escopa e remove duplicatas (ex.: `html, body` → ambos `.guia-doc`)
      rule.selectors = [...new Set(kept.map(scopeSelector))]
    })

    // Remover @media print (não relevante na web; o PDF é estático separado)
    root.walkAtRules('media', (atRule) => {
      if (/print/i.test(atRule.params)) atRule.remove()
    })
  },
})
scopePlugin.postcss = true

async function main() {
  const html = readFileSync(SRC_HTML, 'utf8')

  // 1) CSS bruto do <style>
  const rawCss = extractBetween(html, '<style>', '</style>')

  // 2) Escopar via PostCSS
  const processed = await postcss([scopePlugin()]).process(rawCss, { from: undefined })

  // 3) Mapear fontes para as variáveis do next/font (fallback para os nomes originais)
  const fontVars = `/* Fontes via next/font (layout do hotsite) com fallback para os nomes originais */
${SCOPE} {
  --display: var(--font-guia-display, 'Space Grotesk'), sans-serif;
  --body: var(--font-guia-body, 'Inter'), sans-serif;
  --mono: var(--font-guia-mono, 'JetBrains Mono'), monospace;
}
`

  const header = `/* GERADO por scripts/extract-guia-eleicoes.mjs — NÃO editar à mão.
   Fonte: Eleições/guia_eleicoes_2026_diagramado (1).html
   CSS do mockup escopado sob ${SCOPE}. Conteúdo preservado (RF-02). */\n\n`

  writeFileSync(OUT_CSS, header + processed.css + '\n' + fontVars, 'utf8')

  // 4) Conteúdo do <body>, removendo o bloco .doc-intro (até o próximo comentário/página)
  let body = extractBetween(html, '<body>', '</body>')
  // Remove o <div class="doc-intro">...</div> (primeiro bloco)
  body = body.replace(/<div class="doc-intro">[\s\S]*?<\/div>\s*/, '')
  body = body.trim()

  const tsHeader = `/* GERADO por scripts/extract-guia-eleicoes.mjs — NÃO editar à mão.
   Conteúdo das 36 páginas do guia (RF-02: preservado integralmente, sem .doc-intro). */\n\n`
  // Escapa crases e ${ para template literal seguro
  const escaped = body.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
  writeFileSync(OUT_HTML, `${tsHeader}export const GUIA_HTML = \`${escaped}\`\n`, 'utf8')

  // Stats
  const pageCount = (body.match(/class="page\b/g) || []).length
  console.log('✓ Extração concluída')
  console.log(`  CSS escopado:  ${OUT_CSS}  (${(header + processed.css).length} bytes)`)
  console.log(`  HTML conteúdo: ${OUT_HTML}  (${escaped.length} bytes)`)
  console.log(`  Páginas detectadas: ${pageCount}`)
}

mkdirSync(OUT_DIR, { recursive: true })
main().catch((err) => {
  console.error('✗ Falha na extração:', err)
  process.exit(1)
})
