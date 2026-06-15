'use client'

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Send, AlertCircle, ImagePlus, X } from 'lucide-react'
import { submitGuestPost, type GuestPostInput } from '@/lib/actions/blog-submit-actions'
import RichTextEditor from '@/components/painel/RichTextEditor'

const plainLen = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length

const PILLARS = [
  { value: 'geral', label: 'Geral' },
  { value: 'diagnosticar', label: 'Diagnosticar' },
  { value: 'estruturar', label: 'Estruturar' },
  { value: 'operar', label: 'Operar' },
  { value: 'evoluir', label: 'Evoluir' },
]

const EMPTY: GuestPostInput = {
  authorName: '',
  authorEmail: '',
  authorCompany: '',
  title: '',
  summary: '',
  content: '',
  pillar: 'geral',
  consent: false,
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png']

export default function ContribuirClient() {
  const [form, setForm] = useState<GuestPostInput>(EMPTY)
  const [contentHtml, setContentHtml] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function update<K extends keyof GuestPostInput>(key: K, value: GuestPostInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_IMAGE_MIMES.includes(file.type)) {
      setError('Apenas imagens JPG ou PNG são aceitas.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Imagem maior que 5MB. Reduza o tamanho antes de enviar.')
      e.target.value = ''
      return
    }

    setCoverImage(file)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverPreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setCoverImage(null)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (plainLen(contentHtml) < 200) {
      setError('Conteúdo precisa ter pelo menos 200 caracteres.')
      return
    }
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.append('authorName', form.authorName)
        fd.append('authorEmail', form.authorEmail)
        fd.append('authorCompany', form.authorCompany || '')
        fd.append('title', form.title)
        fd.append('summary', form.summary)
        fd.append('contentHtml', contentHtml)
        fd.append('pillar', form.pillar || 'geral')
        fd.append('consent', form.consent ? 'true' : 'false')
        if (coverImage) fd.append('coverImage', coverImage)

        await submitGuestPost(fd)
        setSuccess(true)
      } catch (err: any) {
        setError(err?.message || 'Falha ao enviar. Tente novamente.')
      }
    })
  }

  if (success) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-24">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="font-display text-3xl font-semibold mb-3">Submissão recebida!</h1>
          <p className="text-foreground/70 leading-relaxed mb-6">
            Obrigado pela contribuição. A liderança editorial da Unfold vai revisar seu post nos próximos dias e
            você receberá um email com o resultado.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-background font-medium hover:opacity-90"
          >
            Voltar para o blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-16 lg:py-24">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary mb-3">
          Blog · Contribuir
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-semibold leading-tight mb-4">
          Tem algo a compartilhar sobre <span className="text-primary">crescimento B2B</span>?
        </h1>
        <p className="text-foreground/70 text-lg leading-relaxed">
          Submeta seu artigo para revisão editorial da liderança Unfold. Conteúdos aceitos focam em vendas
          complexas, growth técnico, CRM e o método UGS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Autor */}
        <fieldset className="space-y-4 p-6 rounded-xl border border-border/50 bg-surface/30">
          <legend className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/60 px-2">
            Sobre você
          </legend>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome completo *</label>
              <input
                type="text"
                required
                value={form.authorName}
                onChange={(e) => update('authorName', e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input
                type="email"
                required
                value={form.authorEmail}
                onChange={(e) => update('authorEmail', e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Empresa (opcional)</label>
            <input
              type="text"
              value={form.authorCompany}
              onChange={(e) => update('authorCompany', e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </fieldset>

        {/* Conteúdo */}
        <fieldset className="space-y-4 p-6 rounded-xl border border-border/50 bg-surface/30">
          <legend className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/60 px-2">
            Sobre o post
          </legend>

          <div>
            <label className="block text-sm font-medium mb-1.5">Título *</label>
            <input
              type="text"
              required
              minLength={10}
              maxLength={120}
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Ex: Como estruturar um funil de vendas B2B previsível"
              className="w-full h-11 px-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-foreground/50">{form.title.length} / 120 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Resumo (1-2 linhas) *</label>
            <textarea
              required
              minLength={20}
              maxLength={200}
              rows={2}
              value={form.summary}
              onChange={(e) => update('summary', e.target.value)}
              placeholder="Frase curta que aparece nos cards do blog"
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <p className="mt-1 text-xs text-foreground/50">{form.summary.length} / 200 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Pilar UGS</label>
            <select
              value={form.pillar}
              onChange={(e) => update('pillar', e.target.value as any)}
              className="w-full h-11 px-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
            >
              {PILLARS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Imagem de capa — opcional */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Imagem de capa (opcional)
            </label>
            {coverPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <div className="relative w-full aspect-[16/9] bg-background">
                  <Image
                    src={coverPreview}
                    alt="Pré-visualização da capa"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 700px"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs bg-background/90 hover:bg-background border border-border"
                >
                  <X className="h-3.5 w-3.5" /> Remover
                </button>
                <p className="px-3 py-2 text-xs text-foreground/60 bg-surface/50 truncate">
                  {coverImage?.name} · {((coverImage?.size || 0) / 1024).toFixed(0)} KB
                </p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full py-8 px-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-background/50 cursor-pointer transition-colors">
                <ImagePlus className="h-6 w-6 text-foreground/50" />
                <span className="text-sm text-foreground/70">Clique para anexar uma imagem</span>
                <span className="text-xs text-foreground/45">JPG ou PNG · até 5MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Conteúdo do post *</label>
            <RichTextEditor
              value={contentHtml}
              onChange={setContentHtml}
              placeholder="Escreva o conteúdo completo. Use a barra para títulos, negrito, listas, links, imagens com legenda, tabelas e vídeos do YouTube. Mínimo 200 caracteres."
            />
            <p className="mt-1 text-xs text-foreground/50">
              {plainLen(contentHtml)} caracteres (mínimo 200)
            </p>
          </div>
        </fieldset>

        {/* Consentimento */}
        <label className="flex items-start gap-3 cursor-pointer text-sm">
          <input
            type="checkbox"
            required
            checked={form.consent}
            onChange={(e) => update('consent', e.target.checked)}
            className="mt-1"
            style={{ accentColor: 'hsl(158 92% 70%)' }}
          />
          <span className="text-foreground/70 leading-relaxed">
            Concordo que o conteúdo é de minha autoria e cedo direitos de publicação à Unfold Growth caso
            seja aprovado. Concordo com a{' '}
            <Link href="/politica-de-privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm flex items-start gap-2 bg-destructive/10 border border-destructive/30 text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !form.consent}
          className="w-full h-12 rounded-lg bg-primary text-background font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Send className="h-4 w-4" />
          {isPending ? 'Enviando...' : 'Enviar para revisão'}
        </button>

        <p className="text-xs text-foreground/50 text-center">
          Conteúdos aceitos: vendas complexas B2B, CRM, growth técnico, método UGS · Tempo médio de revisão: até 5 dias úteis · Limite: 3 submissões por hora
        </p>
      </form>
    </div>
  )
}
