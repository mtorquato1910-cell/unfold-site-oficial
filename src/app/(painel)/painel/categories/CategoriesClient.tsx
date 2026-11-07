'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Check, X, FolderTree, ExternalLink } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState, Field } from '@/components/painel/ui'
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/categories-actions'

type Category = Record<string, any>

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

const inputStyle = {
  background: 'hsl(197 100% 10%)',
  border: '1px solid hsl(158 92% 70% / 0.12)',
  color: 'hsl(0 0% 91%)',
  outline: 'none',
} as const

type EditForm = { nome: string; intro: string; meta_description: string; ordem: string }

/**
 * Categorias do blog (relatório de SEO 06/11/2026 — Tarefa 3). Cada uma tem página
 * própria em /blog/categoria/<slug>, com a intro editada aqui. O slug é fixado na
 * criação: renomear não muda a URL.
 */
export default function CategoriesClient({
  initialCategories,
  postCounts = {},
}: {
  initialCategories: Category[]
  postCounts?: Record<string, number>
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EditForm>({ nome: '', intro: '', meta_description: '', ordem: '0' })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function run(fn: () => Promise<void>) {
    setError(null)
    startTransition(async () => {
      try {
        await fn()
      } catch (e: any) {
        setError(e?.message || 'Falha ao salvar')
      }
    })
  }

  function handleCreate() {
    const nome = newName.trim()
    if (!nome) return
    const slug = slugify(nome)
    const ordem = categories.reduce((m, c) => Math.max(m, Number(c.ordem) || 0), 0) + 1
    run(async () => {
      const res = await createCategory({ nome, slug, ordem })
      setCategories(prev => [...prev, { id: String(res.id), nome, slug, ordem, intro: '', meta_description: '' }])
      setNewName('')
    })
  }

  function startEdit(cat: Category) {
    setEditingId(String(cat.id))
    setForm({
      nome: cat.nome ?? '',
      intro: cat.intro ?? '',
      meta_description: cat.meta_description ?? '',
      ordem: String(cat.ordem ?? 0),
    })
  }

  function handleUpdate(cat: Category) {
    if (!form.nome.trim()) return
    run(async () => {
      await updateCategory(String(cat.id), form)
      setCategories(prev =>
        prev.map(c => (String(c.id) === String(cat.id) ? { ...c, ...form, ordem: Number(form.ordem) || 0 } : c)),
      )
      setEditingId(null)
    })
  }

  function handleDelete(cat: Category) {
    const n = postCounts[String(cat.id)] || 0
    const aviso = n ? `\n\n${n} post(s) ficarão sem categoria.` : ''
    if (!window.confirm(`Deletar categoria "${cat.nome}"?${aviso}`)) return
    run(async () => {
      await deleteCategory(String(cat.id))
      setCategories(prev => prev.filter(c => String(c.id) !== String(cat.id)))
    })
  }

  const sorted = [...categories].sort(
    (a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0) || String(a.nome).localeCompare(String(b.nome), 'pt-BR'),
  )

  return (
    <>
      <PageHeader
        title="Categorias do blog"
        description="Cada categoria com artigo publicado ganha página própria em /blog/categoria/… e entra no sitemap"
      />

      <div className="mb-6">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <input
              className="flex-1 h-10 px-3 rounded-lg text-[13px]"
              style={inputStyle}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
              placeholder="Nome da nova categoria..."
            />
            <div className="shrink-0 text-[11px] font-mono text-dim px-3 hidden sm:block">
              Slug: {newName ? slugify(newName) : '—'}
            </div>
            <button
              onClick={handleCreate}
              disabled={isPending || !newName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] shrink-0 disabled:opacity-50"
              style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
        </GlassCard>
      </div>

      {error && (
        <p className="mb-4 text-[13px]" style={{ color: 'hsl(0 84% 70%)' }}>{error}</p>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria ainda"
          description="Adicione categorias para organizar os artigos do blog."
          icon={FolderTree}
        />
      ) : (
        <div className="space-y-3">
          {sorted.map(cat => {
            const id = String(cat.id)
            const n = postCounts[id] || 0
            const editing = editingId === id
            return (
              <GlassCard key={id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[14px] font-medium" style={{ color: 'hsl(0 0% 91%)' }}>{cat.nome}</span>
                      <span className="text-[11px] font-mono text-dim">/blog/categoria/{cat.slug}</span>
                      <span className="text-[11px] text-dim-2">
                        {n} post{n === 1 ? '' : 's'} publicado{n === 1 ? '' : 's'}
                        {n === 0 && ' · página fica oculta até receber um artigo'}
                      </span>
                    </div>
                    {!editing && (
                      <p className="mt-1.5 text-[12px] text-dim-2 line-clamp-2">
                        {cat.intro?.trim() ? cat.intro : 'Sem intro — preencha para a página da categoria.'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {n > 0 && (
                      <a
                        href={`/blog/categoria/${cat.slug}`}
                        target="_blank"
                        rel="noopener"
                        className="p-1.5 rounded-md transition hover:bg-white/[0.06]"
                        style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                        title="Ver no site"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {!editing && (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-md transition hover:bg-white/[0.06]"
                          style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-md transition hover:bg-red-500/10"
                          style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                          title="Deletar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="mt-4 space-y-4">
                    <div className="grid sm:grid-cols-[1fr_120px] gap-4">
                      <Field label="Nome" hint="Renomear não muda a URL da categoria.">
                        <input
                          autoFocus
                          className="w-full h-10 px-3 rounded-lg text-[13px]"
                          style={inputStyle}
                          value={form.nome}
                          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                        />
                      </Field>
                      <Field label="Ordem" hint="Menor primeiro">
                        <input
                          type="number"
                          className="w-full h-10 px-3 rounded-lg text-[13px]"
                          style={inputStyle}
                          value={form.ordem}
                          onChange={e => setForm(f => ({ ...f, ordem: e.target.value }))}
                        />
                      </Field>
                    </div>
                    <Field label="Intro" hint="Texto de abertura da página da categoria. Parágrafos separados por linha em branco.">
                      <textarea
                        rows={5}
                        className="w-full px-3 py-2 rounded-lg text-[13px] leading-relaxed"
                        style={inputStyle}
                        value={form.intro}
                        onChange={e => setForm(f => ({ ...f, intro: e.target.value }))}
                      />
                    </Field>
                    <Field label="Resumo de busca (SEO)" hint="Vazio = usa o início da intro. Ideal até 155 caracteres.">
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg text-[13px]"
                        style={inputStyle}
                        value={form.meta_description}
                        onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                      />
                      <p className="mt-1 text-[11px] font-mono text-dim">{form.meta_description.length}/155</p>
                    </Field>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] hover:bg-white/[0.06]"
                        style={{ color: 'hsl(0 0% 91% / 0.7)' }}
                      >
                        <X className="h-3.5 w-3.5" /> Cancelar
                      </button>
                      <button
                        onClick={() => handleUpdate(cat)}
                        disabled={isPending || !form.nome.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-[13px] disabled:opacity-50"
                        style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
                      >
                        <Check className="h-3.5 w-3.5" /> Salvar
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            )
          })}
        </div>
      )}
    </>
  )
}
