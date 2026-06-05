import { GuiaEditorial } from './_components/editorial/GuiaEditorial'
import './_styles/editorial.css'

/**
 * Hotsite "Guia de Anúncios Digitais para as Eleições de 2026" — Unfold × Feat.Work.
 *
 * Redesign editorial "estudo impresso" (papel + acento mint), portado do esboço
 * Lovable para Next. O conteúdo do estudo fica aberto; a captura de leads (RD
 * Station) acontece nos CTAs de download e no convite de cadastro auto-aberto,
 * orquestrada pelo EditorialGate (que reaproveita LeadModal/LeadForm com validação
 * MX + WhatsApp + Turnstile). O estudo completo (36 páginas) vive no PDF.
 */
const GUIA_URL =
  process.env.NEXT_PUBLIC_GUIA_URL || 'https://eleicoes.unfoldgrowth.com.br/featwork'

// Schema.org Article para indexação rica (RNF-20).
const ARTICLE_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Guia de Anúncios Digitais para as Eleições de 2026',
  description:
    'Estudo completo sobre a operação de anúncios digitais nas eleições de 2026 — Unfold × Feat.Work.',
  inLanguage: 'pt-BR',
  url: GUIA_URL,
  image: `${GUIA_URL.replace(/\/featwork$/, '')}/guia/og-guia-eleicoes.png`,
  author: [{ '@type': 'Organization', name: 'Unfold Growth' }, { '@type': 'Organization', name: 'Feat.Work' }],
  publisher: { '@type': 'Organization', name: 'Unfold × Feat.Work' },
}

export default function GuiaEleicoes2026Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_LD) }}
      />
      <GuiaEditorial />
    </>
  )
}
