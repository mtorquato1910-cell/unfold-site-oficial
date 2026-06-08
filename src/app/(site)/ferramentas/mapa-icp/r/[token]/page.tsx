/**
 * Página /ferramentas/mapa-icp/r/[token] — mapa salvo do Radar de Comitê.
 *
 * SSR read-only: lê `mapa-icp-results` pelo token (url_resultado_hash) e
 * renderiza o resultado salvo via <ResultadoMapa>. Sem edição.
 *
 * Headers e proteção:
 *   - noindex (metadata + X-Robots-Tag no middleware).
 *   - Rate limit 10/min/IP no middleware (rota /r/).
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { MapaIcpAIResult } from '@/lib/mapa-icp/types'
import ResultadoMapa from '../../_components/ResultadoMapa'
import styles from '../../montar/montar.module.css'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Seu mapa de ICP & comitê | Unfold Growth',
  description: 'Mapa salvo do Radar de Comitê de Compra.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false } },
}

interface PageProps {
  params: Promise<{ token: string }>
}

const TOKEN_RE = /^[a-f0-9]{16}$/

interface MapaIcpDoc {
  nome?: string
  empresa?: string
  ai_result?: MapaIcpAIResult
}

export default async function MapaIcpResultadoSalvoPage({ params }: PageProps) {
  const { token } = await params

  // Token mal formado → 404 sem consultar o banco (anti-scan).
  if (!TOKEN_RE.test(token)) notFound()

  const payload = await getPayload({ config: configPromise })
  const found = await payload.find({
    collection: 'mapa-icp-results',
    where: { url_resultado_hash: { equals: token } },
    limit: 1,
  })
  const doc = found.docs[0] as unknown as MapaIcpDoc | undefined
  if (!doc || !doc.ai_result) notFound()

  return (
    <div className={styles.root}>
      <div className={`${styles.stage} ${styles.resultStage}`}>
        <ResultadoMapa
          result={doc.ai_result}
          nome={doc.nome}
          token={token}
          footer={
            <div className={styles.nextActions}>
              <a className={styles.btn} href="/diagnostico">
                Fazer o Diagnóstico de Growth
              </a>
              <a
                className={`${styles.btn} ${styles.btnGhost}`}
                href={`/api/mapa-icp/pdf?token=${token}`}
              >
                Receber em PDF
              </a>
            </div>
          }
        />
      </div>
    </div>
  )
}
