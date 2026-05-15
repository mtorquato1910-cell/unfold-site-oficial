'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import TurnstileWidget from '@/components/diagnostico/TurnstileWidget'

// Schema dos 7 campos da spec §3.1.
const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  empresa: z.string().min(2, 'Nome da empresa obrigatório'),
  cargo: z.enum(['ceo', 'diretor', 'gerente', 'analista', 'outro'], {
    required_error: 'Selecione seu cargo',
  }),
  setor: z.enum(
    ['construcao', 'agro', 'saas', 'automotivo', 'industria', 'servicos', 'outro'],
    { required_error: 'Selecione o setor da empresa' },
  ),
  faturamento_faixa: z.enum(
    ['ate-50k', '50k-200k', '200k-500k', 'acima-500k', 'prefiro-nao-informar'],
    { required_error: 'Selecione a faixa de faturamento' },
  ),
  urgencia: z.enum(['trimestre', '6-meses', 'sem-prazo', 'pesquisando'], {
    required_error: 'Selecione a urgência',
  }),
  consentimento: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar os termos para continuar' }),
  }),
})

type FormData = z.infer<typeof schema>

const CARGO_OPTIONS = [
  { value: 'ceo', label: 'CEO / Sócio / Fundador' },
  { value: 'diretor', label: 'Diretor (Marketing, Vendas, Comercial, Operações)' },
  { value: 'gerente', label: 'Gerente / Coordenador' },
  { value: 'analista', label: 'Analista / Especialista' },
  { value: 'outro', label: 'Outro' },
]

const SETOR_OPTIONS = [
  { value: 'construcao', label: 'Construção Civil / Incorporação' },
  { value: 'agro', label: 'Agronegócio / Agroindústria' },
  { value: 'saas', label: 'Tecnologia / SaaS B2B' },
  { value: 'automotivo', label: 'Automotivo / Concessionárias' },
  { value: 'industria', label: 'Indústria' },
  { value: 'servicos', label: 'Serviços B2B' },
  { value: 'outro', label: 'Outro' },
]

const FATURAMENTO_OPTIONS = [
  { value: 'ate-50k', label: 'Até R$ 50.000' },
  { value: '50k-200k', label: 'De R$ 50.000 a R$ 200.000' },
  { value: '200k-500k', label: 'De R$ 200.000 a R$ 500.000' },
  { value: 'acima-500k', label: 'Acima de R$ 500.000' },
  { value: 'prefiro-nao-informar', label: 'Prefiro não informar' },
]

const URGENCIA_OPTIONS = [
  { value: 'trimestre', label: 'Neste trimestre' },
  { value: '6-meses', label: 'Nos próximos 6 meses' },
  { value: 'sem-prazo', label: 'Sem prazo definido, mas é prioridade' },
  { value: 'pesquisando', label: 'Estou apenas pesquisando' },
]

export default function DiagnosticoEtapa1Form() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const hasTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

  const onTurnstileToken = useCallback((token: string) => setTurnstileToken(token), [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    if (hasTurnstile && !turnstileToken) {
      setServerError('Aguarde a verificação anti-spam carregar.')
      return
    }
    const requestId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    try {
      const res = await fetch('/api/diagnostico/etapa-1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
        },
        body: JSON.stringify({
          ...data,
          data_inicio: new Date().toISOString(),
          turnstile_token: turnstileToken || undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const traceId = res.headers.get('x-diag-trace-id') || requestId
        const msg = json.error || 'Erro ao processar diagnóstico'
        console.error('[diagnostico:etapa-1] falha', { traceId, status: res.status, code: json.code })
        throw new Error(`${msg} (ref: ${traceId.slice(0, 8)})`)
      }
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
        <p className="text-foreground/60 text-sm mt-2 leading-relaxed">
          Para começar, precisamos entender o contexto da sua operação. Leva menos de 1 minuto.
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

        <Field label="Empresa" error={errors.empresa?.message}>
          <input
            {...register('empresa')}
            placeholder="Nome da empresa"
            className="input-field"
          />
        </Field>

        <Field label="Cargo" error={errors.cargo?.message}>
          <select {...register('cargo')} className="input-field" defaultValue="">
            <option value="" disabled>Selecione...</option>
            {CARGO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Setor da empresa" error={errors.setor?.message}>
          <select {...register('setor')} className="input-field" defaultValue="">
            <option value="" disabled>Selecione...</option>
            {SETOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Faturamento mensal estimado" error={errors.faturamento_faixa?.message}>
            <select {...register('faturamento_faixa')} className="input-field" defaultValue="">
              <option value="" disabled>Selecione...</option>
              {FATURAMENTO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Quando você precisa endereçar isso?" error={errors.urgencia?.message}>
            <select {...register('urgencia')} className="input-field" defaultValue="">
              <option value="" disabled>Selecione...</option>
              {URGENCIA_OPTIONS.map((o) => (
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
              Concordo com o uso dos meus dados para gerar o diagnóstico e receber contato comercial
              da Unfold Growth, incluindo sincronização com o CRM (RD Station) e e-mails de nutrição.
              Veja detalhes em{' '}
              <a href="/diagnostico/privacidade" className="text-primary underline-offset-2 hover:underline" target="_blank">
                Privacidade do Diagnóstico
              </a>
              .
            </span>
          </label>
          {errors.consentimento && (
            <p className="text-destructive text-xs mt-1">{errors.consentimento.message}</p>
          )}
        </div>

        {hasTurnstile && <TurnstileWidget onToken={onTurnstileToken} />}

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
            <>Iniciar diagnóstico<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
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
