// Engine de scoring v2 — Camada 1 (5 eixos).
// Fonte única: docs/diagnostico-spec.md v1.0 §5
// Engine pura: sem side effects, sem Math.random, sem Date.now.

import type {
  Eixo,
  FaixaMaturidade,
  FaixasEixos,
  LetraQ4,
  LetraQuiz,
  Pilar,
  ResultadoCamada1,
  RespostasQuiz,
} from './types'

// Pontos brutos por letra. E = 0 (mesma pontuação que A — spec §5.1).
export function valorBruto(letra: LetraQuiz | LetraQ4): number {
  if (letra === 'A' || letra === 'E') return 0
  if (letra === 'B') return 1
  if (letra === 'C') return 2
  return 3 // D
}

// Faixas de maturidade (spec §5.5). Cortes inclusivos no topo:
// 0-25 Crítica | 26-50 Em formação | 51-75 Estruturada | 76-100 Madura.
export function faixaMaturidade(score: number): FaixaMaturidade {
  if (score <= 25) return 'critica'
  if (score <= 50) return 'em-formacao'
  if (score <= 75) return 'estruturada'
  return 'madura'
}

// Clamp [0,100] + round inteiro.
function normalize(score: number): number {
  if (Number.isNaN(score) || !Number.isFinite(score)) return 0
  if (score < 0) return 0
  if (score > 100) return 100
  return Math.round(score)
}

function scoreDiagnosticar(quiz: RespostasQuiz): number {
  const soma = valorBruto(quiz.q1) + valorBruto(quiz.q2)
  return normalize((soma / 6) * 100)
}

function scoreEstruturar(quiz: RespostasQuiz): number {
  const soma = valorBruto(quiz.q3) + valorBruto(quiz.q4) + valorBruto(quiz.q5) + valorBruto(quiz.q6)
  return normalize((soma / 12) * 100)
}

// Q8 entra invertida no eixo Operar (spec §5.3): contribuição = 3 − pontos_brutos.
function scoreOperar(quiz: RespostasQuiz): number {
  const contribQ8 = 3 - valorBruto(quiz.q8)
  const soma = valorBruto(quiz.q7) + valorBruto(quiz.q9) + contribQ8
  return normalize((soma / 9) * 100)
}

function scoreEvoluir(quiz: RespostasQuiz): number {
  const soma = valorBruto(quiz.q10) + valorBruto(quiz.q11) + valorBruto(quiz.q12)
  return normalize((soma / 9) * 100)
}

// Eixo Gestão (spec §5.4) — calculado por 3 sinais cruzados.
// Sinal 1: faixa da soma Q1+Q9+Q10.
function sinal1Gestao(quiz: RespostasQuiz): number {
  const soma = valorBruto(quiz.q1) + valorBruto(quiz.q9) + valorBruto(quiz.q10)
  if (soma <= 3) return 0
  if (soma <= 5) return 0.5
  if (soma <= 7) return 0.75
  return 1 // 8-9
}

// Sinal 2: cruzamento Q10 × Q12 (spec §5.4). Decisão A1 do dono: manter spec literal,
// inclusive a combinação Q12=B → 0.6 que parece contra-intuitiva mas é intencional.
function sinal2Gestao(quiz: RespostasQuiz): number {
  const q10 = quiz.q10
  const q12 = quiz.q12
  // Q10 = D
  if (q10 === 'D') {
    if (q12 === 'A' || q12 === 'B') return 0
    return 1 // q12 = C ou D
  }
  // Q10 = C (qualquer Q12)
  if (q10 === 'C') return 0.5
  // Q10 = A ou B
  if (q12 === 'A') return 0.75
  if (q12 === 'B') return 0.6
  // q12 = C ou D
  return 0.85
}

// Sinal 3: faixa da soma Q2+Q11.
function sinal3Gestao(quiz: RespostasQuiz): number {
  const soma = valorBruto(quiz.q2) + valorBruto(quiz.q11)
  if (soma <= 2) return 0
  if (soma <= 4) return 0.5
  return 1 // 5-6
}

function scoreGestao(quiz: RespostasQuiz): number {
  const s1 = sinal1Gestao(quiz)
  const s2 = sinal2Gestao(quiz)
  const s3 = sinal3Gestao(quiz)
  return normalize((s1 + s2 + s3) * 33.33)
}

