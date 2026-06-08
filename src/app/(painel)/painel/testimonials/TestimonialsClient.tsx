'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, MessageSquareQuote, Eye, EyeOff, Star } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState, Field, MintButton } from '@/components/painel/ui'
import ImageInput from '@/components/painel/ImageInput'
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialDestaque,
  toggleTestimonialAtivo,
} from '@/lib/actions/testimonials-actions'

type Testimonial = {
  id: string
  nome: string
  cargo: string
  empresa: string
  depoimento: string
  vertical: string
  avaliacao: number
  destaque: boolean
  ativo: boolean
  ordem: number
  foto?: any
  createdAt?: string
}

const VERTICAIS = [
  { value: '', label: '—' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'agro', label: 'Agronegócio' },
  { value: 'tech', label: 'Tecnologia' },
  { value: 'automotivo', label: 'Automotivo' },
  { value: 'industrias', label: 'Indústrias' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'outro', label: 'Outro' },
]

const EMPTY = {
  nome: '',
  cargo: '',
  empresa: '',
  depoimento: '',
  vertical: '',
  avaliacao: 5,
  destaque: false,
  ativo: true,
  ordem: 0,
  foto: '',
}

export default function TestimonialsClient({
  initialTestimonials,
  canDelete,
}: {
  initialTestimonials: Testimonial[]
  canDelete: boolean
}) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)
  const [fotoUrl, setFotoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const destacadosCount = items.filter((i) => i.destaque && i.ativo).length

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY, ordem: items.length })
    setFotoUrl('')
    setError(null)
    setOpen(true)
  }

  function openEdit(t: Testimonial) {
    setEditing(t)
    const fotoId = t.foto?.id ?? t.foto ?? ''
    const fotoUrlVal = t.foto?.url ?? ''
    setForm({
      nome: t.nome,
      cargo: t.cargo || '',
      empresa: t.empresa,
      depoimento: t.depoimento,
      vertical: t.vertical || '',
      avaliacao: t.avaliacao || 5,
      destaque: t.destaque,
      ativo: t.ativo,
      ordem: t.ordem || 0,
      foto: fotoId ? String(fotoId) : '',
    })
    setFotoUrl(fotoUrlVal)
    setError(null)
    setOpen(true)
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      try {
        if (editing) {
          const res: any = await updateTestimonial(editing.id, form)
          if (!res?.ok) {
            setError(res?.error || 'Falha ao salvar')
            return
          }
          setItems((prev) =>
            prev.map((x) => (x.id === editing.id ? { ...x, ...form } : x)),
          )
        } else {
          const res: any = await createTestimonial(form)
          if (!res?.ok) {
            setError(res?.error || 'Falha ao salvar')
            return
          }
          setItems((prev) => [
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

  function handleDelete(t: Testimonial) {
    if (!window.confirm(`Excluir depoimento de "${t.nome}"?`)) return
    startTransition(async () => {
      try {
        await deleteTestimonial(t.id)
        setItems((prev) => prev.filter((x) => x.id !== t.id))
      } catch (err: any) {
        alert(err?.message || 'Falha ao excluir')
      }
    })
  }

  function handleToggleDestaque(t: Testimonial) {
    startTransition(async () => {
      try {
        await toggleTestimonialDestaque(t.id, !t.destaque)
        setItems((prev) =>
          prev.map((x) => (x.id === t.id ? { ...x, destaque: !x.destaque } : x)),
        )
      } catch (err: any) {
        alert(err?.message || 'Falha ao alterar destaque')
      }
    })
  }

  function handleToggleAtivo(t: Testimonial) {
    startTransition(async () => {
      try {
        await toggleTestimonialAtivo(t.id, !t.ativo)
        setItems((prev) =>
          prev.map((x) => (x.id === t.id ? { ...x, ativo: !x.ativo } : x)),
        )
      } catch (err: any) {
        alert(err?.message || 'Falha ao alterar status')
      }
    })
  }

  return (
    <>
      <PageHeader
        title="Depoimentos"
        description={`${destacadosCount} aparecendo na home · ${items.length} total`}
        actions={
          <MintButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo depoimento
          </MintButton>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nenhum depoimento ainda"
          description="Adicione depoimentos de clientes para aparecer no site"
          icon={MessageSquareQuote}
          action={
            <MintButton onClick={openCreate}>
              <Plus className="h-4 w-4" /> Criar depoimento
            </MintButton>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items
            .sort((a, b) => a.ordem - b.ordem)
            .map((t) => (
              <GlassCard key={t.id} className={!t.ativo ? 'opacity-50' : ''}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[14px] font-medium text-fg">{t.nome}</h3>
                      {t.destaque && (
                        <span
                          className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            background: 'hsl(158 92% 70% / 0.12)',
                            color: 'hsl(158 92% 70%)',
                            border: '1px solid hsl(158 92% 70% / 0.25)',
                          }}
                        >
                          <Star className="h-2.5 w-2.5" /> destaque
                        </span>
                      )}
                      {!t.ativo && (
                        <span className="font-mono text-[9px] uppercase tracking-wider text-dim">
                          oculto
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-dim-2">
                      {t.cargo ? `${t.cargo} · ` : ''}
                      {t.empresa}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleDestaque(t)}
                      disabled={isPending}
                      className="icon-btn p-1.5 rounded-md"
                      title={t.destaque ? 'Remover da home' : 'Destacar na home'}
                    >
                      <Star
                        className="h-3.5 w-3.5"
                        style={t.destaque ? { fill: 'hsl(158 92% 70%)', color: 'hsl(158 92% 70%)' } : {}}
                      />
                    </button>
                    <button
                      onClick={() => handleToggleAtivo(t)}
                      disabled={isPending}
                      className="icon-btn p-1.5 rounded-md"
                      title={t.ativo ? 'Ocultar' : 'Ativar'}
                    >
                      {t.ativo ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      className="icon-btn p-1.5 rounded-md"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(t)}
                        className="icon-btn p-1.5 rounded-md"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[13px] text-dim-2 leading-relaxed line-clamp-4 italic">
                  &ldquo;{t.depoimento}&rdquo;
                </p>
                {t.vertical && (
                  <div className="mt-3 text-[10px] font-mono uppercase tracking-wider text-dim">
                    {VERTICAIS.find((v) => v.value === t.vertical)?.label || t.vertical}
                  </div>
                )}
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
                {editing ? 'Editar depoimento' : 'Novo depoimento'}
              </h3>
              <button onClick={() => setOpen(false)} className="icon-btn p-1.5 rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome do cliente">
                  <input
                    className="input-mint"
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    placeholder="João Silva"
                  />
                </Field>
                <Field label="Cargo">
                  <input
                    className="input-mint"
                    value={form.cargo}
                    onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                    placeholder="CEO"
                  />
                </Field>
              </div>
              <Field label="Empresa">
                <input
                  className="input-mint"
                  value={form.empresa}
                  onChange={(e) => setForm((f) => ({ ...f, empresa: e.target.value }))}
                  placeholder="Acme Ltda."
                />
              </Field>

              <ImageInput
                label="Foto do cliente"
                value={form.foto ? { id: form.foto, url: fotoUrl } : null}
                onChange={(v) => {
                  setFotoUrl(v?.url || '')
                  setForm((f) => ({ ...f, foto: v?.id || '' }))
                }}
              />

              <Field label="Depoimento" hint="Recomendado: 80–180 caracteres">
                <textarea
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                  style={{ height: 'auto' }}
                  value={form.depoimento}
                  onChange={(e) => setForm((f) => ({ ...f, depoimento: e.target.value }))}
                  placeholder="Texto do depoimento..."
                />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Vertical">
                  <select
                    className="input-mint"
                    value={form.vertical}
                    onChange={(e) => setForm((f) => ({ ...f, vertical: e.target.value }))}
                  >
                    {VERTICAIS.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Avaliação (1-5)">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="input-mint"
                    value={form.avaliacao}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, avaliacao: parseInt(e.target.value) || 5 }))
                    }
                  />
                </Field>
                <Field label="Ordem">
                  <input
                    type="number"
                    className="input-mint"
                    value={form.ordem}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ordem: parseInt(e.target.value) || 0 }))
                    }
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Aparece na Home">
                  <label className="flex h-11 items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.destaque}
                      onChange={(e) => setForm((f) => ({ ...f, destaque: e.target.checked }))}
                      style={{ accentColor: 'hsl(158 92% 70%)' }}
                    />
                    <span className="text-sm text-dim-2">Destacar na home</span>
                  </label>
                </Field>
                <Field label="Status">
                  <label className="flex h-11 items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.ativo}
                      onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                      style={{ accentColor: 'hsl(158 92% 70%)' }}
                    />
                    <span className="text-sm text-dim-2">Ativo</span>
                  </label>
                </Field>
              </div>
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
                disabled={
                  isPending ||
                  !form.nome.trim() ||
                  !form.empresa.trim() ||
                  !form.depoimento.trim()
                }
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
