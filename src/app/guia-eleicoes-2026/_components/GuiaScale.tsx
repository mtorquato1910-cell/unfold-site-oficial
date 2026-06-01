'use client'

import { useEffect } from 'react'

/** Largura de uma página A4 em px (210mm × 96dpi / 25.4). */
const PAGE_WIDTH_PX = (210 * 96) / 25.4 // ≈ 793.7

/**
 * Ajusta a escala responsiva do guia (RF-03) setando a CSS var `--guia-scale`
 * no container `.guia-doc`. Mantido separado do conteúdo para que o HTML das
 * 37 páginas seja renderizado no servidor (SSR) e não infle o bundle do cliente.
 */
export function GuiaScale() {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.guia-doc')
    if (!el) return

    const applyScale = () => {
      const vw = document.documentElement.clientWidth // exclui a scrollbar
      const gutter = vw >= 1024 ? 64 : vw >= 768 ? 32 : 16
      const available = vw - gutter
      const scale = Math.min(1, available / PAGE_WIDTH_PX)
      el.style.setProperty('--guia-scale', scale.toFixed(4))
      // Centraliza a página escalada (origin top-left). Em desktop (scale=1 e
      // página cabe), deixa `auto` para o fluxo natural centralizar.
      if (scale < 1) {
        const offset = Math.max(0, (vw - PAGE_WIDTH_PX * scale) / 2)
        el.style.setProperty('--guia-offset-x', `${offset.toFixed(2)}px`)
      } else {
        el.style.setProperty('--guia-offset-x', 'auto')
      }
    }

    applyScale()
    window.addEventListener('resize', applyScale, { passive: true })
    return () => window.removeEventListener('resize', applyScale)
  }, [])

  return null
}
