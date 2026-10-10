'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field, MintButton } from '@/components/painel/ui'
import ImageInput from '@/components/painel/ImageInput'
import RichTextEditor from '@/components/painel/RichTextEditor'
import { CharCount, SerpPreview, FaqEditor, validateArticle, type FaqItem } from '@/components/painel/article-fields'
import { createCase, updateCase, deleteCase } from '@/lib/actions/cases-actions'

/**
 * Cases no painel (S10 — épico seo-tecnico-2026-10). Pedido do cliente (10/10/2026):
 * "Preciso que seja da mesma forma dos posts". Mesmo fluxo do form de posts: texto
 * corrido num editor só, resumo, números do case, capa, campos de busca com prévia do
 * Google e FAQ. Os antigos Desafio/Solução/Resultado (editor de blocos) saíram.
 */
type Case = Record<string, any>
type Highlight = { label: string; value: string }

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

/** Roteiro inicial de um case novo — editável/removível, só para não começar do zero. */
const TEMPLATE_HTML = '<h2>Desafio</h2><p></p><h2>Solução</h2><p></p><h2>Resultados</h2><p></p>'

const EMPTY_FORM = {
  title: '',
  slug: '',
  company: '',
  vertical: '',
  excerpt: '',
  contentHtml: '',
  highlights: [] as Highlight[],
  status: 'draft',
  featured: false,
  imagem_destaque: '',
  meta_title: '',
  meta_description: '',
  faq: [] as FaqItem[],
}

const fieldStyle = {
  background: 'hsl(197 100% 10%)',
  border: '1px solid hsl(158 92% 70% / 0.12)',
  color: 'hsl(0 0% 91%)',
  outline: 'none',
} as const

