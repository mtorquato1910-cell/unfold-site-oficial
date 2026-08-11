import type { Metadata } from 'next'
import DiagnosticoEtapa1Form from '@/components/diagnostico/DiagnosticoEtapa1Form'
import DiagnosticoTracker from '@/components/diagnostico/DiagnosticoTracker'
import ConversaoContent, { type ConversaoSecao } from '@/components/site/ConversaoContent'

const SECOES: ConversaoSecao[] = [
  {
    titulo: 'O que o relatório mostra',
    blocos: [
      { tipo: 'p', texto: 'Ele lê quatro dimensões da sua operação e aponta, em cada uma, o estágio atual e o próximo passo:' },
      { tipo: 'lista', itens: ['Como você gera demanda', 'Como qualifica e conduz oportunidades', 'Como marketing e vendas se conectam', 'Como a operação é medida'] },
      { tipo: 'p', texto: 'Não é um score genérico. É a leitura do seu caso.' },
    ],
  },
  {
    titulo: 'Para quem é',
    blocos: [
      { tipo: 'p', texto: 'Empresas com venda complexa: ticket alto, ciclo de semanas ou meses e mais de uma pessoa decidindo.' },
      { tipo: 'p', texto: 'Funciona bem para incorporação, indústria, agronegócio, tecnologia e serviços B2B. Não funciona para produto de baixo ticket com decisão individual.' },
    ],
  },
  {
    titulo: 'O que costuma aparecer',
    blocos: [
      { tipo: 'lista', itens: ['Leads em volume travando na passagem para vendas', 'CRM cadastrado, mas sem critério de avanço entre etapas', 'Forecast que nunca bate', 'Mídia crescendo sem a receita acompanhar'] },
      { tipo: 'p', texto: 'São sintomas de estrutura, não de esforço.' },
    ],
  },
  {
    titulo: 'Depois do relatório',
    blocos: [
      { tipo: 'p', texto: 'Você recebe por e-mail e decide o que fazer. Se quiser conversar sobre o resultado, alguém da equipe responde em até 24 horas.' },
    ],
  },
]

export const metadata: Metadata = {
  title: 'Diagnóstico Gratuito',
  description:
    'Descubra o nível de maturidade da sua operação comercial e receba um diagnóstico personalizado baseado no método UGS.',
  alternates: { canonical: '/diagnostico' },
}

export default function DiagnosticoPage() {
  return (
    <main className="min-h-screen">
      <DiagnosticoTracker event="diagnostico_iniciado" />
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(218_94%_78%/0.08),transparent_55%)]" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
            Diagnóstico gratuito
          </p>
          <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            Descubra o nível de maturidade da sua{' '}
            <span className="text-secondary">operação comercial</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/70 leading-relaxed">
            Responda 12 perguntas sobre como sua empresa diagnostica, estrutura e opera suas vendas.
            Em menos de 5 minutos, você recebe um relatório personalizado baseado no método UGS.
          </p>
        </div>
      </section>

      {/* Formulário Etapa 1 */}
      <section className="pb-16">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <DiagnosticoEtapa1Form />
        </div>
      </section>

      <ConversaoContent secoes={SECOES} />
    </main>
  )
}
