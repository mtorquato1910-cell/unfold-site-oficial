import { GateProvider } from './_components/GateProvider'
import { GuiaProseRenderer } from './_components/redesign/GuiaProseRenderer'
import { StatEnhancer } from './_components/redesign/StatEnhancer'
import { GUIA_PROSE } from './_content/guia-prose-content'
import './_styles/redesign-dark.css'
import './_styles/prose-guia-dark.css'

/**
 * Hotsite "Guia de Anúncios Digitais para as Eleições de 2026" — Unfold × Feat.Work.
 *
 * Repaginação dark premium "dossiê tech" (vitrine enxuta): o conteúdo de maior
 * impacto é renderizado como seções fluidas/animadas (SectionRenderer) a partir
 * do modelo estruturado (guia-data). O conteúdo completo das 36 páginas vive no
 * PDF, baixado automaticamente ao concluir o cadastro. O gate (blur + modal +
 * captura de lead) é orquestrado pelo GateProvider sobre o container .guia-redesign.
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
      {/* O conteúdo nasce BLOQUEADO (guia-locked) no HTML do servidor. O script
          abaixo roda antes do paint: se há sessão de cadastro no localStorage
          (usuário que já preencheu), remove o bloqueio na hora — sem flash e sem
          reabrir o formulário. Caso contrário, o GateProvider assume o gate. */}
      <main id="guia-root" className="guia-redesign guia-locked">
        <section className="r-section r-intro" data-surface="base">
          <div className="r-container">
            <p className="r-overline">Guia Executivo · 2026 · Unfold × Feat.Work</p>
            <h1 className="r-title">Guia de anúncios digitais para as Eleições de 2026</h1>
            <p className="r-subtitle">
              Regras, plataformas, riscos e oportunidades da operação política online.
            </p>
          </div>
        </section>
        <GuiaProseRenderer sections={GUIA_PROSE} />
        <StatEnhancer />
      </main>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var s=localStorage.getItem('hotsite_unlocked');if(s&&JSON.parse(s).hotsite_unlocked===true){var e=document.getElementById('guia-root');if(e){e.classList.remove('guia-locked')}}}catch(_){}",
        }}
      />
      <GateProvider />
    </>
  )
}
