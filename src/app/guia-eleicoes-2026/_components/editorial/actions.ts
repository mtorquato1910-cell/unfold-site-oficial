'use client'

import { useGate } from '../gate-context'
import { readSession } from '../../_lib/session'
import { trackGuia } from '../../_lib/analytics'
import { buildWhatsappUrl } from '../../_lib/share'

const PDF_PATH = '/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf'
const PDF_NAME = 'Guia-Eleicoes-2026-Unfold-FeatWork.pdf'

type Origem = 'header' | 'hero' | 'meio_pagina' | 'convite_final'

/**
 * Reconecta os CTAs do design editorial ao gate de leads existente (RD Station).
 * O conteúdo do estudo fica aberto (fiel ao esboço), mas baixar o PDF exige
 * cadastro: sem sessão, abre o modal; com sessão, dispara o download + tracking.
 */
export function useDownloadGuia(origem: Origem) {
  const { unlocked, openModal } = useGate()
  return function download() {
    if (!unlocked) {
      openModal('Cadastre-se para baixar o estudo completo em PDF')
      return
    }
    trackGuia('pdf_baixado', {
      lead_email_hash: readSession()?.lead_email_hash,
      origem_botao: origem,
    })
    const a = document.createElement('a')
    a.href = PDF_PATH
    a.download = PDF_NAME
    document.body.appendChild(a)
    a.click()
    a.remove()
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
