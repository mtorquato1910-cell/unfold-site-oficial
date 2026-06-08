'use client'

import { useState } from 'react'
import { Radar, ArrowUpRight, ShieldAlert } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState } from '@/components/painel/ui'

type ComiteItem = {
  papel?: string
  tem_veto?: boolean
  prioriza?: string
  o_que_convence?: string
  o_que_trava?: string
  angulo_mensagem?: string
}

type AiResult = {
  icp_estrutural?: { resumo?: string; atributos_fit?: string[] }
  anti_icp?: { resumo?: string; sinais_desfit?: string[] }
  maturidade_icp?: { nivel?: string; leitura?: string }
  comite?: ComiteItem[]
  proximo_passo?: string
} | null

type MapaIcpResult = {
  id: string
  email?: string
  name?: string
  company?: string
  role?: string
  phone?: string
  fitScore?: number
  fitTier?: string
  ticketRange?: string
  ciclo?: string
  modelo?: string
  nDecisores?: string
  maturidadeIcp?: string
  aiResult?: AiResult
  resultHash?: string
  createdAt?: string
  [key: string]: any
}

const FIT_BADGE: Record<string, { label: string; style: React.CSSProperties }> = {
  fit_alto: {
    label: 'Alto',
    style: { background: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)', border: '1px solid hsl(158 92% 70% / 0.25)' },
  },
  fit_medio: {
    label: 'Médio',
    style: { background: 'hsl(217 93% 78% / 0.12)', color: 'hsl(217 93% 78%)', border: '1px solid hsl(217 93% 78% / 0.25)' },
  },
  fit_baixo: {
    label: 'Baixo',
    style: { background: 'hsl(0 0% 91% / 0.08)', color: 'hsl(0 0% 91% / 0.6)', border: '1px solid hsl(0 0% 91% / 0.12)' },
  },
}

function FitBadge({ tier, score }: { tier?: string; score?: number }) {
  const config = FIT_BADGE[tier ?? ''] ?? {
    label: '—',
    style: { background: 'hsl(0 0% 91% / 0.08)', color: 'hsl(0 0% 91% / 0.6)', border: '1px solid hsl(0 0% 91% / 0.12)' },
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
      style={config.style}
    >
      {config.label}
      {typeof score === 'number' && (
        <span className="font-semibold opacity-80">{score}</span>
      )}
    </span>
  )
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[9px] uppercase tracking-[0.22em] mb-2" style={{ color: 'hsl(158 92% 70% / 0.8)' }}>
      {children}
    </div>
  )
}

