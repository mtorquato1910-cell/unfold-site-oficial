'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, MessageSquareQuote, Star } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState, Field } from '@/components/painel/ui'
import { createTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/actions/content-actions'

type Testimonial = Record<string, any>

const EMPTY_FORM = {
  name: '',
  role: '',
  company: '',
  content: '',
  rating: 5,
  avatar: '',
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className="h-5 w-5"
            style={{
              color: n <= value ? 'hsl(158 92% 70%)' : 'hsl(0 0% 91% / 0.2)',
              fill: n <= value ? 'hsl(158 92% 70%)' : 'transparent',
            }}
          />
        </button>
      ))}
    </div>
  )
}

function RatingDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className="h-3.5 w-3.5"
          style={{
            color: n <= value ? 'hsl(158 92% 70%)' : 'hsl(0 0% 91% / 0.2)',
            fill: n <= value ? 'hsl(158 92% 70%)' : 'transparent',
          }}
        />
      ))}
    </div>
  )
}

export default function TestimonialsClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(t: Testimonial) {
    setEditing(t)
    setForm({
      name: t.name ?? '',
      role: t.role ?? '',
      company: t.company ?? '',
      content: t.content ?? '',
      rating: t.rating ?? 5,
      avatar: t.avatar ?? '',
    })
    setOpen(true)
  }

  function handleSubmit() {
    startTransition(async () => {
      if (editing) {
        await updateTestimonial(editing.id, form)
        setTestimonials(prev => prev.map(t => t.id === editing.id ? { ...t, ...form } : t))
      } else {
        await createTestimonial(form)
        setTestimonials(prev => [{ id: Date.now().toString(), ...form, createdAt: new Date().toISOString() }, ...prev])
      }
      setOpen(false)
    })
  }

  function handleDelete(t: Testimonial) {
    if (!window.confirm(`Deletar depoimento de "${t.name}"?`)) return
    startTransition(async () => {
      await deleteTestimonial(t.id)
      setTestimonials(prev => prev.filter(x => x.id !== t.id))
    })
  }

  return (
    <>
      <PageHeader
        eyebrow="Conteúdo"
        title="Depoimentos"
        description="Gerencie os depoimentos e avaliações de clientes."
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px]"
            style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
          >
            <Plus className="h-4 w-4" /> Novo Depoimento
          </button>
        }
      />

      {testimonials.length === 0 ? (
        <EmptyState
          title="Nenhum depoimento ainda"
          description="Adicione o primeiro depoimento de cliente."
          icon={MessageSquareQuote}
          action={
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px]"
              style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
            >
              <Plus className="h-4 w-4" /> Adicionar Depoimento
            </button>
          }
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Nome</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim hidden md:table-cell">Cargo</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim hidden md:table-cell">Empresa</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Rating</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim hidden lg:table-cell">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {testimonials.map(t => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: '1px solid hsl(0 0% 100% / 0.04)' }}
                    className="hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-[13px] font-medium" style={{ color: 'hsl(0 0% 91%)' }}>
                      <div className="flex items-center gap-2">
                        {t.avatar ? (
                          <img src={t.avatar} alt={t.name} className="h-7 w-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <div
                            className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                            style={{ background: 'hsl(158 92% 70% / 0.15)', color: 'hsl(158 92% 70%)' }}
                          >
                            {(t.name?.[0] ?? '?').toUpperCase()}
                          </div>
                        )}
                        <span className="truncate max-w-[120px]">{t.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-dim hidden md:table-cell">{t.role || '—'}</td>
                    <td className="px-4 py-3 text-[12px] text-dim hidden md:table-cell">{t.company || '—'}</td>
                    <td className="px-4 py-3">
                      <RatingDisplay value={t.rating ?? 0} />
                    </td>
                    <td className="px-4 py-3 text-[12px] text-dim hidden lg:table-cell">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-md transition hover:bg-white/[0.06]"
                          style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-1.5 rounded-md transition hover:bg-red-500/10"
                          style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                          title="Deletar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 4% / 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="glass rounded-2xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto"
            style={{ borderColor: 'hsl(158 92% 70% / 0.15)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-[20px] font-semibold" style={{ color: 'hsl(0 0% 91%)', letterSpacing: '-0.02em' }}>
                {editing ? 'Editar Depoimento' : 'Novo Depoimento'}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md transition hover:bg-white/[0.06]"
                style={{ color: 'hsl(0 0% 91% / 0.5)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Nome">
                <input
                  className="w-full h-10 px-3 rounded-lg text-[13px]"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nome do cliente"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Cargo">
                  <input
                    className="w-full h-10 px-3 rounded-lg text-[13px]"
                    style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    placeholder="CEO, CMO..."
                  />
                </Field>
                <Field label="Empresa">
                  <input
                    className="w-full h-10 px-3 rounded-lg text-[13px]"
                    style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Nome da empresa"
                  />
                </Field>
              </div>

              <Field label="Depoimento">
                <textarea
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="O que o cliente disse sobre a Unfold..."
                />
              </Field>

              <Field label="Avaliação">
                <div className="pt-1">
                  <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>
              </Field>

              <Field label="Avatar (URL)">
                <input
                  className="w-full h-10 px-3 rounded-lg text-[13px]"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.avatar}
                  onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
                  placeholder="https://..."
                />
              </Field>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium"
                style={{ color: 'hsl(0 0% 91% / 0.6)', background: 'hsl(0 0% 100% / 0.04)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !form.name}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] disabled:opacity-50"
                style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
              >
                {isPending ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Criar Depoimento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
