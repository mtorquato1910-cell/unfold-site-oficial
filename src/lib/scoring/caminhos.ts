// Mapping de padrões → caminhos de melhoria (spec §8).

import type {
  CodigoCaminho,
  CodigoInsight,
  CodigoPadrao,
  Eixo,
  ResultadoCamada1,
} from './types'
import { PADRAO_NEUTRO } from './types'

// Caminho prioritário por padrão (spec §8.1).
const MAP_PRIORITARIO: Record<CodigoPadrao, CodigoCaminho> = {
  P1: 'C1',
  P2: 'C2',
  P3: 'C1',
  P4: 'C3',
  P5: 'C5',
  P6: 'C2',
  P7: 'C1',
  P8: 'C4',
}

// Caminho secundário por padrão (spec §8.1). P5 não tem secundário definido (—).
const MAP_SECUNDARIO: Record<CodigoPadrao, CodigoCaminho | null> = {
  P1: 'C5',
  P2: 'C4',
  P3: 'C4',
  P4: 'C2',
  P5: null,
  P6: 'C3',
  P7: 'C5',
  P8: 'C2',
}

// Fallback complementar por eixo fraco (mesma lógica de §7.2 estendida).
// Spec não define mapping explícito eixo→caminho; usamos a relação natural:
//   Diagnosticar → C1 (leitura/atribuição)
//   Estruturar   → C2 (CRM/estrutura)
//   Operar       → C3 (resposta/automação)
//   Evoluir      → C5 (ciclos de teste)
//   Gestão       → C4 (alinhamento mkt-vendas)
const MAP_EIXO_CAMINHO: Record<Eixo, CodigoCaminho> = {
  diagnosticar: 'C1',
  estruturar: 'C2',
  operar: 'C3',
  evoluir: 'C5',
  gestao: 'C4',
}

/**
 * Seleciona os 3 caminhos exibidos a partir dos padrões exibidos (§8.2):
 *  1. Para cada padrão, pegar o caminho prioritário.
 *  2. Se duplicar, segundo padrão usa o caminho secundário.
 *  3. Se ainda duplicar, usar caminho complementar do eixo mais fraco.
 *  4. Quando o "padrão" é NEUTRO_POSITIVO, retornar os 3 caminhos de mais alta alavanca
 *     (C1, C2, C5) que valem como sugestão de aprofundamento.
 */
export function selecionarCaminhos(
  padroes: CodigoInsight[],
  camada1: ResultadoCamada1,
): CodigoCaminho[] {
  if (padroes.length === 1 && padroes[0] === PADRAO_NEUTRO) {
    return ['C1', 'C2', 'C5']
  }

  const resultado: CodigoCaminho[] = []
  const padroesReais = padroes.filter((p): p is CodigoPadrao => p !== PADRAO_NEUTRO)

  for (const padrao of padroesReais) {
    let candidato: CodigoCaminho | null = MAP_PRIORITARIO[padrao]
    if (resultado.includes(candidato)) {
      // Tenta secundário
      const sec = MAP_SECUNDARIO[padrao]
      candidato = sec && !resultado.includes(sec) ? sec : null
    }
    if (!candidato) {
      candidato = pegarComplementar(resultado, camada1)
    }
    if (candidato) resultado.push(candidato)
  }

  // Garante 3 itens (caso degenerado).
  while (resultado.length < 3) {
    const comp = pegarComplementar(resultado, camada1)
    if (!comp) break
    resultado.push(comp)
  }

  return resultado.slice(0, 3)
}

// Eixo mais fraco que ainda não teve seu caminho usado.
function pegarComplementar(jaUsados: CodigoCaminho[], camada1: ResultadoCamada1): CodigoCaminho | null {
  const eixosOrdenados: Array<[Eixo, number]> = [
    ['diagnosticar', camada1.score_diagnosticar],
    ['estruturar', camada1.score_estruturar],
    ['operar', camada1.score_operar],
    ['evoluir', camada1.score_evoluir],
    ['gestao', camada1.score_gestao],
  ]
  eixosOrdenados.sort((a, b) => a[1] - b[1]) // mais fraco primeiro

  for (const [eixo] of eixosOrdenados) {
    const caminho = MAP_EIXO_CAMINHO[eixo]
    if (!jaUsados.includes(caminho)) return caminho
  }

  // Último recurso: qualquer caminho ainda não usado em ordem C1..C5.
  for (const c of ['C1', 'C2', 'C3', 'C4', 'C5'] as CodigoCaminho[]) {
    if (!jaUsados.includes(c)) return c
  }
  return null
}
