'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Toaster, toast } from 'sonner'
import { Check } from 'lucide-react'
import { readSession, persistUnlock } from '../../_lib/session'
import { captureOrigin } from '../../_lib/origin'
import { trackGuia } from '../../_lib/analytics'
import { GateContext, type UnlockData } from '../gate-context'
import { LeadModal } from '../LeadModal'

const DEFAULT_MSG =
  'Preencha seus dados para baixar o estudo completo em PDF e compartilhar com sua equipe.'
const AUTO_OPEN_MS = 4000 // RF-10 — convite de cadastro após alguns segundos de leitura
const REOPEN_MS = 45000 // RF-13 — segunda chance, uma vez por sessão
const REOPEN_FLAG = 'modal_reaberto_editorial'
const HIGHLIGHT_MS = 4000 // RF-42
const PDF_PATH = '/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf'
const PDF_NAME = 'Guia-Eleicoes-2026-Unfold-FeatWork.pdf'

/**
 * Provider "headless" do gate para o redesign editorial.
 *
 * Reaproveita toda a infra existente (gate-context, LeadModal/LeadForm com
 * validação MX + WhatsApp + Turnstile + RD Station, sessão e analytics), mas
 * NÃO renderiza header/footer próprios — esses vêm do Chrome do esboço. Diferente
 * do GateProvider antigo, o conteúdo do estudo NÃO é bloqueado (sem blur): a
 * captura acontece nos CTAs de download e no convite de cadastro auto-aberto.
 */
export function EditorialGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [message, setMessage] = useState(DEFAULT_MSG)
  const [emailHash, setEmailHash] = useState<string | undefined>()
  const [highlightCtas, setHighlightCtas] = useState(false)
  const unlockedRef = useRef(false)

  // Mount: origem (RF-39), tracking e checagem de sessão (RF-36).
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
    trackGuia('lead_capturado', { perfil: data.perfil }) // RF-20

    // Download automático do PDF assim que o cadastro conclui.
    try {
      const a = document.createElement('a')
      a.href = PDF_PATH
      a.download = PDF_NAME
      document.body.appendChild(a)
      a.click()
      a.remove()
      trackGuia('pdf_baixado', { lead_email_hash: data.emailHash, origem_botao: 'auto_unlock' })
    } catch {
      /* download best-effort — não bloqueia a liberação */
    }

    toast.success('Pronto! O PDF está baixando.', {
      description: 'Você também pode compartilhar o estudo com sua equipe.',
      icon: <Check className="h-4 w-4" />,
      duration: 6000,
    })
    setHighlightCtas(true)
    window.setTimeout(() => setHighlightCtas(false), HIGHLIGHT_MS)
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setModalOpen(open)
    if (open || unlockedRef.current) return
    // RF-13 — segunda chance, uma vez por sessão.
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(REOPEN_FLAG)) {
      sessionStorage.setItem(REOPEN_FLAG, '1')
      window.setTimeout(() => {
        if (!unlockedRef.current) setModalOpen(true)
      }, REOPEN_MS)
    }
  }, [])

  return (
    <GateContext.Provider value={{ unlocked, emailHash, highlightCtas, openModal, unlock }}>
      {children}
      <LeadModal open={modalOpen} onOpenChange={handleOpenChange} message={message} onUnlock={unlock} />
      <Toaster position="top-right" theme="light" offset={72} />
    </GateContext.Provider>
  )
}
