import GraficoAranha from './GraficoAranha'
import InsightCard from './InsightCard'
import CaminhoCard from './CaminhoCard'
import CTAAgendamento from './CTAAgendamento'
import FooterButtonsV2 from './FooterButtonsV2'
import { Button } from '@/components/ui/button'
import {
  FRASE_FAIXA_CONSOLIDADA,
  FRASES_EIXOS,
  LABEL_EIXO,
  LABEL_FAIXA,
} from '@/lib/scoring/textos'
import type {
  CodigoCaminho,
  CodigoInsight,
  DiagnosticoCompleto,
  Eixo,
  FaixaMaturidade,
} from '@/lib/scoring/types'

interface Props {
  primeiroNome: string
  diag: DiagnosticoCompleto
  hash: string
  calendlyUrl?: string
  contactEmail?: string
}

const ORDEM_EIXOS: Eixo[] = ['diagnosticar', 'estruturar', 'operar', 'evoluir', 'gestao']

function faixaDoScore(s: number): FaixaMaturidade {
  if (s <= 25) return 'critica'
  if (s <= 50) return 'em-formacao'
  if (s <= 75) return 'estruturada'
  return 'madura'
}

export default function DiagnosticoResultadoV2({ primeiroNome, diag, hash, calendlyUrl, contactEmail }: Props) {
  const scores: Record<Eixo, number> = {
    diagnosticar: diag.score_diagnosticar,
    estruturar: diag.score_estruturar,
    operar: diag.score_operar,
    evoluir: diag.score_evoluir,
    gestao: diag.score_gestao,
  }
  const insights = diag.padroes_exibidos as CodigoInsight[]
  const caminhos = diag.caminhos_exibidos as CodigoCaminho[]

  return (
    <article className="max-w-3xl mx-auto px-6 py-16 md:py-24 space-y-20">
      {/* ─────── Bloco 1 — Cabeçalho ─────── */}
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
          Diagnóstico de Growth
        </p>
        <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
          Olá, {primeiroNome}.
          <br />
          Aqui está o diagnóstico da sua operação.
        </h1>
      </header>

      {/* ─────── Bloco 2 — Score consolidado + faixa ─────── */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40 mb-3">
          Score consolidado
        </p>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="font-display font-bold text-6xl md:text-7xl tabular-nums">
            {diag.score_consolidado}
          </span>
          <span className="font-display text-2xl md:text-3xl text-foreground/40">/ 100</span>
        </div>
        <p className="font-display font-bold text-2xl mb-2">
          {LABEL_FAIXA[diag.faixa_consolidada]}
        </p>
        <p className="text-foreground/65 leading-relaxed max-w-xl">
          {FRASE_FAIXA_CONSOLIDADA[diag.faixa_consolidada]}
        </p>
      </section>

      {/* ─────── Bloco 3 — Gráfico aranha + leitura por eixo ─────── */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40 mb-6">
          Sua maturidade por eixo
        </p>
        <div className="rounded-2xl border border-border bg-card/40 p-4 md:p-6 mb-6">
          <GraficoAranha scores={scores} />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {ORDEM_EIXOS.map((eixo) => {
            const score = scores[eixo]
            const faixa = faixaDoScore(score)
            return (
              <li
                key={eixo}
                className="rounded-xl border border-border bg-card/40 p-5"
                data-testid={`eixo-${eixo}`}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-display font-bold text-base">{LABEL_EIXO[eixo]}</span>
                  <span className="font-display text-xl tabular-nums">{score}</span>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary/80 mb-2">
                  {LABEL_FAIXA[faixa]}
                </p>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {FRASES_EIXOS[eixo][faixa]}
                </p>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ─────── Bloco 4 — Três insights ─────── */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40 mb-6">
          O que mais aparece nas suas respostas
        </p>
        <div className="space-y-5">
          {insights.slice(0, 3).map((codigo, i) => (
            <InsightCard key={codigo} codigo={codigo} posicao={i as 0 | 1 | 2} />
          ))}
        </div>
      </section>

      {/* ─────── Bloco 5 — Três caminhos ─────── */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40 mb-6">
          Caminhos de melhoria
        </p>
        <div className="space-y-5">
          {caminhos.slice(0, 3).map((codigo, i) => (
            <CaminhoCard key={codigo} codigo={codigo} posicao={i as 0 | 1 | 2} />
          ))}
        </div>
      </section>

      {/* ─────── Bloco 6 — CTA ─────── */}
      <CTAAgendamento faixa={diag.faixa_fit} calendlyUrl={calendlyUrl} contactEmail={contactEmail} />

      {/* ─────── Bloco 7 — Footer ─────── */}
      <footer className="border-t border-border pt-10 space-y-6">
        <FooterButtonsV2 hash={hash} />

        {/* Opt-in nutrição (Sprint 4 conecta ao adapter de email) */}
        <div className="rounded-xl border border-border bg-card/40 p-6">
          <p className="font-display font-bold text-lg mb-2">
            Receba conteúdos exclusivos sobre como estruturar operações de crescimento
          </p>
          <p className="text-foreground/60 text-sm mb-4">
            Sequência curta com cases reais de vendas complexas no Brasil.
          </p>
          <form
            action="/api/diagnostico/opt-in"
            method="POST"
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="seu@email.com"
              className="input-field flex-1"
            />
            <input type="hidden" name="hash" value={hash} />
            <Button type="submit" className="sm:w-auto">
              Inscrever-se
            </Button>
          </form>
        </div>

        <p className="text-foreground/40 text-xs">
          Este diagnóstico foi gerado pelo método Unfold Growth System (UGS).
        </p>
      </footer>
    </article>
  )
}
