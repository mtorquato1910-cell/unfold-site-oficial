'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Download, Filter } from 'lucide-react'

import { PageHeader, GlassCard } from '@/components/painel/ui'

export interface FunilData {
  counts: {
    iniciado: number
    etapa1: number
    concluido: number
    pdfBaixado: number
    agendado: number
  }
  distFaixaFit: Record<string, number>
  topPadroes: Record<string, number>
  totalResultados: number
  filtros: {
    de?: string
    ate?: string
    setor?: string
    faixa_fit?: string
  }
}

const FAIXA_LABELS: Record<string, string> = {
  'fit-alto': 'Fit Alto',
  'fit-medio': 'Fit Médio',
  'fit-baixo': 'Fit Baixo',
  desfit: 'Desfit',
}

const SETOR_OPTIONS = [
  { value: '', label: 'Todos os setores' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'agro', label: 'Agronegócio' },
  { value: 'saas', label: 'Tecnologia / SaaS' },
  { value: 'automotivo', label: 'Automotivo' },
  { value: 'industria', label: 'Indústria' },
  { value: 'servicos', label: 'Serviços B2B' },
  { value: 'outro', label: 'Outro' },
]

function taxa(num: number, den: number): string {
  if (den === 0) return '—'
  return `${Math.round((num / den) * 100)}%`
}

