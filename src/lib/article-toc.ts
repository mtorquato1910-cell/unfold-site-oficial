/**
 * Índice de navegação (TOC) para artigos do blog.
 *
 * O HTML vem do editor rico sem `id` nos títulos. Aqui processamos o HTML no
 * servidor: para cada <h2>/<h3> geramos um slug estável, injetamos o `id` (para
 * as âncoras) e devolvemos a lista de seções usada pelo componente de índice.
 */

export type TocItem = { id: string; text: string; level: 2 | 3 }

function slugify(text: string): string {
  const base = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos (diacriticos combinados)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '')
  return base || 'secao'
}

export function addHeadingIds(html: string | null | undefined): {
  html: string
  toc: TocItem[]
} {
  if (!html) return { html: '', toc: [] }

  const toc: TocItem[] = []
  const used = new Set<string>()

  const out = html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string, inner: string) => {
      const level = tag.toLowerCase() === 'h2' ? 2 : 3
      const text = inner
        .replace(/<[^>]+>/g, '') // tira tags internas (strong, em…)
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/\s+/g, ' ')
        .trim()
      if (!text) return match

      // Respeita um id já existente; senão gera a partir do texto.
      const existing = /id="([^"]+)"/i.exec(attrs)
      let id = existing ? existing[1] : slugify(text)
      const baseId = id
      let n = 2
      while (used.has(id)) id = `${baseId}-${n++}`
      used.add(id)

      const attrsNoId = attrs.replace(/\s*id="[^"]*"/i, '')
      toc.push({ id, text, level: level as 2 | 3 })
      return `<${tag}${attrsNoId} id="${id}">${inner}</${tag}>`
    },
  )

  return { html: out, toc }
}
