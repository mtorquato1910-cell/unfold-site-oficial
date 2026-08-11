'use client'

/**
 * Bloco D — Insight personalizado (S3.3).
 *
 * Card principal com título + manchete em destaque + corpo (70-90 palavras).
 * Se override I-E ativo, card secundário menor abaixo (acompanha, não substitui).
 *
 * Texto vem 100% de src/lib/calculadora/insights.ts (proibido inline).
 * Dispara evento `insight_exibido` quando combinação principal/override muda.
 */

import { useEffect } from 'react'
import { INSIGHTS_BY_ID } from '@/lib/calculadora/insights'
import { trackCalcEvent } from '@/lib/analytics/calculadora-events'
import type { SelecaoInsight } from '@/lib/calculadora/types'

interface Props {
  selecao: SelecaoInsight
  ready: boolean
}

export default function BlocoInsight({ selecao, ready }: Props) {
  const principal = INSIGHTS_BY_ID[selecao.principal]
  const override = selecao.override_ie ? INSIGHTS_BY_ID['I-E'] : null

  useEffect(() => {
    if (!ready) return
    trackCalcEvent({
      event_name: 'insight_exibido',
      metadata: { principal: selecao.principal, override: selecao.override_ie },
    })
  }, [ready, selecao.principal, selecao.override_ie])

  if (!ready) return null

  return (
    <section aria-labelledby={`insight-titulo-${principal.id}`} className="space-y-3">
      <article
        key={principal.id}
        className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/8 to-primary/2 p-5 md:p-7 animate-in fade-in duration-300"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-3">
          Leitura {principal.id}
        </p>
        <h3
          id={`insight-titulo-${principal.id}`}
          className="font-display font-bold text-xl md:text-2xl leading-tight mb-3"
        >
          {principal.titulo}
        </h3>
        <p className="text-base text-foreground/85 font-medium leading-relaxed mb-3">
          {principal.manchete}
        </p>
        <p className="text-sm text-foreground/70 leading-relaxed">{principal.corpo}</p>
      </article>

      {override && (
        <article
          key="override-IE"
          className="rounded-2xl border border-secondary/25 bg-secondary/5 p-4 md:p-5 animate-in fade-in slide-in-from-top-1 duration-300"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-secondary/85 mb-2">
            Observação adicional · I-E
          </p>
          <p className="text-sm text-foreground/85 font-medium leading-relaxed mb-2">
            {override.manchete}
          </p>
          <p className="text-[13px] text-foreground/85 leading-relaxed">{override.corpo}</p>
        </article>
      )}
    </section>
  )
}
