/**
 * Rotulagem das respostas do Diagnóstico — reutilizado pelo painel admin
 * (exibição) e pelo adapter RD Station (campo consolidado).
 *
 * O quiz salva apenas a letra escolhida (`respostas_raw` = {q1:'B',...}); as
 * perguntas e os textos das alternativas vivem na collection `quiz-questions`.
 * A Etapa 1 (cargo/setor/faturamento/urgência) vive em `respostas_etapa1_raw`.
 *
 * Módulo puro: os mapeamentos de Etapa 1 reaproveitam `rd-mappings`.
 */

import { mapSetor, mapFaturamento, mapUrgencia } from '@/lib/crm/rd-mappings'

export type Letra = 'A' | 'B' | 'C' | 'D' | 'E'
const LETRAS: Letra[] = ['A', 'B', 'C', 'D', 'E']

/** Cargo — enum da Etapa 1 (spec §3). */
export function mapCargo(slug: string | undefined | null): string | undefined {
  if (!slug) return undefined
  switch (slug) {
    case 'ceo':
      return 'CEO / Sócio(a)'
    case 'diretor':
      return 'Diretor(a)'
    case 'gerente':
      return 'Gerente / Head'
    case 'analista':
      return 'Analista / Coordenador(a)'
    case 'outro':
      return 'Outro'
    default:
      return String(slug)
  }
}

/** Shape mínimo de uma pergunta vinda de `quiz-questions`. */
export interface PerguntaQuiz {
  pergunta: string
  pilar?: string
  ordem: number
  opcoes: Array<{ texto: string; valor?: number }>
}

export interface RespostaEtapa1Item {
  label: string
  value: string
}

export interface RespostaQuizItem {
  ordem: number
  pilar?: string
  pergunta: string
  letra: Letra | string
  texto: string
}

/** Converte `respostas_raw` (string JSON ou objeto) em `{q1:'B',...}`. */
export function parseRespostasRaw(raw: unknown): Record<string, string> {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {}
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object') return raw as Record<string, string>
  return {}
}

/** Rótulos legíveis da Etapa 1, a partir de `respostas_etapa1_raw`. */
export function rotularEtapa1(etapa1: unknown): RespostaEtapa1Item[] {
  const e = (etapa1 && typeof etapa1 === 'object' ? etapa1 : {}) as Record<string, unknown>
  const itens: RespostaEtapa1Item[] = []
  const cargo = mapCargo(e.cargo as string | undefined)
  const setor = mapSetor(e.setor as string | undefined)
  const faturamento = mapFaturamento(e.faturamento_faixa as string | undefined)
  const urgencia = mapUrgencia(e.urgencia as string | undefined)
  if (cargo) itens.push({ label: 'Cargo', value: cargo })
  if (setor) itens.push({ label: 'Setor', value: setor })
  if (faturamento) itens.push({ label: 'Faturamento mensal', value: faturamento })
  if (urgencia) itens.push({ label: 'Urgência', value: urgencia })
  return itens
}

/**
 * Cruza as letras salvas com o catálogo de perguntas, devolvendo a resposta
 * legível de cada questão (enunciado + alternativa escolhida).
 */
export function rotularQuiz(
  respostasRaw: unknown,
  perguntas: PerguntaQuiz[],
): RespostaQuizItem[] {
  const respostas = parseRespostasRaw(respostasRaw)
  const ordenadas = [...perguntas].sort((a, b) => a.ordem - b.ordem)
  return ordenadas.map((p) => {
    const letra = respostas[`q${p.ordem}`] ?? ''
    const idx = LETRAS.indexOf(letra as Letra)
    const opcao = idx >= 0 ? p.opcoes?.[idx] : undefined
    return {
      ordem: p.ordem,
      pilar: p.pilar,
      pergunta: p.pergunta,
      letra,
      texto: opcao?.texto ?? (letra ? `Alternativa ${letra}` : '—'),
    }
  })
}

/**
 * Monta o texto consolidado das respostas para o campo único do RD Station
 * (`cf_respostas_diagnostico`). Ex.:
 *
 *   ETAPA 1
 *   Cargo: Diretor(a)
 *   Setor: Indústria
 *   ...
 *
 *   QUESTIONÁRIO
 *   Q1 (Diagnosticar): <pergunta>
 *   → B. <texto da alternativa>
 */
export function montarRespostasConsolidadas(
  respostasRaw: unknown,
  etapa1: unknown,
  perguntas: PerguntaQuiz[],
): string {
  const blocos: string[] = []

  const e1 = rotularEtapa1(etapa1)
  if (e1.length > 0) {
    blocos.push(['ETAPA 1', ...e1.map((i) => `${i.label}: ${i.value}`)].join('\n'))
  }

  const quiz = rotularQuiz(respostasRaw, perguntas)
  if (quiz.length > 0) {
    const linhas = quiz.map((q) => {
      const pilar = q.pilar ? ` (${q.pilar})` : ''
      return `Q${q.ordem}${pilar}: ${q.pergunta}\n→ ${q.letra ? q.letra + '. ' : ''}${q.texto}`
    })
    blocos.push(['QUESTIONÁRIO', ...linhas].join('\n'))
  }

  return blocos.join('\n\n')
}
