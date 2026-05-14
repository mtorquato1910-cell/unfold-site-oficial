'use client'

/**
 * Bloco C — Funil visual de 5 etapas (S3.2).
 *
 * Cada linha tem o valor exibido (regras §6.2 do spec) e um tooltip que
 * mostra a premissa aplicada + um botão "Editar premissa" que rola até
 * o bloco de premissas e o expande.
 */

import { ChevronDown } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Premissas, ResultadoExibicao } from '@/lib/calculadora/types'

interface Props {
  resultadoExibicao: ResultadoExibicao
  premissas: Premissas
  /** Callback chamado quando o lead clica em "Editar premissa". */
  onEditarPremissa?: () => void
}

export default function FunilVisual({ resultadoExibicao: r, premissas, onEditarPremissa }: Props) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-2xl border border-border bg-card/50 p-5 md:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-4">
          Como o investimento vira receita
        </p>
        <div className="space-y-2">
          <FunnelRow
            label="Investimento total"
            valor={r.investimento_total}
            tooltipTitulo="Investimento total"
            tooltipDesc="Investimento mensal × meses de projeção."
          />
          <FunnelDivider />
          <FunnelRow
            label="Leads gerados"
            valor={r.leads_gerados}
            premissaLabel={`CPL aplicado: R$ ${premissas.cpl.toFixed(0)}`}
            tooltipTitulo="CPL aplicado"
            tooltipDesc={`Custo R$ ${premissas.cpl.toFixed(0)} por lead — média dos canais selecionados.`}
            onEditarPremissa={onEditarPremissa}
          />
          <FunnelDivider />
          <FunnelRow
            label="Qualificados (MQLs)"
            valor={r.mqls}
            premissaLabel={`Taxa: ${(premissas.taxa_qualificacao * 100).toFixed(0)}%`}
            tooltipTitulo="Taxa de qualificação"
            tooltipDesc={`${(premissas.taxa_qualificacao * 100).toFixed(0)}% dos leads viram MQLs. Operações com CRM funcional convertem ~2× mais.`}
            onEditarPremissa={onEditarPremissa}
          />
          <FunnelDivider />
          <FunnelRow
            label="Clientes fechados"
            valor={r.clientes_fechados}
            premissaLabel={`Conv. MQL→Cliente: ${(premissas.conversao_mql_cliente * 100).toFixed(0)}%`}
            tooltipTitulo="Conversão MQL → Cliente"
            tooltipDesc={`${(premissas.conversao_mql_cliente * 100).toFixed(0)}% dos MQLs viram clientes pagantes.`}
            onEditarPremissa={onEditarPremissa}
          />
          <FunnelDivider />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <FunnelLeaf
              label="No período"
              valor={r.clientes_no_periodo}
              subLabel="Receita"
              subValor={r.receita_no_periodo}
              tooltipTitulo="Fator temporal"
              tooltipDesc={`${r.fator_temporal_pct} dos clientes fecham dentro da janela de projeção (ciclo: ${premissas.ciclo_dias} dias).`}
              onEditarPremissa={onEditarPremissa}
            />
            <FunnelLeaf
              label="Em pipeline futuro"
              valor={r.clientes_em_pipeline}
              subLabel="Pipeline"
              subValor={r.receita_em_pipeline}
              tooltipTitulo="Pipeline futuro"
              tooltipDesc="Clientes que vão fechar após a janela. Em B2B de ciclo longo, esse é o número que decide o valor real do investimento."
              accent
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

interface FunnelRowProps {
  label: string
  valor: string
  premissaLabel?: string
  tooltipTitulo: string
  tooltipDesc: string
  onEditarPremissa?: () => void
}

function FunnelRow({
  label,
  valor,
  premissaLabel,
  tooltipTitulo,
  tooltipDesc,
  onEditarPremissa,
}: FunnelRowProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-baseline justify-between rounded-md px-3 py-2 hover:bg-card/80 transition-colors cursor-help">
          <div>
            <p className="text-sm font-medium text-foreground/85">{label}</p>
            {premissaLabel && (
              <p className="text-[10px] text-foreground/45 font-mono mt-0.5">{premissaLabel}</p>
            )}
          </div>
          <p className="font-mono font-semibold tabular-nums text-foreground/95">{valor}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px]">
        <p className="font-medium text-xs mb-1">{tooltipTitulo}</p>
        <p className="text-xs text-foreground/70">{tooltipDesc}</p>
        {onEditarPremissa && (
          <button
            type="button"
            onClick={onEditarPremissa}
            className="text-[11px] text-primary hover:underline mt-2"
          >
            Editar premissa →
          </button>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

interface FunnelLeafProps {
  label: string
  valor: string
  subLabel: string
  subValor: string
  tooltipTitulo: string
  tooltipDesc: string
  accent?: boolean
  onEditarPremissa?: () => void
}

function FunnelLeaf({
  label,
  valor,
  subLabel,
  subValor,
  tooltipTitulo,
  tooltipDesc,
  accent,
  onEditarPremissa,
}: FunnelLeafProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`rounded-lg border px-3 py-3 cursor-help ${
            accent
              ? 'border-secondary/30 bg-secondary/5'
              : 'border-border bg-card/70'
          }`}
        >
          <p className="text-[10px] uppercase tracking-wider font-mono text-foreground/55 mb-1">
            {label}
          </p>
          <p className="font-mono font-semibold text-lg tabular-nums">{valor}</p>
          <p className="text-[11px] text-foreground/55 mt-1">
            {subLabel}: <span className="text-foreground/80 font-medium">{subValor}</span>
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px]">
        <p className="font-medium text-xs mb-1">{tooltipTitulo}</p>
        <p className="text-xs text-foreground/70">{tooltipDesc}</p>
        {onEditarPremissa && (
          <button
            type="button"
            onClick={onEditarPremissa}
            className="text-[11px] text-primary hover:underline mt-2"
          >
            Editar premissa →
          </button>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

function FunnelDivider() {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <ChevronDown className="h-3 w-3 text-foreground/30" />
    </div>
  )
}