export default function MapaIcpClient({ initialResults }: { initialResults: MapaIcpResult[] }) {
  const [selected, setSelected] = useState<MapaIcpResult | null>(null)
  const ai = selected?.aiResult ?? null

  return (
    <>
      <PageHeader
        title="Radar de Comitê"
        description="Leads gerados pela ferramenta Radar de Comitê de Compra (Mapa de ICP)"
      />

      {initialResults.length === 0 ? (
        <EmptyState
          title="Nenhum lead encontrado"
          description="Os mapas de ICP & comitê gerados pela ferramenta aparecerão aqui."
          icon={Radar}
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                  {['Empresa', 'Nome', 'E-mail', 'Fit', 'Ticket', 'Nº decisores', 'Data'].map((h) => (
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
                      {item.name || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                      {item.email || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <FitBadge tier={item.fitTier} score={item.fitScore} />
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                      {item.ticketRange || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                      {item.nDecisores || '—'}
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
            className="w-full max-w-2xl rounded-2xl p-6 max-h-[88vh] overflow-y-auto"
            style={{
              background: 'hsl(197 100% 10%)',
              border: '1px solid hsl(158 92% 70% / 0.15)',
              boxShadow: '0 24px 64px hsl(0 0% 0% / 0.5)',
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1" style={{ color: 'hsl(158 92% 70% / 0.8)' }}>
                  Mapa de ICP & Comitê
                </div>
                <h3 className="font-display text-[20px] font-semibold" style={{ color: 'hsl(0 0% 91%)' }}>
                  {selected.company || '—'}
                </h3>
                <div className="mt-2">
                  <FitBadge tier={selected.fitTier} score={selected.fitScore} />
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5"
                style={{ color: 'hsl(0 0% 91% / 0.5)' }}
              >
                ✕
              </button>
            </div>

            {/* Lead meta */}
            <div className="space-y-3 mb-6">
              {[
                { label: 'Nome', value: selected.name },
                { label: 'E-mail', value: selected.email },
                { label: 'Cargo', value: selected.role },
                { label: 'Telefone', value: selected.phone },
                { label: 'Ticket', value: selected.ticketRange },
                { label: 'Ciclo', value: selected.ciclo },
                { label: 'Modelo', value: selected.modelo },
                { label: 'Nº decisores', value: selected.nDecisores },
                { label: 'Maturidade ICP', value: selected.maturidadeIcp },
                { label: 'Data', value: formatDate(selected.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.18em] w-28 shrink-0"
                    style={{ color: 'hsl(0 0% 91% / 0.42)' }}
                  >
                    {label}
                  </span>
                  <span className="text-[13px]" style={{ color: 'hsl(0 0% 91% / 0.85)' }}>
                    {value || '—'}
                  </span>
                </div>
              ))}
            </div>

            {/* Mapa gerado pela IA */}
            {ai ? (
              <div className="space-y-5">
                {/* ICP */}
                {ai.icp_estrutural && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'hsl(158 92% 70% / 0.05)', border: '1px solid hsl(158 92% 70% / 0.12)' }}
                  >
                    <SectionLabel>ICP estrutural</SectionLabel>
                    {ai.icp_estrutural.resumo && (
                      <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'hsl(0 0% 91% / 0.85)' }}>
                        {ai.icp_estrutural.resumo}
                      </p>
                    )}
                    {Array.isArray(ai.icp_estrutural.atributos_fit) && ai.icp_estrutural.atributos_fit.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {ai.icp_estrutural.atributos_fit.map((a, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px]"
                            style={{ background: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)' }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Anti-ICP */}
                {ai.anti_icp && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'hsl(0 0% 100% / 0.03)', border: '1px solid hsl(0 0% 100% / 0.08)' }}
                  >
                    <SectionLabel>
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldAlert className="h-3 w-3" /> Anti-ICP
                      </span>
                    </SectionLabel>
                    {ai.anti_icp.resumo && (
                      <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'hsl(0 0% 91% / 0.75)' }}>
                        {ai.anti_icp.resumo}
                      </p>
                    )}
                    {Array.isArray(ai.anti_icp.sinais_desfit) && ai.anti_icp.sinais_desfit.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {ai.anti_icp.sinais_desfit.map((a, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px]"
                            style={{ background: 'hsl(0 0% 91% / 0.08)', color: 'hsl(0 0% 91% / 0.6)' }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Maturidade */}
                {ai.maturidade_icp && (ai.maturidade_icp.nivel || ai.maturidade_icp.leitura) && (
                  <div>
                    <SectionLabel>Maturidade do ICP</SectionLabel>
                    {ai.maturidade_icp.nivel && (
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider mb-2"
                        style={{ background: 'hsl(217 93% 78% / 0.12)', color: 'hsl(217 93% 78%)', border: '1px solid hsl(217 93% 78% / 0.25)' }}
                      >
                        {ai.maturidade_icp.nivel}
                      </span>
                    )}
                    {ai.maturidade_icp.leitura && (
                      <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(0 0% 91% / 0.8)' }}>
                        {ai.maturidade_icp.leitura}
                      </p>
                    )}
                  </div>
                )}

                {/* Comitê */}
                {Array.isArray(ai.comite) && ai.comite.length > 0 && (
                  <div>
                    <SectionLabel>Comitê de compra</SectionLabel>
                    <div className="space-y-3">
                      {ai.comite.map((c, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl p-4"
                          style={{ background: 'hsl(0 0% 100% / 0.03)', border: '1px solid hsl(158 92% 70% / 0.1)' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-display text-[15px] font-semibold" style={{ color: 'hsl(0 0% 91%)' }}>
                              {c.papel || '—'}
                            </span>
                            {c.tem_veto && (
                              <span
                                className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                                style={{ background: 'hsl(0 84% 70% / 0.12)', color: 'hsl(0 84% 75%)', border: '1px solid hsl(0 84% 70% / 0.25)' }}
                              >
                                Veto
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {[
                              { label: 'Prioriza', value: c.prioriza },
                              { label: 'Convence', value: c.o_que_convence },
                              { label: 'Trava', value: c.o_que_trava },
                              { label: 'Ângulo', value: c.angulo_mensagem },
                            ]
                              .filter((row) => row.value)
                              .map((row) => (
                                <div key={row.label} className="flex gap-3">
                                  <span
                                    className="font-mono text-[9px] uppercase tracking-[0.18em] w-20 shrink-0 pt-0.5"
                                    style={{ color: 'hsl(0 0% 91% / 0.42)' }}
                                  >
                                    {row.label}
                                  </span>
                                  <span className="text-[12px] leading-relaxed" style={{ color: 'hsl(0 0% 91% / 0.8)' }}>
                                    {row.value}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Próximo passo */}
                {ai.proximo_passo && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'hsl(158 92% 70% / 0.08)', border: '1px solid hsl(158 92% 70% / 0.2)' }}
                  >
                    <SectionLabel>Próximo passo</SectionLabel>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(0 0% 91% / 0.9)' }}>
                      {ai.proximo_passo}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px]" style={{ color: 'hsl(0 0% 91% / 0.5)' }}>
                Mapa ainda não gerado para este lead.
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              {selected.resultHash ? (
                <a
                  href={`/ferramentas/mapa-icp/r/${selected.resultHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium"
                  style={{ color: 'hsl(158 92% 70%)', background: 'hsl(158 92% 70% / 0.1)', border: '1px solid hsl(158 92% 70% / 0.2)' }}
                >
                  Abrir resultado público
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span />
              )}
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
