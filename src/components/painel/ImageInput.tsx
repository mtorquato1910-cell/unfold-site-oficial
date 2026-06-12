'use client'

import { useRef, useState, useTransition } from 'react'
import { Upload, X, Link as LinkIcon } from 'lucide-react'
import { uploadMedia, uploadMediaFromUrl } from '@/lib/actions/media-actions'

type ImageValue = { id?: string; url?: string } | null

// Vercel/Serverless rejeita requisições com body > ~4.5MB (HTTP 413) ANTES do
// handler rodar — e uploads do painel passam por Server Action (FormData). Por isso
// redimensionamos/comprimimos no browser antes de enviar: capas não precisam de mais
// que ~1920px, e o Payload gera os tamanhos (thumb/card/og) a partir do que receber.
const MAX_DIMENSION = 1920
// Alvo bem abaixo do teto da Vercel para folga com headers/multipart.
const TARGET_MAX_BYTES = 3_500_000

async function compressImage(file: File): Promise<File> {
  // GIF (animado) e SVG não podem passar por canvas sem perder dados — manda como está.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file // formato não decodificável no browser — deixa o servidor validar
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close?.()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  // WebP preserva transparência (importante p/ logos) e comprime bem.
  // Baixa a qualidade em passos até caber no alvo.
  const toBlob = (q: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', q))

  let blob: Blob | null = null
  for (const q of [0.85, 0.72, 0.6, 0.48]) {
    blob = await toBlob(q)
    if (blob && blob.size <= TARGET_MAX_BYTES) break
  }
  if (!blob) return file
  // Se mesmo assim ficou maior que o original, mantém o original (sem ganho).
  if (blob.size >= file.size) return file

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'imagem'
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
}

export default function ImageInput({
  value,
  onChange,
  label,
}: {
  value?: ImageValue
  onChange: (v: { id: string; url: string } | null) => void
  label?: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setError(null)
    startTransition(async () => {
      let toSend = file
      try {
        toSend = await compressImage(file)
      } catch {
        toSend = file // se a compressão falhar, tenta enviar o original
      }
      // Guarda final: se ainda passar do teto da Vercel, avisa em vez de estourar 413.
      if (toSend.size > TARGET_MAX_BYTES + 500_000) {
        setError('Imagem muito grande mesmo após compressão. Use um arquivo menor (< 4MB).')
        return
      }
      const fd = new FormData()
      fd.append('file', toSend)
      const res: any = await uploadMedia(fd)
      if (!res?.ok) {
        setError(res?.error || 'Falha no upload')
        return
      }
      onChange({ id: res.id, url: res.url })
    })
  }

  function handleUrl() {
    if (!urlInput.trim()) return
    setError(null)
    const url = urlInput.trim()
    startTransition(async () => {
      const res: any = await uploadMediaFromUrl(url)
      if (!res?.ok) {
        setError(res?.error || 'Falha ao importar imagem da URL')
        return
      }
      onChange({ id: res.id, url: res.url })
      setUrlInput('')
    })
  }

  const previewUrl = value?.url

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim-2 block">
          {label}
        </label>
      )}

      {previewUrl ? (
        <div
          className="relative rounded-lg overflow-hidden"
          style={{ border: '1px solid hsl(158 92% 70% / 0.12)', background: 'hsl(197 100% 10%)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="preview"
            className="w-full max-h-[220px] object-contain"
            style={{ background: 'hsl(197 100% 8%)' }}
          />
          <button
            type="button"
            onClick={() => {
              setError(null)
              onChange(null)
            }}
            className="absolute top-2 right-2 p-1.5 rounded-md transition"
            style={{ background: 'hsl(194 100% 4% / 0.7)', color: 'hsl(0 0% 91%)' }}
            title="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
          }}
          className="flex flex-col items-center justify-center gap-2 rounded-lg px-4 py-8 text-center cursor-pointer transition"
          style={{
            background: 'hsl(197 100% 10%)',
            border: `1px dashed ${dragOver ? 'hsl(158 92% 70% / 0.5)' : 'hsl(158 92% 70% / 0.12)'}`,
            color: 'hsl(0 0% 91% / 0.7)',
          }}
        >
          <Upload className="h-5 w-5" style={{ color: 'hsl(158 92% 70%)' }} />
          <span className="text-[12px]">
            {isPending
              ? 'Enviando...'
              : 'Arraste uma imagem ou clique para selecionar (PNG, JPG, WEBP)'}
          </span>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {/* URL alternativa */}
      <div className="flex items-center gap-2 pt-1">
        <input
          className="flex-1 h-9 px-3 rounded-lg text-[12px]"
          style={{
            background: 'hsl(197 100% 10%)',
            border: '1px solid hsl(158 92% 70% / 0.12)',
            color: 'hsl(0 0% 91%)',
            outline: 'none',
          }}
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleUrl()
            }
          }}
          placeholder="ou cole uma URL de imagem"
        />
        <button
          type="button"
          onClick={handleUrl}
          disabled={isPending || !urlInput.trim()}
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-[12px] font-medium transition disabled:opacity-50"
          style={{
            background: 'hsl(158 92% 70% / 0.12)',
            color: 'hsl(158 92% 70%)',
            border: '1px solid hsl(158 92% 70% / 0.25)',
          }}
        >
          <LinkIcon className="h-3.5 w-3.5" /> Usar URL
        </button>
      </div>

      {error && (
        <p className="text-[11px]" style={{ color: 'hsl(0 70% 80%)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
