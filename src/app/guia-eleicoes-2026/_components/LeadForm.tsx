'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { GuiaTurnstile } from './GuiaTurnstile'
import { formatPhoneBR, extractDigits } from '@/lib/format/phone-mask'
import { guiaLeadSchema, type GuiaLeadInput } from '../_lib/validation'
import { PERFIL_OPTIONS, type PerfilEleitoral } from '../_lib/perfil'
import { submitGuiaLead } from '../_lib/submit-lead'
import { POLITICA_URL } from '../_lib/links'

const ALERT = '#E24B4A'
const MINT = '#6DF9C6'
const CREAM = '#E7E7E7'

const inputBase =
  'w-full rounded-lg border bg-white/[0.06] px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-[#E7E7E7]/35 focus:border-[#6DF9C6]'

interface Props {
  onUnlock: (data: { perfil: PerfilEleitoral; emailHash?: string; leadId?: string }) => void
}

export function LeadForm({ onUnlock }: Props) {
  const [turnstileToken, setTurnstileToken] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<GuiaLeadInput>({
    resolver: zodResolver(guiaLeadSchema),
    mode: 'onChange',
    defaultValues: { nome: '', email: '', telefone: '', perfil: undefined },
  })

  async function onSubmit(values: GuiaLeadInput) {
    setSubmitError(null)
    try {
      const result = await submitGuiaLead({
        nome: values.nome,
        email: values.email,
        telefone: extractDigits(values.telefone),
        perfil: values.perfil as PerfilEleitoral,
        turnstileToken,
      })
      if (!result.ok) {
        // RF-19 — erro amigável, sem desbloquear.
        setSubmitError(
          'Tivemos um problema ao processar seu cadastro. Tente novamente em alguns instantes ou recarregue a página.',
        )
        return
      }
      onUnlock({
        perfil: values.perfil as PerfilEleitoral,
        emailHash: result.emailHash,
        leadId: result.leadId,
      })
    } catch {
      setSubmitError(
        'Tivemos um problema ao processar seu cadastro. Tente novamente em alguns instantes ou recarregue a página.',
      )
    }
  }

  // Em dev sem site key, o TurnstileWidget já chama onVerify('mock-...') no mount.
  const canSubmit = isValid && !!turnstileToken && !isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4" style={{ color: CREAM }}>
      {/* Nome */}
      <div>
        <label htmlFor="guia-nome" className="mb-1.5 block text-sm font-medium">
          Nome completo
        </label>
        <input
          id="guia-nome"
          type="text"
          autoComplete="name"
          placeholder="Seu nome completo"
          className={inputBase}
          style={{ borderColor: errors.nome ? ALERT : 'rgba(231,231,231,0.2)', color: CREAM }}
          aria-invalid={!!errors.nome}
          aria-describedby={errors.nome ? 'guia-nome-err' : undefined}
          {...register('nome')}
        />
        {errors.nome && (
          <p id="guia-nome-err" className="mt-1 text-xs" style={{ color: ALERT }}>
            {errors.nome.message}
          </p>
        )}
      </div>

      {/* E-mail */}
      <div>
        <label htmlFor="guia-email" className="mb-1.5 block text-sm font-medium">
          E-mail
        </label>
        <input
          id="guia-email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          className={inputBase}
          style={{ borderColor: errors.email ? ALERT : 'rgba(231,231,231,0.2)', color: CREAM }}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'guia-email-err' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="guia-email-err" className="mt-1 text-xs" style={{ color: ALERT }}>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Telefone com máscara */}
      <div>
        <label htmlFor="guia-telefone" className="mb-1.5 block text-sm font-medium">
          Telefone (WhatsApp)
        </label>
        <Controller
          control={control}
          name="telefone"
          render={({ field }) => (
            <input
              id="guia-telefone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              className={inputBase}
              style={{ borderColor: errors.telefone ? ALERT : 'rgba(231,231,231,0.2)', color: CREAM }}
              aria-invalid={!!errors.telefone}
              aria-describedby={errors.telefone ? 'guia-telefone-err' : undefined}
              value={formatPhoneBR(field.value || '')}
              onChange={(e) => field.onChange(extractDigits(e.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />
        {errors.telefone && (
          <p id="guia-telefone-err" className="mt-1 text-xs" style={{ color: ALERT }}>
            {errors.telefone.message}
          </p>
        )}
      </div>

      {/* Perfil (radio) */}
      <div>
        <span className="mb-1.5 block text-sm font-medium">
          Você é candidato ou pré-candidato em 2026?
        </span>
        <Controller
          control={control}
          name="perfil"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="gap-2"
              aria-invalid={!!errors.perfil}
              aria-describedby={errors.perfil ? 'guia-perfil-err' : undefined}
            >
              {PERFIL_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  htmlFor={`guia-perfil-${opt.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.04]"
                  style={{ borderColor: 'rgba(231,231,231,0.2)' }}
                >
                  <RadioGroupItem
                    id={`guia-perfil-${opt.value}`}
                    value={opt.value}
                    className="border-[#6DF9C6] text-[#6DF9C6]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </RadioGroup>
          )}
        />
        {errors.perfil && (
          <p id="guia-perfil-err" className="mt-1 text-xs" style={{ color: ALERT }}>
            {errors.perfil.message}
          </p>
        )}
      </div>

      {/* Turnstile (widget real em prod; bypass em dev) */}
      <GuiaTurnstile onVerify={setTurnstileToken} />

      {/* Erro de envio (RF-19) */}
      {submitError && (
        <p role="alert" className="text-sm" style={{ color: ALERT }}>
          {submitError}
        </p>
      )}

      {/* Botão principal (RF-18) */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-1 inline-flex items-center justify-center rounded-lg px-5 py-3 text-[15px] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
        style={{ background: MINT, color: '#001E29', fontFamily: 'var(--font-guia-display)' }}
      >
        {isSubmitting ? 'Desbloqueando…' : 'Desbloquear estudo'}
      </button>

      {/* Rodapé LGPD (RNF-14) */}
      <p className="text-center text-[11px] leading-relaxed" style={{ color: 'rgba(231,231,231,0.8)', fontFamily: 'var(--font-guia-mono)' }}>
        Seus dados são tratados conforme nossa{' '}
        <a href={POLITICA_URL} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#E7E7E7' }}>
          Política de Privacidade
        </a>{' '}
        e a LGPD. Não enviamos spam.
      </p>
    </form>
  )
}
