'use client'

import { Download } from 'lucide-react'

const PDF_PATH = '/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf'
const PDF_NAME = 'Guia-Eleicoes-2026-Unfold-FeatWork.pdf'

/**
 * CTA de download do PDF (asset existente), tema dark premium.
 * Microcopy Fase 4: "Baixar guia em PDF". A integração com o tracking/gate real
 * (trackGuia / useGate) acontece na fase de troca de produção — aqui o botão já
 * aponta para o PDF existente.
 */
export function DownloadButtonDark({ className = '' }: { className?: string }) {
  function handleClick() {
    const a = document.createElement('a')
    a.href = PDF_PATH
    a.download = PDF_NAME
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <button type="button" onClick={handleClick} className={`r-download ${className}`}>
      <Download className="h-[18px] w-[18px]" aria-hidden="true" />
      Baixar guia em PDF
    </button>
  )
}
