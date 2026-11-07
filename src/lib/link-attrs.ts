/**
 * Atributos dos links do corpo de posts/cases (Tarefa 1 do relatório técnico de SEO
 * de 06/11/2026).
 *
 * O editor (extensão Link do TipTap) gravava `rel="noopener noreferrer nofollow"` e
 * `target="_blank"` em todo link — inclusive nos internos, o que corta o PageRank
 * entre os artigos. Regra única, usada no save (html-sanitize) e no backfill
 * (scripts/normalize-content-links.ts):
 *  - interno (relativo ou https://[www.]unfoldgrowth.com.br) → caminho relativo,
 *    sem `rel` e sem `target`;
 *  - subdomínio próprio (ex.: eleicoes.unfoldgrowth.com.br) → mantém a URL absoluta
 *    (é outro host), sem `rel` e sem `target`;
 *  - externo http(s) → `target="_blank"` + `rel="noopener"` (sem nofollow);
 *  - âncora, mailto:, tel: → sem `rel` e sem `target`.
 */

const MAIN_HOST = /^https?:\/\/(www\.)?unfoldgrowth\.com\.br(?=[/?#]|$)/i
const OWN_SUBDOMAIN = /^https?:\/\/([a-z0-9-]+\.)+unfoldgrowth\.com\.br(?=[/?#]|$)/i

export type LinkKind = 'internal' | 'own-subdomain' | 'external' | 'other'

export function linkKind(href: string): LinkKind {
  const h = href.trim()
  if (h.startsWith('/') && !h.startsWith('//')) return 'internal'
  if (MAIN_HOST.test(h)) return 'internal'
  if (OWN_SUBDOMAIN.test(h)) return 'own-subdomain'
  if (/^(https?:)?\/\//i.test(h)) return 'external'
  return 'other'
}

/** Converte https://unfoldgrowth.com.br/x em /x (só para o host principal). */
export function toRelativeHref(href: string): string {
  const h = href.trim()
  if (!MAIN_HOST.test(h)) return h
  const rest = h.replace(MAIN_HOST, '')
  if (!rest) return '/'
  return rest.startsWith('/') ? rest : `/${rest}`
}

export function normalizeLinkAttribs(attribs: Record<string, string>): Record<string, string> {
  const { rel: _rel, target: _target, ...rest } = attribs
  const href = rest.href ?? ''
  switch (linkKind(href)) {
    case 'internal':
      return { ...rest, href: toRelativeHref(href) }
    case 'external':
      return { ...rest, target: '_blank', rel: 'noopener' }
    default:
      return rest
  }
}
