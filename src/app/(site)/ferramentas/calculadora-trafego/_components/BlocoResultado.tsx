'use client'

/**
 * Bloco C — Resultado dinâmico.
 *
 * Compõe os cards de ROI + funil visual + dispara `resultado_visualizado`
 * uma vez por sessão quando inputs ficam válidos.
 *
 * Fix pré-prod (auditoria @architect): a persistência inicial é disparada
 * APENAS uma vez por token (não mais a cada keystroke). Persistências
 * subsequentes acontecem on clique CTA / on baixar PDF / on share.
 */

import { useEffect, useRef } from 'react'
import { trackCalcEvent } from '@/lib/analytics/calculadora-events'
import CardsROI from './CardsROI'
import FunilVisual from './FunilVisual'
import type { UseCalculadora } from './useCalculadora'

interface Props {
  hook: UseCalculadora
  /** Callback do shell para expandir o bloco de premissas ao clicar em "Editar premissa". */
  onEditarPremissa?: () => void
}

export default function BlocoResultado({ hook, onEditarPremissa }: Props) {
  const { resultado, resultadoExibicao, premissas, inputsValidos, token, persistir } = hook

  // ref guarda o token já persistido nesta sessão (singleton).
  const persistedTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!inputsValidos) return
    trackCalcEvent({
      event_name: 'resultado_visualizado',
      result_token: token,
    })
    // Persiste só uma vez por token — evita POST a cada mudança de input/premissa.
    if (persistedTokenRef.current !== token) {
      persistedTokenRef.current = token
      void persistir()
    }
    // Intencionalmente NÃO inclui `persistir` nas deps — ele é recriado a cada
    // mudança de state e dispararia o effect novamente. O ref + comparação por
    // token é a guarda contra loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputsValidos, token])

  if (!inputsValidos) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/30 p-6 text-center">
        <p className="text-sm text-foreground/55">
          Ajuste os inputs ao lado para ver o resultado em tempo real.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CardsROI resultado={resultado} />
      <FunilVisual
        resultadoExibicao={resultadoExibicao}
        premissas={premissas}
        onEditarPremissa={onEditarPremissa}
      />
    </div>
  )
}
