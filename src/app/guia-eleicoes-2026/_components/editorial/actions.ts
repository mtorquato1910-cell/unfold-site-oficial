'use client'

import { useGate } from '../gate-context'
import { readSession } from '../../_lib/session'
import { trackGuia } from '../../_lib/analytics'
import { buildWhatsappUrl } from '../../_lib/share'

const PDF_ENDPOINT = '/api/guia-eleicoes/pdf'
const PDF_NAME = 'Guia-Eleicoes-2026-Unfold-FeatWork.pdf'

type Origem = 'header' | 'hero' | 'meio_pagina' | 'convite_final' | 'auto_unlock'

/**
 * Baixa o PDF pelo endpoint protegido (exige o cookie de desbloqueio emitido no
 * cadastro). Retorna false se o servidor recusar (401) — aí o caller reabre o gate.
 * O arquivo não vive mais numa URL pública: o download passa por /api/guia-eleicoes/pdf.
 */
export async function fetchAndSaveGuiaPdf(origem: Origem): Promise<boolean> {
  try {
    const res = await fetch(PDF_ENDPOINT, { cache: 'no-store' })
    if (!res.ok) return false
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = PDF_NAME
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    trackGuia('pdf_baixado', { lead_email_hash: readSession()?.lead_email_hash, origem_botao: origem })
    return true
  } catch {
    return false
  }
}

/**
 * Reconecta os CTAs do design editorial ao gate de leads (RD Station). Sem sessão,
 * abre o modal; com sessão, baixa o PDF protegido. Se o cookie expirou (401), reabre
 * o cadastro para o usuário se identificar de novo.
 */
export function useDownloadGuia(origem: Origem) {
  const { unlocked, openModal } = useGate()
  return async function download() {
    if (!unlocked) {
      openModal('Cadastre-se para baixar o estudo completo em PDF')
      return
    }
    const ok = await fetchAndSaveGuiaPdf(origem)
    if (!ok) openModal('Para baixar o PDF, confirme seus dados novamente.')
  }
}

/**
 * Compartilhamento do guia. Usa a Web Share API quando disponível (mobile),
 * com fallback para WhatsApp — ambos carregando os UTMs de viralização (RF-31..33).
 */
export function useShareGuia() {
  const { emailHash } = useGate()
  return async function share() {
    const url = buildWhatsappUrl(emailHash)
    trackGuia('guia_compartilhado', { canal: 'share', lead_email_hash: emailHash })
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Guia de Anúncios Digitais para as Eleições de 2026',
          text: 'Estudo Unfold × Feat.Work sobre a operação política online em 2026.',
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        })
        return
      } catch {
        /* usuário cancelou o share nativo — não faz fallback */
        return
      }
    }
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
  }
}
