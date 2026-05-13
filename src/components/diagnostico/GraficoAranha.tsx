'use client'

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'

import { LABEL_EIXO } from '@/lib/scoring/textos'
import type { Eixo, FaixaMaturidade } from '@/lib/scoring/types'

// Cores APR V2 — spec §5.5.
// Nota: a spec lista "Crítica" como Navy #001E29 (mesma cor do background do site),
// o que tornaria a faixa invisível. Substituído por coral #FF6B5C para sinalização visual.
// Decisão técnica registrada em docs/sprints-diagnostico-v2-ajustes.md.
const COR_POR_FAIXA: Record<FaixaMaturidade, string> = {
  critica: '#FF6B5C',
  'em-formacao': '#9B7BFF', // derivado do #2E1A7F (tertiary) — versão clareada para legibilidade
  estruturada: '#93BAFB', // spec
  madura: '#6DF9C6', // spec
}

function faixaDoScore(score: number): FaixaMaturidade {
  if (score <= 25) return 'critica'
  if (score <= 50) return 'em-formacao'
  if (score <= 75) return 'estruturada'
  return 'madura'
}

interface Props {
  scores: Record<Eixo, number>
  size?: number // altura do gráfico
}

export default function GraficoAranha({ scores, size = 320 }: Props) {
  const data = (
    ['diagnosticar', 'estruturar', 'operar', 'evoluir', 'gestao'] as Eixo[]
  ).map((eixo) => ({
    subject: LABEL_EIXO[eixo],
    valor: scores[eixo],
  }))

  const media = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length,
  )
  const cor = COR_POR_FAIXA[faixaDoScore(media)]

  return (
    <div className="relative" style={{ height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.4} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: 'hsl(var(--foreground))',
              fontSize: 12,
              fontFamily: 'inherit',
              opacity: 0.75,
            }}
          />
          <Radar
            name="Score"
            dataKey="valor"
            stroke={cor}
            fill={cor}
            fillOpacity={0.25}
            strokeWidth={2}
            // animação suave; sem dependência de Date.now (deterministic on SSR re-hydration)
            isAnimationActive
            animationDuration={800}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Texto-equivalente acessível para screen readers (G3.4 do QA). */}
      <table className="sr-only" aria-label="Scores por eixo">
        <thead>
          <tr>
            <th>Eixo</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.subject}>
              <td>{d.subject}</td>
              <td>{d.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