export default function FunilClient({ data }: { data: FunilData }) {
  const router = useRouter()
  const sp = useSearchParams()

  const [de, setDe] = useState(data.filtros.de || '')
  const [ate, setAte] = useState(data.filtros.ate || '')
  const [setor, setSetor] = useState(data.filtros.setor || '')
  const [faixaFit, setFaixaFit] = useState(data.filtros.faixa_fit || '')

  function aplicarFiltros() {
    const params = new URLSearchParams(sp.toString())
    if (de) params.set('de', de); else params.delete('de')
    if (ate) params.set('ate', ate); else params.delete('ate')
    if (setor) params.set('setor', setor); else params.delete('setor')
    if (faixaFit) params.set('faixa_fit', faixaFit); else params.delete('faixa_fit')
    router.push(`/painel/diagnostico/funil?${params.toString()}`)
  }

  function limparFiltros() {
    setDe('')
    setAte('')
    setSetor('')
    setFaixaFit('')
    router.push('/painel/diagnostico/funil')
  }

  function exportarCSV() {
    const params = new URLSearchParams(sp.toString())
    window.location.href = `/api/painel/diagnostico/export-csv?${params.toString()}`
  }

  const padroesOrdenados = Object.entries(data.topPadroes).sort((a, b) => b[1] - a[1])

  const { counts } = data

  return (
    <>
      <PageHeader
        title="Funil do Diagnóstico"
        description="Conversão entre etapas, distribuição por faixa de Fit e padrões mais acionados."
      />

      {/* Filtros */}
      <GlassCard className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-[hsl(0_0%_91%_/_0.5)]" />
          <h3 className="font-display text-[14px] font-medium text-[hsl(0_0%_91%)]">Filtros</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <FieldLabel label="De">
            <input
              type="date"
              value={de ? de.slice(0, 10) : ''}
              onChange={(e) => setDe(e.target.value)}
              className="input-field h-9 text-[12px]"
            />
          </FieldLabel>
          <FieldLabel label="Até">
            <input
              type="date"
              value={ate ? ate.slice(0, 10) : ''}
              onChange={(e) => setAte(e.target.value)}
              className="input-field h-9 text-[12px]"
            />
          </FieldLabel>
          <FieldLabel label="Setor">
            <select
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              className="input-field h-9 text-[12px]"
            >
              {SETOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label="Faixa Fit">
            <select
              value={faixaFit}
              onChange={(e) => setFaixaFit(e.target.value)}
              className="input-field h-9 text-[12px]"
            >
              <option value="">Todas</option>
              {Object.entries(FAIXA_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </FieldLabel>
          <div className="flex items-end gap-2">
            <button
              onClick={aplicarFiltros}
              className="flex-1 h-9 px-3 rounded-lg text-[12px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Aplicar
            </button>
            <button
              onClick={limparFiltros}
              className="h-9 px-3 rounded-lg text-[12px] font-medium border border-border text-foreground/70 hover:bg-card transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Funil de conversão */}
      <GlassCard className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-[15px] font-medium text-[hsl(0_0%_91%)]">
            Funil de conversão
          </h3>
          <button
            onClick={exportarCSV}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-medium border border-border text-foreground/70 hover:bg-card transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <FunnelCard
            label="Iniciaram"
            valor={counts.iniciado}
            base={counts.iniciado}
            conversao="—"
          />
          <FunnelCard
            label="Etapa 1 concluída"
            valor={counts.etapa1}
            base={counts.iniciado}
            conversao={taxa(counts.etapa1, counts.iniciado)}
          />
          <FunnelCard
            label="Concluíram"
            valor={counts.concluido}
            base={counts.etapa1}
            conversao={taxa(counts.concluido, counts.etapa1)}
            destacado
          />
          <FunnelCard
            label="Baixaram PDF"
            valor={counts.pdfBaixado}
            base={counts.concluido}
            conversao={taxa(counts.pdfBaixado, counts.concluido)}
          />
          <FunnelCard
            label="Agendaram"
            valor={counts.agendado}
            base={counts.concluido}
            conversao={taxa(counts.agendado, counts.concluido)}
          />
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribuição por faixa Fit */}
        <GlassCard>
          <h3 className="font-display text-[15px] font-medium text-[hsl(0_0%_91%)] mb-4">
            Distribuição por faixa Fit
          </h3>
          <div className="space-y-3">
            {Object.entries(FAIXA_LABELS).map(([key, label]) => {
              const v = data.distFaixaFit[key] || 0
              const pct = data.totalResultados > 0 ? Math.round((v / data.totalResultados) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="text-foreground/80">{label}</span>
                    <span className="font-mono text-foreground/60">
                      {v} <span className="text-foreground/30">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[hsl(0_0%_100%_/_0.05)] overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-foreground/40 mt-4">
            Base: {data.totalResultados} resultado{data.totalResultados === 1 ? '' : 's'} no filtro atual.
          </p>
        </GlassCard>

        {/* Top padrões acionados */}
        <GlassCard>
          <h3 className="font-display text-[15px] font-medium text-[hsl(0_0%_91%)] mb-4">
            Padrões mais acionados
          </h3>
          {padroesOrdenados.length === 0 ? (
            <p className="text-[12px] text-foreground/45">
              Sem dados de padrões no filtro atual.
            </p>
          ) : (
            <ul className="space-y-2">
              {padroesOrdenados.slice(0, 8).map(([codigo, count]) => {
                const max = padroesOrdenados[0][1]
                const pct = Math.round((count / max) * 100)
                return (
                  <li key={codigo}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-mono text-foreground/75">{codigo}</span>
                      <span className="font-mono text-foreground/60">{count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[hsl(0_0%_100%_/_0.05)] overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </GlassCard>
      </div>
    </>
  )
}

function FunnelCard({
  label,
  valor,
  base,
  conversao,
  destacado,
}: {
  label: string
  valor: number
  base: number
  conversao: string
  destacado?: boolean
}) {
  return (
    <div
      className={`rounded-xl p-4 ${
        destacado
          ? 'bg-primary/8 border border-primary/30'
          : 'bg-[hsl(0_0%_100%_/_0.02)] border border-border'
      }`}
    >
      <p className="text-[10px] font-mono uppercase tracking-wider text-foreground/45 mb-2">
        {label}
      </p>
      <p className="font-display text-[26px] font-semibold leading-none text-foreground tabular-nums">
        {valor}
      </p>
      <p className="text-[11px] text-foreground/45 mt-2">
        {conversao === '—' ? `—` : `${conversao} de ${base}`}
      </p>
    </div>
  )
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/45">
        {label}
      </span>
      {children}
    </label>
  )
}
