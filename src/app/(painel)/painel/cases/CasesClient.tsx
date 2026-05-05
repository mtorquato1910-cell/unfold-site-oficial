'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field, MintButton } from '@/components/painel/ui'
import { createCase, updateCase, deleteCase } from '@/lib/actions/content-actions'

type Case = Record<string, any>

const EMPTY_FORM = {
  title: '',
  company: '',
  sector: '',
  challenge: '',
  solution: '',
  result: '',
  metrics: '',
  status: 'draft',
  featured: false,
}

export default function CasesClient({ initialCases }: { initialCases: Case[] }) {
  const [cases, setCases] = useState<Case[]>(initialCases)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Case | null>(null)
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(c: Case) {
    setEditing(c)
    setForm({
      title: c.title ?? '',
      company: c.company ?? '',
      sector: c.sector ?? '',
      challenge: c.challenge ?? '',
      solution: c.solution ?? '',
      result: c.result ?? '',
      metrics: c.metrics ?? '',
      status: c.status ?? 'draft',
      featured: !!c.featured,
    })
    setOpen(true)
  }

  function handleSubmit() {
    startTransition(async () => {
      if (editing) {
        await updateCase(editing.id, form)
        setCases(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c))
      } else {
        await createCase(form)
        setCases(prev => [{ id: Date.now().toString(), ...form, createdAt: new Date().toISOString() }, ...prev])
      }
      setOpen(false)
    })
  }

  function handleDelete(c: Case) {
    if (!window.confirm(`Excluir este case?`)) return
    startTransition(async () => {
      await deleteCase(c.id)
      setCases(prev => prev.filter(x => x.id !== c.id))
    })
  }

  return (
    <>
      <PageHeader
        title="Cases"
        description="Histórias de sucesso de clientes"
        actions={
          <MintButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo case
          </MintButton>
        }
      />

      {cases.length === 0 ? (
        <EmptyState title="Nenhum case ainda" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map(c => (
            <GlassCard key={c.id} className="glass-hover transition-all">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-mono uppercase tracking-wider text-mint">
                    {c.company || '—'}
                  </div>
                  <h3 className="mt-1 font-medium truncate text-fg">{c.title || '—'}</h3>
                </div>
                {c.featured && <Star className="h-4 w-4 text-mint" style={{ fill: 'hsl(158 92% 70%)' }} />}
              </div>
              <p className="text-xs text-dim-2 line-clamp-3 min-h-[3rem]">
                {c.result || c.challenge || '—'}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <StatusBadge status={c.status ?? 'draft'} />
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="icon-btn p-1.5 rounded-md"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="icon-btn p-1.5 rounded-md"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 4% / 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="glass rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ borderColor: 'hsl(158 92% 70% / 0.15)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-[20px] font-semibold text-fg">
                {editing ? 'Editar case' : 'Novo case'}
              </h3>
              <button onClick={() => setOpen(false)} className="icon-btn p-1.5 rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Título">
                <input
                  className="input-mint"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Como a Acme cresceu 3x"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Cliente">
                  <input
                    className="input-mint"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Nome da empresa"
                  />
                </Field>
                <Field label="Segmento">
                  <input
                    className="input-mint"
                    value={form.sector}
                    onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                    placeholder="SaaS, E-commerce..."
                  />
                </Field>
              </div>

              <Field label="Desafio">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                  style={{ height: 'auto' }}
                  value={form.challenge}
                  onChange={e => setForm(f => ({ ...f, challenge: e.target.value }))}
                />
              </Field>
              <Field label="Solução">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                  style={{ height: 'auto' }}
                  value={form.solution}
                  onChange={e => setForm(f => ({ ...f, solution: e.target.value }))}
                />
              </Field>
              <Field label="Resultado">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                  style={{ height: 'auto' }}
                  value={form.result}
                  onChange={e => setForm(f => ({ ...f, result: e.target.value }))}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <select
                    className="input-mint"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </Field>
                <Field label="Destaque">
                  <label className="flex h-11 items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                      style={{ accentColor: 'hsl(158 92% 70%)' }}
                    />
                    <span className="text-sm text-dim-2">Marcar como featured</span>
                  </label>
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-dim-2 hover:bg-white/[0.04]"
              >
                Cancelar
              </button>
              <MintButton onClick={handleSubmit} disabled={isPending || !form.title}>
                {isPending ? 'Salvando...' : 'Salvar'}
              </MintButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
