'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Loader2, TrendingUp, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  // Etapa 1
  nome: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  empresa: z.string().min(2, 'Empresa obrigatória'),
  // Etapa 2
  investimento_atual: z.string().min(1, 'Informe o investimento'),
  ticket_medio: z.string().min(1, 'Informe o ticket médio'),
  ciclo_vendas: z.string().min(1, 'Informe o ciclo de vendas'),
  // Etapa 3
  taxa_conversao_lead: z.string().optional(),
  taxa_conversao_opo: z.string().optional(),
  canais: z.array(z.string()).min(1, 'Selecione ao menos um canal'),
  // Etapa 4
  objetivo_receita: z.string().optional(),
  vertical: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const CANAIS = [
  'Google Ads',
  'Meta Ads (Facebook/Instagram)',
  'LinkedIn Ads',
  'YouTube Ads',
  'Outbound (SDR)',
  'Conteúdo / SEO',
]

type ResultadoIA = {
  projecao_leads?: number
  projecao_oportunidades?: number
  projecao_clientes?: number
  ticket_medio_sugerido?: number
  receita_projetada?: number
  investimento_recomendado?: number
  roi_estimado?: string
  principais_alavancas?: string[]
  proximos_passos?: string
  nota?: string
}

export default function CalculadoraClient() {
  const [etapa, setEtapa] = useState(1)
  const [resultado, setResultado] = useState<ResultadoIA | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { canais: [] },
  })

  const canaisSelecionados = watch('canais') || []

  function toggleCanal(canal: string) {
    const atual = getValues('canais') || []
    if (atual.includes(canal)) {
      setValue('canais', atual.filter((c) => c !== canal))
    } else {
      setValue('canais', [...atual, canal])
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/calculadora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao calcular')
      setResultado(json.resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (resultado) {
    return <ResultadoDisplay resultado={resultado} />
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((e) => (
            <div key={e} className={`flex-1 h-1 rounded-full mx-0.5 transition-all ${e <= etapa ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
        <p className="font-mono text-xs text-foreground/40 mt-2">Etapa {etapa} de 4</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {etapa === 1 && (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-xl mb-6">Seus dados de contato</h2>
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1.5">Nome</label>
              <input {...register('nome')} placeholder="João Silva" className="input-field" />
              {errors.nome && <p className="text-destructive text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1.5">E-mail corporativo</label>
              <input {...register('email')} type="email" placeholder="joao@empresa.com.br" className="input-field" />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1.5">Empresa</label>
              <input {...register('empresa')} placeholder="Nome da empresa" className="input-field" />
              {errors.empresa && <p className="text-destructive text-xs mt-1">{errors.empresa.message}</p>}
            </div>
            <Button type="button" onClick={() => setEtapa(2)} className="w-full gap-2">
              Próxima etapa <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {etapa === 2 && (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-xl mb-6">Sua operação atual</h2>
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1.5">Investimento mensal em tráfego (R$)</label>
              <input {...register('investimento_atual')} placeholder="Ex: 15000" className="input-field" type="number" />
              {errors.investimento_atual && <p className="text-destructive text-xs mt-1">{errors.investimento_atual.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1.5">Ticket médio de venda (R$)</label>
              <input {...register('ticket_medio')} placeholder="Ex: 8500" className="input-field" type="number" />
              {errors.ticket_medio && <p className="text-destructive text-xs mt-1">{errors.ticket_medio.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1.5">Ciclo médio de vendas (dias)</label>
              <input {...register('ciclo_vendas')} placeholder="Ex: 30" className="input-field" type="number" />
              {errors.ciclo_vendas && <p className="text-destructive text-xs mt-1">{errors.ciclo_vendas.message}</p>}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setEtapa(1)} className="gap-2 flex-1">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <Button type="button" onClick={() => setEtapa(3)} className="gap-2 flex-1">
                Próxima <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {etapa === 3 && (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-xl mb-6">Canais e conversão</h2>
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-3">Canais que você usa (selecione todos)</label>
              <div className="grid grid-cols-2 gap-2">
                {CANAIS.map((canal) => (
                  <button
                    key={canal}
                    type="button"
                    onClick={() => toggleCanal(canal)}
                    className={`text-left rounded-lg border px-4 py-3 text-sm transition-all ${
                      canaisSelecionados.includes(canal)
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-card hover:border-primary/40 text-foreground/70'
                    }`}
                  >
                    {canal}
                  </button>
                ))}
              </div>
              {errors.canais && <p className="text-destructive text-xs mt-1">{errors.canais.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/80 block mb-1.5">Taxa lead → oportunidade (%)</label>
                <input {...register('taxa_conversao_lead')} placeholder="Ex: 30" className="input-field" type="number" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 block mb-1.5">Taxa oportunidade → cliente (%)</label>
                <input {...register('taxa_conversao_opo')} placeholder="Ex: 25" className="input-field" type="number" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setEtapa(2)} className="gap-2 flex-1">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <Button type="button" onClick={() => setEtapa(4)} className="gap-2 flex-1">
                Próxima <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {etapa === 4 && (
          <div className="space-y-5">
            <h2 className="font-display font-bold text-xl mb-6">Objetivo e contexto</h2>
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1.5">Meta de receita anual (R$) — opcional</label>
              <input {...register('objetivo_receita')} placeholder="Ex: 1200000" className="input-field" type="number" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1.5">Vertical de mercado — opcional</label>
              <select {...register('vertical')} className="input-field">
                <option value="">Selecione...</option>
                <option value="construcao">Construção Civil</option>
                <option value="agro">Agronegócio</option>
                <option value="b2b-saas">B2B / SaaS</option>
                <option value="industria">Indústria</option>
                <option value="servicos">Serviços Profissionais</option>
                <option value="varejo">Varejo B2B</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {error && <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-4 py-3">{error}</p>}

            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setEtapa(3)} className="gap-2 flex-1">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 flex-1">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Calculando...</> : <>Calcular projeção <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

function ResultadoDisplay({ resultado }: { resultado: ResultadoIA }) {
  return (
    <div className="space-y-6">
      {resultado.nota && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-mono text-primary/70">
          {resultado.nota}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {resultado.projecao_leads && (
          <MetricCard icon={<Users className="h-5 w-5" />} label="Leads/mês" value={String(resultado.projecao_leads)} />
        )}
        {resultado.projecao_oportunidades && (
          <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Oportunidades/mês" value={String(resultado.projecao_oportunidades)} />
        )}
        {resultado.receita_projetada && (
          <MetricCard icon={<DollarSign className="h-5 w-5" />} label="Receita projetada/mês" value={`R$ ${resultado.receita_projetada.toLocaleString('pt-BR')}`} />
        )}
        {resultado.roi_estimado && (
          <MetricCard icon={<TrendingUp className="h-5 w-5 text-secondary" />} label="ROI estimado" value={resultado.roi_estimado} highlight />
        )}
      </div>

      {resultado.principais_alavancas && resultado.principais_alavancas.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Principais alavancas</p>
          <ul className="space-y-3">
            {resultado.principais_alavancas.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground/80">
                <span className="font-mono text-primary mt-0.5">→</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {resultado.proximos_passos && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Próximos passos</p>
          <p className="text-foreground/70 text-sm leading-relaxed">{resultado.proximos_passos}</p>
        </div>
      )}

      <div className="text-center pt-2">
        <p className="text-foreground/60 text-sm mb-4">Quer validar essas projeções com um especialista?</p>
        <Button asChild size="lg" className="h-12 px-8 gap-2">
          <Link href="/diagnostico">
            Fazer diagnóstico completo <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-secondary/30 bg-secondary/5' : 'border-border bg-card'}`}>
      <div className={`mb-2 ${highlight ? 'text-secondary' : 'text-primary'}`}>{icon}</div>
      <p className="font-mono text-xs text-foreground/40 uppercase mb-1">{label}</p>
      <p className={`font-display font-bold text-xl ${highlight ? 'text-secondary' : 'text-foreground'}`}>{value}</p>
    </div>
  )
}
