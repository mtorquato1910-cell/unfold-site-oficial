'use client'

/**
 * Botões "Baixar PDF" e "Compartilhar por e-mail" (Sprint 5 / S5.6).
 *
 * Aparece logo após o resultado (acima da CTA do Diagnóstico) e na página
 * de resultado salvo `/r/[token]`.
 */

import { useState } from 'react'
import { Download, Mail, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackCalcEvent } from '@/lib/analytics/calculadora-events'

interface Props {
  token: string
  /** Função que persiste o estado atual antes de gerar PDF — opcional. */
  persistirAntes?: () => Promise<unknown>
}

export default function BlocoAcoesResultado({ token, persistirAntes }: Props) {
  const [shareOpen, setShareOpen] = useState(false)
  const [emailDest, setEmailDest] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [baixandoPdf, setBaixandoPdf] = useState(false)

  async function onBaixarPDF() {
    setBaixandoPdf(true)
    try {
      if (persistirAntes) await persistirAntes()
      trackCalcEvent({ event_name: 'pdf_baixado', result_token: token })
      window.location.href = `/api/calculadora/pdf?token=${token}`
    } finally {
      // O download é assíncrono — desliga o loader após pequeno delay.
      setTimeout(() => setBaixandoPdf(false), 1500)
    }
  }

  async function onEnviarShare() {
    setMensagem(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDest)) {
      setMensagem({ tipo: 'erro', texto: 'E-mail inválido.' })
      return
    }
    setEnviando(true)
    try {
      if (persistirAntes) await persistirAntes()
      const res = await fetch('/api/calculadora/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, destinatario_email: emailDest }),
      })
      if (res.status === 429) {
        setMensagem({ tipo: 'erro', texto: 'Limite atingido. Tente novamente em 1 hora.' })
      } else if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setMensagem({
          tipo: 'erro',
          texto: j?.error === 'invalid_payload' ? 'E-mail inválido.' : 'Falha ao enviar.',
        })
      } else {
        setMensagem({ tipo: 'ok', texto: 'Enviado!' })
        setEmailDest('')
        setTimeout(() => {
          setShareOpen(false)
          setMensagem(null)
        }, 1500)
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Falha de rede.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onBaixarPDF}
          disabled={baixandoPdf}
          className="gap-2 text-[13px] h-9"
        >
          {baixandoPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Baixar resultado em PDF
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShareOpen(true)}
          className="gap-2 text-[13px] h-9"
        >
          <Mail className="h-4 w-4" /> Compartilhar por e-mail
        </Button>
      </div>

      {shareOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShareOpen(false)
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 id="share-titulo" className="font-display font-bold text-lg mb-1">
                  Compartilhar por e-mail
                </h3>
                <p className="text-xs text-foreground/55">
                  Enviaremos um link para o resultado salvo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                aria-label="Fechar"
                className="text-foreground/55 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <label htmlFor="share-email" className="text-sm font-medium block mb-1.5">
              E-mail destinatário
            </label>
            <input
              id="share-email"
              type="email"
              value={emailDest}
              onChange={(e) => setEmailDest(e.target.value)}
              placeholder="destinatario@empresa.com"
              className="input-field mb-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onEnviarShare()
              }}
            />
            {mensagem && (
              <p
                role="alert"
                className={`text-xs mb-3 ${
                  mensagem.tipo === 'ok' ? 'text-emerald-500' : 'text-destructive'
                }`}
              >
                {mensagem.texto}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShareOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={onEnviarShare} disabled={enviando} className="gap-2">
                {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
