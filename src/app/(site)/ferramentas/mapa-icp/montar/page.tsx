/**
 * /ferramentas/mapa-icp/montar — fluxo do Radar de Comitê de Compra.
 * Telas internas (perguntas + captura + processamento + resultado): noindex.
 */
import type { Metadata } from 'next'
import { Suspense } from 'react'
import MontarClient from './MontarClient'

export const metadata: Metadata = {
  title: 'Montar Mapa de ICP & Comitê | Unfold Growth',
  description: 'Responda 13 perguntas e receba seu mapa de ICP e comitê de compra.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false } },
}

export default function MontarPage() {
  return (
    <Suspense fallback={null}>
      <MontarClient />
    </Suspense>
  )
}
