'use client'

import { Calendar, Clock, Mail } from 'lucide-react'

import { trackEvent } from '@/lib/analytics/diagnostico-events'
import { CTA_POR_FAIXA, LABEL_FAIXA_FIT } from '@/lib/scoring/textos'
import type { FaixaFit } from '@/lib/scoring/types'

interface Props {
  faixa: FaixaFit
  calendlyUrl?: string
  /** Fallback usado quando `calendlyUrl` está ausente — vira um botão mailto. */
  contactEmail?: string
}

const DESTAQUE_POR_FAIXA: Record<FaixaFit, string> = {
  'fit-alto': 'ring-2 ring-primary/40 shadow-[0_8px_32px_hsl(var(--primary)/0.25)]',
  'fit-medio': 'ring-1 ring-border',
  'fit-baixo': 'ring-1 ring-border opacity-95',
  desfit: 'ring-1 ring-border opacity-90',
}

export default function CTAAgendamento({ faixa, calendlyUrl, contactEmail }: Props) {
  const cta = CTA_POR_FAIXA[faixa]
  const destaque = DESTAQUE_POR_FAIXA[faixa]

  const mailtoHref = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(
        'Quero conversar sobre meu diagnóstico de growth',
      )}&body=${encodeURIComponent(
        `Olá, acabei de concluir o diagnóstico de growth no site e gostaria de marcar uma conversa.\n\nFaixa de Fit: ${LABEL_FAIXA_FIT[faixa]}\n\nObrigado!`,
      )}`
    : undefined

  return (
    <section
      data-testid={`cta-${faixa}`}
      className={`relative rounded-2xl border border-border bg-card p-8 md:p-10 ${destaque}`}
    >
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary mb-4">
        {LABEL_FAIXA_FIT[faixa]}
      </p>
      <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight mb-3">
        {cta.headline}
      </h2>
      <p className="text-foreground/65 leading-relaxed mb-6 max-w-xl">
        {cta.microcopy}
      </p>

      <div className="flex items-center gap-3 text-sm text-foreground/50 mb-6">
        <Clock className="h-4 w-4" />
        <span>{cta.slot_minutos} minutos</span>
      </div>

      {calendlyUrl ? (
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent({ event_name: 'agendamento_iniciado', metadata: { faixa } })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
        >
          <Calendar className="h-4 w-4" />
          Agendar conversa
        </a>
      ) : mailtoHref ? (
        <a
          href={mailtoHref}
          onClick={() =>
            trackEvent({ event_name: 'agendamento_iniciado', metadata: { faixa, fallback: 'mailto' } })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
        >
          <Mail className="h-4 w-4" />
          Falar com a Unfold
        </a>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-background/40 p-6 text-center">
          <Calendar className="h-5 w-5 text-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-foreground/55">
            Calendário em configuração.
            <br className="hidden sm:block" />
            Use o link enviado no e-mail ou aguarde nosso contato em até 24h.
          </p>
        </div>
      )}
    </section>
  )
}
