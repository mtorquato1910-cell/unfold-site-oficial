'use client'

/**
 * Bloco E — CTA único para o Diagnóstico de Growth (S3.4).
 *
 * - Persiste `CalcToDiagPayload` no sessionStorage com a key contratual
 *   `calc-v2:para-diagnostico` (ADR-4 / contract.calcToDiagSchema).
 * - Navega para `/diagnostico?origem=calculadora&token={token}` para que o
 *   produto Diagnóstico (S3.0) consiga ler tanto via URL quanto via storage.
 * - Dispara `calculadora_para_diagnostico` (singleton por sessão).
 *
 * Bloqueado por S3.0 (PR no produto Diagnóstico) — Sprint 3 deixa o lado
 * Calculadora pronto. Sem o lado Diagnóstico, o lead aterrissa em
 * /diagnostico sem pré-preenchimento (degradação aceitável).
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CALC_TO_DIAG_QUERY_PARAM,
  CALC_TO_DIAG_STORAGE_KEY,
  CALC_TO_DIAG_TOKEN_PARAM,
  encodeCalcToDiag,
} from '@/lib/contracts/calc-to-diag'
import { trackCalcEvent } from '@/lib/analytics/calculadora-events'
import type { CalculadoraInputs, Etapa1 } from '@/lib/calculadora/types'

interface Props {
  token: string
  etapa1: Etapa1
  inputs: CalculadoraInputs
  /** Hook chamado antes da navegação — usado para garantir persistência do snapshot. */
  onAntesDoClique?: () => Promise<unknown>
}

export default function BlocoCTA({ token, etapa1, inputs, onAntesDoClique }: Props) {
  const href = `/diagnostico?${CALC_TO_DIAG_QUERY_PARAM}=calculadora&${CALC_TO_DIAG_TOKEN_PARAM}=${token}`

  function onClick() {
    // Best-effort: persiste estado final antes do lead sair da página.
    if (onAntesDoClique) {
      void onAntesDoClique()
    }
    try {
      const payload = encodeCalcToDiag({
        token,
        nome: etapa1.nome.trim(),
        email: etapa1.email.trim().toLowerCase(),
        empresa: etapa1.empresa.trim(),
        setor: etapa1.setor,
        crm_funcional: inputs.crm_funcional,
        ticket_medio: inputs.ticket_medio,
        investimento_mensal: inputs.investimento_mensal,
      })
      window.sessionStorage.setItem(CALC_TO_DIAG_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* sessionStorage indisponível — lead continua, Diagnóstico vai pedir os campos */
    }
    trackCalcEvent({
      event_name: 'calculadora_para_diagnostico',
      result_token: token,
      lead_email: etapa1.email.toLowerCase().trim(),
      metadata: { setor: etapa1.setor },
    })
  }

  return (
    <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/12 to-primary/4 p-6 md:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-3">
        Próximo passo
      </p>
      <p className="text-base md:text-lg text-foreground/90 leading-relaxed max-w-xl mb-5">
        Esse cálculo assume que sua operação opera com taxas médias de mercado. Quer descobrir
        como sua operação realmente performa contra esses benchmarks?
      </p>
      <Button asChild size="lg" className="h-12 gap-2">
        <Link href={href} onClick={onClick}>
          Fazer o Diagnóstico de Growth <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      <p className="mt-3 text-[12px] text-foreground/80">
        Diagnóstico completo de 5 min · Gratuito
      </p>
    </section>
  )
}
