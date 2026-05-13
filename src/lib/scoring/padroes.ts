// Camada 3 — Padrões cruzados P1–P8.
// Fonte: docs/diagnostico-spec.md v1.0 §7

import type {
  CodigoInsight,
  CodigoPadrao,
  Eixo,
  FaixaMaturidade,
  FaixasEixos,
  ResultadoCamada1,
  RespostasQuiz,
} from './types'
import { PADRAO_NEUTRO } from './types'

// Prioridade base — spec §7.1.
export const PRIORIDADES: Record<CodigoPadrao, number> = {
  P1: 6,
  P2: 7,
  P3: 8,
  P4: 9,
  P5: 5,
  P6: 6,
  P7: 7,
  P8: 8,
}

// Hierarquia total para desempate — spec §7.2.
const HIERARQUIA: CodigoPadrao[] = ['P4', 'P3', 'P8', 'P2', 'P7', 'P1', 'P6', 'P5']
const HIERARQUIA_RANK: Record<CodigoPadrao, number> = HIERARQUIA.reduce(
  (acc, p, i) => ({ ...acc, [p]: i }),
  {} as Record<CodigoPadrao, number>,
)

// Mapping eixo fraco → padrões fallback (spec §7.2).
// Ordenados pelo critério "prioridade base descendente" para escolha determinística.
const FALLBACK_EIXO: Record<Eixo, CodigoPadrao[]> = {
  diagnosticar: ['P3', 'P1'],
  estruturar: ['P8', 'P2'],
  operar: ['P4', 'P6'],
  evoluir: ['P5', 'P7'],
  gestao: [], // sem mapeamento direto na spec
}

const FAIXA_BAIXA: FaixaMaturidade[] = ['critica', 'em-formacao'] // score < 40 ≈ crítica + parte de em-formação

function isLeq(letra: string, ref: string): boolean {
  return letra.charCodeAt(0) <= ref.charCodeAt(0)
}

function isGeq(letra: string, ref: string): boolean {
  return letra.charCodeAt(0) >= ref.charCodeAt(0)
}

// Verifica acionamento de cada padrão (spec §7.1).
export function verificarPadroes(
  quiz: RespostasQuiz,
  camada1: ResultadoCamada1,
): CodigoPadrao[] {
  const acionados: CodigoPadrao[] = []

  // P1 — Atribuição cega: Q2 ≤ B e Q6 ≥ C
  if (isLeq(quiz.q2, 'B') && isGeq(quiz.q6, 'C')) acionados.push('P1')

  // P2 — CRM órfão: Q3 = B e Q5 ≤ B
  if (quiz.q3 === 'B' && isLeq(quiz.q5, 'B')) acionados.push('P2')

  // P3 — Funil sem leitura: Q4 = E e Q11 ≤ B
  if (quiz.q4 === 'E' && isLeq(quiz.q11, 'B')) acionados.push('P3')

  // P4 — Resposta lenta: Q7 ≤ B e Q8 ≥ C
  if (isLeq(quiz.q7, 'B') && isGeq(quiz.q8, 'C')) acionados.push('P4')

  // P5 — Cultura sem prática: Q10 = D e Q12 ≤ B
  if (quiz.q10 === 'D' && isLeq(quiz.q12, 'B')) acionados.push('P5')

  // P6 — Mídia desconectada: Q9 ≤ B e Q3 ≤ B
  if (isLeq(quiz.q9, 'B') && isLeq(quiz.q3, 'B')) acionados.push('P6')

  // P7 — Operação madura, leitura imatura: score_Operar ≥ 60 e score_Diagnosticar ≤ 40
  if (camada1.score_operar >= 60 && camada1.score_diagnosticar <= 40) acionados.push('P7')

  // P8 — Vendas resolvendo o que marketing não entrega: Q4 ≤ B e Q5 ≤ B
  // (E é tratado como A para comparações ≤, então E ≤ B é true)
  if ((quiz.q4 === 'E' || isLeq(quiz.q4, 'B')) && isLeq(quiz.q5, 'B')) acionados.push('P8')

  return acionados
}

// Seleciona top 3 padrões — ordem: prioridade base desc, depois hierarquia para desempate (spec §7.2).
function selecionarTop3(acionados: CodigoPadrao[]): CodigoPadrao[] {
  const ordenados = [...acionados].sort((a, b) => {
    const diff = PRIORIDADES[b] - PRIORIDADES[a]
    if (diff !== 0) return diff
    return HIERARQUIA_RANK[a] - HIERARQUIA_RANK[b]
  })
  return ordenados.slice(0, 3)
}

// Fallback: se < 3 padrões selecionados, completar pelos eixos com score < 40.
function completarFallback(
  parciais: CodigoPadrao[],
  camada1: ResultadoCamada1,
): CodigoPadrao[] {
  if (parciais.length >= 3) return parciais
  const resultado = [...parciais]
  const eixosBaixos: Eixo[] = (
    Object.entries({
      diagnosticar: camada1.score_diagnosticar,
      estruturar: camada1.score_estruturar,
      operar: camada1.score_operar,
      evoluir: camada1.score_evoluir,
      gestao: camada1.score_gestao,
    }) as Array<[Eixo, number]>
  )
    .filter(([, s]) => s < 40)
    .sort(([, a], [, b]) => a - b) // mais fraco primeiro
    .map(([eixo]) => eixo)

  for (const eixo of eixosBaixos) {
    if (resultado.length >= 3) break
    for (const padrao of FALLBACK_EIXO[eixo]) {
      if (resultado.length >= 3) break
      if (!resultado.includes(padrao)) resultado.push(padrao)
    }
  }
  return resultado
}

/**
 * Determina os padrões exibidos (top 3) considerando:
 * 1. acionados por condição rígida (§7.1);
 * 2. fallback por eixo fraco se < 3 (§7.2);
 * 3. padrão neutro positivo se 0 acionados E 0 fallback.
 */
export function calcularCamada3Padroes(
  quiz: RespostasQuiz,
  camada1: ResultadoCamada1,
): { acionados: CodigoPadrao[]; exibidos: CodigoInsight[] } {
  const acionados = verificarPadroes(quiz, camada1)
  const top3 = selecionarTop3(acionados)
  const completos = completarFallback(top3, camada1)
  if (completos.length === 0) {
    return { acionados, exibidos: [PADRAO_NEUTRO] }
  }
  return { acionados, exibidos: completos.slice(0, 3) }
}

// Re-export do tipo `FaixaMaturidade` usado em fallback (mantém superfície pública limpa).
export type { FaixaMaturidade, FaixasEixos }
export { FAIXA_BAIXA }
