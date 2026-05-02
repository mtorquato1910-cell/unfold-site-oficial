export type Pilar = 'diagnosticar' | 'estruturar' | 'operar' | 'evoluir'
export type NivelFit = 'alto' | 'medio' | 'baixo'
export type NivelMaturidade = 'em-construcao' | 'em-operacao' | 'em-otimizacao'

export interface Resposta {
  question_id: string
  pilar: Pilar
  peso: number
  valor: number   // 0–4 (score da opção escolhida)
  max_valor: number // 4 (valor máximo possível para a questão)
}

export interface ScoreResult {
  score_total: number          // 0–100
  score_diagnosticar: number   // 0–100
  score_estruturar: number     // 0–100
  score_operar: number         // 0–100
  score_evoluir: number        // 0–100
  nivel_fit: NivelFit
  pilar_mais_fraco: Pilar
}

function calcPilarScore(respostas: Resposta[], pilar: Pilar): number {
  const do_pilar = respostas.filter((r) => r.pilar === pilar)
  if (do_pilar.length === 0) return 0

  const obtido = do_pilar.reduce((sum, r) => sum + r.valor * r.peso, 0)
  const maximo = do_pilar.reduce((sum, r) => sum + r.max_valor * r.peso, 0)

  if (maximo === 0) return 0
  return Math.round((obtido / maximo) * 100)
}

function calcNivelFit(score: number): NivelFit {
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

export function calcularScore(respostas: Resposta[]): ScoreResult {
  const score_diagnosticar = calcPilarScore(respostas, 'diagnosticar')
  const score_estruturar = calcPilarScore(respostas, 'estruturar')
  const score_operar = calcPilarScore(respostas, 'operar')
  const score_evoluir = calcPilarScore(respostas, 'evoluir')

  const pilares_com_dados = [score_diagnosticar, score_estruturar, score_operar, score_evoluir].filter(
    (_, i) => respostas.some((r) => r.pilar === (['diagnosticar', 'estruturar', 'operar', 'evoluir'] as Pilar[])[i])
  )
  const score_total = pilares_com_dados.length > 0
    ? Math.round(pilares_com_dados.reduce((a, b) => a + b, 0) / pilares_com_dados.length)
    : 0

  const nivel_fit = calcNivelFit(score_total)

  const scores: Record<Pilar, number> = {
    diagnosticar: score_diagnosticar,
    estruturar: score_estruturar,
    operar: score_operar,
    evoluir: score_evoluir,
  }
  const pilar_mais_fraco = (Object.entries(scores).sort(([, a], [, b]) => a - b)[0][0]) as Pilar

  return { score_total, score_diagnosticar, score_estruturar, score_operar, score_evoluir, nivel_fit, pilar_mais_fraco }
}
