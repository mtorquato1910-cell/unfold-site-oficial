'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field, MintButton } from '@/components/painel/ui'
import ImageInput from '@/components/painel/ImageInput'
import RichTextEditor from '@/components/painel/RichTextEditor'
import { CharCount, SerpPreview, FaqEditor, validateArticle, type FaqItem } from '@/components/painel/article-fields'
import { createCase, updateCase, deleteCase, quickUpdateCase } from '@/lib/actions/cases-actions'
import QuickEdit from '@/components/painel/QuickEdit'
import { fromBrtInput, toBrtInput } from '@/lib/content-date'

/**
 * Cases no painel (S10 — épico seo-tecnico-2026-10). Pedido do cliente (10/10/2026):
 * "Preciso que seja da mesma forma dos posts". Mesmo fluxo do form de posts: texto
 * corrido num editor só, resumo, números do case, capa, campos de busca com prévia do
 * Google e FAQ. Texto corrido do começo ao fim — sem campos separados (pedido do
 * cliente em 14/10: números de destaque e roteiro pré-preenchido saíram).
 */
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
  excerpt: '',
  contentHtml: '',
  status: 'draft',
  featured: false,
  imagem_destaque: '',
  meta_title: '',
  meta_description: '',
  faq: [] as FaqItem[],
  /** Data de publicação (datetime-local, horário de Brasília). Vazio = carimbo automático. */
  published_at: '',
}

const fieldStyle = {
  background: 'hsl(197 100% 10%)',
  border: '1px solid hsl(158 92% 70% / 0.12)',
  color: 'hsl(0 0% 91%)',
  outline: 'none',
} as const


export default function CasesClient({ initialCases }: { initialCases: Case[] }) {
  const [cases, setCases] = useState<Case[]>(initialCases)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Case | null>(null)
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM)
  const [coverUrl, setCoverUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  /** Case aberto na edição rápida (pedido de 17/11/2026). */
  const [quickId, setQuickId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleQuickSave(c: Case, payload: Record<string, any>) {
    const res: any = await quickUpdateCase(c.id, payload)
    if (res?.ok) {
      setCases((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...res.doc } : x)))
      setQuickId(null)
    }
    return res
  }

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
      company: c.client ?? c.company ?? '',
      vertical: c.vertical ?? '',
      excerpt: c.excerpt ?? c.tagline ?? '',
      contentHtml: c.conteudo_html ?? '',
      status: c.status === 'publicado' ? 'published' : c.status === 'rascunho' ? 'draft' : (c.status ?? 'draft'),
      featured: !!(c.destacar_na_home ?? c.featured),
      imagem_destaque: mediaId ? String(mediaId) : '',
      meta_title: c.meta_title ?? '',
      meta_description: c.meta_description ?? '',
      faq: Array.isArray(c.faq) ? c.faq : [],
      published_at: toBrtInput(c.published_at),
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
    // Mesmos avisos de qualidade dos posts ao publicar: avisa, não bloqueia.
    if (form.status === 'published') {
      const warns = validateArticle(form.contentHtml, form.faq, 'case')
      if (warns.length && !window.confirm(`Avisos de qualidade:\n\n- ${warns.join('\n- ')}\n\nPublicar mesmo assim?`)) return
    }
    const data = { ...form, destacar_na_home: form.featured, client: form.company, published_at: fromBrtInput(form.published_at) }
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
          {cases.map((c) =>
            quickId === c.id ? (
              <div key={c.id} className="md:col-span-2 lg:col-span-3">
                <QuickEdit
                  kind="case"
                  initial={{
                    titulo: c.title ?? '',
                    slug: c.slug ?? '',
                    meta_description: c.meta_description ?? '',
                    categoria: '',
                    tags: '',
                    data: toBrtInput(c.published_at),
                    imagem_destaque: String(c.imagem_destaque?.id ?? c.imagem_destaque ?? ''),
                    coverUrl: c.imagem_destaque?.url ?? '',
                    autor: '',
                    status: c.status === 'publicado' ? 'published' : 'draft',
                  }}
                  wasPublished={c.status === 'publicado'}
                  onSave={(payload) => handleQuickSave(c, payload)}
                  onCancel={() => setQuickId(null)}
                />
              </div>
            ) : (
            <GlassCard key={c.id} className="glass-hover transition-all">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-mono uppercase tracking-wider text-mint">{c.client || c.company || '—'}</div>
                  <h3 className="mt-1 font-medium truncate text-fg">{c.title || '—'}</h3>
                </div>
                {(c.destacar_na_home ?? c.featured) && <Star className="h-4 w-4 text-mint" style={{ fill: 'hsl(158 92% 70%)' }} />}
              </div>
              <p className="text-xs text-dim-2 line-clamp-3 min-h-[3rem]">{c.excerpt || c.tagline || '—'}</p>
              {/* Ações no estilo do WordPress: editor completo ou edição rápida. */}
              <div className="mt-3 flex flex-wrap items-center gap-x-1.5 text-[11px]">
                <button onClick={() => openEdit(c)} className="text-mint hover:underline">Editar</button>
                <span className="text-dim">|</span>
                <button onClick={() => setQuickId(c.id)} className="text-mint hover:underline">Edição rápida</button>
                {c.status === 'publicado' && c.slug && (
                  <>
                    <span className="text-dim">|</span>
                    <a href={`/cases/${c.slug}`} target="_blank" rel="noopener" className="text-mint hover:underline">Ver</a>
                  </>
                )}
              </div>
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
            ),
          )}
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
              <Field label="Título do case" hint="É o H1 da página. O título que vai para o Google fica na seção de SEO.">
                <input className="input-mint" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Como a Acme cresceu 3x" />
              </Field>

              <Field label="Slug" hint="Gerado automaticamente a partir do título · usado na URL /cases/...">
                <input
                  className="input-mint font-mono"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="como-a-acme-cresceu-3x"
                />
                {editing?.status === 'publicado' && editing.slug && form.slug && form.slug !== editing.slug && (
                  <p className="mt-1 text-[11px]" style={{ color: 'hsl(45 95% 75%)' }}>
                    Endereço publicado vai mudar: /cases/{editing.slug} redirecionará (301) para /cases/{form.slug}.
                  </p>
                )}
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

              <Field label="Resumo do card" hint="Uma ou duas frases: aparece no card da listagem e da home. Não é a meta descrição.">
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


              <ImageInput
                label="Imagem de capa"
                value={form.imagem_destaque ? { id: form.imagem_destaque, url: coverUrl } : null}
                onChange={(v) => {
                  setCoverUrl(v?.url || '')
                  setForm((f) => ({ ...f, imagem_destaque: v?.id || '' }))
                }}
              />

              <div className="grid grid-cols-3 gap-3">
                <Field label="Data de publicação" hint="Horário de Brasília">
                  <input
                    type="datetime-local"
                    className="input-mint"
                    value={form.published_at}
                    onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
                  />
                </Field>
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
                  SEO — como aparece no Google
                </p>
                <div className="space-y-4">
                  <Field label="Title" hint="Sai na tag <title> da página. Vazio = usa o título do case. Até 60 caracteres.">
                    <input className="input-mint" value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} />
                    <CharCount value={form.meta_title || form.title} max={60} />
                  </Field>
                  <Field label="Meta descrição" hint="Texto abaixo do título no Google. Vazio = usa o resumo. Até 155 caracteres.">
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
