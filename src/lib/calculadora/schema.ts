/**
 * Schemas Zod compartilhados (ADR-6) — usados por useCalculadora (client)
 * e pela API /api/calculadora (server). Fonte única de validação.
 *
 * Módulo puro (ADR-1): só importa `zod` e `./types`.
 */

import { z } from 'zod'
import type {
  CalculadoraInputs,
  Canal,
  Etapa1,
  InsightId,
  Modelo,
  Periodo,
  Premissas,
  Resultado,
  Setor,
} from './types'

export const setorSchema: z.ZodType<Setor> = z.enum([
  'construcao',
  'agro',
  'saas',
  'automotivo',
  'industria',
  'servicos_b2b',
  'outro',
])

export const canalSchema: z.ZodType<Canal> = z.enum(['google', 'meta', 'linkedin'])

export const modeloSchema: z.ZodType<Modelo> = z.enum(['b2b', 'b2c'])

export const periodoSchema: z.ZodType<Periodo> = z.union([
  z.literal(3),
  z.literal(6),
  z.literal(12),
])

export const etapa1Schema: z.ZodType<Etapa1> = z.object({
  nome: z.string().trim().min(3, 'Nome obrigatório (mín. 3 caracteres)'),
  email: z.string().trim().email('E-mail inválido'),
  empresa: z.string().trim().min(2, 'Empresa obrigatória (mín. 2 caracteres)'),
  setor: setorSchema,
  // Telefone (WhatsApp) obrigatório — exige 10 ou 11 dígitos (com ou sem máscara).
  telefone: z
    .string({ required_error: 'Informe seu WhatsApp com DDD' })
    .trim()
    .min(1, 'Informe seu WhatsApp com DDD')
    .refine(
      (v) => /^\D*(\d\D*){10,11}$/.test(v),
      'Telefone deve ter 10 ou 11 dígitos',
    ),
})

export const inputsSchema: z.ZodType<CalculadoraInputs> = z.object({
  investimento_mensal: z
    .number()
    .min(1000, 'Investimento mínimo R$ 1.000')
    .max(500000, 'Investimento máximo R$ 500.000'),
  canais: z.array(canalSchema).min(1, 'Selecione ao menos 1 canal'),
  ticket_medio: z.number().min(1000, 'Ticket mínimo R$ 1.000'),
  modelo: modeloSchema,
  periodo: periodoSchema,
  crm_funcional: z.boolean(),
})

export const premissasSchema: z.ZodType<Premissas> = z.object({
  cpl: z.number().min(30).max(800),
  taxa_qualificacao: z.number().min(0.05).max(0.8),
  conversao_mql_cliente: z.number().min(0.01).max(0.5),
  ciclo_dias: z.number().int().min(7).max(365),
})

export const resultadoSchema: z.ZodType<Resultado> = z.object({
  investimento_total: z.number(),
  leads_gerados: z.number(),
  mqls: z.number(),
  clientes_fechados: z.number(),
  fator_temporal: z.number(),
  clientes_no_periodo: z.number(),
  clientes_em_pipeline: z.number(),
  receita_no_periodo: z.number(),
  receita_em_pipeline: z.number(),
  roi_no_periodo: z.number(),
  roi_total: z.number(),
})

export const insightIdSchema: z.ZodType<InsightId> = z.enum(['I-A', 'I-B', 'I-C', 'I-D'])

export const consentSchema = z.object({
  given: z.literal(true, {
    errorMap: () => ({ message: 'Consentimento obrigatório' }),
  }),
  timestamp: z.string().datetime().optional(),
  policyVersion: z.string().default('v1.0'),
})

/**
 * Payload completo de submissão da API POST /api/calculadora.
 * O servidor recalcula `resultado` e `insight` por defesa (ADR-7).
 */
export const submissaoSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{32}$/, 'Token UUID v4 (32 hex) inválido'),
  etapa1: etapa1Schema,
  inputs: inputsSchema,
  premissas: premissasSchema,
  premissas_editadas: z.boolean().default(false),
  resultado: resultadoSchema,
  insight: z.object({
    principal: insightIdSchema,
    override_ie: z.boolean(),
  }),
  consent: consentSchema,
})

export type Submissao = z.infer<typeof submissaoSchema>
