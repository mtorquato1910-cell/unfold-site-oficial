import type { Metadata } from 'next'
import { SectionRenderer } from '../_components/redesign/SectionRenderer'
import { GUIA_SECTIONS_POC } from '../_content/guia-data'
import '../_styles/redesign-dark.css'

/**
 * PREVIEW ISOLADO da repaginação visual (Redesign S0 — POC).
 *
 * Rota: /featwork/preview — NÃO afeta a página de produção (/featwork).
 * Renderiza a "Parte 00 — O cenário" no tema dark premium para validação
 * visual da direção antes de escalar para o guia inteiro.
 */
export const metadata: Metadata = {
  title: 'Preview — Repaginação Guia Eleições 2026',
  robots: { index: false, follow: false },
}

export default function RedesignPreviewPage() {
  return (
    <main className="guia-redesign">
      <SectionRenderer sections={GUIA_SECTIONS_POC} />
    </main>
  )
}
