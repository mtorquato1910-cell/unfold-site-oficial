'use client'

import { MessageCircle, Mail } from 'lucide-react'
import { useGate } from './gate-context'
import { buildWhatsappUrl, buildMailtoUrl } from '../_lib/share'
import { trackGuia } from '../_lib/analytics'

export function ShareButtons({ className = '' }: { className?: string }) {
  const { emailHash, highlightCtas } = useGate()

  function share(canal: 'whatsapp' | 'email') {
    const url = canal === 'whatsapp' ? buildWhatsappUrl(emailHash) : buildMailtoUrl(emailHash)
    trackGuia('link_compartilhado', { canal, lead_email_hash: emailHash }) // RF-34
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none'
  const outline = {
    background: 'transparent',
    color: '#E7E7E7',
    border: '1px solid rgba(231,231,231,0.3)',
    fontFamily: 'var(--font-guia-display)',
  }
  const hl = highlightCtas ? 'guia-cta-highlight' : ''

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button type="button" onClick={() => share('whatsapp')} className={`${base} ${hl}`} style={outline}>
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Compartilhar via WhatsApp
      </button>
      <button type="button" onClick={() => share('email')} className={`${base} ${hl}`} style={outline}>
        <Mail className="h-4 w-4" aria-hidden="true" />
        Compartilhar por e-mail
      </button>
    </div>
  )
}
