import sanitizeHtml from 'sanitize-html'

/**
 * Sanitização do HTML produzido pelo editor rico (TipTap) antes de persistir.
 *
 * O conteúdo do painel vem de editores autenticados, mas o do formulário público
 * (/blog/contribuir) vem de usuários EXTERNOS — então sanitizamos sempre, no
 * servidor, com uma allowlist estrita. Vídeos do YouTube são representados por
 * `<div data-youtube="ID"></div>` (placeholder) e transformados em player no
 * render (RichContent), nunca como <iframe> cru salvo no banco.
 */

const YT_ID = /^[A-Za-z0-9_-]{6,20}$/

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr', 'span',
    'strong', 'b', 'em', 'i', 'u', 's', 'code', 'pre', 'blockquote',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a',
    'figure', 'figcaption', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col',
    'div',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    div: ['data-youtube'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
    col: ['span'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  // Remove <div> que não seja o placeholder de YouTube (evita HTML estrutural lixo).
  exclusiveFilter: (frame) =>
    frame.tag === 'div' && !YT_ID.test(frame.attribs['data-youtube'] || ''),
  transformTags: {
    // Links externos sempre abrem em nova aba e sem vazar referrer/opener.
    a: (tagName, attribs) => {
      const href = attribs.href || ''
      const external = /^https?:\/\//i.test(href)
      return {
        tagName: 'a',
        attribs: external
          ? { ...attribs, target: '_blank', rel: 'noopener noreferrer nofollow' }
          : attribs,
      }
    },
  },
}

export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return ''
  const clean = sanitizeHtml(html, OPTIONS).trim()
  // Normaliza vazios comuns do editor (parágrafo único em branco).
  if (clean === '<p></p>' || clean === '<p><br /></p>') return ''
  return clean
}

/** Extrai texto puro do HTML (para gerar resumo / fallback Lexical / busca). */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim()
}
