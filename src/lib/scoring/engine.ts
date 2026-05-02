export type Pilar = 'diagnosticar' | 'estruturar' | 'operar'
export type NivelFit = 'alto' | 'medio' | 'baixo'

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

export function calcularScore(respostas: Resposta[]): ScoreResult {
  const score_diagnosticar = calcPilarScore(respostas, 'diagnosticar')
  const score_estruturar = calcPilarScore(respostas, 'estruturar')
  const score_operar = calcPilarScore(respostas, 'operar')

  const score_total = Math.round((score_diagnosticar + score_estruturar + score_operar) / 3)
  const nivel_fit = calcNivelFit(score_total)

  const scores: Record<Pilar, number> = {
    diagnosticar: score_diagnosticar,
    estruturar: score_estruturar,
    operar: score_operar,
  }
  const pilar_mais_fraco = (Object.entries(scores).sort(([, a], [, b]) => a - b)[0][0]) as Pilar

  return { score_total, score_diagnosticar, score_estruturar, score_operar, nivel_fit, pilar_mais_fraco }
}
