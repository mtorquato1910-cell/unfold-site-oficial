// Camada 2 — Fit Comercial.
// Fonte: docs/diagnostico-spec.md v1.0 §6
// Decisão A2 do dono: Q4=E pontua 0 no Fit de Dor (manter spec literal).

import { valorBruto } from './engine'
import type {
  Cargo,
  FaixaFit,
  FaturamentoFaixa,
  RespostasEtapa1,
  RespostasQuiz,
  ResultadoCamada2,
  Setor,
  Urgencia,
} from './types'

const PONTOS_SETOR: Record<Setor, number> = {
  construcao: 100,
  agro: 100,
  saas: 80,
  automotivo: 60,
  industria: 60,
  servicos: 50,
  outro: 30,
}

const PONTOS_CARGO: Record<Cargo, number> = {
  ceo: 100,
  diretor: 90,
  gerente: 60,
  analista: 30,
  outro: 30,
}

const PONTOS_FATURAMENTO: Record<FaturamentoFaixa, number> = {
  'acima-500k': 100,
  '200k-500k': 90,
  '50k-200k': 60,
  'ate-50k': 20,
  'prefiro-nao-informar': 50,
}

const PONTOS_URGENCIA: Record<Urgencia, number> = {
  trimestre: 100,
  '6-meses': 75,
  'sem-prazo': 50,
  pesquisando: 25,
}

// Subitem 4 — ciclo de venda (Q8 NÃO invertida no Fit, diferente do eixo Operar).
function pontosCiclo(q8: RespostasQuiz['q8']): number {
  if (q8 === 'D') return 100
  if (q8 === 'C') return 90
  if (q8 === 'B') return 60
  return 30 // A
}

function fitEstrutural(etapa1: RespostasEtapa1, quiz: RespostasQuiz): number {
  const s1 = PONTOS_SETOR[etapa1.setor]
  const s2 = PONTOS_CARGO[etapa1.cargo]
  const s3 = PONTOS_FATURAMENTO[etapa1.faturamento_faixa]
  const s4 = pontosCiclo(quiz.q8)
  return (s1 + s2 + s3 + s4) / 4
}

// Curva U invertido — soma 8-9 (operação muito madura) perde fit (spec §6.3).
function fitDor(quiz: RespostasQuiz): number {
  const soma = valorBruto(quiz.q4) + valorBruto(quiz.q5) + valorBruto(quiz.q7)
  if (soma <= 3) return 30
  if (soma <= 5) return 60
  if (soma <= 7) return 90
  return 70 // 8-9
}

function fitUrgencia(etapa1: RespostasEtapa1): number {
  return PONTOS_URGENCIA[etapa1.urgencia]
}

function faixaFit(score: number): FaixaFit {
  if (score >= 75) return 'fit-alto'
  if (score >= 50) return 'fit-medio'
  if (score >= 25) return 'fit-baixo'
  return 'desfit'
}

// Mantém precisão fracionária internamente (o caso Roberto exige 58.84 ±0.5).
export function calcularCamada2(
  etapa1: RespostasEtapa1,
  quiz: RespostasQuiz,
  scoreGestao: number,
): ResultadoCamada2 {
  const fit_estrutural = fitEstrutural(etapa1, quiz)
  const fit_dor = fitDor(quiz)
  const fit_cabeca = scoreGestao // já em [0,100]
  const fit_urgencia = fitUrgencia(etapa1)
  const score_fit = fit_estrutural * 0.4 + fit_dor * 0.3 + fit_cabeca * 0.2 + fit_urgencia * 0.1
  return {
    fit_estrutural: round2(fit_estrutural),
    fit_dor: round2(fit_dor),
    fit_cabeca: round2(fit_cabeca),
    fit_urgencia: round2(fit_urgencia),
    score_fit: round2(score_fit),
    faixa_fit: faixaFit(score_fit),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
