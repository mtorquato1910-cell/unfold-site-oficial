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
  const clean = path.split('?')[0].split('#')[0]
  return { alternates: { canonical: clean || '/' } }
}
