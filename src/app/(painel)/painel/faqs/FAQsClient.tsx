'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, HelpCircle, Eye, EyeOff } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState, Field, MintButton } from '@/components/painel/ui'
import { createFAQ, updateFAQ, deleteFAQ, toggleFAQPublished } from '@/lib/actions/faqs-actions'

type FAQ = {
  id: string
  question: string
  answer: string
  category: string
  order: number
  published: boolean
  createdAt?: string
}

const CATEGORIES = [
  { value: 'geral', label: 'Geral' },
  { value: 'diagnostico', label: 'Diagnóstico' },
  { value: 'metodo', label: 'Método UGS' },
  { value: 'cases', label: 'Cases' },
  { value: 'comercial', label: 'Comercial' },
]

const EMPTY_FORM = {
  question: '',
  answer: '',
  category: 'geral',
  order: 0,
  published: true,
}

export default function FAQsClient({
  initialFaqs,
  canDelete,
}: {
  initialFaqs: FAQ[]
  canDelete: boolean
}) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FAQ | null>(null)
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, order: faqs.length })
    setError(null)
    setOpen(true)
  }

  function openEdit(f: FAQ) {
    setEditing(f)
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category,
      order: f.order,
      published: f.published,
    })
    setError(null)
    setOpen(true)
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      try {
        if (editing) {
          await updateFAQ(editing.id, form)
          setFaqs((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...form } : x)))
        } else {
          const res: any = await createFAQ(form)
          setFaqs((prev) => [
            ...prev,
            { id: res.id, ...form, createdAt: new Date().toISOString() },
          ])
        }
        setOpen(false)
      } catch (err: any) {
        setError(err?.message || 'Falha ao salvar')
      }
    })
  }

  function handleDelete(f: FAQ) {
    if (!window.confirm(`Excluir "${f.question}"?`)) return
    startTransition(async () => {
      try {
        await deleteFAQ(f.id)
        setFaqs((prev) => prev.filter((x) => x.id !== f.id))
      } catch (err: any) {
        alert(err?.message || 'Falha ao excluir')
      }
    })
  }

  function handleTogglePublished(f: FAQ) {
    startTransition(async () => {
      try {
        await toggleFAQPublished(f.id, !f.published)
        setFaqs((prev) =>
          prev.map((x) => (x.id === f.id ? { ...x, published: !x.published } : x)),
        )
      } catch (err: any) {
        alert(err?.message || 'Falha ao atualizar')
      }
    })
  }

  const filtered =
    filterCategory === 'all' ? faqs : faqs.filter((f) => f.category === filterCategory)

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Perguntas frequentes do site"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg px-3 py-2 text-[13px] outline-none"
              style={{
                background: 'hsl(197 100% 10%)',
                border: '1px solid hsl(158 92% 70% / 0.15)',
                color: 'hsl(0 0% 91%)',
              }}
            >
              <option value="all">Todas categorias</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <MintButton onClick={openCreate}>
              <Plus className="h-4 w-4" /> Nova FAQ
            </MintButton>
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma FAQ ainda"
          description="Crie a primeira pergunta frequente"
          icon={HelpCircle}
          action={
            <MintButton onClick={openCreate}>
              <Plus className="h-4 w-4" /> Criar FAQ
            </MintButton>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered
            .sort((a, b) => a.order - b.order)
            .map((f) => (
              <GlassCard key={f.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{
                          background: 'hsl(158 92% 70% / 0.10)',
                          color: 'hsl(158 92% 70%)',
                          border: '1px solid hsl(158 92% 70% / 0.20)',
                        }}
                      >
                        {f.category}
                      </span>
                      <span className="text-[10px] text-dim">ordem {f.order}</span>
                      {!f.published && (
                        <span
                          className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            background: 'hsl(0 0% 100% / 0.04)',
                            color: 'hsl(0 0% 91% / 0.6)',
                            border: '1px solid hsl(0 0% 100% / 0.10)',
                          }}
                        >
                          rascunho
                        </span>
                      )}
                    </div>
                    <h3 className="text-[14px] font-medium mb-1 text-fg">{f.question}</h3>
                    <p className="text-[13px] text-dim-2 leading-relaxed line-clamp-2 whitespace-pre-line">
                      {f.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePublished(f)}
                      className="icon-btn p-1.5 rounded-md"
                      title={f.published ? 'Despublicar' : 'Publicar'}
                      disabled={isPending}
                    >
                      {f.published ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(f)}
                      className="icon-btn p-1.5 rounded-md"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(f)}
                        className="icon-btn p-1.5 rounded-md"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 4% / 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div
            className="glass rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ borderColor: 'hsl(158 92% 70% / 0.15)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-[20px] font-semibold text-fg">
                {editing ? 'Editar FAQ' : 'Nova FAQ'}
              </h3>
              <button onClick={() => setOpen(false)} className="icon-btn p-1.5 rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Pergunta">
                <input
                  className="input-mint"
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="Ex: Quanto tempo dura o diagnóstico?"
                />
              </Field>

              <Field label="Resposta">
                <textarea
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                  style={{ height: 'auto' }}
                  value={form.answer}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                  placeholder="Resposta clara e direta..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Categoria">
                  <select
                    className="input-mint"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ordem (menor = primeiro)">
                  <input
                    type="number"
                    className="input-mint"
                    value={form.order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))
                    }
                  />
                </Field>
              </div>

              <Field label="Publicar no site">
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-fg">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                    style={{ accentColor: 'hsl(158 92% 70%)' }}
                  />
                  <span>Visível para o público</span>
                </label>
              </Field>
            </div>

            {error && (
              <div
                className="mt-4 rounded-lg px-4 py-2.5 text-[13px]"
                style={{
                  background: 'hsl(0 70% 60% / 0.10)',
                  color: 'hsl(0 70% 80%)',
                  border: '1px solid hsl(0 70% 60% / 0.25)',
                }}
              >
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-dim-2 hover:bg-white/[0.04]"
              >
                Cancelar
              </button>
              <MintButton
                onClick={handleSubmit}
                disabled={isPending || !form.question.trim() || !form.answer.trim()}
              >
                {isPending ? 'Salvando...' : 'Salvar'}
              </MintButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
