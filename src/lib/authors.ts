/**
 * Helpers de autores (S07 — épico seo-tecnico-2026-10). Puros: recebem o documento
 * já populado pelo Payload (depth ≥ 1) e não acessam o banco.
 */

export type AuthorDoc = {
  id: number | string
  nome: string
  slug: string
  cargo?: string | null
  bio_curta?: string | null
  bio_completa?: string | null
  foto?: { url?: string | null } | number | string | null
  foto_url?: string | null
  linkedin?: string | null
  perfis?: unknown
  formacao?: string | null
  experiencia?: string | null
  temas?: unknown
  registro_profissional?: string | null
  ativo?: boolean | null
}

export const authorPath = (a: Pick<AuthorDoc, 'slug'>) => `/autor/${a.slug}`

export function authorPhoto(a: AuthorDoc): string | null {
  if (a.foto && typeof a.foto === 'object' && a.foto.url) return a.foto.url
  return a.foto_url || null
}

function stringList(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean)
}

/** LinkedIn + outros perfis oficiais (sameAs do Person). */
export function authorProfiles(a: AuthorDoc): string[] {
  return [a.linkedin || '', ...stringList(a.perfis)].filter((u) => /^https?:\/\//i.test(u))
}

export const authorTopics = (a: AuthorDoc) => stringList(a.temas)

/** A página do autor só entra no Google quando tem bio completa (página rala não ajuda). */
export const authorIndexable = (a: AuthorDoc) => Boolean(a.bio_completa?.trim())

/** Autores populados de um post (ignora ids não populados e autores inativos). */
export function postAuthors(post: { autores?: unknown }): AuthorDoc[] {
  const list = Array.isArray(post?.autores) ? post.autores : []
  return list.filter(
    (a): a is AuthorDoc => !!a && typeof a === 'object' && 'slug' in a && 'nome' in a && (a as AuthorDoc).ativo !== false,
  )
}

export function postReviewer(post: { revisor?: unknown }): AuthorDoc | null {
  const r = post?.revisor
  return r && typeof r === 'object' && 'slug' in r && 'nome' in r ? (r as AuthorDoc) : null
}

/**
 * Regra "post publicado precisa de ao menos um autor" (S07 — Checklist SEO M08).
 * Exceções: edição técnica de scripts (`context.technicalEdit`) e submissão externa
 * (o autor é o convidado). Campo ausente num update parcial = vale o do documento.
 */
export function publishMissingAuthor(
  data: Record<string, any>,
  originalDoc?: Record<string, any> | null,
  context?: Record<string, any> | null,
): boolean {
  if (context?.technicalEdit === true) return false
  const status = data.status ?? originalDoc?.status
  const external = data.isExternalSubmission ?? originalDoc?.isExternalSubmission
  if (status !== 'published' || external) return false
  const autores = data.autores !== undefined ? data.autores : originalDoc?.autores
  return !Array.isArray(autores) || autores.length === 0
}

/** Nome(s) para exibição em cards: "Gabriel Calheiros" / "A e B". Fallback no texto antigo. */
export function authorNames(post: { autores?: unknown; autor?: string | null }): string {
  const names = postAuthors(post).map((a) => a.nome)
  if (names.length === 0) return post.autor || ''
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}
