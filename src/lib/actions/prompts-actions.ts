'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

type FlexibleData = Record<string, any>

/**
 * AIPrompts actions com mapping inglês → PT-BR.
 * Schema real: nome, tipo, system_prompt, user_prompt_template, modelo, temperatura,
 * max_tokens, versao, ativo, notas
 */

function mapPrompt(input: FlexibleData) {
  return {
    nome: input.nome ?? input.name ?? '',
    tipo: input.tipo ?? input.type ?? 'diagnostico',
    system_prompt:
      input.system_prompt ?? input.systemPrompt ?? input.template ?? input.system ?? '',
    user_prompt_template:
      input.user_prompt_template ??
      input.userPrompt ??
      input.user_template ??
      input.user ??
      '',
    modelo: input.modelo ?? input.model ?? 'anthropic/claude-sonnet-4-5',
    temperatura:
      typeof input.temperatura === 'number'
        ? input.temperatura
        : typeof input.temperature === 'number'
          ? input.temperature
          : 0.7,
    max_tokens:
      typeof input.max_tokens === 'number'
        ? input.max_tokens
        : typeof input.maxTokens === 'number'
          ? input.maxTokens
          : 1500,
    versao: typeof input.versao === 'number' ? input.versao : input.version ?? 1,
    ativo: input.ativo ?? input.active ?? true,
    notas: input.notas ?? input.notes ?? undefined,
  }
}

export async function createPrompt(input: FlexibleData) {
  await requireRole('admin')
  const data = mapPrompt(input)
  if (!data.nome?.trim()) throw new Error('Nome obrigatório')
  if (!data.system_prompt?.trim()) throw new Error('System prompt obrigatório')

  const payload = await getPayload({ config })
  const created = await payload.create({ collection: 'ai-prompts', data: data as any })
  revalidatePath('/admin/prompts')
  return { ok: true, id: created.id }
}

export async function updatePrompt(id: string, input: FlexibleData) {
  await requireRole('admin')
  const data = mapPrompt(input)
  const payload = await getPayload({ config })
  await payload.update({ collection: 'ai-prompts', id, data: data as any })
  revalidatePath('/admin/prompts')
  return { ok: true }
}

export async function deletePrompt(id: string) {
  await requireRole('admin')
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'ai-prompts', id })
  revalidatePath('/admin/prompts')
  return { ok: true }
}
