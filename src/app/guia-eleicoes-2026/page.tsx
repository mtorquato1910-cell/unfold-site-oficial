import { GuiaScale } from './_components/GuiaScale'
import { GateProvider } from './_components/GateProvider'
import { GUIA_HTML } from './_content/guia-content'

/**
 * Hotsite "Guia de Anúncios Digitais para as Eleições de 2026" — Unfold × Feat.Work.
 *
 * O conteúdo das 37 páginas é renderizado no servidor (SSR) via dangerouslySetInnerHTML
 * — é o nosso próprio mockup, confiável, preservado 100% (RF-02) — o que mantém o
 * bundle do cliente leve e favorece SEO/LCP. A escala responsiva (RF-03) é ajustada
 * pelo GuiaScale; o gate (blur + modal de cadastro) é orquestrado pelo GateProvider.
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
      <div className="guia-doc" dangerouslySetInnerHTML={{ __html: GUIA_HTML }} />
      <GuiaScale />
      <GateProvider />
    </>
  )
}
