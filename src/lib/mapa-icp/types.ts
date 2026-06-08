/**
 * Tipos do Radar de Comitê de Compra (Mapa de ICP & Comitê).
 * Ver PRD_Mapa_ICP_Comite_de_Compra (ferramenta) e System_Prompt_IA.
 */

export type TicketRange = '<5k' | '5-20k' | '20-50k' | '50-200k' | '200k+'
export type Ciclo = '<30d' | '30-60d' | '60-120d' | '120d+'
export type Modelo = 'B2B' | 'B2C' | 'Hibrido'
export type NDecisores = '1' | '2-3' | '4-6' | '7+'
export type Maturidade = 'nao' | 'informal' | 'documentado'
export type RoleId =
  | 'ceo' | 'cfo' | 'cmo' | 'cro' | 'ti' | 'tecnica' | 'compras' | 'juridico'
export type FitTier = 'fit_alto' | 'fit_medio' | 'fit_baixo'

/** Respostas das 13 perguntas + captura. */
export interface MapaIcpAnswers {
  A1: string
  A2: string
  A3: TicketRange
  A4: Ciclo
  A5: Modelo
  B1: string
  B2: string[]
  B3: string
  C1: NDecisores
  C2: RoleId[]
  C3: RoleId
  D1: string[]
  D2: Maturidade
}

export interface MapaIcpCapture {
  nome: string
  email: string
  empresa: string
  cargo: string
  telefone?: string
}

export interface FitResult {
  fit_score: number
  fit_tier: FitTier
  breakdown: Record<string, number>
}

/** Contrato de saída da IA (System_Prompt §FORMATO DE SAÍDA). */
export interface ComiteItem {
  papel: string
  tem_veto: boolean
  prioriza: string
  o_que_convence: string
  o_que_trava: string
  angulo_mensagem: string
}

export interface MapaIcpAIResult {
  icp_estrutural: { resumo: string; atributos_fit: string[] }
  anti_icp: { resumo: string; sinais_desfit: string[] }
  maturidade_icp: { nivel: 'inicial' | 'intermediario' | 'avancado'; leitura: string }
  comite: ComiteItem[]
  proximo_passo: string
}
