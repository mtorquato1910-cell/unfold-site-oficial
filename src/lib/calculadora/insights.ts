/**
 * Motor de seleção e biblioteca de textos dos insights (I-A a I-E).
 *
 * Fonte canônica: docs/calculadora-v2/_spec_raw.txt §7.2.
 * Textos copiados caractere a caractere (proibido editar sem alinhamento estratégico).
 *
 * Módulo puro (ADR-1).
 */

import type { InsightId, SelecaoInsight } from './types'

export interface InsightTexto {
  id: InsightId | 'I-E'
  titulo: string
  /** Frase de abertura em destaque (1 linha). */
  manchete: string
  /** Texto principal (70-90 palavras). */
  corpo: string
}

export const INSIGHT_IA: InsightTexto = {
  id: 'I-A',
  titulo: 'Sistema validado, evolução é a próxima alavanca',
  manchete: 'Sua operação tem fundação para crescer — o próximo nível é otimização, não construção.',
  corpo:
    'Com CRM funcional, sua taxa de aproveitamento da demanda gerada está dentro do que vendas complexas brasileiras conseguem entregar quando operam com sistema mínimo no lugar. O ROI positivo no período mostra que a engrenagem básica está funcionando — investimento entra, lead vira oportunidade, oportunidade vira receita. O ponto de atenção é diferente para operações neste estágio: o limite não é mais "fazer o sistema funcionar", é operar o sistema com inteligência de evolução. Empresas que ficam paradas neste patamar tendem a tratar marketing como linha de custo recorrente. Empresas que avançam tratam marketing como sistema que aprende e melhora ciclo após ciclo.',
}

export const INSIGHT_IB: InsightTexto = {
  id: 'I-B',
  titulo: 'Investimento incompatível com o sistema atual',
  manchete: 'Você tem o sistema certo, mas a calibração ainda não fecha a conta.',
  corpo:
    'Sua operação tem CRM funcional, o que significa que a base estrutural existe. Mesmo assim, o cálculo aponta retorno negativo no período projetado — isso normalmente significa que uma de três variáveis está fora do ponto: ticket médio baixo para sustentar o CPL do setor, ciclo de venda longo demais para a janela de projeção, ou taxa de qualificação ainda imatura mesmo com CRM no lugar. O resultado não diz que sua operação está errada. Diz que as alavancas precisam ser recalibradas — geralmente em ticket, qualificação ou estratégia de canal. Sistema com CRM mas com calibração errada queima caixa silenciosamente; a leitura honesta é o que evita isso.',
}

export const INSIGHT_IC: InsightTexto = {
  id: 'I-C',
  titulo: 'Resultado bom, mas frágil sem CRM',
  manchete: 'O cálculo deu positivo, mas sua operação ainda não tem o que sustenta esse resultado.',
  corpo:
    'Sua operação não conta com CRM funcional, e mesmo assim o cálculo projeta retorno positivo no período. Isso pode acontecer em três cenários: ticket médio muito alto compensando a perda de eficiência, ciclo curto reduzindo o impacto da falta de qualificação, ou simulação otimista das premissas editáveis. O ponto crítico não é o ROI calculado — é a fragilidade do resultado. Operações que entregam resultado sem CRM funcional dependem de fatores externos (poucos leads de alta intenção, vendedor sênior cobrindo o gap, sorte de timing). Quando esses fatores oscilam, o resultado oscila junto. Em vendas complexas, previsibilidade só nasce de sistema — não de execução individual brilhante.',
}

export const INSIGHT_ID: InsightTexto = {
  id: 'I-D',
  titulo: 'O cálculo expõe o problema estrutural',
  manchete: 'O problema não está no investimento. Está no sistema que recebe o lead.',
  corpo:
    'Você está investindo em mídia para alimentar uma operação que ainda não tem CRM funcional como destino. O cálculo expõe a consequência direta: leads são gerados, mas a taxa de aproveitamento cai pela metade quando comparada a operações com CRM no lugar. O resultado é investimento que entra como custo e não retorna como receita. A leitura óbvia seria: "preciso investir mais". A leitura correta é: preciso estruturar antes de investir mais. Em vendas complexas, aumentar verba sobre um sistema frágil acelera o problema em vez de resolvê-lo — porque o gargalo não é volume de leads, é capacidade de transformar lead em receita.',
}

export const INSIGHT_IE: InsightTexto = {
  id: 'I-E',
  titulo: 'Sua receita real está no pipeline',
  manchete: 'A leitura do período curto esconde o resultado real desta operação.',
  corpo:
    'Sua operação tem ciclo de venda mais longo do que a janela projetada, o que significa que a maior parte da receita gerada pelo investimento aparece como pipeline futuro, não como receita realizada no período. Em vendas complexas, esse padrão é regra, não exceção — e é por isso que ler ROI apenas no período pode levar a decisões erradas, como cortar verba de mídia justamente quando ela está construindo pipeline que vai converter nos próximos trimestres. O número que importa para decisões de investimento em B2B com ciclo longo é o ROI total (com pipeline), não o ROI no período. Operações que decidem por ROI no período tendem a oscilar entre investimento e corte, criando ciclos de vai-e-vem que destroem a previsibilidade que B2B exige.',
}

export const INSIGHTS_BY_ID: Record<InsightId | 'I-E', InsightTexto> = {
  'I-A': INSIGHT_IA,
  'I-B': INSIGHT_IB,
  'I-C': INSIGHT_IC,
  'I-D': INSIGHT_ID,
  'I-E': INSIGHT_IE,
}

/**
 * Seleciona o insight principal e decide se o override I-E acompanha.
 *
 * Regras (spec §7.1):
 * - I-A: CRM=Sim & ROI_periodo ≥ 0
 * - I-B: CRM=Sim & ROI_periodo < 0
 * - I-C: CRM=Não & ROI_periodo ≥ 0
 * - I-D: CRM=Não & ROI_periodo < 0
 * - I-E (override paralelo): (receita_em_pipeline / receita_no_periodo) > 3
 *   • I-E **acompanha** o principal, nunca substitui.
 *   • Se receita_no_periodo == 0, considera-se override ativo (todo o resultado virou pipeline).
 */
export function selecionarInsight(args: {
  crm_funcional: boolean
  roi_no_periodo: number
  receita_no_periodo: number
  receita_em_pipeline: number
}): SelecaoInsight {
  const { crm_funcional, roi_no_periodo, receita_no_periodo, receita_em_pipeline } = args

  const principal: InsightId =
    crm_funcional && roi_no_periodo >= 0
      ? 'I-A'
      : crm_funcional && roi_no_periodo < 0
        ? 'I-B'
        : !crm_funcional && roi_no_periodo >= 0
          ? 'I-C'
          : 'I-D'

  const override_ie =
    receita_no_periodo <= 0
      ? receita_em_pipeline > 0
      : receita_em_pipeline / receita_no_periodo > 3

  return { principal, override_ie }
}