export function calcularCamada1(quiz: RespostasQuiz): ResultadoCamada1 {
  const score_diagnosticar = scoreDiagnosticar(quiz)
  const score_estruturar = scoreEstruturar(quiz)
  const score_operar = scoreOperar(quiz)
  const score_evoluir = scoreEvoluir(quiz)
  const score_gestao = scoreGestao(quiz)
  const score_consolidado = normalize(
    (score_diagnosticar + score_estruturar + score_operar + score_evoluir + score_gestao) / 5,
  )
  const faixas_eixos: FaixasEixos = {
    diagnosticar: faixaMaturidade(score_diagnosticar),
    estruturar: faixaMaturidade(score_estruturar),
    operar: faixaMaturidade(score_operar),
    evoluir: faixaMaturidade(score_evoluir),
    gestao: faixaMaturidade(score_gestao),
  }
  return {
    score_diagnosticar,
    score_estruturar,
    score_operar,
    score_evoluir,
    score_gestao,
    score_consolidado,
    faixa_consolidada: faixaMaturidade(score_consolidado),
    faixas_eixos,
  }
}

// ──────────────────────────────────────────────────────────
// API LEGADA (v0) — mantida para a etapa-2 route atual.
// Será removida na Sprint 2 quando a API for migrada para `calcularDiagnostico`.
// ──────────────────────────────────────────────────────────

export type NivelFit = 'alto' | 'medio' | 'baixo'
export type NivelMaturidade = 'em-construcao' | 'em-operacao' | 'em-otimizacao'

export interface Resposta {
  question_id: string
  pilar: Pilar
  peso: number
  valor: number
  max_valor: number
}

export interface ScoreResult {
  score_total: number
  score_diagnosticar: number
  score_estruturar: number
  score_operar: number
  score_evoluir: number
  nivel_fit: NivelFit
  pilar_mais_fraco: Pilar
}

function calcPilarScoreLegacy(respostas: Resposta[], pilar: Pilar): number {
  const do_pilar = respostas.filter((r) => r.pilar === pilar)
  if (do_pilar.length === 0) return 0
  const obtido = do_pilar.reduce((sum, r) => sum + r.valor * r.peso, 0)
  const maximo = do_pilar.reduce((sum, r) => sum + r.max_valor * r.peso, 0)
  if (maximo === 0) return 0
  return Math.round((obtido / maximo) * 100)
}

function calcNivelFitLegacy(score: number): NivelFit {
  if (score >= 70) return 'alto'
  if (score >= 40) return 'medio'
  return 'baixo'
}

export function calcNivelMaturidade(score: number): NivelMaturidade {
  if (score >= 70) return 'em-otimizacao'
  if (score >= 40) return 'em-operacao'
  return 'em-construcao'
}

export const NIVEL_MATURIDADE_LABELS: Record<NivelMaturidade, string> = {
  'em-construcao': 'Em construção',
  'em-operacao': 'Em operação',
  'em-otimizacao': 'Em otimização',
}

/** @deprecated Use `calcularDiagnostico` de `src/lib/scoring`. Será removido na Sprint 2. */
export function calcularScore(respostas: Resposta[]): ScoreResult {
  const score_diagnosticar = calcPilarScoreLegacy(respostas, 'diagnosticar')
  const score_estruturar = calcPilarScoreLegacy(respostas, 'estruturar')
  const score_operar = calcPilarScoreLegacy(respostas, 'operar')
  const score_evoluir = calcPilarScoreLegacy(respostas, 'evoluir')
  const pilares = ['diagnosticar', 'estruturar', 'operar', 'evoluir'] as Pilar[]
  const pilares_com_dados = [score_diagnosticar, score_estruturar, score_operar, score_evoluir].filter(
    (_, i) => respostas.some((r) => r.pilar === pilares[i]),
  )
  const score_total = pilares_com_dados.length > 0
    ? Math.round(pilares_com_dados.reduce((a, b) => a + b, 0) / pilares_com_dados.length)
    : 0
  const nivel_fit = calcNivelFitLegacy(score_total)
  const scores: Record<Pilar, number> = {
    diagnosticar: score_diagnosticar,
    estruturar: score_estruturar,
    operar: score_operar,
    evoluir: score_evoluir,
  }
  const pilar_mais_fraco = (Object.entries(scores).sort(([, a], [, b]) => a - b)[0][0]) as Pilar
  return {
    score_total,
    score_diagnosticar,
    score_estruturar,
    score_operar,
    score_evoluir,
    nivel_fit,
    pilar_mais_fraco,
  }
}

export type { Eixo }
