'use client'

import { Download, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics/diagnostico-events'

interface Props {
  hash: string
}

export default function FooterButtonsV2({ hash }: Props) {
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || ''
  const mailto = `mailto:?subject=Meu%20diagn%C3%B3stico%20de%20growth&body=${encodeURIComponent(`Veja meu diagnóstico: ${baseUrl}/diagnostico/r/${hash}`)}`

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button variant="outline" className="gap-2" asChild>
        <a
          href={`/api/diagnostico/pdf/${hash}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent({ event_name: 'pdf_baixado', result_hash: hash })}
        >
          <Download className="h-4 w-4" /> Baixar diagnóstico em PDF
        </a>
      </Button>
      <Button variant="ghost" className="gap-2" asChild>
        <a
          href={mailto}
          onClick={() => trackEvent({ event_name: 'resultado_compartilhado', result_hash: hash })}
        >
          <Mail className="h-4 w-4" /> Compartilhar por e-mail
        </a>
      </Button>
    </div>
  )
}
