'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, Pencil, Trash2, Check, X, FolderTree } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState } from '@/components/painel/ui'
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/content-actions'

type Category = Record<string, any>

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    const slug = slugify(name)
    startTransition(async () => {
      await createCategory({ name, slug })
      setCategories(prev => [...prev, { id: Date.now().toString(), name, slug, createdAt: new Date().toISOString() }])
      setNewName('')
    })
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditName(cat.name ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  function handleUpdate(cat: Category) {
    const name = editName.trim()
    if (!name) return
    const slug = slugify(name)
    startTransition(async () => {
      await updateCategory(cat.id, { name, slug })
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name, slug } : c))
      setEditingId(null)
    })
  }

  function handleDelete(cat: Category) {
    if (!window.confirm(`Deletar categoria "${cat.name}"?`)) return
    startTransition(async () => {
      await deleteCategory(cat.id)
      setCategories(prev => prev.filter(c => c.id !== cat.id))
    })
  }

  return (
    <>
      <PageHeader
        title="Categorias"
        description="Organize posts e cases por categoria"
      />

      {/* Criação inline */}
      <div className="mb-6">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              className="flex-1 h-10 px-3 rounded-lg text-[13px]"
              style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
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

      {/* Tabela */}
      {categories.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria ainda"
          description="Adicione categorias para organizar seu conteúdo."
          icon={FolderTree}
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Nome</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Slug</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr
                    key={cat.id}
                    style={{ borderBottom: '1px solid hsl(0 0% 100% / 0.04)' }}
                    className="hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-2.5">
                      {editingId === cat.id ? (
                        <input
                          autoFocus
                          className="w-full h-8 px-2.5 rounded-md text-[13px]"
                          style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.25)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleUpdate(cat)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                      ) : (
                        <span className="text-[13px] font-medium" style={{ color: 'hsl(0 0% 91%)' }}>
                          {cat.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-mono text-dim">
                      {editingId === cat.id ? slugify(editName || cat.name) : (cat.slug || slugify(cat.name || ''))}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        {editingId === cat.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(cat)}
                              disabled={isPending}
                              className="p-1.5 rounded-md transition hover:bg-white/[0.06]"
                              style={{ color: 'hsl(158 92% 70%)' }}
                              title="Salvar"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 rounded-md transition hover:bg-white/[0.06]"
                              style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                              title="Cancelar"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </>
  )
}
