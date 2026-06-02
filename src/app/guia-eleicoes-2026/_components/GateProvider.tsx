'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { Check } from 'lucide-react'
import { readSession, persistUnlock } from '../_lib/session'
import { captureOrigin } from '../_lib/origin'
import { trackGuia } from '../_lib/analytics'
import { GateContext, type UnlockData } from './gate-context'
import { LeadModal } from './LeadModal'
import { StickyUnlockButton } from './StickyUnlockButton'
import { GuiaHeader } from './GuiaHeader'
import { InlineCtaSlots } from './InlineCtaSlots'
import { GuiaFooter } from './GuiaFooter'

const DEFAULT_MSG =
  'Preencha seus dados para desbloquear o estudo completo, baixar o PDF e compartilhar com sua equipe.'
const AUTO_OPEN_MS = 3000 // RF-10
const REOPEN_MS = 30000 // RF-13
const REOPEN_FLAG = 'modal_reaberto_30s'
const HIGHLIGHT_MS = 4000 // RF-42

export function GateProvider() {
  const [unlocked, setUnlocked] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [message, setMessage] = useState(DEFAULT_MSG)
  const [emailHash, setEmailHash] = useState<string | undefined>()
  const [highlightCtas, setHighlightCtas] = useState(false)
  const unlockedRef = useRef(false)

  // Mount: captura origem (RF-39), tracking de carregamento e checagem de sessão (RF-36).
  useEffect(() => {
    captureOrigin()
    trackGuia('pagina_carregada')
    const session = readSession()
    if (session) {
      unlockedRef.current = true
      setUnlocked(true)
      setEmailHash(session.lead_email_hash)
      trackGuia('visita_retorno')
      return
    }
    const t = setTimeout(() => setModalOpen(true), AUTO_OPEN_MS)
    return () => clearTimeout(t)
  }, [])

  // Aplica/remove blur + aria-hidden no container do conteúdo (RF-06..09, RNF-08).
  useEffect(() => {
    const el = document.querySelector('.guia-redesign')
    if (!el) return
    el.classList.toggle('guia-locked', !unlocked)
    if (unlocked) el.removeAttribute('aria-hidden')
    else el.setAttribute('aria-hidden', 'true')
  }, [unlocked])

  const openModal = useCallback((msg?: string) => {
    if (unlockedRef.current) return
    setMessage(msg || DEFAULT_MSG)
    setModalOpen(true)
  }, [])

  const unlock = useCallback((data: UnlockData) => {
    persistUnlock({
      cadastro_timestamp: new Date().toISOString(),
      lead_perfil: data.perfil,
      lead_email_hash: data.emailHash,
      lead_id: data.leadId,
    })
    unlockedRef.current = true
    setUnlocked(true)
    setEmailHash(data.emailHash)
    setModalOpen(false)
    setDismissed(false)
    trackGuia('lead_capturado', { perfil: data.perfil }) // RF-20

    // Download automático do PDF assim que o cadastro é concluído.
    try {
      const a = document.createElement('a')
      a.href = '/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf'
      a.download = 'Guia-Eleicoes-2026-Unfold-FeatWork.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      trackGuia('pdf_baixado', { lead_email_hash: data.emailHash, origem_botao: 'auto_unlock' })
    } catch {
      /* download best-effort — não bloqueia a liberação */
    }

    // Toast de sucesso (RF-41) + destaque dos CTAs (RF-42).
    toast.success('Pronto! Boa leitura.', {
      description: 'Você também pode baixar o PDF e compartilhar com sua equipe.',
      icon: <Check className="h-4 w-4" />,
      duration: 6000,
    })
    setHighlightCtas(true)
    window.setTimeout(() => setHighlightCtas(false), HIGHLIGHT_MS)
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setModalOpen(open)
    if (open || unlockedRef.current) return
    setDismissed(true) // RF-13: mostra CTA fixo
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(REOPEN_FLAG)) {
      sessionStorage.setItem(REOPEN_FLAG, '1')
      window.setTimeout(() => {
        if (!unlockedRef.current) setModalOpen(true)
      }, REOPEN_MS)
    }
  }, [])

  return (
    <GateContext.Provider value={{ unlocked, emailHash, highlightCtas, openModal, unlock }}>
      {!unlocked && (
        <div role="status" className="sr-only">
          Conteúdo bloqueado. Cadastre-se para liberar o estudo completo.
        </div>
      )}

      <GuiaHeader />

      <LeadModal open={modalOpen} onOpenChange={handleOpenChange} message={message} onUnlock={unlock} />

      {!unlocked && dismissed && !modalOpen && <StickyUnlockButton onClick={() => openModal()} />}

      {unlocked && <InlineCtaSlots />}
      {unlocked && <GuiaFooter />}

      <Toaster position="top-right" theme="dark" offset={72} />
    </GateContext.Provider>
  )
}
