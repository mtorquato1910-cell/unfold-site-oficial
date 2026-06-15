'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, ExternalLink } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState, Field, MintButton } from '@/components/painel/ui'
import ImageInput from '@/components/painel/ImageInput'
import { createBanner, updateBanner, deleteBanner } from '@/lib/actions/banners-actions'

type Banner = Record<string, any>

const EMPTY_FORM = {
  titulo: '',
  tag: '',
  descricao: '',
  cta_label: 'Saiba mais',
  link: '',
  ativo: true,
  ordem: 0,
  imagem: '',
}

export default function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
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

  function openEdit(b: Banner) {
    setEditing(b)
    const mediaId = b.imagem?.id ?? b.imagem ?? ''
    const mediaUrl = b.imagem?.url ?? ''
    setForm({
      titulo: b.titulo ?? '',
      tag: b.tag ?? '',
      descricao: b.descricao ?? '',
      cta_label: b.cta_label ?? 'Saiba mais',
      link: b.link ?? '',
      ativo: b.ativo != null ? !!b.ativo : true,
      ordem: typeof b.ordem === 'number' ? b.ordem : Number(b.ordem) || 0,
      imagem: mediaId ? String(mediaId) : '',
    })
    setCoverUrl(mediaUrl)
    setError(null)
    setOpen(true)
  }

  function handleSubmit() {
    setError(null)
    if (!form.titulo.trim()) { setError('Informe o título do banner.'); return }
    if (!form.link.trim()) { setError('Informe o link de destino.'); return }
    startTransition(async () => {
      try {
        if (editing) {
          const res: any = await updateBanner(editing.id, form)
          if (!res?.ok) { setError(res?.error || 'Falha ao salvar'); return }
          setBanners(prev => prev.map(b => b.id === editing.id
            ? { ...b, ...form, imagem: form.imagem ? { id: form.imagem, url: coverUrl } : null }
            : b))
        } else {
          const res: any = await createBanner(form)
          if (!res?.ok) { setError(res?.error || 'Falha ao salvar'); return }
          setBanners(prev => [
            ...prev,
            { id: res.id, ...form, imagem: form.imagem ? { id: form.imagem, url: coverUrl } : null },
          ].sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)))
        }
        setOpen(false)
      } catch (err: any) {
        setError(err?.message || 'Falha ao salvar')
      }
    })
  }

  function handleDelete(b: Banner) {
    if (!window.confirm('Excluir este banner?')) return
    startTransition(async () => {
      await deleteBanner(b.id)
      setBanners(prev => prev.filter(x => x.id !== b.id))
    })
  }

  return (
    <>
      <PageHeader
        title="Banners"
        description="Peças clicáveis exibidas dentro dos posts do blog (ferramentas, diagnóstico, cases)"
        actions={
          <MintButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo banner
          </MintButton>
        }
      />

      {banners.length === 0 ? (
        <EmptyState title="Nenhum banner ainda" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map(b => {
            const imgUrl = b.imagem?.url ?? (typeof b.imagem === 'string' ? coverUrl : '')
            return (
              <GlassCard key={b.id} className="glass-hover transition-all overflow-hidden">
                {imgUrl ? (
                  <div className="mb-3 -mx-1 -mt-1 aspect-[16/9] overflow-hidden rounded-lg bg-white/[0.03]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={b.titulo || ''} className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {b.tag && (
                      <div className="text-[10px] font-mono uppercase tracking-wider text-mint">{b.tag}</div>
                    )}
                    <h3 className="mt-0.5 font-medium truncate text-fg">{b.titulo || '—'}</h3>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={
                      b.ativo
                        ? { background: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)' }
                        : { background: 'hsl(0 0% 100% / 0.06)', color: 'hsl(0 0% 60%)' }
                    }
                  >
                    {b.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {b.descricao && <p className="text-xs text-dim-2 line-clamp-2">{b.descricao}</p>}
                <div className="mt-3 flex items-center gap-1 text-[11px] text-dim-2 truncate">
                  <ExternalLink className="h-3 w-3 shrink-0" /> <span className="truncate">{b.link}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-dim-2">Ordem: {b.ordem ?? 0}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(b)} className="icon-btn p-1.5 rounded-md" title="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(b)} className="icon-btn p-1.5 rounded-md" title="Excluir">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            )
          })}
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
                {editing ? 'Editar banner' : 'Novo banner'}
              </h3>
              <button onClick={() => setOpen(false)} className="icon-btn p-1.5 rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Título">
                <input
                  className="input-mint"
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Faça seu diagnóstico gratuito"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Etiqueta" hint="Texto pequeno acima do título (opcional)">
                  <input
                    className="input-mint"
                    value={form.tag}
                    onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                    placeholder="Ferramenta"
                  />
                </Field>
                <Field label="Texto do botão">
                  <input
                    className="input-mint"
                    value={form.cta_label}
                    onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))}
                    placeholder="Saiba mais"
                  />
                </Field>
              </div>

              <Field label="Descrição" hint="Frase curta de apoio (opcional)">
                <textarea
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                  value={form.descricao}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Descubra os gargalos da sua operação comercial em 5 minutos."
                />
              </Field>

              <Field label="Link de destino" hint="Ex: /diagnostico, /calculadora, /cases ou uma URL completa">
                <input
                  className="input-mint font-mono"
                  value={form.link}
                  onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="/diagnostico"
                />
              </Field>

              <ImageInput
                label="Imagem do banner"
                value={form.imagem ? { id: form.imagem, url: coverUrl } : null}
                onChange={(v) => {
                  setCoverUrl(v?.url || '')
                  setForm(f => ({ ...f, imagem: v?.id || '' }))
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <Field label="Ordem" hint="Número menor aparece primeiro">
                  <input
                    type="number"
                    className="input-mint"
                    value={form.ordem}
                    onChange={e => setForm(f => ({ ...f, ordem: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Status">
                  <label className="flex h-11 items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.ativo}
                      onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))}
                      style={{ accentColor: 'hsl(158 92% 70%)' }}
                    />
                    <span className="text-sm text-dim-2">Ativo (aparece no blog)</span>
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
              <MintButton onClick={handleSubmit} disabled={isPending || !form.titulo}>
                {isPending ? 'Salvando...' : 'Salvar'}
              </MintButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
