'use client'

/**
 * Quando a página é aberta com `?heatmap=1` (dentro do iframe do painel de mapa
 * de calor), entra em "modo prévia": adiciona a classe `heatmap-preview` no
 * <html> (o CSS global desliga animações/transições e oculta o banner de
 * cookies), força imagens lazy a carregarem e pausa vídeos com autoplay — para
 * o overlay refletir um layout estável e completo.
 *
 * Não coleta nada; é puramente visual. Fora do modo prévia, é no-op.
 */

import { useEffect } from 'react'

export default function HeatmapPreviewGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('heatmap') !== '1') return

    document.documentElement.classList.add('heatmap-preview')

    // Força imagens lazy a renderizarem (o iframe não rola).
    document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
      img.loading = 'eager'
    })

    // Pausa vídeos / desliga autoplay.
    document.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
      try {
        v.autoplay = false
        v.pause()
      } catch {
        /* ignore */
      }
    })

    return () => {
      document.documentElement.classList.remove('heatmap-preview')
    }
  }, [])

  return null
}
