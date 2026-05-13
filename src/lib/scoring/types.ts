// Tipos compartilhados do engine de scoring v2.
// Fonte: docs/diagnostico-spec.md v1.0

export type Pilar = 'diagnosticar' | 'estruturar' | 'operar' | 'evoluir'
export type Eixo = Pilar | 'gestao'

export type LetraQuiz = 'A' | 'B' | 'C' | 'D'
export type LetraQ4 = LetraQuiz | 'E' // Q4 é a única com 5 opções

export type Cargo = 'ceo' | 'diretor' | 'gerente' | 'analista' | 'outro'
export type Setor = 'construcao' | 'agro' | 'saas' | 'automotivo' | 'industria' | 'servicos' | 'outro'
export type FaturamentoFaixa = 'ate-50k' | '50k-200k' | '200k-500k' | 'acima-500k' | 'prefiro-nao-informar'
export type Urgencia = 'trimestre' | '6-meses' | 'sem-prazo' | 'pesquisando'

export interface RespostasEtapa1 {
  cargo: Cargo
  setor: Setor
  faturamento_faixa: FaturamentoFaixa
  urgencia: Urgencia
}

export interface RespostasQuiz {
  q1: LetraQuiz
  q2: LetraQuiz
  q3: LetraQuiz
  q4: LetraQ4
  q5: LetraQuiz
  q6: LetraQuiz
  q7: LetraQuiz
  q8: LetraQuiz
  q9: LetraQuiz
  q10: LetraQuiz
  q11: LetraQuiz
  q12: LetraQuiz
}

export type FaixaMaturidade = 'critica' | 'em-formacao' | 'estruturada' | 'madura'
export type FaixaFit = 'fit-alto' | 'fit-medio' | 'fit-baixo' | 'desfit'

export type CodigoPadrao = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8'
export type CodigoCaminho = 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
export const PADRAO_NEUTRO = 'NEUTRO_POSITIVO' as const
export type CodigoInsight = CodigoPadrao | typeof PADRAO_NEUTRO

export interface FaixasEixos {
  diagnosticar: FaixaMaturidade
  estruturar: FaixaMaturidade
  operar: FaixaMaturidade
  evoluir: FaixaMaturidade
  gestao: FaixaMaturidade
}

export interface ResultadoCamada1 {
  score_diagnosticar: number
  score_estruturar: number
  score_operar: number
  score_evoluir: number
  score_gestao: number
  score_consolidado: number
  faixa_consolidada: FaixaMaturidade
  faixas_eixos: FaixasEixos
}

export interface ResultadoCamada2 {
  fit_estrutural: number
  fit_dor: number
  fit_cabeca: number
  fit_urgencia: number
  score_fit: number
  faixa_fit: FaixaFit
}

export interface ResultadoCamada3 {
  padroes_acionados: CodigoPadrao[]
  padroes_exibidos: CodigoInsight[]
  caminhos_exibidos: CodigoCaminho[]
}

export type DiagnosticoCompleto = ResultadoCamada1 & ResultadoCamada2 & ResultadoCamada3

export interface InputDiagnostico {
  etapa1: RespostasEtapa1
  quiz: RespostasQuiz
}
