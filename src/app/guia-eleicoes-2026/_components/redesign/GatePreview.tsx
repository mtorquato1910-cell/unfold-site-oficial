'use client'

import { useState, type ReactNode } from 'react'
import { Check, Lock } from 'lucide-react'
import { DownloadButtonDark } from './DownloadButtonDark'

/**
 * Demonstração visual do gate dark restilizado (S3.2 + microcopy Fase 4).
 *
 * Mostra: conteúdo embaçado atrás + scrim em gradiente + card glass elevado com
 * o form RESTILIZADO e a microcopy nova. Ao "Liberar o guia", desembaça, revela
 * e exibe o DownloadButton.
 *
 * IMPORTANTE: aqui o submit é apenas demonstrativo (preventDefault → unlock).
 * Na troca de produção, este card recebe o LeadForm real (validação MX+Evolution)
 * e a lógica do GateProvider — sem alterar o fluxo de captura de lead.
 */
export function GatePreview({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)

  return (
    <div className="r-gate-root">
      <div className={`r-gate-content${unlocked ? ' is-unlocked' : ''}`} aria-hidden={!unlocked}>
        {children}
      </div>

      {unlocked ? (
        <div className="r-gate-success">
          <p className="r-gate-success-msg">
            <Check className="h-4 w-4" aria-hidden="true" />
            Pronto — conteúdo liberado. Seu PDF está logo abaixo.
          </p>
          <DownloadButtonDark />
        </div>
      ) : (
        <>
          <div className="r-gate-scrim" aria-hidden="true" />
          <div className="r-gate-overlay">
            <div className="r-gate-card" role="dialog" aria-label="Liberar o guia completo">
              <span className="r-gate-chip">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Conteúdo exclusivo
              </span>
              <h2 className="r-gate-title">Libere o guia completo</h2>
              <p className="r-gate-sub">
                Regras do TSE, plataformas, IA/deepfake, LGPD e checklists. Acesso imediato + PDF
                para baixar.
              </p>

              <form
                className="r-gate-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  setUnlocked(true)
                }}
              >
                <input className="r-field" type="text" placeholder="Seu nome completo" aria-label="Nome" />
                <input className="r-field" type="email" placeholder="voce@exemplo.com" aria-label="E-mail" />
                <input className="r-field" type="tel" placeholder="(00) 00000-0000" aria-label="WhatsApp" />
                <button type="submit" className="r-gate-submit">
                  Liberar o guia
                </button>
              </form>

              <p className="r-gate-legal">
                Seus dados são tratados conforme a LGPD. Não enviamos spam.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
