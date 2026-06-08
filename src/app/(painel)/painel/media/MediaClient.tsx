'use client'

import { useState, useTransition } from 'react'
import { Copy, Trash2, ImageIcon, Check, ExternalLink } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/painel/ui'
import ImageInput from '@/components/painel/ImageInput'
import { deleteMedia } from '@/lib/actions/media-actions'

type MediaItem = Record<string, any>

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

function getMediaUrl(item: MediaItem): string {
  if (item.url) return item.url
  if (item.filename) return `${SERVER_URL}/api/media/file/${item.filename}`
  return ''
}

function MediaCard({ item, onDelete }: { item: MediaItem; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const url = getMediaUrl(item)
  const isImage = item.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(item.filename || '')

  function copyUrl() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDelete() {
    if (!window.confirm(`Deletar "${item.filename || item.id}"?`)) return
    startTransition(() => {
      onDelete(item.id)
    })
  }

  return (
    <div
      className="glass rounded-xl overflow-hidden group"
      style={{ border: '1px solid hsl(158 92% 70% / 0.08)' }}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-square bg-white/[0.03] flex items-center justify-center overflow-hidden"
        style={{ background: 'hsl(197 100% 8%)' }}
      >
        {isImage && url ? (
          <img
            src={url}
            alt={item.alt || item.filename || ''}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-8 w-8" style={{ color: 'hsl(0 0% 91% / 0.2)' }} />
            <span className="text-[10px] font-mono text-dim uppercase">
              {item.mimeType?.split('/')[1] || 'arquivo'}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'hsl(194 100% 4% / 0.7)', backdropFilter: 'blur(2px)' }}
        >
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition"
              style={{ background: 'hsl(0 0% 100% / 0.1)', color: 'hsl(0 0% 91%)' }}
              title="Abrir original"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Info + Actions */}
      <div className="p-3">
        <p className="text-[11px] font-mono text-dim truncate mb-2" title={item.filename}>
          {item.filename || item.id}
        </p>
        {item.width && item.height && (
          <p className="text-[10px] text-dim mb-2">
            {item.width}×{item.height}
          </p>
        )}
        <div className="flex items-center gap-1.5">
          <button
            onClick={copyUrl}
            className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md text-[11px] font-medium transition"
            style={{
              background: copied ? 'hsl(158 92% 70% / 0.15)' : 'hsl(0 0% 100% / 0.06)',
              color: copied ? 'hsl(158 92% 70%)' : 'hsl(0 0% 91% / 0.7)',
              border: `1px solid ${copied ? 'hsl(158 92% 70% / 0.25)' : 'transparent'}`,
            }}
            title="Copiar URL"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copiado!' : 'Copiar URL'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="h-7 w-7 flex items-center justify-center rounded-md transition hover:bg-red-500/10 disabled:opacity-50"
            style={{ color: 'hsl(0 0% 91% / 0.4)' }}
            title="Deletar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MediaClient({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [, startDelete] = useTransition()

  function handleDelete(id: string) {
    setDeleteError(null)
    startDelete(async () => {
      const res: any = await deleteMedia(id)
      if (!res?.ok) {
        setDeleteError(res?.error || 'Falha ao excluir')
        return
      }
      setMedia(prev => prev.filter(m => m.id !== id))
    })
  }

  return (
    <>
      <PageHeader
        title="Mídia"
        description="Imagens e arquivos do site"
      />

      {/* Upload */}
      <div className="mb-6 max-w-xl">
        <ImageInput
          label="Enviar nova imagem"
          value={null}
          onChange={(v) => {
            if (!v) return
            setMedia(prev => [{ id: v.id, url: v.url, filename: v.url.split('/').pop()?.split('?')[0] || v.id }, ...prev])
          }}
        />
      </div>

      {deleteError && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-[13px]"
          style={{ background: 'hsl(0 70% 60% / 0.10)', color: 'hsl(0 70% 80%)', border: '1px solid hsl(0 70% 60% / 0.25)' }}
        >
          {deleteError}
        </div>
      )}

      {media.length === 0 ? (
        <EmptyState
          title="Nenhum arquivo de mídia"
          description="Arraste uma imagem na área acima ou cole uma URL para enviar o primeiro arquivo."
          icon={ImageIcon}
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] text-dim font-mono">
              {media.length} arquivo{media.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map(item => (
              <MediaCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
