/**
 * Schema de validação do formulário do guia (RF-14..RF-17).
 * Reutilizável no client (react-hook-form) e no server (endpoint da Sprint 3).
 */
import { z } from 'zod'
import { isValidPhoneBR } from '@/lib/format/phone-mask'

/** Conta palavras "de verdade" (≥2 letras), ignorando ruído. */
function palavrasValidas(nome: string): number {
  return nome
    .split(' ')
    .filter((w) => w.replace(/[^\p{L}]/gu, '').length >= 2).length
}

export const guiaLeadSchema = z.object({
  // Nome: ≥2 palavras com ≥2 letras cada, máx. 80 chars; normaliza espaços (RF-14, edge cases item 16).
  nome: z
    .string()
    .trim()
    .transform((s) => s.replace(/\s+/g, ' '))
    .refine((v) => v.length >= 2, 'Informe seu nome completo')
    .refine((v) => v.length <= 80, 'Máximo de 80 caracteres')
    .refine((v) => palavrasValidas(v) >= 2, 'Informe nome e sobrenome'),

  // E-mail RFC (zod cobre o essencial do RFC 5322 prático) (RF-14).
  email: z.string().trim().toLowerCase().email('E-mail inválido'),

  // Telefone BR: 10 (fixo) ou 11 (celular) dígitos (RF-14/RF-17, item 16).
  telefone: z
    .string()
    .refine(isValidPhoneBR, 'Telefone inválido — informe DDD + número'),

  // Perfil obrigatório (RF-14/RF-15).
  perfil: z.enum(['candidato', 'equipe-campanha', 'setor', 'outro'], {
    errorMap: () => ({ message: 'Selecione uma opção' }),
  }),
})

export type GuiaLeadInput = z.input<typeof guiaLeadSchema>
export type GuiaLeadParsed = z.output<typeof guiaLeadSchema>

/**
 * Schema do formulário de Consultoria (#contato). Sem perfil/turnstile — campos
 * livres de organização/cargo e mensagem. Reutilizável no client e no endpoint
 * /api/guia-eleicoes/consultoria.
 */
export const consultoriaSchema = z.object({
  nome: z
    .string()
    .trim()
    .transform((s) => s.replace(/\s+/g, ' '))
    .refine((v) => v.length >= 2, 'Informe seu nome completo')
    .refine((v) => v.length <= 80, 'Máximo de 80 caracteres')
    .refine((v) => palavrasValidas(v) >= 2, 'Informe nome e sobrenome'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  telefone: z.string().refine(isValidPhoneBR, 'Telefone inválido — informe DDD + número'),
  organizacao: z.string().trim().max(120, 'Máximo de 120 caracteres').optional().or(z.literal('')),
  mensagem: z.string().trim().max(2000, 'Máximo de 2000 caracteres').optional().or(z.literal('')),
})

export type ConsultoriaInput = z.input<typeof consultoriaSchema>
export type ConsultoriaParsed = z.output<typeof consultoriaSchema>
