'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { formatPhoneBR, extractDigits } from '@/lib/format/phone-mask'
import { useContatoCheck } from '@/lib/validation/use-contato-check'
import { trackGuia } from '../../_lib/analytics'
import { getStoredOrigin } from '../../_lib/origin'
import { consultoriaSchema, type ConsultoriaInput } from '../../_lib/validation'

const CONTATO_EMAIL = 'contato@unfoldgrowth.com.br'

/** Fallback de resiliência: abre o cliente de e-mail com os dados preenchidos. */
function mailtoFallback(v: ConsultoriaInput) {
  if (typeof window === 'undefined') return
  const subject = 'Solicitação de consultoria — Unfold × Feat.Work'
  const linhas = [
    `Nome: ${v.nome}`,
    `E-mail: ${v.email}`,
    `WhatsApp/Telefone: ${formatPhoneBR(v.telefone)}`,
    `Organização ou cargo: ${v.organizacao || '—'}`,
    '',
    'Mensagem:',
    v.mensagem || '—',
  ]
  window.location.href = `mailto:${CONTATO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(linhas.join('\n'))}`
}

/**
 * Form de captação de consultoria (Unfold × Feat.Work) — substitui o antigo quiz
 * de diagnóstico. Tema light editorial. Validação reforçada (e-mail MX + WhatsApp
 * via Evolution). Envia ao endpoint /api/guia-eleicoes/consultoria (RD Station);
 * se a rede falhar, cai no fallback por `mailto` para não perder o lead.
 */
export function ContatoForm() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { emailError, phoneError, checkingEmail, checkingPhone, checkEmail, checkPhone } =
    useContatoCheck()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<ConsultoriaInput>({
    resolver: zodResolver(consultoriaSchema),
    mode: 'onChange',
    defaultValues: { nome: '', email: '', telefone: '', organizacao: '', mensagem: '' },
  })

  const emailReg = register('email')

  async function onSubmit(values: ConsultoriaInput) {
    setSubmitting(true)
    try {
      // Revalida e-mail (MX) e WhatsApp (Evolution) no envio.
      const [emailOk, phoneOk] = await Promise.all([
        checkEmail(values.email),
        checkPhone(values.telefone, { requirePhone: true }),
      ])
      if (!emailOk || !phoneOk) return

      trackGuia('consultoria_solicitada', { origem: 'form_contato' })

      // Envia ao endpoint (persiste em Payload + sync RD Station).
      const origin = getStoredOrigin() || {}
      try {
        const res = await fetch('/api/guia-eleicoes/consultoria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: values.nome,
            email: values.email,
            telefone: extractDigits(values.telefone),
            organizacao: values.organizacao || undefined,
            mensagem: values.mensagem || undefined,
            origin: {
              utm_source: origin.utm_source,
              utm_medium: origin.utm_medium,
              utm_campaign: origin.utm_campaign,
              utm_content: origin.utm_content,
              utm_term: origin.utm_term,
              referrer: origin.referrer,
            },
          }),
        })
        if (!res.ok) mailtoFallback(values) // resiliência: não perde o lead
      } catch {
        mailtoFallback(values) // rede indisponível → fallback
      }
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const inputBase =
    'w-full rounded-xl px-4 py-3 text-[15px] outline-none transition-colors bg-[var(--paper)] focus:border-[var(--mint-deep)]'

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto rounded-3xl p-10 md:p-14 text-center"
        style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}
      >
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'var(--mint-wash)', color: 'var(--mint-deep)' }}
        >
          <Check className="h-7 w-7" />
        </div>
        <h4 className="font-serif mt-6" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', lineHeight: 1.15, color: 'var(--ink)' }}>
          Recebemos seu contato.
        </h4>
        <p className="mt-4 text-lg" style={{ color: 'var(--ink-body)' }}>
          Em breve a equipe Unfold × Feat.Work fala com você.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto rounded-3xl p-8 md:p-12" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5" style={{ color: 'var(--ink)' }}>
        {/* Nome */}
        <div>
          <label htmlFor="contato-nome" className="mb-1.5 block text-sm font-medium font-display">Nome*</label>
          <input
            id="contato-nome"
            type="text"
            autoComplete="name"
            placeholder="Seu nome completo"
            className={inputBase}
            style={{ border: `1px solid ${errors.nome ? 'var(--vedado)' : 'var(--ink-hair)'}` }}
            aria-invalid={!!errors.nome}
            {...register('nome')}
          />
          {errors.nome && <p className="mt-1 text-xs" style={{ color: 'var(--vedado)' }}>{errors.nome.message}</p>}
        </div>

        {/* E-mail */}
        <div>
          <label htmlFor="contato-email" className="mb-1.5 block text-sm font-medium font-display">E-mail*</label>
          <input
            id="contato-email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            className={inputBase}
            style={{ border: `1px solid ${errors.email || emailError ? 'var(--vedado)' : 'var(--ink-hair)'}` }}
            aria-invalid={!!errors.email || !!emailError}
            {...emailReg}
            onBlur={(e) => {
              emailReg.onBlur(e)
              void checkEmail(e.target.value)
            }}
          />
          {(errors.email || emailError) && <p className="mt-1 text-xs" style={{ color: 'var(--vedado)' }}>{errors.email?.message || emailError}</p>}
        </div>

        {/* WhatsApp / Telefone */}
        <div>
          <label htmlFor="contato-telefone" className="mb-1.5 block text-sm font-medium font-display">WhatsApp / Telefone*</label>
          <Controller
            control={control}
            name="telefone"
            render={({ field }) => (
              <input
                id="contato-telefone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                className={inputBase}
                style={{ border: `1px solid ${errors.telefone || phoneError ? 'var(--vedado)' : 'var(--ink-hair)'}` }}
                aria-invalid={!!errors.telefone || !!phoneError}
                value={formatPhoneBR(field.value || '')}
                onChange={(e) => field.onChange(extractDigits(e.target.value))}
                onBlur={(e) => {
                  field.onBlur()
                  void checkPhone(e.target.value, { requirePhone: true })
                }}
              />
            )}
          />
          {(errors.telefone || phoneError) && <p className="mt-1 text-xs" style={{ color: 'var(--vedado)' }}>{errors.telefone?.message || phoneError}</p>}
        </div>

        {/* Organização ou cargo (opcional) */}
        <div>
          <label htmlFor="contato-org" className="mb-1.5 block text-sm font-medium font-display">Organização ou cargo</label>
          <input
            id="contato-org"
            type="text"
            placeholder="Ex.: pré-candidatura, partido, agência…"
            className={inputBase}
            style={{ border: '1px solid var(--ink-hair)' }}
            {...register('organizacao')}
          />
        </div>

        {/* Mensagem (opcional) */}
        <div>
          <label htmlFor="contato-msg" className="mb-1.5 block text-sm font-medium font-display">Mensagem</label>
          <textarea
            id="contato-msg"
            rows={4}
            placeholder="Conte rapidamente o seu cenário para 2026."
            className={`${inputBase} resize-y`}
            style={{ border: '1px solid var(--ink-hair)' }}
            {...register('mensagem')}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || submitting || checkingEmail || checkingPhone || !!emailError || !!phoneError}
          className="mt-1 inline-flex items-center justify-center rounded-full px-7 py-4 text-[15px] font-semibold font-display transition-opacity disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          style={{ background: 'var(--mint)', color: 'var(--ink)' }}
        >
          {submitting ? 'Enviando…' : 'Solicitar consultoria'}
        </button>
      </form>
    </div>
  )
}
