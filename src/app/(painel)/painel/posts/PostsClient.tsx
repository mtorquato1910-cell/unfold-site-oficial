'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, FileText, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field } from '@/components/painel/ui'
import ImageInput from '@/components/painel/ImageInput'
import RichTextEditor from '@/components/painel/RichTextEditor'
import { lexicalToHtml } from '@/lib/rich-text'
import { createPost, updatePost, deletePost } from '@/lib/actions/posts-actions'
import { approvePost, rejectPost } from '@/lib/actions/blog-submit-actions'

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

/** Contador de caracteres com alerta ao passar do ideal (item 1.5). */
function CharCount({ value, max }: { value: string; max: number }) {
  const len = (value || '').length
  const over = len > max
  return (
    <span
      className="mt-1 block text-right font-mono text-[10px]"
      style={{ color: over ? 'hsl(0 70% 72%)' : 'hsl(0 0% 91% / 0.4)' }}
    >
      {len}/{max}
      {over ? ' \u2014 acima do ideal' : ''}
    </span>
  )
}

/** Pr\u00e9via de como o artigo aparece no resultado de busca do Google (estilo WordPress). */
function SerpPreview({ title, slug, desc }: { title: string; slug: string; desc: string }) {
  const url = `unfoldgrowth.com.br \u203a blog \u203a ${slug || 'seu-artigo'}`
  const t = (title || 'T\u00edtulo do artigo').slice(0, 60)
  const d = (desc || 'Resumo de busca do artigo\u2026').slice(0, 160)
  return (
    <div className="rounded-lg p-3" style={{ background: 'hsl(0 0% 100% / 0.03)', border: '1px solid hsl(0 0% 100% / 0.06)' }}>
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] mb-2" style={{ color: 'hsl(0 0% 91% / 0.35)' }}>
        Pr\u00e9via no Google
      </p>
      <p className="text-[12px]" style={{ color: 'hsl(140 40% 62%)' }}>{url}</p>
      <p className="text-[15px] leading-snug" style={{ color: 'hsl(214 90% 74%)' }}>{t}</p>
      <p className="text-[12px] leading-snug mt-0.5" style={{ color: 'hsl(0 0% 91% / 0.55)' }}>{d}</p>
    </div>
  )
}

type FaqItem = { pergunta: string; resposta: string }

/** Editor de perguntas frequentes (item 1.4): add/remover/reordenar pares Q&A. */
function FaqEditor({ value, onChange }: { value: FaqItem[]; onChange: (v: FaqItem[]) => void }) {
  const items = value || []
  const fieldStyle = { background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' } as const
  const set = (i: number, patch: Partial<FaqItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const add = () => onChange([...items, { pergunta: '', resposta: '' }])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-[12px]" style={{ color: 'hsl(0 0% 91% / 0.4)' }}>Nenhuma pergunta ainda.</p>
      )}
      {items.map((it, i) => (
        <div key={i} className="rounded-lg p-3" style={{ background: 'hsl(0 0% 100% / 0.03)', border: '1px solid hsl(0 0% 100% / 0.06)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px]" style={{ color: 'hsl(0 0% 91% / 0.4)' }}>#{i + 1}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 text-[13px]" style={{ color: 'hsl(0 0% 91% / 0.6)' }}>↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="px-1.5 text-[13px]" style={{ color: 'hsl(0 0% 91% / 0.6)' }}>↓</button>
              <button type="button" onClick={() => remove(i)} className="px-1.5 text-[12px]" style={{ color: 'hsl(0 70% 72%)' }}>remover</button>
            </div>
          </div>
          <input className="w-full h-9 px-3 rounded-lg text-[13px] mb-2" style={fieldStyle} value={it.pergunta} onChange={(e) => set(i, { pergunta: e.target.value })} placeholder="Pergunta (como a pessoa perguntaria)" />
          <textarea rows={2} className="w-full px-3 py-2 rounded-lg text-[13px] resize-none" style={fieldStyle} value={it.resposta} onChange={(e) => set(i, { resposta: e.target.value })} placeholder="Resposta completa já nas primeiras 40 palavras" />
        </div>
      ))}
      <button type="button" onClick={add} className="text-[12px] px-3 py-1.5 rounded-lg" style={{ background: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)' }}>+ Adicionar pergunta</button>
    </div>
  )
}

/** Avisos de qualidade antes de publicar (item 1.3 — validação). */
function validateArticle(html: string, faq: FaqItem[]): string[] {
  const warns: string[] = []
  const h = html || ''
  const words = h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
  if (words > 800 && !/<h2[\s>]/i.test(h)) warns.push('Mais de 800 palavras e nenhum Título 2 (H2). Adicione capítulos.')
  if ((h.match(/<h1[\s>]/gi) || []).length > 0) warns.push('Há Título 1 (H1) no corpo — o H1 é só o título do post. Use H2 em diante.')
  const levels = [...h.matchAll(/<h([2-6])[\s>]/gi)].map((m) => Number(m[1]))
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) { warns.push('A hierarquia de títulos pula um nível (ex.: H2 → H4). Desça um nível por vez.'); break }
  }
  if ([...h.matchAll(/<img\b[^>]*>/gi)].some((m) => !/\balt="[^"]+"/i.test(m[0]))) warns.push('Há imagem sem descrição (alt).')
  const f = (faq || []).filter((q) => q.pergunta?.trim() && q.resposta?.trim())
  if (f.length > 0 && f.length < 3) warns.push('A seção de FAQ tem menos de 3 perguntas — o ideal é 3 a 8.')
  if (f.length > 8) warns.push('A seção de FAQ tem mais de 8 perguntas — o ideal é 3 a 8.')
  return warns
}

type Post = Record<string, any>

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  contentHtml: '',
  category: '',
  status: 'draft',
  tags: '',
  cover_image: '',
  imagem_destaque: '',
  meta_title: '',
  meta_description: '',
  faq: [] as FaqItem[],
  destaque_home: false,
}

