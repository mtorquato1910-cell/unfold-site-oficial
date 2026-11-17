'use client'

import { useState, useTransition } from 'react'
import { Field } from '@/components/painel/ui'
import ImageInput from '@/components/painel/ImageInput'
import { CharCount } from '@/components/painel/article-fields'
import { fromBrtInput } from '@/lib/content-date'

/**
 * Edição rápida (manual do desenvolvedor de 13/11/2026 + pedido de 17/11/2026), no
 * estilo do WordPress: abre na própria lista, sem entrar no editor completo.
 * Posts: título, slug, meta descrição, categoria, tags, data, capa, autor e status.
 * Cases: título, slug, meta descrição, data, capa e status (não têm os outros).
 * Os demais campos não aparecem e não são alterados (actions quickUpdate*).
 */

export type QuickEditValues = {
  titulo: string
  slug: string
  meta_description: string
  categoria: string
  tags: string
  /** Valor do datetime-local, em horário de Brasília. */
  data: string
  imagem_destaque: string
  coverUrl: string
  autor: string
  status: 'published' | 'draft'
}

type Option = { id: string; nome: string }

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

export default function QuickEdit({
  kind,
  initial,
  wasPublished,
  categories = [],
  authors = [],
  onSave,
  onCancel,
}: {
  kind: 'post' | 'case'
  initial: QuickEditValues
  /** Publicado antes de abrir: trocar o slug cria redirect do endereço antigo. */
  wasPublished: boolean
  categories?: Option[]
  authors?: Option[]
  onSave: (payload: Record<string, any>) => Promise<{ ok: boolean; error?: string; warning?: string }>
  onCancel: () => void
}) {
  const [v, setV] = useState<QuickEditValues>(initial)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const set = (patch: Partial<QuickEditValues>) => setV((prev) => ({ ...prev, ...patch }))
  const base = kind === 'post' ? '/blog' : '/cases'
  const slugChanged = wasPublished && slugify(v.slug) !== initial.slug && slugify(v.slug) !== ''

  function submit() {
    setError(null)
    if (!v.titulo.trim()) return setError('Informe o título.')
    if (!slugify(v.slug)) return setError('Informe o slug.')
    if (kind === 'post' && v.status === 'published' && !v.autor) return setError('Selecione o autor para publicar.')
    // Só envia a data se mudou: o datetime-local não tem segundos, e reenviar o valor
    // intacto cortaria os segundos da data original a cada salvamento.
    const publishedIso = v.data !== initial.data ? fromBrtInput(v.data) : null
    const common = {
      slug: slugify(v.slug),
      meta_description: v.meta_description,
      imagem_destaque: v.imagem_destaque,
      status: v.status,
    }
    const payload =
      kind === 'post'
        ? { ...common, titulo: v.titulo, categoria: v.categoria, tags: v.tags, autor: v.autor, publicado_em: publishedIso }
        : { ...common, title: v.titulo, published_at: publishedIso }
    startTransition(async () => {
      const res = await onSave(payload)
      if (!res?.ok) setError(res?.error || 'Falha ao salvar')
      else if (res.warning) window.alert(res.warning)
    })
  }

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: 'hsl(197 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.2)' }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel()
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'hsl(158 92% 70% / 0.8)' }}>
        Edição rápida
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="Título">
            <input className="input-mint" value={v.titulo} onChange={(e) => set({ titulo: e.target.value })} autoFocus />
          </Field>
          <Field label="Slug" hint={`Endereço: ${base}/${slugify(v.slug) || '…'}`}>
            <input className="input-mint font-mono" value={v.slug} onChange={(e) => set({ slug: e.target.value })} />
            {slugChanged && (
              <p className="mt-1 text-[11px]" style={{ color: 'hsl(45 95% 75%)' }}>
                Endereço publicado vai mudar: {base}/{initial.slug} redirecionará (301) para {base}/{slugify(v.slug)}.
              </p>
            )}
          </Field>
          <Field label="Meta descrição" hint="Texto que aparece abaixo do título no Google. Ideal até 155 caracteres.">
            <textarea
              rows={3}
              className="input-mint resize-none"
              style={{ height: 'auto' }}
              value={v.meta_description}
              onChange={(e) => set({ meta_description: e.target.value })}
            />
            <CharCount value={v.meta_description} max={155} />
          </Field>
          {kind === 'post' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoria">
                <select className="input-mint" value={v.categoria} onChange={(e) => set({ categoria: e.target.value })}>
                  <option value="">— Sem categoria —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </Field>
              <Field label="Autor">
                <select className="input-mint" value={v.autor} onChange={(e) => set({ autor: e.target.value })}>
                  <option value="">— Selecione —</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}
          {kind === 'post' && (
            <Field label="Tags" hint="Separadas por vírgula. Alimentam os artigos relacionados no fim do post.">
              <input className="input-mint" value={v.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="crm, funil de vendas" />
            </Field>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data de publicação" hint="Horário de Brasília">
              <input type="datetime-local" className="input-mint" value={v.data} onChange={(e) => set({ data: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className="input-mint" value={v.status} onChange={(e) => set({ status: e.target.value as QuickEditValues['status'] })}>
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
              </select>
            </Field>
          </div>
          <ImageInput
            label="Capa"
            value={v.imagem_destaque ? { id: v.imagem_destaque, url: v.coverUrl } : null}
            onChange={(img) => set({ imagem_destaque: img?.id || '', coverUrl: img?.url || '' })}
          />
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-2.5 text-[13px]"
          style={{ background: 'hsl(0 70% 60% / 0.10)', color: 'hsl(0 70% 80%)', border: '1px solid hsl(0 70% 60% / 0.25)' }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] font-medium text-dim-2 hover:bg-white/[0.04]">
          Cancelar
        </button>
        <button
          onClick={submit}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] disabled:opacity-50"
          style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
        >
          {isPending ? 'Salvando...' : 'Atualizar'}
        </button>
      </div>
    </div>
  )
}
