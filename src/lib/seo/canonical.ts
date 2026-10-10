import type { Metadata } from 'next'

/**
 * Canonical self-referencing (item 1.1 da auditoria de SEO).
 *
 * Com `metadataBase` definido no layout raiz (`src/app/(site)/layout.tsx`), um
 * canonical relativo (o próprio pathname) é resolvido para URL absoluta pelo
 * Next. Cada página passa a apontar para si mesma como endereço oficial, o que
 * neutraliza o ruído de query strings de campanha (`?gclid`, `?fbclid`, `?utm_*`)
 * que hoje fazem o Google tratar cada variação como uma página distinta e dividir
 * a força entre as cópias.
 *
 * Uso:
 *   export const metadata = { ...canonical('/contato') }
 *   // ou dentro de generateMetadata:
 *   return { title, alternates: canonical(`/blog/${slug}`).alternates }
 */
export function canonical(path: string): Pick<Metadata, 'alternates'> {
  return { alternates: { canonical: cleanPath(path) } }
}

function cleanPath(path: string): string {
  return path.split('?')[0].split('#')[0] || '/'
}

export const SITE_NAME = 'Unfold Growth'

/** og:image padrão (gerada por scripts/gen-og-default.py). */
export const DEFAULT_OG_IMAGE = {
  url: '/og/default.png',
  width: 1200,
  height: 630,
  alt: 'Unfold Growth — Growth para vendas complexas B2B',
}

type SeoOptions = {
  /** Imagem de compartilhamento própria (URL absoluta ou relativa ao site). */
  image?: string | null
  /** `article` para posts/cases; padrão `website`. */
  type?: 'website' | 'article'
  /** Página que não deve aparecer no Google (ex.: páginas legais). */
  noindex?: boolean
}

/**
 * Metadata de SEO completo de uma página (S04 — épico seo-tecnico-2026-10):
 * canonical + openGraph com `og:url` igual ao canonical e imagem (fallback na og:image
 * padrão), e `noindex, follow` quando pedido. og:title/og:description são herdados
 * do title/description da página pelo próprio Next.
 *
 * O `openGraph` de uma página SUBSTITUI o do layout (o Next não mescla), por isso
 * locale/siteName são repetidos aqui. Campos de `meta.openGraph` têm prioridade.
 *
 * Uso:
 *   export const metadata: Metadata = withSeo('/sobre', { title: 'Sobre', description: '…' })
 *   export const metadata: Metadata = withSeo('/termos', { … }, { noindex: true })
 */
export function withSeo(path: string, meta: Metadata = {}, opts: SeoOptions = {}): Metadata {
  const url = cleanPath(path)
  const images = opts.image ? [{ url: opts.image }] : [DEFAULT_OG_IMAGE]
  return {
    ...meta,
    alternates: { ...meta.alternates, canonical: url },
    openGraph: {
      type: opts.type ?? 'website',
      locale: 'pt_BR',
      siteName: SITE_NAME,
      url,
      // og:title/og:description NÃO são fixados aqui: sem eles o Next herda o `title`
      // (já com o template "| Unfold Growth") e a `description` da página.
      images,
      ...(meta.openGraph ?? {}),
    } as Metadata['openGraph'],
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