export default function PostsClient({
  initialPosts,
  canApprove = false,
}: {
  initialPosts: Post[]
  canApprove?: boolean
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [coverUrl, setCoverUrl] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'published' | 'draft'>('all')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const pendingCount = posts.filter((p) => p.status === 'pending_review').length

  function handleApprove(post: Post) {
    if (!window.confirm(`Aprovar e publicar "${post.titulo || post.title}"?`)) return
    setError(null)
    startTransition(async () => {
      try {
        await approvePost(post.id)
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, status: 'published', publicado_em: new Date().toISOString() }
              : p,
          ),
        )
      } catch (err: any) {
        setError(err?.message || 'Falha ao aprovar')
      }
    })
  }

  function openReject(post: Post) {
    setRejectingId(post.id)
    setRejectReason('')
  }

  function handleReject() {
    if (!rejectingId || !rejectReason.trim()) return
    setError(null)
    startTransition(async () => {
      try {
        await rejectPost(rejectingId, rejectReason)
        setPosts((prev) =>
          prev.map((p) =>
            p.id === rejectingId
              ? { ...p, status: 'draft', rejectionReason: rejectReason }
              : p,
          ),
        )
        setRejectingId(null)
        setRejectReason('')
      } catch (err: any) {
        setError(err?.message || 'Falha ao rejeitar')
      }
    })
  }

  const filteredPosts =
    filter === 'all' ? posts : posts.filter((p) => p.status === filter)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setCoverUrl('')
    setOpen(true)
  }

  function openEdit(post: Post) {
    setEditing(post)
    const mediaId = post.imagem_destaque?.id ?? post.imagem_destaque ?? ''
    const mediaUrl = post.imagem_destaque?.url ?? post.cover_image ?? ''
    const cat = post.categoria ?? post.category
    const tagsArr = Array.isArray(post.tags)
      ? post.tags.map((t: any) => (typeof t === 'object' ? t?.tag : t)).filter(Boolean)
      : []
    setForm({
      title: post.titulo ?? post.title ?? '',
      slug: post.slug ?? '',
      excerpt: post.resumo ?? post.excerpt ?? '',
      content: '',
      // Pré-carrega o editor rico: usa o HTML salvo ou converte o Lexical antigo.
      contentHtml: post.conteudo_html || lexicalToHtml(post.conteudo) || '',
      category: typeof cat === 'object' ? (cat?.titulo ?? cat?.name ?? '') : (cat ?? ''),
      status: post.status ?? 'draft',
      tags: tagsArr.join(', '),
      cover_image: mediaUrl,
      imagem_destaque: mediaId ? String(mediaId) : '',
      meta_title: post.meta_title ?? '',
      meta_description: post.meta_description ?? '',
      faq: Array.isArray(post.faq) ? post.faq : [],
      destaque_home: !!post.destaque_home,
    })
    setCoverUrl(mediaUrl)
    setOpen(true)
  }

  function handleTitleChange(val: string) {
    // Edição: NÃO sobrescreve o slug existente (preserva a URL já publicada/indexada).
    // Autogera o slug apenas na criação. Espelha o comportamento do CasesClient.
    setForm(f => ({ ...f, title: val, slug: editing ? f.slug : slugify(val) }))
  }

  function handleSubmit() {
    const data = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    // Validação de qualidade ao publicar (item 1.3): avisa, não bloqueia.
    if (form.status === 'published') {
      const warns = validateArticle(form.contentHtml, form.faq)
      if (warns.length && !window.confirm(`Avisos de qualidade:\n\n- ${warns.join('\n- ')}\n\nPublicar mesmo assim?`)) {
        return
      }
    }
    setError(null)
    startTransition(async () => {
      try {
        if (editing) {
          const res: any = await updatePost(editing.id, data)
          if (!res?.ok) {
            setError(res?.error || 'Falha ao salvar')
            return
          }
          setPosts(prev => prev.map(p => p.id === editing.id ? { ...p, ...data } : p))
          if (res.warning) window.alert(res.warning)
        } else {
          const res: any = await createPost(data)
          if (!res?.ok) {
            setError(res?.error || 'Falha ao salvar')
            return
          }
          // Re-fetch simple: just prepend optimistically
          setPosts(prev => [{ id: res.id, ...data, createdAt: new Date().toISOString() }, ...prev])
          if (res.warning) window.alert(res.warning)
        }
        setOpen(false)
      } catch (err: any) {
        setError(err?.message || 'Falha ao salvar')
      }
    })
  }

  function handleDelete(post: Post) {
    if (!window.confirm(`Deletar post "${post.title}"?`)) return
    startTransition(async () => {
      await deletePost(post.id)
      setPosts(prev => prev.filter(p => p.id !== post.id))
    })
  }

  return (
    <>
      <PageHeader
        title="Posts / Blog"
        description={
          pendingCount > 0
            ? `${pendingCount} aguardando revisão · Crie, edite e publique artigos`
            : 'Crie, edite e publique artigos'
        }
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px]"
            style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
          >
            <Plus className="h-4 w-4" /> Novo Post
          </button>
        }
      />

      {/* Filtros / Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          { v: 'all', label: 'Todos', count: posts.length },
          { v: 'pending_review', label: 'Aguardando revisão', count: pendingCount, urgent: true },
          { v: 'published', label: 'Publicados', count: posts.filter((p) => p.status === 'published').length },
          { v: 'draft', label: 'Rascunhos', count: posts.filter((p) => p.status === 'draft').length },
        ].map((t: any) => {
          const active = filter === t.v
          return (
            <button
              key={t.v}
              onClick={() => setFilter(t.v)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition flex items-center gap-2"
              style={
                active
                  ? {
                      background: 'hsl(158 92% 70% / 0.14)',
                      color: 'hsl(158 92% 80%)',
                      border: '1px solid hsl(158 92% 70% / 0.3)',
                    }
                  : {
                      background: 'hsl(0 0% 100% / 0.03)',
                      color: 'hsl(0 0% 91% / 0.6)',
                      border: '1px solid hsl(0 0% 100% / 0.06)',
                    }
              }
            >
              {t.label}
              <span
                className="font-mono text-[10px] px-1.5 rounded"
                style={{
                  background: t.urgent && t.count > 0 ? 'hsl(45 95% 65% / 0.2)' : 'hsl(0 0% 100% / 0.05)',
                  color: t.urgent && t.count > 0 ? 'hsl(45 95% 80%)' : 'inherit',
                }}
              >
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-[13px]"
          style={{
            background: 'hsl(0 70% 60% / 0.10)',
            color: 'hsl(0 70% 80%)',
            border: '1px solid hsl(0 70% 60% / 0.25)',
          }}
        >
          {error}
        </div>
      )}

      {/*
        Enquanto um modal está aberto, NÃO renderizamos a lista/tabela de posts.
        Motivo: com ~34 posts, manter a tabela montada atrás do modal congela a
        renderização (GPU/compositing) por segundos — sem erro no console. O modal
        cobre a tela inteira com fundo sólido, então esconder a lista é invisível
        para o usuário. Isso deixa a aba "Publicados" tão leve quanto uma vazia.
      */}
      {open || rejectingId ? null : filteredPosts.length === 0 ? (
        <EmptyState
          title="Nenhum post ainda"
          description="Crie o primeiro artigo para o blog da Unfold."
          icon={FileText}
          action={
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px]"
              style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
            >
              <Plus className="h-4 w-4" /> Criar Post
            </button>
          }
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Título</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim hidden md:table-cell">Slug</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Status</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim hidden lg:table-cell">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => {
                  const titulo = post.titulo || post.title || '—'
                  const isExternal = !!post.isExternalSubmission
                  const isPending = post.status === 'pending_review'
                  return (
                    <tr
                      key={post.id}
                      style={{ borderBottom: '1px solid hsl(0 0% 100% / 0.04)' }}
                      className="hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 max-w-[280px]">
                        <div className="font-medium text-[13px] truncate text-fg">{titulo}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {isExternal && (
                            <span
                              className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                              style={{
                                background: 'hsl(217 93% 78% / 0.12)',
                                color: 'hsl(217 93% 78%)',
                                border: '1px solid hsl(217 93% 78% / 0.25)',
                              }}
                              title={`Por: ${post.submittedByName} <${post.submittedByEmail}>`}
                            >
                              <ExternalLink className="h-2.5 w-2.5" />
                              externo · {post.submittedByName}
                            </span>
                          )}
                          {post.slug && (
                            <span className="text-[10px] font-mono text-dim truncate max-w-[160px]">
                              /{post.slug}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-mono text-dim hidden md:table-cell max-w-[160px] truncate">
                        {post.slug || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={post.status ?? 'draft'} />
                      </td>
                      <td className="px-4 py-3 text-[12px] text-dim hidden lg:table-cell">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {isPending && canApprove && (
                            <>
                              <button
                                onClick={() => handleApprove(post)}
                                disabled={isPending}
                                className="px-2 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider flex items-center gap-1"
                                style={{
                                  background: 'hsl(158 92% 70% / 0.14)',
                                  color: 'hsl(158 92% 70%)',
                                  border: '1px solid hsl(158 92% 70% / 0.3)',
                                }}
                                title="Aprovar e publicar"
                              >
                                <CheckCircle2 className="h-3 w-3" /> aprovar
                              </button>
                              <button
                                onClick={() => openReject(post)}
                                className="px-2 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider flex items-center gap-1"
                                style={{
                                  background: 'hsl(0 70% 60% / 0.10)',
                                  color: 'hsl(0 70% 80%)',
                                  border: '1px solid hsl(0 70% 60% / 0.25)',
                                }}
                                title="Rejeitar com motivo"
                              >
                                <XCircle className="h-3 w-3" /> rejeitar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openEdit(post)}
                            className="p-1.5 rounded-md transition hover:bg-white/[0.06]"
                            style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="p-1.5 rounded-md transition hover:bg-red-500/10"
                            style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                            title="Deletar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Modal */}
      {/*
        IMPORTANTE: sem backdrop-filter/blur aqui.
        O blur força o navegador a recompor TODA a página atrás do modal; com a lista
        de 34 posts (página alta) isso congela a GPU por segundos (tela travada, sem
        erro no console). Fundo sólido opaco resolve e fica visualmente idêntico.
      */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 4% / 0.92)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: 'hsl(197 100% 9%)',
              border: '1px solid hsl(158 92% 70% / 0.15)',
              boxShadow: '0 20px 60px -15px hsl(197 100% 3% / 0.85)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-[20px] font-semibold" style={{ color: 'hsl(0 0% 91%)', letterSpacing: '-0.02em' }}>
                {editing ? 'Editar Post' : 'Novo Post'}
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
              <Field label="Título">
                <input
                  className="w-full h-10 px-3 rounded-lg text-[13px]"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Título do artigo"
                />
              </Field>

              <Field label="Slug" hint="Gerado automaticamente a partir do título">
                <input
                  className="w-full h-10 px-3 rounded-lg text-[13px] font-mono"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91% / 0.7)', outline: 'none' }}
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="meu-artigo"
                />
              </Field>

              <Field label="Resumo (excerpt)">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Breve descrição do artigo..."
                />
              </Field>

              <Field
                label="Conteúdo"
                hint="Escreva o artigo de ponta a ponta. Use a barra para Título 2–6 (H2–H6), listas, tabela, imagem (com descrição), vídeo e link. O H1 é o título do post, aplicado automaticamente — não use no corpo."
              >
                <RichTextEditor
                  variant="article"
                  value={form.contentHtml}
                  onChange={(html) => setForm(f => ({ ...f, contentHtml: html }))}
                  placeholder="Escreva o artigo…"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Categoria">
                  <input
                    className="w-full h-10 px-3 rounded-lg text-[13px]"
                    style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="growth, marketing..."
                  />
                </Field>

                <Field label="Status">
                  <select
                    className="w-full h-10 px-3 rounded-lg text-[13px]"
                    style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </Field>
              </div>

              <Field
                label="Destacar na Home"
                hint='Exibe o post na seção "Insights" da página inicial (só vale se Publicado)'
              >
                <label className="flex h-10 items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.destaque_home}
                    onChange={e => setForm(f => ({ ...f, destaque_home: e.target.checked }))}
                    style={{ accentColor: 'hsl(158 92% 70%)' }}
                  />
                  <span className="text-[13px] text-dim-2">Exibir nos Insights da home</span>
                </label>
              </Field>

              <Field label="Tags" hint="Separadas por vírgula">
                <input
                  className="w-full h-10 px-3 rounded-lg text-[13px]"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="seo, growth, inbound"
                />
              </Field>

              <ImageInput
                label="Imagem de capa"
                value={form.imagem_destaque ? { id: form.imagem_destaque, url: coverUrl } : null}
                onChange={(v) => {
                  setCoverUrl(v?.url || '')
                  setForm(f => ({ ...f, imagem_destaque: v?.id || '', cover_image: v?.url || '' }))
                }}
              />

              {/* Cabeçalho de busca (SEO) — item 1.3/1.5: campos próprios de busca,
                  separados do resumo do card, com contador e prévia do Google. */}
              <div className="pt-2" style={{ borderTop: '1px solid hsl(0 0% 100% / 0.06)' }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3" style={{ color: 'hsl(158 92% 70% / 0.7)' }}>Cabeçalho de busca (SEO)</p>
                <div className="space-y-4">
                  <Field label="Título de busca" hint="Vazio = usa o título do post. Ideal até 60 caracteres.">
                    <input
                      className="w-full h-10 px-3 rounded-lg text-[13px]"
                      style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                      value={form.meta_title}
                      onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
                      placeholder="Como aparece no título do Google"
                    />
                    <CharCount value={form.meta_title || form.title} max={60} />
                  </Field>
                  <Field label="Resumo de busca" hint="Texto abaixo do título no Google — separado do resumo do card.">
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                      style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                      value={form.meta_description}
                      onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                      placeholder="Como aparece o resumo no Google"
                    />
                    <CharCount value={form.meta_description || form.excerpt} max={155} />
                  </Field>
                  <SerpPreview
                    title={form.meta_title || form.title}
                    slug={form.slug}
                    desc={form.meta_description || form.excerpt}
                  />
                </div>
              </div>

              {/* Perguntas frequentes (item 1.4) */}
              <div className="pt-2" style={{ borderTop: '1px solid hsl(0 0% 100% / 0.06)' }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1" style={{ color: 'hsl(158 92% 70% / 0.7)' }}>Perguntas frequentes</p>
                <p className="text-[11px] mb-3" style={{ color: 'hsl(0 0% 91% / 0.4)' }}>3 a 8 perguntas. Geram a seção no artigo + a marcação para IA e Bing.</p>
                <FaqEditor value={form.faq} onChange={(faq) => setForm(f => ({ ...f, faq }))} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition"
                style={{ color: 'hsl(0 0% 91% / 0.6)', background: 'hsl(0 0% 100% / 0.04)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !form.title}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] disabled:opacity-50"
                style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
              >
                {isPending ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Criar Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 4% / 0.92)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectingId(null)
          }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
            style={{
              background: 'hsl(197 100% 9%)',
              border: '1px solid hsl(158 92% 70% / 0.15)',
              boxShadow: '0 20px 60px -15px hsl(197 100% 3% / 0.85)',
            }}
          >
            <h3 className="font-display text-[18px] font-semibold mb-3 text-fg">Rejeitar submissão</h3>
            <p className="text-[13px] text-dim-2 mb-4">
              O autor receberá um email com o motivo. Seja específico para que ele possa ajustar.
            </p>
            <textarea
              rows={5}
              autoFocus
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Conteúdo com viés comercial; reescreva focando no método. Reduza autoreferências."
              className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
              style={{ height: 'auto' }}
            />
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-dim-2 hover:bg-white/[0.04]"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={isPending || !rejectReason.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] disabled:opacity-50"
                style={{
                  background: 'hsl(0 70% 60%)',
                  color: 'white',
                }}
              >
                <XCircle className="h-4 w-4" />
                {isPending ? 'Enviando...' : 'Rejeitar e notificar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
