'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  empresa: z.string().min(2, 'Nome da empresa obrigatório'),
  cargo: z.string().min(2, 'Cargo obrigatório'),
  tamanho_equipe: z.enum(['1-5', '6-20', '21-50', '51-200', '200+'], {
    required_error: 'Selecione o tamanho da equipe',
  }),
  receita_anual: z.enum(['ate-1mm', '1mm-5mm', '5mm-20mm', '20mm-100mm', '100mm+'], {
    required_error: 'Selecione a faixa de receita',
  }),
  consentimento: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar os termos para continuar' }),
  }),
})

type FormData = z.infer<typeof schema>

const EQUIPE_OPTIONS = [
  { value: '1-5', label: '1–5 pessoas' },
  { value: '6-20', label: '6–20 pessoas' },
  { value: '21-50', label: '21–50 pessoas' },
  { value: '51-200', label: '51–200 pessoas' },
  { value: '200+', label: '200+ pessoas' },
]

const RECEITA_OPTIONS = [
  { value: 'ate-1mm', label: 'Até R$ 1 milhão' },
  { value: '1mm-5mm', label: 'R$ 1MM – R$ 5MM' },
  { value: '5mm-20mm', label: 'R$ 5MM – R$ 20MM' },
  { value: '20mm-100mm', label: 'R$ 20MM – R$ 100MM' },
  { value: '100mm+', label: 'Acima de R$ 100MM' },
]

export default function DiagnosticoEtapa1Form() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    try {
      const res = await fetch('/api/diagnostico/etapa-1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao processar')
      router.push(`/diagnostico/etapa-2/${json.token}`)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary mb-2">Etapa 1 de 2</p>
        <h2 className="font-display font-bold text-2xl">Dados da sua empresa</h2>
        <p className="text-foreground/60 text-sm mt-2">
          Precisamos de alguns dados para personalizar seu diagnóstico.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Nome completo" error={errors.nome?.message}>
            <input
              {...register('nome')}
              placeholder="João Silva"
              className="input-field"
            />
          </Field>
          <Field label="E-mail corporativo" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="joao@empresa.com.br"
              className="input-field"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Empresa" error={errors.empresa?.message}>
            <input
              {...register('empresa')}
              placeholder="Nome da empresa"
              className="input-field"
            />
          </Field>
          <Field label="Cargo" error={errors.cargo?.message}>
            <input
              {...register('cargo')}
              placeholder="Diretor Comercial"
              className="input-field"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Tamanho da equipe comercial" error={errors.tamanho_equipe?.message}>
            <select {...register('tamanho_equipe')} className="input-field">
              <option value="">Selecione...</option>
              {EQUIPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Receita anual aproximada" error={errors.receita_anual?.message}>
            <select {...register('receita_anual')} className="input-field">
              <option value="">Selecione...</option>
              {RECEITA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('consentimento')}
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-foreground/70 leading-relaxed">
              Concordo com a{' '}
              <a href="/politica-de-privacidade" className="text-primary underline-offset-2 hover:underline" target="_blank">
                Política de Privacidade
              </a>{' '}
              e autorizo o uso dos meus dados para contato.
            </span>
          </label>
          {errors.consentimento && (
            <p className="text-destructive text-xs mt-1">{errors.consentimento.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-4 py-3">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full h-12 text-base group"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processando...</>
          ) : (
            <>Iniciar Diagnóstico<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
          )}
        </Button>
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
