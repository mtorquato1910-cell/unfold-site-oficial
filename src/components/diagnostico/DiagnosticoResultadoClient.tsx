'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, CheckCircle2 } from 'lucide-react'

type NivelFit = 'alto' | 'medio' | 'baixo'
type Pilar = 'diagnosticar' | 'estruturar' | 'operar'

const NIVEL_CONFIG: Record<NivelFit, { label: string; color: string; bg: string; badge: string }> = {
  alto: {
    label: 'Alto Fit',
    color: 'text-secondary',
    bg: 'bg-secondary/10 border-secondary/30',
    badge: 'Alto',
  },
  medio: {
    label: 'Médio Fit',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/30',
    badge: 'Médio',
  },
  baixo: {
    label: 'Baixo Fit',
    color: 'text-[hsl(0_84%_60%)]',
    bg: 'bg-[hsl(0_84%_60%/0.1)] border-[hsl(0_84%_60%/0.3)]',
    badge: 'Baixo',
  },
}

const PILAR_LABELS: Record<Pilar, string> = {
  diagnosticar: 'Diagnosticar',
  estruturar: 'Estruturar',
  operar: 'Operar',
}

type Props = {
  nome: string
  score_total: number
  score_diagnosticar: number
  score_estruturar: number
  score_operar: number
  nivel_fit: NivelFit
  pilar_mais_fraco: Pilar
  insight: { headline: string; corpo: string; cta_texto: string }
}

export default function DiagnosticoResultadoClient({
  nome,
  score_total,
  score_diagnosticar,
  score_estruturar,
  score_operar,
  nivel_fit,
  pilar_mais_fraco,
  insight,
}: Props) {
  const config = NIVEL_CONFIG[nivel_fit]

  const radarData = [
    { subject: 'Diagnosticar', A: score_diagnosticar, fullMark: 100 },
    { subject: 'Estruturar', A: score_estruturar, fullMark: 100 },
    { subject: 'Operar', A: score_operar, fullMark: 100 },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
          Diagnóstico concluído
        </p>
        {nome && (
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-3">
            {nome.split(' ')[0]}, aqui está seu resultado
          </h1>
        )}
        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${config.bg} ${config.color} mt-2`}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          {config.label} com o Método UGS
        </div>
      </div>

      {/* Score total */}
      <div className="rounded-2xl border border-border bg-card p-8 mb-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mb-2">
          Score geral de maturidade
        </p>
        <p className={`font-display font-bold text-7xl ${config.color}`}>
          {score_total}
          <span className="text-3xl text-foreground/30">/100</span>
        </p>
      </div>

      {/* Radar Chart + Scores */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Radar */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mb-4">
            Maturidade por pilar
          </p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'hsl(var(--foreground) / 0.6)', fontSize: 11 }}
                />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${value}/100`, 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scores individuais */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mb-4">
            Breakdown por pilar
          </p>
          {([
            { pilar: 'diagnosticar' as Pilar, score: score_diagnosticar },
            { pilar: 'estruturar' as Pilar, score: score_estruturar },
            { pilar: 'operar' as Pilar, score: score_operar },
          ]).map(({ pilar, score }) => (
            <div key={pilar} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium">{PILAR_LABELS[pilar]}</span>
                <span className={`font-mono text-sm font-semibold ${pilar === pilar_mais_fraco ? 'text-[hsl(0_84%_60%)]' : 'text-foreground'}`}>
                  {score}/100
                </span>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${score}%`,
                    background: pilar === pilar_mais_fraco
                      ? 'hsl(0 84% 60%)'
                      : pilar === 'diagnosticar'
                      ? 'hsl(var(--primary))'
                      : pilar === 'estruturar'
                      ? 'hsl(var(--secondary))'
                      : 'hsl(250 64% 70%)',
                  }}
                />
              </div>
              {pilar === pilar_mais_fraco && (
                <p className="text-[10px] font-mono text-[hsl(0_84%_60%)] mt-1">
                  Pilar mais crítico
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insight personalizado */}
      <div className="rounded-2xl border border-border bg-card p-8 mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">
          Insight personalizado
        </p>
        <h2 className="font-display font-bold text-xl md:text-2xl mb-4">{insight.headline}</h2>
        <p className="text-foreground/70 leading-relaxed">{insight.corpo}</p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-foreground/60 text-sm mb-4">
          Quer aprofundar esse diagnóstico com um especialista UGS?
        </p>
        <Button asChild size="lg" className="h-12 px-8 text-base group">
          <Link
            href={process.env.NEXT_PUBLIC_CALENDAR_EMBED_URL || 'https://example.com/agendamento'}
            target="_blank"
            rel="noopener noreferrer"
          >
            {insight.cta_texto}
            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
