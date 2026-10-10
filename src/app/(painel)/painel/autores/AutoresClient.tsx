'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, UserRound, X } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState, Field, MintButton } from '@/components/painel/ui'
import ImageInput from '@/components/painel/ImageInput'
import { createAuthor, updateAuthor, deleteAuthor } from '@/lib/actions/authors-actions'

/**
 * Autores dos artigos (S07 — épico seo-tecnico-2026-10; Checklist SEO M08).
 * A página pública /autor/<slug> só entra no Google com a bio completa preenchida.
 */
type Author = Record<string, any>

const EMPTY = {
  nome: '',
  slug: '',
  cargo: '',
  bio_curta: '',
  bio_completa: '',
  foto: '',
  foto_url: '',
  linkedin: '',
  perfis: '',
  formacao: '',
  experiencia: '',
  temas: '',
  registro_profissional: '',
  ativo: true,
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

const inputStyle = {
  background: 'hsl(197 100% 10%)',
  border: '1px solid hsl(158 92% 70% / 0.12)',
  color: 'hsl(0 0% 91%)',
  outline: 'none',
} as const

function photoOf(a: Author): string {
  if (a?.foto && typeof a.foto === 'object' && a.foto.url) return a.foto.url
  return a?.foto_url || ''
}

export default function AutoresClient({ initialAuthors }: { initialAuthors: Author[] }) {
  const [authors, setAuthors] = useState<Author[]>(initialAuthors)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Author | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [photoUrl, setPhotoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setPhotoUrl('')
    setError(null)
    setOpen(true)
  }

  function openEdit(a: Author) {
    setEditing(a)
    setForm({
      nome: a.nome ?? '',
      slug: a.slug ?? '',
      cargo: a.cargo ?? '',
      bio_curta: a.bio_curta ?? '',
      bio_completa: a.bio_completa ?? '',
      foto: a.foto ? String(a.foto?.id ?? a.foto) : '',
      foto_url: a.foto_url ?? '',
      linkedin: a.linkedin ?? '',
      perfis: Array.isArray(a.perfis) ? a.perfis.join('\n') : '',
      formacao: a.formacao ?? '',
      experiencia: a.experiencia ?? '',
      temas: Array.isArray(a.temas) ? a.temas.join(', ') : '',
      registro_profissional: a.registro_profissional ?? '',
      ativo: a.ativo !== false,
    })
    setPhotoUrl(photoOf(a))
    setError(null)
    setOpen(true)
  }

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit() {
    if (!form.nome.trim()) {
      setError('Informe o nome do autor.')
      return
    }
    setError(null)
    startTransition(async () => {
      const res: any = editing ? await updateAuthor(String(editing.id), form) : await createAuthor(form)
      if (!res?.ok) {
        setError(res?.error || 'Falha ao salvar')
        return
      }
      const saved = { ...(res.doc ?? {}), foto: res.doc?.foto ?? (form.foto ? { id: form.foto, url: photoUrl } : null) }
      setAuthors((prev) => (editing ? prev.map((a) => (a.id === editing.id ? saved : a)) : [...prev, saved]))
      setOpen(false)
    })
  }

  function handleDelete(a: Author) {
    if (!window.confirm(`Excluir o autor "${a.nome}"?`)) return
    startTransition(async () => {
      const res: any = await deleteAuthor(String(a.id))
      if (!res?.ok) {
        window.alert(res?.error || 'Falha ao excluir')
        return
      }
      setAuthors((prev) => prev.filter((x) => x.id !== a.id))
    })
  }

  const text = (key: keyof typeof EMPTY, placeholder = '') => (
    <input
      className="w-full h-10 px-3 rounded-lg text-[13px]"
      style={inputStyle}
      value={String(form[key] ?? '')}
      onChange={(e) => set(key, e.target.value as never)}
      placeholder={placeholder}
    />
  )
  const area = (key: keyof typeof EMPTY, rows: number, placeholder = '') => (
    <textarea
      rows={rows}
      className="w-full px-3 py-2 rounded-lg text-[13px] leading-relaxed"
      style={inputStyle}
      value={String(form[key] ?? '')}
      onChange={(e) => set(key, e.target.value as never)}
      placeholder={placeholder}
    />
  )

  return (
    <>
      <PageHeader
        title="Autores"
        description="Quem assina os artigos do blog. A página do autor só entra no Google com a bio completa."
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px]"
            style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
          >
            <Plus className="h-4 w-4" /> Novo autor
          </button>
        }
      />

      {authors.length === 0 ? (
        <EmptyState title="Nenhum autor ainda" description="Cadastre quem assina os artigos." icon={UserRound} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {authors.map((a) => (
            <GlassCard key={a.id} className="p-4 flex items-center gap-4">
              {photoOf(a) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoOf(a)} alt="" className="h-14 w-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-full grid place-items-center shrink-0" style={{ background: 'hsl(197 100% 10%)' }}>
                  <UserRound className="h-6 w-6 text-dim" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-fg truncate">
                  {a.nome} {a.ativo === false && <span className="text-[11px] text-dim">(inativo)</span>}
                </p>
                <p className="text-[12px] text-dim truncate">{a.cargo || 'Sem cargo'} · /autor/{a.slug}</p>
                <p className="text-[11px] mt-1" style={{ color: a.bio_completa ? 'hsl(158 92% 70%)' : 'hsl(40 90% 65%)' }}>
                  {a.bio_completa ? 'Página indexável' : 'Falta a bio completa (página fora do Google)'}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(a)} className="p-2 rounded-md hover:bg-white/[0.06] text-dim" title="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(a)} className="p-2 rounded-md hover:bg-red-500/10 text-dim" title="Excluir">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:p-10">
          <GlassCard className="w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[20px] font-semibold text-fg">{editing ? 'Editar autor' : 'Novo autor'}</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-white/[0.06] text-dim" title="Fechar">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome completo" hint="Como assina profissionalmente">
                <input
                  className="w-full h-10 px-3 rounded-lg text-[13px]"
                  style={inputStyle}
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))}
                />
              </Field>
              <Field label="Slug" hint="URL: /autor/<slug>">{text('slug')}</Field>
              <Field label="Cargo">{text('cargo', 'Ex.: Head de Growth')}</Field>
              <Field label="LinkedIn">{text('linkedin', 'https://www.linkedin.com/in/...')}</Field>
            </div>

            <ImageInput
              label="Foto (quadrada, rosto visível)"
              value={form.foto ? { id: form.foto, url: photoUrl } : photoUrl ? { url: photoUrl } : null}
              onChange={(v) => {
                // Remover a foto remove também a foto estática (foto_url) — senão ela "reaparecia".
                setPhotoUrl(v?.url || '')
                setForm((f) => ({ ...f, foto: v?.id || '', foto_url: v ? f.foto_url : '' }))
              }}
            />

            <Field label="Bio curta" hint="2 ou 3 linhas — aparece no box ao fim de cada artigo">{area('bio_curta', 3)}</Field>
            <Field label="Bio completa" hint="1 ou 2 parágrafos — página do autor. Sem ela a página fica fora do Google.">
              {area('bio_completa', 6)}
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Formação">{area('formacao', 3, 'Graduação, pós, cursos relevantes')}</Field>
              <Field label="Experiência">{area('experiencia', 3, 'Anos de atuação e especialidades')}</Field>
              <Field label="Temas que assina" hint="Separados por vírgula">{text('temas', 'CRM, funil de vendas, RevOps')}</Field>
              <Field label="Registro profissional" hint="OAB, CRM, CRC… quando houver">{text('registro_profissional')}</Field>
            </div>
            <Field label="Outros perfis" hint="Uma URL por linha (Instagram profissional, YouTube, site pessoal)">
              {area('perfis', 3)}
            </Field>
            <label className="flex items-center gap-2 text-[13px] text-dim-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => set('ativo', e.target.checked)}
                style={{ accentColor: 'hsl(158 92% 70%)' }}
              />
              Ativo (aparece no seletor de autores dos posts)
            </label>

            {error && <p className="text-[13px]" style={{ color: 'hsl(0 80% 70%)' }}>{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-[13px] text-dim-2 hover:bg-white/[0.06]">
                Cancelar
              </button>
              <MintButton onClick={handleSubmit} disabled={isPending}>
                {isPending ? 'Salvando…' : 'Salvar'}
              </MintButton>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  )
}
