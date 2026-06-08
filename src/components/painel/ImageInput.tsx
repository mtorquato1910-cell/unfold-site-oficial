'use client'

import { useRef, useState, useTransition } from 'react'
import { Upload, X, Link as LinkIcon } from 'lucide-react'
import { uploadMedia, uploadMediaFromUrl } from '@/lib/actions/media-actions'

type ImageValue = { id?: string; url?: string } | null

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
    const fd = new FormData()
    fd.append('file', file)
    startTransition(async () => {
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
