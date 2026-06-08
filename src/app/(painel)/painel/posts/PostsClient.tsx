'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, FileText, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field } from '@/components/painel/ui'
import { createPost, updatePost, deletePost } from '@/lib/actions/posts-actions'
import { approvePost, rejectPost } from '@/lib/actions/blog-submit-actions'

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

type Post = Record<string, any>

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  category: '',
  status: 'draft',
  tags: '',
  cover_image: '',
  meta_title: '',
  meta_description: '',
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
    setOpen(true)
  }

  function openEdit(post: Post) {
    setEditing(post)
    setForm({
      title: post.title ?? '',
      slug: post.slug ?? '',
      excerpt: post.excerpt ?? '',
      category: typeof post.category === 'object' ? (post.category?.name ?? '') : (post.category ?? ''),
      status: post.status ?? 'draft',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags ?? ''),
      cover_image: post.cover_image ?? '',
      meta_title: post.meta_title ?? '',
      meta_description: post.meta_description ?? '',
    })
    setOpen(true)
  }

  function handleTitleChange(val: string) {
    setForm(f => ({ ...f, title: val, slug: slugify(val) }))
  }

  function handleSubmit() {
    const data = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
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
        } else {
          const res: any = await createPost(data)
          if (!res?.ok) {
            setError(res?.error || 'Falha ao salvar')
            return
          }
          // Re-fetch simple: just prepend optimistically
          setPosts(prev => [{ id: res.id, ...data, createdAt: new Date().toISOString() }, ...prev])
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

      {filteredPosts.length === 0 ? (
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
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </Field>
              </div>

              <Field label="Tags" hint="Separadas por vírgula">
                <input
                  className="w-full h-10 px-3 rounded-lg text-[13px]"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="seo, growth, inbound"
                />
              </Field>

              <Field label="Imagem de Capa (URL)">
                <input
                  className="w-full h-10 px-3 rounded-lg text-[13px]"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.cover_image}
                  onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                  placeholder="https://..."
                />
              </Field>

              {/* SEO */}
              <div className="pt-2" style={{ borderTop: '1px solid hsl(0 0% 100% / 0.06)' }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3" style={{ color: 'hsl(158 92% 70% / 0.7)' }}>SEO</p>
                <div className="space-y-4">
                  <Field label="Meta Title">
                    <input
                      className="w-full h-10 px-3 rounded-lg text-[13px]"
                      style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                      value={form.meta_title}
                      onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
                      placeholder="Título para SEO"
                    />
                  </Field>
                  <Field label="Meta Description">
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                      style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                      value={form.meta_description}
                      onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                      placeholder="Descrição para mecanismos de busca..."
                    />
                  </Field>
                </div>
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
          style={{ background: 'hsl(194 100% 4% / 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectingId(null)
          }}
        >
          <div
            className="glass rounded-2xl p-6 w-full max-w-md"
            style={{ borderColor: 'hsl(158 92% 70% / 0.15)' }}
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
