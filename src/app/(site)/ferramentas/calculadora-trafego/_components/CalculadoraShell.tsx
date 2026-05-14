'use client'

/**
 * Shell da Calculadora v2 — versão Sprint 3.
 *
 * Estrutura:
 *   - Etapa 1 ainda não concluída → form de qualificação centralizado.
 *   - Concluída → grid 2 colunas (desktop) / coluna única (mobile):
 *       coluna 1: inputs + premissas (sticky desktop)
 *       coluna 2: cards ROI + funil + insight
 *     Abaixo do grid (largura total): CTA Diagnóstico + Fontes.
 */

import { useRef } from 'react'
import { useCalculadora } from './useCalculadora'
import Etapa1Qualificacao from './Etapa1Qualificacao'
import BlocoInputs from './BlocoInputs'
import BlocoPremissas, { type BlocoPremissasHandle } from './BlocoPremissas'
import BlocoResultado from './BlocoResultado'
import BlocoInsight from './BlocoInsight'
import BlocoCTA from './BlocoCTA'
import BlocoFontes from './BlocoFontes'
import BlocoAcoesResultado from './BlocoAcoesResultado'

export default function CalculadoraShell() {
  const hook = useCalculadora()
  const premissasRef = useRef<BlocoPremissasHandle | null>(null)

  function abrirPremissas() {
    premissasRef.current?.abrirEFocar()
  }

  if (!hook.etapa1Concluida) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 md:p-8">
          <Etapa1Qualificacao
            defaultValues={hook.etapa1}
            onConcluir={hook.concluirEtapa1}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-5 md:p-7 space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <BlocoInputs hook={hook} />
          <BlocoPremissas ref={premissasRef} hook={hook} />
        </div>
        <div className="space-y-5">
          <BlocoResultado hook={hook} onEditarPremissa={abrirPremissas} />
          <BlocoInsight selecao={hook.insight} ready={hook.inputsValidos} />
          {hook.inputsValidos && (
            <BlocoAcoesResultado token={hook.token} persistirAntes={hook.persistir} />
          )}
        </div>
      </div>

      <BlocoCTA
        token={hook.token}
        etapa1={hook.etapa1}
        inputs={hook.inputs}
        onAntesDoClique={hook.persistir}
      />
      <BlocoFontes />
    </div>
  )
}
