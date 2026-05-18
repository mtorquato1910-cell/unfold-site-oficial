'use client'

/**
 * Etapa 1 — Qualificação (S2.2).
 *
 * 4 campos da spec §3.1: nome, email, empresa, setor.
 * Microcopy de abertura literal do spec §3.4.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { etapa1Schema } from '@/lib/calculadora/schema'
import { SETORES } from '@/lib/calculadora/benchmarks'
import type { Etapa1 } from '@/lib/calculadora/types'
import { trackCalcEvent } from '@/lib/analytics/calculadora-events'
import { formatPhoneBR } from '@/lib/format/phone-mask'

interface Props {
  defaultValues: Etapa1
  onConcluir: (e: Etapa1) => void
}

export default function Etapa1Qualificacao({ defaultValues, onConcluir }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Etapa1>({
    resolver: zodResolver(etapa1Schema),
    defaultValues,
    mode: 'onBlur',
  })

  // Evento "calculadora_iniciada" — uma vez por sessão.
  useEffect(() => {
    trackCalcEvent({ event_name: 'calculadora_iniciada' })
  }, [])

  function submit(data: Etapa1) {
    trackCalcEvent({
      event_name: 'etapa_1_concluida',
      lead_email: data.email.toLowerCase().trim(),
      metadata: { setor: data.setor },
    })
    onConcluir(data)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" aria-labelledby="calc-etapa1-titulo">
      <header className="space-y-2 mb-4">
        <h2
          id="calc-etapa1-titulo"
          className="font-display font-bold text-xl md:text-2xl"
        >
          Acessar a Calculadora
        </h2>
        <p className="text-sm text-foreground/70 leading-relaxed">
          Para acessar a Calculadora, precisamos apenas de algumas informações básicas. Leva menos de
          30 segundos.
        </p>
      </header>

      <Field id="nome" label="Nome completo" error={errors.nome?.message}>
        <input
          id="nome"
          type="text"
          autoComplete="name"
          placeholder="Marina Costa"
          className="input-field"
          {...register('nome')}
        />
      </Field>

      <Field id="email" label="E-mail corporativo" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="marina@empresa.com.br"
          className="input-field"
          {...register('email')}
        />
      </Field>

      <Field id="empresa" label="Empresa" error={errors.empresa?.message}>
        <input
          id="empresa"
          type="text"
          autoComplete="organization"
          placeholder="Nome da empresa"
          className="input-field"
          {...register('empresa')}
        />
      </Field>

      <Field
        id="telefone"
        label="WhatsApp"
        optional
        error={errors.telefone?.message}
      >
        <input
          id="telefone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(11) 99999-9999"
          className="input-field"
          {...register('telefone')}
          onChange={(e) => setValue('telefone', formatPhoneBR(e.target.value), { shouldValidate: false })}
        />
      </Field>

      <Field id="setor" label="Setor da empresa" error={errors.setor?.message}>
        <select id="setor" className="input-field" {...register('setor')}>
          {SETORES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <Button type="submit" disabled={isSubmitting} className="w-full gap-2 h-11">
        Acessar a Calculadora <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-[11px] text-foreground/45 leading-relaxed pt-1">
        Ao continuar você concorda em receber o resultado por e-mail. Nenhuma informação é
        compartilhada com terceiros — consulte nossa{' '}
        <a href="/politica-de-privacidade" className="underline hover:text-primary">
          política de privacidade
        </a>
        .
      </p>
    </form>
  )
}

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-foreground/80 block mb-1.5">
        {label}
        {optional && <span className="text-foreground/45 font-normal"> (opcional)</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-destructive text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
