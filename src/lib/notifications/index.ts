/**
 * Notifications helpers — cria notificações in-app + lê pendentes para o sino do header.
 */

export type NotificationType =
  | 'post.in_review'
  | 'post.approved'
  | 'post.rejected'
  | 'post.published'
  | 'lead.new'
  | 'lead.assigned'
  | 'diagnostico.completed'
  | 'system'

export type CreateNotificationInput = {
  userId: string
  type: NotificationType
  title: string
  message?: string
  link?: string
  metadata?: Record<string, unknown>
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    const { getPayload } = await import('payload')
    const config = (await import('../../../payload.config')).default
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'notifications',
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        metadata: input.metadata,
        read: false,
      },
    })
  } catch (err) {
    console.error('[notifications] Falha ao criar:', err)
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { getPayload } = await import('payload')
    const config = (await import('../../../payload.config')).default
    const payload = await getPayload({ config })
    const result = await payload.count({
      collection: 'notifications',
      where: { and: [{ userId: { equals: userId } }, { read: { equals: false } }] },
    })
    return result.totalDocs
  } catch {
    return 0
  }
}

export async function listRecentNotifications(userId: string, limit = 10) {
  try {
    const { getPayload } = await import('payload')
    const config = (await import('../../../payload.config')).default
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'notifications',
      where: { userId: { equals: userId } },
      sort: '-createdAt',
      limit,
    })
    return result.docs
  } catch {
    return []
  }
}

export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const { getPayload } = await import('payload')
    const config = (await import('../../../payload.config')).default
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'notifications',
      id: notificationId,
      data: { read: true },
    })
  } catch (err) {
    console.error('[notifications] markAsRead falhou:', err)
  }
}

export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const { getPayload } = await import('payload')
    const config = (await import('../../../payload.config')).default
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'notifications',
      where: { and: [{ userId: { equals: userId } }, { read: { equals: false } }] },
      data: { read: true },
    })
  } catch (err) {
    console.error('[notifications] markAllAsRead falhou:', err)
  }
}
