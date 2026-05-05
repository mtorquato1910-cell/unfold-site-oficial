'use server'

import { revalidatePath } from 'next/cache'
import { requireRole, adminUpdateUserRole, type PainelRole } from '@/lib/painel-auth'

export async function updateUserRole(userId: string, role: PainelRole) {
  const me = await requireRole('admin')

  // Bloqueio: não pode mudar o próprio role (impede self-demote/promote)
  if (me.id === userId) {
    throw new Error('Você não pode alterar o seu próprio role.')
  }

  if (role !== 'admin' && role !== 'editor') {
    throw new Error('Role inválido')
  }

  await adminUpdateUserRole(userId, role)
  revalidatePath('/admin/users')
  return { ok: true }
}
