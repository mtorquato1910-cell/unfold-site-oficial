'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Sparkles, Eye, EyeOff } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState, Field, MintButton } from '@/components/painel/ui'
import { createInsight, updateInsight, deleteInsight } from '@/lib/actions/insights-content-actions'
import { toggleInsightFeatured } from '@/lib/actions/insights-actions'

type Insight = {
  id: string
  title?: string
  maturityLevel?: string
  dimension?: string
  content?: string
  featured?: boolean
  publishOrder?: number
  createdAt?: string
}

type FormData = {
  title: string
  maturityLevel: string
  dimension: string
  content: string
}

const EMPTY_FORM: FormData = { title: '', maturityLevel: 'basico', dimension: '', content: '' }

const MATURITY_OPTIONS = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
  { value: 'expert', label: 'Expert' },
]

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

function truncate(str?: string, max = 80) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

export default function InsightsClient({ initialInsights }: { initialInsights: Insight[] }) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Insight | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(insight: Insight) {
    setEditing(insight)
    setForm({
      title: insight.title || '',
      maturityLevel: insight.maturityLevel || 'basico',
      dimension: insight.dimension || '',
      content: insight.content || '',
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleSubmit() {
    const data = { ...form }
    startTransition(async () => {
      if (editing) {
        await updateInsight(editing.id, data)
        setInsights((prev) => prev.map((i) => i.id === editing.id ? { ...i, ...data } : i))
        showSuccess('Insight atualizado!')
      } else {
        await createInsight(data)
        setInsights((prev) => [...prev, { id: Date.now().toString(), ...data }])
        showSuccess('Insight criado!')
      }
      closeModal()
    })
  }

  function handleDelete(id: string) {
    if (!window.confirm('Remover este insight permanentemente?')) return
    startTransition(async () => {
      await deleteInsight(id)
      setInsights((prev) => prev.filter((i) => i.id !== id))
    })
  }

  function handleToggleFeatured(insight: Insight) {
    startTransition(async () => {
      try {
        await toggleInsightFeatured(insight.id, !insight.featured)
        setInsights((prev) =>
          prev.map((i) => (i.id === insight.id ? { ...i, featured: !i.featured } : i)),
        )
        showSuccess(insight.featured ? 'Despublicado' : 'Publicado no site')
      } catch (err: any) {
        alert(err?.message || 'Falha ao alterar publicação')
      }
    })
  }

  const featuredCount = insights.filter((i) => i.featured).length
  const FEATURED_LIMIT = 6

  return (
    <>
      <PageHeader
        title="Variações de Insights"
        description={`Banco de variações + curadoria pública · ${featuredCount}/${FEATURED_LIMIT} publicados`}
        actions={
          <MintButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo insight
          </MintButton>
        }
      />

      {successMsg && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-[13px] font-medium"
          style={{ background: 'hsl(158 92% 70% / 0.1)', color: 'hsl(158 92% 70%)', border: '1px solid hsl(158 92% 70% / 0.2)' }}
        >
          {successMsg}
        </div>
      )}

      {insights.length === 0 ? (
        <EmptyState
          title="Nenhum insight cadastrado"
          description="Crie variações de insights por nível de maturidade."
          icon={Sparkles}
          action={<MintButton onClick={openCreate}><Plus className="h-4 w-4" /> Novo Insight</MintButton>}
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                  {['Título', 'Maturidade', 'Dimensão', 'Preview', 'Publicado', 'Ações'].map((h) => (
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
                {insights.map((insight, i) => (
                  <tr
                    key={insight.id}
                    className="transition-colors"
                    style={{ borderBottom: i < insights.length - 1 ? '1px solid hsl(158 92% 70% / 0.06)' : undefined }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(158 92% 70% / 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3 font-medium max-w-[180px]" style={{ color: 'hsl(0 0% 91%)' }}>
                      {truncate(insight.title, 40)}
                    </td>
                    <td className="px-4 py-3">
                      <MaturityBadge level={insight.maturityLevel} />
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                      {insight.dimension || '—'}
                    </td>
                    <td className="px-4 py-3 max-w-[280px]" style={{ color: 'hsl(0 0% 91% / 0.55)' }}>
                      {truncate(insight.content)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleFeatured(insight)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-mono uppercase tracking-wider transition"
                        style={
                          insight.featured
                            ? {
                                background: 'hsl(158 92% 70% / 0.12)',
                                color: 'hsl(158 92% 70%)',
                                border: '1px solid hsl(158 92% 70% / 0.25)',
                              }
                            : {
                                background: 'hsl(0 0% 100% / 0.04)',
                                color: 'hsl(0 0% 91% / 0.42)',
                                border: '1px solid hsl(0 0% 100% / 0.10)',
                              }
                        }
                        title={
                          insight.featured ? 'Despublicar do site' : 'Publicar no site'
                        }
                      >
                        {insight.featured ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {insight.featured ? 'público' : 'oculto'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(insight)}
                          className="rounded-lg p-1.5 transition-colors"
                          style={{ color: 'hsl(158 92% 70% / 0.7)' }}
                          title="Editar"
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(158 92% 70%)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(158 92% 70% / 0.7)')}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(insight.id)}
                          className="rounded-lg p-1.5 transition-colors"
                          style={{ color: 'hsl(0 0% 91% / 0.35)' }}
                          title="Remover"
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(0 0% 91% / 0.35)')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 8% / 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{
              background: 'hsl(197 100% 10%)',
              border: '1px solid hsl(158 92% 70% / 0.15)',
              boxShadow: '0 24px 64px hsl(0 0% 0% / 0.5)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-[18px] font-semibold" style={{ color: 'hsl(0 0% 91%)' }}>
                {editing ? 'Editar Insight' : 'Novo Insight'}
              </h3>
              <button onClick={closeModal} style={{ color: 'hsl(0 0% 91% / 0.5)' }}>✕</button>
            </div>

            <div className="space-y-4">
              <Field label="Título">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Título do insight..."
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                  style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Nível de Maturidade">
                  <select
                    value={form.maturityLevel}
                    onChange={(e) => setForm((f) => ({ ...f, maturityLevel: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                    style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                  >
                    {MATURITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Dimensão">
                  <input
                    type="text"
                    value={form.dimension}
                    onChange={(e) => setForm((f) => ({ ...f, dimension: e.target.value }))}
                    placeholder="Ex: Dados, Estratégia..."
                    className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                    style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                  />
                </Field>
              </div>

              <Field label="Conteúdo">
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={6}
                  placeholder="Texto completo do insight..."
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none resize-none"
                  style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-[13px] font-medium"
                style={{ color: 'hsl(0 0% 91% / 0.6)', background: 'hsl(0 0% 100% / 0.05)' }}
              >
                Cancelar
              </button>
              <MintButton onClick={handleSubmit} disabled={isPending || !form.title.trim()}>
                {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar insight'}
              </MintButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
