'use client'

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState } from '@/components/painel/ui'

type DiagnosticoResult = {
  id: string
  company?: string
  responsible?: string
  email?: string
  score?: number
  maturityLevel?: string
  createdAt?: string
  [key: string]: any
}

const MATURITY_BADGE: Record<string, { label: string; style: React.CSSProperties }> = {
  basico: {
    label: 'Básico',
    style: { background: 'hsl(0 0% 91% / 0.08)', color: 'hsl(0 0% 91% / 0.6)', border: '1px solid hsl(0 0% 91% / 0.12)' },
  },
  intermediario: {
    label: 'Intermediário',
    style: { background: 'hsl(217 93% 78% / 0.12)', color: 'hsl(217 93% 78%)', border: '1px solid hsl(217 93% 78% / 0.25)' },
  },
  avancado: {
    label: 'Avançado',
    style: { background: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)', border: '1px solid hsl(158 92% 70% / 0.25)' },
  },
  expert: {
    label: 'Expert',
    style: { background: 'hsl(45 93% 70% / 0.12)', color: 'hsl(45 93% 70%)', border: '1px solid hsl(45 93% 70% / 0.25)' },
  },
}

function MaturityBadge({ level }: { level?: string }) {
  const key = (level || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const config = MATURITY_BADGE[key] ?? {
    label: level || '—',
    style: { background: 'hsl(0 0% 91% / 0.08)', color: 'hsl(0 0% 91% / 0.6)', border: '1px solid hsl(0 0% 91% / 0.12)' },
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
      style={config.style}
    >
      {config.label}
    </span>
  )
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DiagnosticoClient({ initialResults }: { initialResults: DiagnosticoResult[] }) {
  const [selected, setSelected] = useState<DiagnosticoResult | null>(null)

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Diagnósticos"
        description={`${initialResults.length} diagnóstico${initialResults.length !== 1 ? 's' : ''} realizados`}
      />

      {initialResults.length === 0 ? (
        <EmptyState
          title="Nenhum diagnóstico encontrado"
          description="Resultados do diagnóstico de maturidade aparecerão aqui."
          icon={ClipboardList}
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                  {['Empresa', 'Responsável', 'Email', 'Score', 'Maturidade', 'Data'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: 'hsl(0 0% 91% / 0.42)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {initialResults.map((item, i) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer transition-colors"
                    style={{
                      borderBottom: i < initialResults.length - 1 ? '1px solid hsl(158 92% 70% / 0.06)' : undefined,
                    }}
                    onClick={() => setSelected(item)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(158 92% 70% / 0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'hsl(0 0% 91%)' }}>
                      {item.company || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                      {item.responsible || item.name || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                      {item.email || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-display text-[22px] font-semibold"
                        style={{ color: 'hsl(158 92% 70%)', letterSpacing: '-0.03em' }}
                      >
                        {item.score ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <MaturityBadge level={item.maturityLevel} />
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.5)' }}>
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 8% / 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6"
            style={{
              background: 'hsl(197 100% 10%)',
              border: '1px solid hsl(158 92% 70% / 0.15)',
              boxShadow: '0 24px 64px hsl(0 0% 0% / 0.5)',
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1" style={{ color: 'hsl(158 92% 70% / 0.8)' }}>
                  Diagnóstico Completo
                </div>
                <h3 className="font-display text-[20px] font-semibold" style={{ color: 'hsl(0 0% 91%)' }}>
                  {selected.company || '—'}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5"
                style={{ color: 'hsl(0 0% 91% / 0.5)' }}
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-center mb-6">
              <div
                className="flex flex-col items-center justify-center rounded-2xl w-28 h-28"
                style={{ background: 'hsl(158 92% 70% / 0.08)', border: '1px solid hsl(158 92% 70% / 0.2)' }}
              >
                <span
                  className="font-display text-[42px] font-semibold leading-none"
                  style={{ color: 'hsl(158 92% 70%)', letterSpacing: '-0.04em' }}
                >
                  {selected.score ?? '—'}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: 'hsl(158 92% 70% / 0.7)' }}>
                  Score
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Empresa', value: selected.company },
                { label: 'Responsável', value: selected.responsible || selected.name },
                { label: 'Email', value: selected.email },
                { label: 'Data', value: formatDate(selected.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.18em] w-24 shrink-0"
                    style={{ color: 'hsl(0 0% 91% / 0.42)' }}
                  >
                    {label}
                  </span>
                  <span className="text-[13px]" style={{ color: 'hsl(0 0% 91% / 0.85)' }}>
                    {value || '—'}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.18em] w-24 shrink-0"
                  style={{ color: 'hsl(0 0% 91% / 0.42)' }}
                >
                  Maturidade
                </span>
                <MaturityBadge level={selected.maturityLevel} />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium"
                style={{ color: 'hsl(0 0% 91% / 0.6)', background: 'hsl(0 0% 100% / 0.05)' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
