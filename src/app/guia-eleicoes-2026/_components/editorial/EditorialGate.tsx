'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Toaster, toast } from 'sonner'
import { Check, Lock } from 'lucide-react'
import { readSession, persistUnlock } from '../../_lib/session'
import { captureOrigin } from '../../_lib/origin'
import { trackGuia } from '../../_lib/analytics'
import { GateContext, type UnlockData } from '../gate-context'
import { LeadModal } from '../LeadModal'
import { fetchAndSaveGuiaPdf } from './actions'

const DEFAULT_MSG =
  'Preencha seus dados para desbloquear o estudo completo, baixar o PDF e compartilhar com sua equipe.'
const OPEN_MS = 600 // abre o modal logo após carregar (conteúdo já nasce bloqueado)
const REOPEN_MS = 20000 // se fechar sem cadastrar, reabre uma vez
const HIGHLIGHT_MS = 4000 // RF-42

/**
 * Gate do redesign editorial. O conteúdo (children) nasce BLOQUEADO: borrado, sem
 * interação e sem scroll, com o modal de cadastro por cima. Ao concluir o cadastro
 * (LeadForm → RD Station), libera o conteúdo, baixa o PDF automaticamente e grava a
 * sessão em localStorage — em visitas futuras entra direto, sem pedir de novo.
 *
 * Reaproveita LeadModal/LeadForm (validação MX + WhatsApp + Turnstile), sessão e
 * analytics. Diferente do GateProvider antigo, não renderiza header/footer próprios.
 */
export function EditorialGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
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
    const t = setTimeout(() => setModalOpen(true), OPEN_MS)
    return () => clearTimeout(t)
  }, [])

  // Bloqueia o scroll da página enquanto o conteúdo está bloqueado.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const prev = document.body.style.overflow
    document.body.style.overflow = unlocked ? prev || '' : 'hidden'
    return () => {
      document.body.style.overflow = prev || ''
    }
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

    // Download automático do PDF (endpoint protegido; o cookie acabou de ser emitido).
    void fetchAndSaveGuiaPdf('auto_unlock')

    toast.success('Pronto! O estudo está liberado e o PDF está baixando.', {
      description: 'Você também pode compartilhar com sua equipe.',
      icon: <Check className="h-4 w-4" />,
      duration: 6000,
    })
    setHighlightCtas(true)
    window.setTimeout(() => setHighlightCtas(false), HIGHLIGHT_MS)
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setModalOpen(open)
    if (open || unlockedRef.current) return
    // Fechou sem cadastrar: conteúdo segue bloqueado, mostra o botão fixo e reabre uma vez.
    setDismissed(true)
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('gate_reaberto')) {
      sessionStorage.setItem('gate_reaberto', '1')
      window.setTimeout(() => {
        if (!unlockedRef.current) setModalOpen(true)
      }, REOPEN_MS)
    }
  }, [])

  return (
    <GateContext.Provider value={{ unlocked, emailHash, highlightCtas, openModal, unlock }}>
      {!unlocked && (
        <div role="status" className="sr-only">
          Conteúdo bloqueado. Cadastre-se para liberar o estudo completo e baixar o PDF.
        </div>
      )}

      <div className="guia-editorial-gate" data-locked={!unlocked} aria-hidden={!unlocked || undefined}>
        {children}
      </div>

      <LeadModal open={modalOpen} onOpenChange={handleOpenChange} message={message} onUnlock={unlock} />

      {/* Botão fixo para reabrir o cadastro caso o usuário feche o modal. */}
      {!unlocked && dismissed && !modalOpen && (
        <button
          type="button"
          onClick={() => openModal()}
          className="fixed bottom-5 left-1/2 z-[55] -translate-x-1/2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold font-display shadow-lg"
          style={{ background: 'var(--mint)', color: 'var(--on-accent)', boxShadow: 'var(--glow-mint)' }}
        >
          <Lock className="h-4 w-4" /> Liberar o estudo completo
        </button>
      )}

      <Toaster position="top-right" theme="dark" offset={72} />
    </GateContext.Provider>
  )
}
