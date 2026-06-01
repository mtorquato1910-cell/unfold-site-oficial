'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGate } from './gate-context'
import { DownloadButton } from './DownloadButton'
import { ShareButtons } from './ShareButtons'

/** CTAs contextuais no meio da leitura (RF-26): após a Parte 00 (pág. 7) e no convite final (pág. 36). */
const SLOTS = [
  { page: 7, origem: 'meio_pagina' as const, titulo: 'Continue com o estudo na mão' },
  { page: 36, origem: 'convite_final' as const, titulo: 'Leve o guia com você' },
]

interface Slot {
  el: HTMLElement
  origem: 'meio_pagina' | 'convite_final'
  titulo: string
}

export function InlineCtaSlots() {
  const { unlocked } = useGate()
  const [slots, setSlots] = useState<Slot[]>([])

  useEffect(() => {
    if (!unlocked) return
    const pages = document.querySelectorAll<HTMLElement>('.guia-doc .page')
    const created: Slot[] = []
    for (const s of SLOTS) {
      const page = pages[s.page - 1]
      if (!page) continue
      const el = document.createElement('div')
      el.className = 'guia-inline-cta'
      page.insertAdjacentElement('afterend', el)
      created.push({ el, origem: s.origem, titulo: s.titulo })
    }
    setSlots(created)
    return () => created.forEach((c) => c.el.remove())
  }, [unlocked])

  if (!unlocked) return null

  return (
    <>
      {slots.map((s, i) =>
        createPortal(
          <div
            className="mx-auto my-6 flex max-w-[600px] flex-col items-center gap-4 rounded-2xl px-6 py-8 text-center"
            style={{ background: '#001E29', color: '#E7E7E7' }}
          >
            <p className="text-lg font-semibold" style={{ fontFamily: 'var(--font-guia-display)' }}>
              {s.titulo}
            </p>
            <DownloadButton origem={s.origem} />
            <ShareButtons className="justify-center" />
          </div>,
          s.el,
          `inline-cta-${i}`,
        ),
      )}
    </>
  )
}
