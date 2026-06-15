'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

/**
 * Player do YouTube no padrão "facade" (capa + clique pra tocar):
 * mostra só a thumbnail até o usuário clicar — aí carrega o iframe e dá play.
 * Mais leve para a página (não baixa o player do YouTube no load) e melhor para SEO.
 */
export default function YouTubeEmbed({ id, title }: { id: string; title?: string }) {
  const [playing, setPlaying] = useState(false)
  // maxresdefault nem sempre existe; hqdefault está sempre disponível.
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-card my-8 not-prose">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title || 'Vídeo do YouTube'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`Reproduzir vídeo${title ? `: ${title}` : ''}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt={title || 'Capa do vídeo'}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            loading="lazy"
          />
          <span className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 shadow-lg transition group-hover:scale-110">
            <Play className="h-7 w-7 translate-x-0.5 fill-white text-white" />
          </span>
        </button>
      )}
    </div>
  )
}
