/**
 * Helpers de rich text seguros para o browser (sem dependências node).
 * Use estes no client (editor). A sanitização node fica em html-sanitize.ts.
 */

const YT_ID = /^[A-Za-z0-9_-]{6,20}$/

/** Aceita URL completa do YouTube ou um ID e retorna o ID canônico (ou null). */
export function extractYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null
  const s = input.trim()
  if (YT_ID.test(s)) return s
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{6,20})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,20})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,20})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,20})/,
    /youtube-nocookie\.com\/embed\/([A-Za-z0-9_-]{6,20})/,
  ]
  for (const re of patterns) {
    const m = s.match(re)
    if (m) return m[1]
  }
  return null
}

/** Converte texto puro (parágrafos separados por linha em branco) em HTML simples. */
export function plainToHtml(text: string | null | undefined): string {
  if (!text || !text.trim()) return ''
  return text
    .split(/\n\n+/)
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, '<br />')}</p>`)
    .join('')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const FORMAT = { BOLD: 1, ITALIC: 1 << 1, STRIKETHROUGH: 1 << 2, UNDERLINE: 1 << 3, CODE: 1 << 4 }

function renderTextNode(node: any): string {
  let t = escapeHtml(node.text ?? '')
  const fmt = typeof node.format === 'number' ? node.format : 0
  if (fmt & FORMAT.CODE) t = `<code>${t}</code>`
  if (fmt & FORMAT.BOLD) t = `<strong>${t}</strong>`
  if (fmt & FORMAT.ITALIC) t = `<em>${t}</em>`
  if (fmt & FORMAT.UNDERLINE) t = `<u>${t}</u>`
  if (fmt & FORMAT.STRIKETHROUGH) t = `<s>${t}</s>`
  return t
}

function renderNodes(nodes: any[] | undefined): string {
  if (!nodes) return ''
  return nodes.map(renderNodeToHtml).join('')
}

function renderNodeToHtml(node: any): string {
  switch (node?.type) {
    case 'text':
      return renderTextNode(node)
    case 'paragraph': {
      const inner = renderNodes(node.children)
      return inner ? `<p>${inner}</p>` : ''
    }
    case 'heading': {
      const tag = /^h[1-6]$/.test(node.tag) ? node.tag : 'h2'
      return `<${tag}>${renderNodes(node.children)}</${tag}>`
    }
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${renderNodes(node.children)}</${tag}>`
    }
    case 'listitem':
      return `<li>${renderNodes(node.children)}</li>`
    case 'quote':
      return `<blockquote>${renderNodes(node.children)}</blockquote>`
    case 'link':
    case 'autolink': {
      const url = node.fields?.url || node.url || '#'
      return `<a href="${escapeHtml(url)}">${renderNodes(node.children)}</a>`
    }
    case 'linebreak':
      return '<br />'
    case 'horizontalrule':
      return '<hr />'
    case 'upload': {
      const u = node.value
      if (u?.url) return `<figure><img src="${escapeHtml(u.url)}" alt="${escapeHtml(u.alt || '')}" /><figcaption></figcaption></figure>`
      return ''
    }
    default:
      return renderNodes(node?.children)
  }
}

/**
 * Converte um state Lexical (Payload richText) em HTML simples — usado para
 * preencher o editor rico ao abrir um post antigo (que só tem `conteudo` Lexical).
 */
export function lexicalToHtml(data: any): string {
  if (!data?.root?.children) return ''
  return renderNodes(data.root.children).trim()
}
