import type { Metadata } from 'next'
import CalculadoraShell from './_components/CalculadoraShell'
import ConversaoContent, { type ConversaoSecao } from '@/components/site/ConversaoContent'

const SECOES: ConversaoSecao[] = [
  {
    titulo: 'O que ela calcula',
    blocos: [
      { tipo: 'p', texto: 'Você informa investimento, ticket médio e as suas conversões. Ela projeta a cadeia inteira:' },
      { tipo: 'lista', itens: ['Quantos cliques o investimento compra', 'Quantos leads isso gera', 'Quantas oportunidades avançam', 'Quantos clientes fecham', 'Quanto isso vira em receita'] },
    ],
  },
  {
    titulo: 'O que muda em relação às outras',
    blocos: [
      { tipo: 'p', texto: 'A maioria das calculadoras projeta lead e para por aí, como se lead fosse resultado.' },
      { tipo: 'p', texto: 'Esta segue até o contrato. Em venda complexa, o custo se acumula a cada etapa: o mesmo investimento passa a ser dividido por um número cada vez menor de sobreviventes. É essa conta que mostra se o dinheiro se paga.' },
    ],
  },
  {
    titulo: 'Três decisões que ela resolve',
    blocos: [
      { tipo: 'lista', itens: ['Quanto investir para atingir uma meta de faturamento', 'Se a meta é alcançável com o orçamento que existe', 'Qual conversão melhorar para o número fechar sem aumentar a verba'] },
    ],
  },
  {
    titulo: 'O que você recebe',
    blocos: [
      { tipo: 'p', texto: 'A projeção na tela e uma cópia por e-mail, com os números do seu cenário e a referência do seu setor.' },
      { tipo: 'p', texto: 'Se algum indicador seu estiver muito longe da referência, é ali que está o gargalo.' },
      { tipo: 'p', texto: 'Gratuita, sem compromisso comercial. Os dados servem para enviar o resultado e não vão para terceiros.' },
    ],
  },
]

export const metadata: Metadata = {
  title: 'Calculadora de Performance',
  description:
    'Descubra quanto seu investimento em mídia paga pode realmente retornar — com premissas honestas para vendas complexas B2B.',
  alternates: { canonical: '/ferramentas/calculadora-trafego' },
}

export default function CalculadoraTráfegoPage() {
  return (
    <main className="min-h-screen">
      <section className="relative isolate overflow-hidden pt-28 pb-10 md:pt-32 md:pb-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(218_94%_78%/0.06),transparent_55%)]" />
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
            Ferramenta gratuita
          </p>
          <h1 className="font-display font-bold tracking-tight text-3xl md:text-5xl leading-[1.05] max-w-3xl">
            Calculadora de Performance
          </h1>
          <p className="mt-4 text-base md:text-lg text-foreground/70 leading-relaxed max-w-2xl">
            Descubra quanto seu investimento em mídia paga pode realmente retornar — com premissas
            honestas para vendas complexas B2B.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <CalculadoraShell />
        </div>
      </section>

      <ConversaoContent secoes={SECOES} />
    </main>
  )
}
