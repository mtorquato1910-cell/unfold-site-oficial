/**
 * Categorias do blog e bloco de artigos relacionados (relatório técnico de SEO de
 * 06/11/2026 — Tarefas 3 e 4). Funções puras; a busca no CMS fica nas páginas.
 *
 * A URL do artigo NÃO muda (/blog/<slug>): a categoria é só um campo do post, com
 * listagem própria em /blog/categoria/<slug>.
 */

export type CategoryRef = { id: number | string; nome: string; slug: string }

export const categoryPath = (slug: string) => `/blog/categoria/${slug}`

/** Categoria populada do post (depth ≥ 1) ou null. */
export function postCategory(post: { categoria?: unknown } | null | undefined): CategoryRef | null {
  const c = post?.categoria as any
  if (!c || typeof c !== 'object' || !c.slug || !c.nome) return null
  return { id: c.id, nome: String(c.nome), slug: String(c.slug) }
}

/** Id da categoria, com o campo populado ou não. */
export function postCategoryId(post: { categoria?: unknown }): string | null {
  const c = post?.categoria as any
  if (c == null || c === '') return null
  return String(typeof c === 'object' ? c.id : c)
}

/** Resumo de busca da categoria: campo próprio ou o início da intro (≤155). */
export function categoryDescription(cat: { nome: string; intro?: string | null; meta_description?: string | null }): string {
  const own = cat.meta_description?.trim()
  if (own) return own
  const intro = (cat.intro || '').replace(/\s+/g, ' ').trim()
  if (intro) return intro.length > 155 ? `${intro.slice(0, 154).trimEnd()}…` : intro
  return `Artigos da Unfold Growth sobre ${cat.nome.toLowerCase()} para empresas B2B com vendas complexas.`
}

/**
 * As 11 URLs da Tarefa 4 (rastreadas e fora do índice, ou com ≤1 link vindo de outro
 * artigo). Entram primeiro no bloco de relacionados quando são da mesma categoria.
 */
export const RELATED_PRIORITY_SLUGS = [
  'funil-de-vendas-para-construcao-civil',
  'permuta-vgv-e-funil-estrutura-financeira-e-vendas',
  'sales-enablement-para-corretores-e-comite-de-compra',
  'como-qualificar-e-priorizar-leads-na-incorporadora',
  'funil-de-marketing-x-funil-de-vendas',
  'marketing-e-growth-para-incorporadoras-e-construtoras',
  'playbook-de-vendas',
  'dashboard-comercial',
  'pipeline-de-vendas',
  'por-que-sua-incorporadora-gera-leads-e-nao-fecha-vendas-e-como-resolver',
  'integracao-entre-marketing-e-vendas',
]

/** Hash estável (FNV-1a) — mesma entrada, mesma rotação em todo render. */
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

type RelatedCandidate = { slug: string; publicado_em?: string | null }

/**
 * Escolhe `n` relacionados da mesma categoria (os candidatos já vêm filtrados):
 *  1. URLs prioritárias da Tarefa 4 — quando há mais prioritárias que vagas, a lista
 *     gira conforme o artigo atual (hash do slug), para TODAS receberem links;
 *  2. completa com os mais recentes.
 * O próprio artigo nunca entra.
 */
export function pickRelated<T extends RelatedCandidate>(
  currentSlug: string,
  candidates: T[],
  n = 3,
  priority: string[] = RELATED_PRIORITY_SLUGS,
): T[] {
  const pool = candidates.filter((c) => c.slug !== currentSlug)
  const prio = priority
    .map((s) => pool.find((c) => c.slug === s))
    .filter((c): c is T => Boolean(c))
  const start = prio.length ? hash(currentSlug) % prio.length : 0
  const rotated = [...prio.slice(start), ...prio.slice(0, start)].slice(0, n)
  const time = (c: T) => (c.publicado_em ? new Date(c.publicado_em).getTime() : 0) || 0
  const recent = pool
    .filter((c) => !rotated.includes(c))
    .sort((a, b) => time(b) - time(a))
  return [...rotated, ...recent].slice(0, n)
}
