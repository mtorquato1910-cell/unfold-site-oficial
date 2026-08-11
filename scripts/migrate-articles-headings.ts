/**
 * S05 — Migração/normalização de hierarquia de títulos dos 31 artigos (item 1.3 etapa 4).
 *
 * O conteúdo já é HTML único (`posts.conteudo_html`), então NÃO é conversão de
 * formato — é normalização de nível de heading sobre HTML pronto:
 *   1. Rebaixa qualquer H1 do CORPO para H2 (o H1 é só o título do post).
 *   2. Se o artigo não tem H2 mas usa H3+ (o padrão "pula do H1 direto pro H3"),
 *      sobe todos os níveis em 1 (h3→h2, h4→h3, h5→h4, h6→h5).
 * As molduras (CTA, banners, "leia também") já saíram da hierarquia no RENDER
 * (S02) — não estão no `conteudo_html` —, então aqui só o corpo é tratado.
 *
 * SEGURANÇA (recomendação do documento):
 *   - Rode SEMPRE primeiro em dry-run (sem --apply): imprime o diff de headings.
 *   - Faça um SNAPSHOT do banco antes de --apply.
 *   - Comece com --limit 3, revise, e só então rode nos 31.
 *
 * USO:
 *   npx tsx scripts/migrate-articles-headings.ts               # dry-run, todos
 *   npx tsx scripts/migrate-articles-headings.ts --limit 3     # dry-run, piloto
 *   npx tsx scripts/migrate-articles-headings.ts --apply --limit 3   # grava o piloto
 *   npx tsx scripts/migrate-articles-headings.ts --apply       # grava todos
 */
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true })
dotenv.config({ path: path.join(projectRoot, '.env') })

const APPLY = process.argv.includes('--apply')
const limitFlag = process.argv.indexOf('--limit')
const LIMIT = limitFlag >= 0 ? Number(process.argv[limitFlag + 1]) || 0 : 0

/** Extrai a sequência de níveis de heading do HTML (para o diff legível). */
function headingSeq(html: string): string {
  return (html.match(/<h[1-6][\s>]/gi) || []).map((h) => h[2]).join(' ')
}

/** Normaliza a hierarquia conforme as regras 1 e 2 acima. Puro (não muta). */
function normalizeHeadings(html: string): string {
  // 1. H1 do corpo → H2.
  let out = html.replace(
    /<(\/?)h1(\s[^>]*)?>/gi,
    (_m, slash: string, attrs: string) => `<${slash}h2${slash ? '' : attrs || ''}>`,
  )

  // 2. Sem H2 mas com H3+ → sobe todos em 1.
  const hasH2 = /<h2[\s>]/i.test(out)
  const hasH3plus = /<h[3-6][\s>]/i.test(out)
  if (!hasH2 && hasH3plus) {
    out = out.replace(
      /<(\/?)h([3-6])(\s[^>]*)?>/gi,
      (_m, slash: string, lvl: string, attrs: string) =>
        `<${slash}h${Number(lvl) - 1}${slash ? '' : attrs || ''}>`,
    )
  }
  return out
}

const { getPayload } = await import('payload')
const { default: config } = await import('../payload.config')

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'posts',
  where: { conteudo_html: { exists: true } },
  limit: LIMIT || 1000,
  depth: 0,
})

let changed = 0
for (const post of docs as any[]) {
  const original = (post.conteudo_html as string) || ''
  if (!original.trim()) continue
  const next = normalizeHeadings(original)
  if (next === original) continue

  changed++
  console.log(`\n── #${post.id} /blog/${post.slug} ──`)
  console.log(`  headings antes:  ${headingSeq(original) || '(nenhum)'}`)
  console.log(`  headings depois: ${headingSeq(next) || '(nenhum)'}`)

  if (APPLY) {
    await payload.update({ collection: 'posts', id: post.id, data: { conteudo_html: next } as any })
    console.log('  ✔ atualizado')
  }
}

console.log(
  `\n${changed} de ${docs.length} artigos ${APPLY ? 'ATUALIZADOS' : 'seriam alterados (dry-run)'}.`,
)
if (!APPLY && changed > 0) console.log('Rode novamente com --apply para gravar (após snapshot).')
process.exit(0)
