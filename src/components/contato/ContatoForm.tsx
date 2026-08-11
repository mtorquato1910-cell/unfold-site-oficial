'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2, Check } from 'lucide-react'
import { formatPhoneBR } from '@/lib/format/phone-mask'
import { useContatoCheck } from '@/lib/validation/use-contato-check'

const schema = z.object({
  nome: z.string().min(3, 'Informe seu nome completo'),
  telefone: z
    .string({ required_error: 'Informe seu telefone com DDD' })
    .trim()
    .min(1, 'Informe seu telefone com DDD')
    .refine((v) => /^\D*(\d\D*){10,11}$/.test(v), 'Telefone deve ter 10 ou 11 dígitos'),
  email: z.string().email('E-mail inválido'),
})

type FormData = z.infer<typeof schema>

export default function ContatoForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { emailError, phoneError, checkingEmail, checkingPhone, checkEmail, checkPhone } =
    useContatoCheck()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const emailReg = register('email')

  async function onSubmit(data: FormData) {
    setServerError(null)
    // Valida e-mail (MX) e WhatsApp (Evolution) antes de enviar.
    const [emailOk, phoneOk] = await Promise.all([
      checkEmail(data.email),
      checkPhone(data.telefone ?? '', { requirePhone: true }),
    ])
    if (!emailOk || !phoneOk) return
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Erro ao enviar. Tente novamente.')
      }
      setSuccess(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    }
  }

  if (success) {
    return (
      <div className="rounded-[22px] border border-border bg-card/70 backdrop-blur-sm p-8 md:p-11 text-center shadow-[0_30px_80px_-24px_hsl(195_100%_4%/0.7)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="font-display font-bold text-2xl">Recebido!</h2>
        <p className="mt-3 text-foreground/70 leading-relaxed">
          Obrigado pelo contato. Nosso time da Unfold retornará em breve.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[22px] border border-border bg-card/70 backdrop-blur-sm p-8 md:p-11 shadow-[0_30px_80px_-24px_hsl(195_100%_4%/0.7)]">
      <div className="mb-8">
        <span className="inline-flex items-center rounded-full bg-primary/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Fale com a Unfold
        </span>
        <h1 className="font-display font-bold text-2xl md:text-[29px] leading-[1.22] mt-4">
          Vamos conversar sobre o seu crescimento
        </h1>
        <p className="text-foreground/60 text-[15px] mt-3.5 leading-relaxed">
          Somos a <span className="text-foreground/90 font-medium">Unfold Growth</span> —
          estruturamos sistemas de crescimento que conectam marketing, vendas, CRM e automação.
          Deixe seus dados e nosso time entra em contato com você.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field label="Nome" error={errors.nome?.message}>
          <input {...register('nome')} placeholder="Seu nome completo" className="input-field" />
        </Field>

        <Field label="Telefone" error={errors.telefone?.message || phoneError || undefined}>
          <input
            {...register('telefone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            className="input-field"
            onChange={(e) =>
              setValue('telefone', formatPhoneBR(e.target.value), { shouldValidate: false })
            }
            onBlur={(e) => void checkPhone(e.target.value)}
          />
        </Field>

        <Field label="E-mail" error={errors.email?.message || emailError || undefined}>
          <input
            {...emailReg}
            onBlur={(e) => {
              emailReg.onBlur(e)
              void checkEmail(e.target.value)
            }}
            type="email"
            placeholder="voce@empresa.com"
            className="input-field"
          />
        </Field>

        {serverError && (
          <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-4 py-3">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || checkingEmail || checkingPhone}
          size="lg"
          className="w-full h-12 text-base group"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            <>
              Enviar
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>

        <p className="text-xs text-foreground/50 text-center leading-relaxed pt-1">
          Seus dados serão utilizados exclusivamente para que a Unfold entre em contato com você.
          Não compartilhamos suas informações com terceiros.
        </p>
      </form>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
