'use client'

/**
 * Dashboard de funil da Calculadora (Sprint 5 / S5.1).
 *
 * Server Component carrega via `dashboard-queries.ts`. Este componente é só
 * a apresentação — Tailwind + paleta painel.
 */

import { INSIGHTS_BY_ID } from '@/lib/calculadora/insights'
import type { DashboardData } from '@/lib/calculadora-server/dashboard-queries'
import type { InsightId } from '@/lib/calculadora/types'

const INSIGHT_ORDER: InsightId[] = ['I-A', 'I-B', 'I-C', 'I-D']

interface Props {
  data: DashboardData
  periodoLabel: string
}

export default function DashboardFunil({ data, periodoLabel }: Props) {
  const fn = data.funil
  const totalInsight = INSIGHT_ORDER.reduce((acc, id) => acc + data.distInsights[id], 0)
  const totalSetor = data.distSetores.reduce((acc, s) => acc + s.count, 0)

  return (
    <section className="grid gap-4 lg:grid-cols-3 mb-6">
      {/* Funil completo */}
      <Card title="Funil completo" subtitle={periodoLabel} colSpan={2}>
        <FunilBars
          steps={[
            { label: 'Calculadoras iniciadas', value: fn.iniciadas },
            { label: 'Etapa 1 concluída', value: fn.etapa1 },
            { label: 'Resultado visualizado', value: fn.resultadoVisto },
            { label: 'CTA Diagnóstico clicado', value: fn.ctaClicado },
            { label: 'Diagnóstico concluído', value: fn.diagnosticoConcluido },
          ]}
        />
      </Card>

      {/* % Premissas editadas */}
      <Card title="Engajamento profundo" subtitle="Editaram premissas">
        <div className="flex items-baseline gap-2 mb-2">
          <p className="font-mono text-4xl font-bold text-mint tabular-nums">
            {data.premissasEditadas.pct.toFixed(0)}%
          </p>
          <p className="text-[11px] text-dim">
            {data.premissasEditadas.editaram} / {data.premissasEditadas.total}
          </p>
        </div>
        <p className="text-[11px] text-dim-2 leading-relaxed">
          Proxy de engajamento — leads que ajustaram as 4 premissas para refletir
          dados próprios.
        </p>
      </Card>

      {/* Distribuição de insights */}
      <Card title="Distribuição de insights" subtitle={`${totalInsight} resultados`}>
        <ul className="space-y-2">
          {INSIGHT_ORDER.map((id) => {
            const count = data.distInsights[id]
            const pct = totalInsight > 0 ? (count / totalInsight) * 100 : 0
            return (
              <li key={id}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[12px] font-medium">
                    {id} <span className="text-dim-2 font-mono text-[10px]">{INSIGHTS_BY_ID[id].titulo}</span>
                  </span>
                  <span className="font-mono text-[11px] text-dim">
                    {count} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-mint/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
        <p className="text-[10px] text-dim mt-3">
          I-E (override) acionou em {data.distInsightOverride} resultados.
        </p>
      </Card>

      {/* Distribuição setores */}
      <Card title="Setores" subtitle={`${totalSetor} resultados`} colSpan={2}>
        <ul className="space-y-2">
          {data.distSetores.slice(0, 7).map((s) => {
            const pct = totalSetor > 0 ? (s.count / totalSetor) * 100 : 0
            return (
              <li key={s.setor}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[12px]">{s.label}</span>
                  <span className="font-mono text-[11px] text-dim">
                    {s.count} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-mint/40"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      {/* ROI médio por setor */}
      <Card title="ROI médio por setor" subtitle="No período projetado" colSpan={3}>
        {data.roiMedioPorSetor.length === 0 ? (
          <p className="text-[12px] text-dim">Sem dados suficientes.</p>
        ) : (
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-[10px] text-dim font-mono uppercase tracking-wider">
                <th className="py-2 pr-2">Setor</th>
                <th className="py-2 pr-2 text-right">N</th>
                <th className="py-2 pr-2 text-right">ROI período (média)</th>
                <th className="py-2 pr-2 text-right">ROI total (média)</th>
              </tr>
            </thead>
            <tbody>
              {data.roiMedioPorSetor.map((r) => (
                <tr key={r.setor} className="border-t border-white/5">
                  <td className="py-2 pr-2">{r.label}</td>
                  <td className="py-2 pr-2 text-right font-mono text-dim">{r.n}</td>
                  <td className="py-2 pr-2 text-right font-mono">
                    {fmtRoi(r.roiPeriodoMedio)}
                  </td>
                  <td className="py-2 pr-2 text-right font-mono">
                    {fmtRoi(r.roiTotalMedio)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </section>
  )
}

function fmtRoi(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return '—'
  const sinal = n >= 0 ? '+' : ''
  return `${sinal}${Math.round(n)}%`
}

interface CardProps {
  title: string
  subtitle?: string
  colSpan?: 1 | 2 | 3
  children: React.ReactNode
}

function Card({ title, subtitle, colSpan = 1, children }: CardProps) {
  const span = colSpan === 1 ? '' : colSpan === 2 ? 'lg:col-span-2' : 'lg:col-span-3'
  return (
    <div
      className={`rounded-xl p-4 ${span}`}
      style={{
        background: 'hsl(0 0% 100% / 0.02)',
        border: '1px solid hsl(158 92% 70% / 0.10)',
      }}
    >
      <div className="mb-3">
        <h3 className="text-[13px] font-medium text-fg">{title}</h3>
        {subtitle && <p className="text-[10px] text-dim font-mono uppercase tracking-wider">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function FunilBars({ steps }: { steps: { label: string; value: number }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value))
  return (
    <ul className="space-y-2.5">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null
        const dropoff =
          prev !== null && prev > 0 ? Math.round((1 - s.value / prev) * 100) : null
        const pct = (s.value / max) * 100
        return (
          <li key={s.label}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[12px] font-medium">{s.label}</span>
              <span className="font-mono text-[11px] text-dim">
                {s.value.toLocaleString('pt-BR')}
                {dropoff !== null && dropoff > 0 && (
                  <span className="ml-2 text-[10px] text-amber-400">
                    −{dropoff}% vs etapa anterior
                  </span>
                )}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-mint/70 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
