/** Validação do payload do POST /api/mapa-icp. */
import { z } from 'zod'

export const answersSchema = z.object({
  A1: z.string().min(1).max(500),
  A2: z.string().min(1).max(500),
  A3: z.enum(['<5k', '5-20k', '20-50k', '50-200k', '200k+']),
  A4: z.enum(['<30d', '30-60d', '60-120d', '120d+']),
  A5: z.enum(['B2B', 'B2C', 'Hibrido']),
  B1: z.string().min(1).max(1000),
  B2: z.array(z.string()).min(1),
  B3: z.string().min(1).max(1000),
  C1: z.enum(['1', '2-3', '4-6', '7+']),
  C2: z.array(z.string()).min(1),
  C3: z.string().min(1),
  D1: z.array(z.string()).min(1),
  D2: z.enum(['nao', 'informal', 'documentado']),
})

export const mapaIcpSubmissaoSchema = z.object({
  answers: answersSchema,
  capture: z.object({
    nome: z.string().min(1).max(120),
    email: z.string().email(),
    empresa: z.string().min(1).max(160),
    cargo: z.string().min(1).max(120),
    telefone: z.string().max(40).optional().or(z.literal('')),
  }),
  consent: z.object({
    given: z.literal(true),
    policyVersion: z.string().default('v1'),
  }),
  utm: z.record(z.string(), z.string()).optional(),
})

export type MapaIcpSubmissao = z.infer<typeof mapaIcpSubmissaoSchema>
