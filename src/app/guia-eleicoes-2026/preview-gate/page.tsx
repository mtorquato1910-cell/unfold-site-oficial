import type { Metadata } from 'next'
import { SectionRenderer } from '../_components/redesign/SectionRenderer'
import { GatePreview } from '../_components/redesign/GatePreview'
import { GUIA_SECTIONS_POC } from '../_content/guia-data'
import '../_styles/redesign-dark.css'

/**
 * PREVIEW do GATE dark restilizado (Redesign S3) — rota isolada, noindex.
 * Demonstra blur + card glass + microcopy Fase 4 + desbloqueio + download,
 * sobre as seções já no tema dark. Não afeta a produção (/featwork).
 */
export const metadata: Metadata = {
  title: 'Preview Gate — Repaginação Guia Eleições 2026',
  robots: { index: false, follow: false },
}

export default function RedesignGatePreviewPage() {
  return (
    <main className="guia-redesign">
      <GatePreview>
        <SectionRenderer sections={GUIA_SECTIONS_POC} />
      </GatePreview>
    </main>
  )
}
