'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/painel-auth'
import { markAsRead, markAllAsRead } from '@/lib/notifications'

export async function markNotificationRead(notificationId: string) {
  const user = await getSession()
  if (!user) throw new Error('UNAUTHENTICATED')
  await markAsRead(notificationId)
  revalidatePath('/admin')
}

export async function markAllNotificationsRead() {
  const user = await getSession()
  if (!user) throw new Error('UNAUTHENTICATED')
  await markAllAsRead(user.id)
  revalidatePath('/admin')
}
