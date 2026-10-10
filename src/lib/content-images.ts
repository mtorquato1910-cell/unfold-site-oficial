/**
 * Imagens dentro do conteúdo rico (S08 — épico seo-tecnico-2026-10; Checklist SEO M04).
 *
 * O HTML salvo passa pelo sanitizer, que só permite src/alt/title/width/height em
 * <img> — por isso `loading`/`decoding` são acrescentados no RENDER, não no conteúdo
 * gravado. Imagens do corpo do artigo ficam abaixo da dobra (a capa vem antes), então
 * todas recebem loading="lazy" + decoding="async", salvo `eagerFirst`.
 */
export function lazyContentImages(html: string, opts: { eagerFirst?: boolean } = {}): string {
  let index = 0
  return html.replace(/<img\b([^>]*?)(\s*\/?)>/gi, (tag, attrs: string, close: string) => {
    const i = index++
    if (/\sloading\s*=/i.test(attrs)) return tag
    const decoding = /\sdecoding\s*=/i.test(attrs) ? '' : ' decoding="async"'
    if (opts.eagerFirst && i === 0) return `<img${attrs}${decoding}${close}>`
    return `<img${attrs} loading="lazy"${decoding}${close}>`
  })
}

export type ContentImageIssue = { src: string; missingAlt: boolean; missingSize: boolean }

/** Lista imagens sem alt (ou alt vazio) e sem width/height — para o relatório de conteúdo. */
export function auditContentImages(html: string): ContentImageIssue[] {
  const out: ContentImageIssue[] = []
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0]
    const src = /\ssrc\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? ''
    const alt = /\salt\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1]
    const missingAlt = alt === undefined || alt.trim() === ''
    const missingSize = !/\swidth\s*=/i.test(tag) || !/\sheight\s*=/i.test(tag)
    if (missingAlt || missingSize) out.push({ src, missingAlt, missingSize })
  }
  return out
}
