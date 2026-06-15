'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field, MintButton } from '@/components/painel/ui'
import ImageInput from '@/components/painel/ImageInput'
import RichTextEditor from '@/components/painel/RichTextEditor'
import { plainToHtml } from '@/lib/rich-text'
import { createCase, updateCase, deleteCase } from '@/lib/actions/cases-actions'

type Case = Record<string, any>

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

// Valores válidos do select `vertical` no schema (src/collections/Cases.ts).
const VERTICAIS = [
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'agro', label: 'Agronegócio' },
  { value: 'b2b-saas', label: 'B2B / SaaS' },
  { value: 'industria', label: 'Indústria' },
  { value: 'varejo', label: 'Varejo' },
  { value: 'servicos', label: 'Serviços Profissionais' },
]

const EMPTY_FORM = {
  title: '',
  slug: '',
  company: '',
  vertical: '',
  challenge: '',
  challengeHtml: '',
  solution: '',
  solutionHtml: '',
  result: '',
  metrics: '',
  status: 'draft',
  featured: false,
  imagem_destaque: '',
}

export default function CasesClient({ initialCases }: { initialCases: Case[] }) {
  const [cases, setCases] = useState<Case[]>(initialCases)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Case | null>(null)
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM)
  const [coverUrl, setCoverUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setCoverUrl('')
    setError(null)
    setOpen(true)
  }

  function openEdit(c: Case) {
    setEditing(c)
    const mediaId = c.imagem_destaque?.id ?? c.imagem_destaque ?? ''
    const mediaUrl = c.imagem_destaque?.url ?? ''
    setForm({
      title: c.title ?? '',
      slug: c.slug ?? '',
      company: c.company ?? c.client ?? '',
      vertical: c.vertical ?? '',
      challenge: c.challenge ?? '',
      challengeHtml: c.challenge_html || plainToHtml(c.challenge),
      solution: c.solution ?? '',
      solutionHtml: c.solution_html || plainToHtml(c.solution),
      result: c.result ?? '',
      metrics: c.metrics ?? '',
      status: c.status ?? 'draft',
      featured: !!c.featured,
      imagem_destaque: mediaId ? String(mediaId) : '',
    })
    setCoverUrl(mediaUrl)
    setError(null)
    setOpen(true)
  }

  function handleTitleChange(val: string) {
    // Edição: não sobrescreve slug existente (preserva URL já publicada).
    setForm(f => ({ ...f, title: val, slug: editing ? f.slug : slugify(val) }))
  }

  function handleSubmit() {
    setError(null)
    // Campos required no schema (Cases.ts): title, slug, client, vertical.
    if (!form.title.trim()) { setError('Informe o título do case.'); return }
    if (!form.company.trim()) { setError('Informe o cliente.'); return }
    if (!form.vertical) { setError('Selecione a vertical do case.'); return }
    startTransition(async () => {
      try {
        if (editing) {
          const res: any = await updateCase(editing.id, form)
          if (!res?.ok) {
            setError(res?.error || 'Falha ao salvar')
            return
          }
          setCases(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c))
        } else {
          const res: any = await createCase(form)
          if (!res?.ok) {
            setError(res?.error || 'Falha ao salvar')
            return
          }
          setCases(prev => [{ id: res.id, ...form, createdAt: new Date().toISOString() }, ...prev])
        }
        setOpen(false)
      } catch (err: any) {
        setError(err?.message || 'Falha ao salvar')
      }
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
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Como a Acme cresceu 3x"
                />
              </Field>

              <Field label="Slug" hint="Gerado automaticamente a partir do título · usado na URL /cases/...">
                <input
                  className="input-mint font-mono"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="como-a-acme-cresceu-3x"
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
                <Field label="Vertical">
                  <select
                    className="input-mint"
                    value={form.vertical}
                    onChange={e => setForm(f => ({ ...f, vertical: e.target.value }))}
                  >
                    <option value="">Selecione…</option>
                    {VERTICAIS.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Desafio" hint="Títulos, listas, imagens, links e vídeos do YouTube disponíveis.">
                <RichTextEditor
                  value={form.challengeHtml}
                  onChange={(html) => setForm(f => ({ ...f, challengeHtml: html }))}
                  placeholder="Contexto e problema que o cliente enfrentava…"
                />
              </Field>
              <Field label="Solução" hint="Títulos, listas, imagens, links e vídeos do YouTube disponíveis.">
                <RichTextEditor
                  value={form.solutionHtml}
                  onChange={(html) => setForm(f => ({ ...f, solutionHtml: html }))}
                  placeholder="Como a Unfold estruturou a solução…"
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

              <ImageInput
                label="Imagem de destaque"
                value={form.imagem_destaque ? { id: form.imagem_destaque, url: coverUrl } : null}
                onChange={(v) => {
                  setCoverUrl(v?.url || '')
                  setForm(f => ({ ...f, imagem_destaque: v?.id || '' }))
                }}
              />

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
