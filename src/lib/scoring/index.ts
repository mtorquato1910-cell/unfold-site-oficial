// Orquestrador do diagnóstico v2. Roda as 3 camadas em sequência e devolve o resultado completo.

import { selecionarCaminhos } from './caminhos'
import { calcularCamada1 } from './engine'
import { calcularCamada2 } from './fit'
import { calcularCamada3Padroes } from './padroes'
import type { DiagnosticoCompleto, InputDiagnostico } from './types'

export function calcularDiagnostico(input: InputDiagnostico): DiagnosticoCompleto {
  const camada1 = calcularCamada1(input.quiz)
  const camada2 = calcularCamada2(input.etapa1, input.quiz, camada1.score_gestao)
  const { acionados, exibidos } = calcularCamada3Padroes(input.quiz, camada1)
  const caminhos = selecionarCaminhos(exibidos, camada1)

  return {
    ...camada1,
    ...camada2,
    padroes_acionados: acionados,
    padroes_exibidos: exibidos,
    caminhos_exibidos: caminhos,
  }
}

export * from './types'
export { calcularCamada1, valorBruto, faixaMaturidade } from './engine'
export { calcularCamada2 } from './fit'
export { calcularCamada3Padroes, verificarPadroes, PRIORIDADES } from './padroes'
export { selecionarCaminhos } from './caminhos'
export {
  CTA_POR_FAIXA,
  FRASES_EIXOS,
  FRASE_FAIXA_CONSOLIDADA,
  LABEL_EIXO,
  LABEL_FAIXA,
  LABEL_FAIXA_FIT,
  TEXTO_PADRAO_NEUTRO,
  TEXTOS_CAMINHOS,
  TEXTOS_PADROES,
  textoPadrao,
} from './textos'
