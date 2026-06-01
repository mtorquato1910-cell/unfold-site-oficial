'use client'

import { Download } from 'lucide-react'
import { useGate } from './gate-context'
import { readSession } from '../_lib/session'
import { trackGuia } from '../_lib/analytics'

const PDF_PATH = '/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf'
const PDF_NAME = 'Guia-Eleicoes-2026-Unfold-FeatWork.pdf'

type Origem = 'header' | 'meio_pagina' | 'convite_final'

export function DownloadButton({
  origem,
  variant = 'solid',
  className = '',
}: {
  origem: Origem
  variant?: 'solid' | 'outline'
  className?: string
}) {
  const { unlocked, openModal, highlightCtas } = useGate()

  function handleClick() {
    if (!unlocked) {
      openModal('Cadastre-se para baixar o estudo completo em PDF') // RF-27
      return
    }
    trackGuia('pdf_baixado', {
      lead_email_hash: readSession()?.lead_email_hash,
      origem_botao: origem,
    }) // RF-29
    const a = document.createElement('a')
    a.href = PDF_PATH
    a.download = PDF_NAME
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none'
  const styles =
    variant === 'solid'
      ? { background: '#6DF9C6', color: '#001E29' }
      : { background: 'transparent', color: '#E7E7E7', border: '1px solid rgba(231,231,231,0.3)' }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${base} ${highlightCtas ? 'guia-cta-highlight' : ''} ${className}`}
      style={{ ...styles, fontFamily: 'var(--font-guia-display)' }}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Baixar PDF
    </button>
  )
}
