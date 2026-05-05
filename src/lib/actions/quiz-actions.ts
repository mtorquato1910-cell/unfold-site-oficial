'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

type FlexibleData = Record<string, any>

const PILAR_MAP: Record<string, string> = {
  diagnosticar: 'diagnosticar',
  estruturar: 'estruturar',
  operar: 'operar',
  evoluir: 'evoluir',
  // Aliases inglês → PT-BR
  diagnosing: 'diagnosticar',
  structuring: 'estruturar',
  operating: 'operar',
  evolving: 'evoluir',
}

function mapQuizQuestion(input: FlexibleData) {
  // Schema real: pergunta, pilar, peso, ordem, opcoes[{texto, valor}], ativo, nota_interna
  const pergunta = input.pergunta ?? input.text ?? input.question ?? ''
  const pilar = PILAR_MAP[input.pilar ?? input.dimension ?? input.pillar ?? 'diagnosticar'] ?? 'diagnosticar'
  const peso = input.peso ?? input.weight ?? 1
  const ordem = input.ordem ?? input.order ?? 0
  const ativo = input.ativo ?? input.active ?? true
  const nota_interna = input.nota_interna ?? input.notes ?? input.note ?? undefined

  // Opções: aceita array de strings (legado) ou objetos {texto, valor} ou {label, value}
  let opcoes: Array<{ texto: string; valor: number }> = []
  const optsInput = input.opcoes ?? input.options ?? input.choices ?? []
  if (Array.isArray(optsInput)) {
    opcoes = optsInput
      .map((o: any) => {
        if (typeof o === 'string') return { texto: o, valor: 0 }
        if (typeof o === 'object') {
          return {
            texto: o.texto ?? o.label ?? o.text ?? '',
            valor: typeof o.valor === 'number' ? o.valor : typeof o.value === 'number' ? o.value : 0,
          }
        }
        return { texto: '', valor: 0 }
      })
      .filter((o) => o.texto)
  }

  return { pergunta, pilar, peso, ordem, ativo, opcoes, nota_interna }
}

export async function createQuizQuestion(input: FlexibleData) {
  await requireRole('editor')
  const data = mapQuizQuestion(input)
  if (!data.pergunta?.trim()) throw new Error('Pergunta obrigatória')

  const payload = await getPayload({ config })
  const created = await payload.create({ collection: 'quiz-questions', data: data as any })
  revalidatePath('/admin/quiz')
  revalidatePath('/diagnostico')
  return { ok: true, id: created.id }
}

export async function updateQuizQuestion(id: string, input: FlexibleData) {
  await requireRole('editor')
  const data = mapQuizQuestion(input)
  const payload = await getPayload({ config })
  await payload.update({ collection: 'quiz-questions', id, data: data as any })
  revalidatePath('/admin/quiz')
  revalidatePath('/diagnostico')
  return { ok: true }
}

export async function deleteQuizQuestion(id: string) {
  await requireRole('admin')
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'quiz-questions', id })
  revalidatePath('/admin/quiz')
  revalidatePath('/diagnostico')
  return { ok: true }
}
