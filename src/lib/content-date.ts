/**
 * Data de atualização EDITORIAL de posts/cases (`content_updated_at`).
 *
 * Por que existe (S01 — épico seo-tecnico-2026-10): o sitemap usava `updatedAt`,
 * que o Payload muda em QUALQUER `payload.update` — inclusive scripts em massa.
 * Em 07/08/2026 um script de headings "atualizou" 25 posts de uma vez e o Google
 * passou a receber um lastmod que não correspondia a mudança real de conteúdo.
 *
 * Regra (decisão D3 do cliente): só muda quando o TÍTULO ou o CORPO mudam de
 * verdade. Resumo, SEO, categoria, tags, capa, status, FAQ e destaque não contam.
 * Edições técnicas (remoção de link quebrado, normalização de HTML, migrações)
 * passam `context: { technicalEdit: true }` no `payload.update` e não mexem na data.
 */

/** Fuso de Brasília (sem horário de verão desde 2019). */
const BRT_OFFSET_MIN = -3 * 60

/**
 * ISO 8601 com o fuso de Brasília explícito: `2026-10-01T00:00:00-03:00`.
 * Usado no `<lastmod>` do sitemap e no `dateModified`/`datePublished` do schema
 * (o `toISOString()` sairia em UTC `Z`, que o cliente pediu para evitar).
 */
export function toBrtIso(input: Date | string | null | undefined): string | undefined {
  if (input == null || input === '') return undefined
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return undefined
  const shifted = new Date(d.getTime() + BRT_OFFSET_MIN * 60_000)
  return `${shifted.toISOString().slice(0, 19)}-03:00`
}

/** Dia civil (AAAA-MM-DD) em Brasília — para comparar "publicado" × "atualizado". */
export function brtDay(input: Date | string | null | undefined): string | undefined {
  return toBrtIso(input)?.slice(0, 10)
}

/**
 * Assinatura do corpo HTML que ignora diferenças de serialização (o editor TipTap
 * reescreve espaços, atributos e `<br>`/`<br/>` ao reabrir um post) mas captura
 * mudança editorial: o texto, a estrutura de tags (ex.: H2 → H3, lista nova) e as
 * imagens (troca de `src`). Atributos como `href`, `class` e `id` não contam —
 * trocar o destino de um link é ajuste técnico.
 */
export function contentSignature(html: string | null | undefined): string {
  if (!html) return ''
  const imgs: string[] = []
  const withImgs = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = /\bsrc\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? ''
    imgs.push(src)
    return ` [img:${src}] `
  })
  const tags: string[] = []
  const text = withImgs.replace(/<\/?\s*([a-z0-9]+)\b[^>]*>/gi, (_m, name: string) => {
    const n = name.toLowerCase()
    // Quebras e marcadores inline não mudam o conteúdo de forma relevante.
    if (n !== 'br' && n !== 'span' && n !== 'wbr') tags.push(n)
    return ' '
  })
  const normText = decodeBasicEntities(text).replace(/\s+/g, ' ').trim()
  return `${tags.join(',')}|${imgs.join(',')}|${normText}`
}

function decodeBasicEntities(s: string): string {
  // `&amp;` por último: decodificar antes faria `&amp;lt;` virar `<` (dupla decodificação).
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
}

function normTitle(s: unknown): string {
  return typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : ''
}

function toTime(v: unknown): number | undefined {
  if (v == null || v === '') return undefined
  const t = new Date(v as string).getTime()
  return Number.isNaN(t) ? undefined : t
}

export type ContentDateArgs = {
  operation: 'create' | 'update'
  /** Dados que estão sendo gravados (podem ser parciais num update). */
  data: Record<string, any>
  /** Documento antes da alteração (só em update). */
  originalDoc?: Record<string, any> | null
  /** `req.context` do Payload. */
  context?: Record<string, any> | null
  /** Nome do campo de título (`titulo` em posts, `title` em cases). */
  titleField: string
  /** Nome do campo de corpo HTML. */
  htmlField: string
  /** Nome do campo de data de publicação (`publicado_em` / `published_at`). */
  publishedField: string
  now?: Date
}

/**
 * Calcula o novo `content_updated_at` (ISO UTC, formato que o Payload grava).
 * Retorna `undefined` quando não há valor a gravar (mantém o que está no banco).
 */
export function computeContentUpdatedAt(args: ContentDateArgs): string | undefined {
  const { operation, data, originalDoc, context, titleField, htmlField, publishedField } = args
  const now = args.now ?? new Date()
  const published = toTime(data[publishedField] ?? originalDoc?.[publishedField])
  const previous = toTime(originalDoc?.content_updated_at)

  let next: number | undefined
  if (operation === 'create') {
    // Publicação agendada no futuro não pode virar lastmod futuro no sitemap.
    next = Math.min(published ?? now.getTime(), now.getTime())
  } else if (context?.technicalEdit === true) {
    next = previous
  } else {
    // Campo ausente no `data` (save parcial) = não mudou.
    const titleChanged =
      titleField in data && normTitle(data[titleField]) !== normTitle(originalDoc?.[titleField])
    const bodyChanged =
      htmlField in data &&
      contentSignature(data[htmlField]) !== contentSignature(originalDoc?.[htmlField])
    next = titleChanged || bodyChanged ? now.getTime() : (previous ?? published)
  }

  if (next === undefined) return undefined
  // Nunca "atualizado" antes de publicado (rascunho criado dias antes da publicação),
  // nem no futuro (publicação agendada).
  if (published !== undefined && next < published) next = published
  next = Math.min(next, now.getTime())
  return new Date(next).toISOString()
}
