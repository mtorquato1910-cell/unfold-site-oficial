'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Calculator, Eye, Trash2, Download } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState } from '@/components/painel/ui'
import { deleteCalculadoraResult } from '@/lib/actions/calculadora-actions'

type Item = {
  id: string
  nome: string
  email: string
  empresa: string
  cargo: string | null
  telefone: string | null
  score: number | null
  leadId: string | null
  inputs: any
  output: any
  createdAt: string
}

function formatDate(d: string): string {
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-dim">—</span>
  let bg = 'hsl(0 0% 100% / 0.04)'
  let color = 'hsl(0 0% 91% / 0.6)'
  let border = 'hsl(0 0% 100% / 0.10)'
  if (score >= 70) {
    bg = 'hsl(158 92% 70% / 0.12)'
    color = 'hsl(158 92% 70%)'
    border = 'hsl(158 92% 70% / 0.25)'
  } else if (score >= 40) {
    bg = 'hsl(45 95% 65% / 0.10)'
    color = 'hsl(45 95% 80%)'
    border = 'hsl(45 95% 65% / 0.25)'
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {score}
    </span>
  )
}

export default function CalculadoraClient({
  initialItems,
  canDelete,
}: {
  initialItems: Item[]
  canDelete: boolean
}) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [filterScore, setFilterScore] = useState<'all' | 'alto' | 'medio' | 'baixo'>('all')
  const [searchQ, setSearchQ] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = items.filter((it) => {
    if (filterScore !== 'all' && it.score !== null) {
      if (filterScore === 'alto' && it.score < 70) return false
      if (filterScore === 'medio' && (it.score < 40 || it.score >= 70)) return false
      if (filterScore === 'baixo' && it.score >= 40) return false
    }
    if (searchQ) {
      const q = searchQ.toLowerCase()
      return (
        it.nome.toLowerCase().includes(q) ||
        it.email.toLowerCase().includes(q) ||
        it.empresa.toLowerCase().includes(q)
      )
    }
    return true
  })

  function handleDelete(id: string) {
    if (!window.confirm('Excluir registro? (LGPD: cria entry no AuditLog)')) return
    startTransition(async () => {
      try {
        await deleteCalculadoraResult(id, 'Solicitação de exclusão LGPD')
        setItems((prev) => prev.filter((x) => x.id !== id))
      } catch (err: any) {
        alert(err?.message || 'Falha ao excluir')
      }
    })
  }

  function handleExportCSV() {
    const rows = [
      ['ID', 'Nome', 'Email', 'Empresa', 'Cargo', 'Telefone', 'Score', 'Data'],
      ...filtered.map((it) => [
        it.id,
        sanitizeCsv(it.nome),
        sanitizeCsv(it.email),
        sanitizeCsv(it.empresa),
        sanitizeCsv(it.cargo || ''),
        sanitizeCsv(it.telefone || ''),
        String(it.score ?? ''),
        formatDate(it.createdAt),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calculadora-results-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader
        title="Calculadora de Tráfego"
        description={`${items.length} submissão${items.length !== 1 ? 'ões' : ''} · quem usou a ferramenta`}
        actions={
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium disabled:opacity-50"
            style={{
              background: 'hsl(0 0% 100% / 0.04)',
              color: 'hsl(0 0% 91%)',
              border: '1px solid hsl(158 92% 70% / 0.15)',
            }}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Buscar nome, email, empresa..."
          className="px-3 py-2 rounded-lg text-[13px] outline-none flex-1 min-w-[200px]"
          style={{
            background: 'hsl(197 100% 10%)',
            border: '1px solid hsl(158 92% 70% / 0.15)',
            color: 'hsl(0 0% 91%)',
          }}
        />
        <select
          value={filterScore}
          onChange={(e) => setFilterScore(e.target.value as any)}
          className="px-3 py-2 rounded-lg text-[13px] outline-none"
          style={{
            background: 'hsl(197 100% 10%)',
            border: '1px solid hsl(158 92% 70% / 0.15)',
            color: 'hsl(0 0% 91%)',
          }}
        >
          <option value="all">Todos os scores</option>
          <option value="alto">Alto (≥70)</option>
          <option value="medio">Médio (40-69)</option>
          <option value="baixo">Baixo (&lt;40)</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma submissão encontrada"
          description="Submissões da Calculadora de Tráfego aparecem aqui."
          icon={Calculator}
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                  {['Nome', 'Empresa', 'Email', 'Cargo', 'Score', 'Data', ''].map((h) => (
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
                {filtered.map((it, i) => (
                  <tr
                    key={it.id}
                    style={{
                      borderBottom:
                        i < filtered.length - 1 ? '1px solid hsl(158 92% 70% / 0.06)' : undefined,
                    }}
                    className="hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium text-fg">{it.nome}</td>
                    <td className="px-4 py-3 text-fg">{it.empresa}</td>
                    <td className="px-4 py-3 text-dim-2 text-[12px]">{it.email}</td>
                    <td className="px-4 py-3 text-dim-2 text-[12px]">{it.cargo || '—'}</td>
                    <td className="px-4 py-3">
                      <ScorePill score={it.score} />
                    </td>
                    <td className="px-4 py-3 text-dim font-mono text-[11px]">
                      {formatDate(it.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/admin/calculadora/${it.id}`}
                          className="p-1.5 rounded-md hover:bg-white/[0.06]"
                          style={{ color: 'hsl(158 92% 70% / 0.7)' }}
                          title="Ver detalhes"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(it.id)}
                            disabled={isPending}
                            className="p-1.5 rounded-md hover:bg-red-500/10"
                            style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                            title="Excluir (LGPD)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </>
  )
}

function sanitizeCsv(value: string): string {
  // QA AC20: anti-formula injection
  if (/^[=+\-@]/.test(value)) return `'${value}`
  return value
}