function HighlightsEditor({ value, onChange }: { value: Highlight[]; onChange: (v: Highlight[]) => void }) {
  const set = (i: number, patch: Partial<Highlight>) => onChange(value.map((h, idx) => (idx === i ? { ...h, ...patch } : h)))
  return (
    <div className="space-y-2">
      {value.map((h, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input className="h-9 px-3 rounded-lg text-[13px]" style={fieldStyle} value={h.value} onChange={(e) => set(i, { value: e.target.value })} placeholder="Número (ex.: +180%)" />
          <input className="h-9 px-3 rounded-lg text-[13px]" style={fieldStyle} value={h.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="Rótulo (ex.: leads qualificados)" />
          <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="px-2 text-[12px]" style={{ color: 'hsl(0 70% 72%)' }}>
            remover
          </button>
        </div>
      ))}
      {value.length < 4 && (
        <button
          type="button"
          onClick={() => onChange([...value, { label: '', value: '' }])}
          className="text-[12px] px-3 py-1.5 rounded-lg"
          style={{ background: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)' }}
        >
          + Adicionar número
        </button>
      )}
    </div>
  )
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
    setForm({ ...EMPTY_FORM, contentHtml: TEMPLATE_HTML })
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
      company: c.client ?? c.company ?? '',
      vertical: c.vertical ?? '',
      excerpt: c.excerpt ?? c.tagline ?? '',
      contentHtml: c.conteudo_html ?? '',
      highlights: Array.isArray(c.highlights) ? c.highlights.map((h: any) => ({ label: h.label ?? '', value: h.value ?? '' })) : [],
      status: c.status === 'publicado' ? 'published' : c.status === 'rascunho' ? 'draft' : (c.status ?? 'draft'),
      featured: !!(c.destacar_na_home ?? c.featured),
      imagem_destaque: mediaId ? String(mediaId) : '',
      meta_title: c.meta_title ?? '',
      meta_description: c.meta_description ?? '',
      faq: Array.isArray(c.faq) ? c.faq : [],
    })
    setCoverUrl(mediaUrl)
    setError(null)
    setOpen(true)
  }

  function handleTitleChange(val: string) {
    // Edição: não sobrescreve slug existente (preserva URL já publicada).
    setForm((f) => ({ ...f, title: val, slug: editing ? f.slug : slugify(val) }))
  }

  function handleSubmit() {
    setError(null)
    // Campos required no schema (Cases.ts): title, slug, client, vertical.
    if (!form.title.trim()) { setError('Informe o título do case.'); return }
    if (!form.company.trim()) { setError('Informe o cliente.'); return }
    if (!form.vertical) { setError('Selecione a vertical do case.'); return }
    // Números preenchidos pela metade seriam descartados no save → avisa antes.
    if (form.highlights.some((h) => !!h.label.trim() !== !!h.value.trim())) {
      setError('Há número do case sem rótulo (ou rótulo sem número). Complete ou remova a linha.')
      return
    }
    // Mesmos avisos de qualidade dos posts ao publicar: avisa, não bloqueia.
    if (form.status === 'published') {
      const warns = validateArticle(form.contentHtml, form.faq, 'case')
      if (warns.length && !window.confirm(`Avisos de qualidade:\n\n- ${warns.join('\n- ')}\n\nPublicar mesmo assim?`)) return
    }
    const data = { ...form, destacar_na_home: form.featured, client: form.company }
    startTransition(async () => {
      try {
        const res: any = editing ? await updateCase(editing.id, data) : await createCase(data)
        if (!res?.ok) {
          setError(res?.error || 'Falha ao salvar')
          return
        }
        const doc = res.doc ?? { id: res.id, ...data }
        setCases((prev) => (editing ? prev.map((c) => (c.id === editing.id ? doc : c)) : [doc, ...prev]))
        setOpen(false)
      } catch (err: any) {
        setError(err?.message || 'Falha ao salvar')
      }
    })
  }

  function handleDelete(c: Case) {
    if (!window.confirm(`Excluir este case?`)) return
    startTransition(async () => {
      const res: any = await deleteCase(c.id)
      if (res && res.ok === false) {
        window.alert(res.error || 'Falha ao excluir')
        return
      }
      setCases((prev) => prev.filter((x) => x.id !== c.id))
    })
  }

  return (
    <>
      <PageHeader
        title="Cases"
        description="Histórias de sucesso de clientes — publicadas como os posts"
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
          {cases.map((c) => (
            <GlassCard key={c.id} className="glass-hover transition-all">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-mono uppercase tracking-wider text-mint">{c.client || c.company || '—'}</div>
                  <h3 className="mt-1 font-medium truncate text-fg">{c.title || '—'}</h3>
                </div>
                {(c.destacar_na_home ?? c.featured) && <Star className="h-4 w-4 text-mint" style={{ fill: 'hsl(158 92% 70%)' }} />}
              </div>
              <p className="text-xs text-dim-2 line-clamp-3 min-h-[3rem]">{c.excerpt || c.tagline || '—'}</p>
              <div className="mt-4 flex items-center justify-between">
                <StatusBadge status={c.status === 'publicado' ? 'published' : c.status === 'rascunho' ? 'draft' : (c.status ?? 'draft')} />
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="icon-btn p-1.5 rounded-md" title="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c)} className="icon-btn p-1.5 rounded-md" title="Excluir">
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="glass rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ borderColor: 'hsl(158 92% 70% / 0.15)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-[20px] font-semibold text-fg">{editing ? 'Editar case' : 'Novo case'}</h3>
              <button onClick={() => setOpen(false)} className="icon-btn p-1.5 rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Título">
                <input className="input-mint" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Como a Acme cresceu 3x" />
              </Field>

              <Field label="Slug" hint="Gerado automaticamente a partir do título · usado na URL /cases/...">
                <input
                  className="input-mint font-mono"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="como-a-acme-cresceu-3x"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Cliente">
                  <input className="input-mint" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Nome da empresa" />
                </Field>
                <Field label="Vertical">
                  <select className="input-mint" value={form.vertical} onChange={(e) => setForm((f) => ({ ...f, vertical: e.target.value }))}>
                    <option value="">Selecione…</option>
                    {VERTICAIS.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Resumo" hint="Uma ou duas frases: aparece no card da listagem e da home.">
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-[13px] resize-none"
                  style={fieldStyle}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                />
              </Field>

              <Field
                label="Conteúdo"
                hint="Escreva o case de ponta a ponta. Use a barra para Título 2–6 (H2–H6), listas, tabela, imagem (com descrição), vídeo e link. O H1 é o título do case, aplicado automaticamente — não use no corpo."
              >
                <RichTextEditor
                  variant="article"
                  value={form.contentHtml}
                  onChange={(html) => setForm((f) => ({ ...f, contentHtml: html }))}
                  placeholder="Escreva o case…"
                />
              </Field>

              <Field label="Números do case" hint="Até 4 números de destaque, exibidos em cartões no case e na home.">
                <HighlightsEditor value={form.highlights} onChange={(highlights) => setForm((f) => ({ ...f, highlights }))} />
              </Field>

              <ImageInput
                label="Imagem de capa"
                value={form.imagem_destaque ? { id: form.imagem_destaque, url: coverUrl } : null}
                onChange={(v) => {
                  setCoverUrl(v?.url || '')
                  setForm((f) => ({ ...f, imagem_destaque: v?.id || '' }))
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <select className="input-mint" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </Field>
                <Field label="Destacar na Home">
                  <label className="flex h-11 items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                      style={{ accentColor: 'hsl(158 92% 70%)' }}
                    />
                    <span className="text-sm text-dim-2">Exibir no bloco de case da home</span>
                  </label>
                </Field>
              </div>

              {/* Cabeçalho de busca (SEO) — igual aos posts. */}
              <div className="pt-2" style={{ borderTop: '1px solid hsl(0 0% 100% / 0.06)' }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3" style={{ color: 'hsl(158 92% 70% / 0.7)' }}>
                  Cabeçalho de busca (SEO)
                </p>
                <div className="space-y-4">
                  <Field label="Título de busca" hint="Vazio = usa o título do case. Ideal até 60 caracteres.">
                    <input className="input-mint" value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} />
                    <CharCount value={form.meta_title || form.title} max={60} />
                  </Field>
                  <Field label="Resumo de busca" hint="Texto abaixo do título no Google. Vazio = usa o resumo.">
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg text-[13px] resize-none"
                      style={fieldStyle}
                      value={form.meta_description}
                      onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
                    />
                    <CharCount value={form.meta_description || form.excerpt} max={155} />
                  </Field>
                  <SerpPreview section="cases" title={form.meta_title || form.title} slug={form.slug} desc={form.meta_description || form.excerpt} />
                </div>
              </div>

              <div className="pt-2" style={{ borderTop: '1px solid hsl(0 0% 100% / 0.06)' }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1" style={{ color: 'hsl(158 92% 70% / 0.7)' }}>
                  Perguntas frequentes
                </p>
                <p className="text-[11px] mb-3" style={{ color: 'hsl(0 0% 91% / 0.4)' }}>
                  Opcional. 3 a 8 perguntas geram a seção no case + a marcação para IA e Bing.
                </p>
                <FaqEditor value={form.faq} onChange={(faq) => setForm((f) => ({ ...f, faq }))} />
              </div>
            </div>

            {error && (
              <div
                className="mt-4 rounded-lg px-4 py-2.5 text-[13px]"
                style={{ background: 'hsl(0 70% 60% / 0.10)', color: 'hsl(0 70% 80%)', border: '1px solid hsl(0 70% 60% / 0.25)' }}
              >
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-8">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-dim-2 hover:bg-white/[0.04]">
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
