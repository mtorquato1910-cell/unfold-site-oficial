import { NextResponse } from 'next/server'
import { getSession } from '@/lib/painel-auth'
import { getUnreadCount, listRecentNotifications } from '@/lib/notifications'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const [unread, recent] = await Promise.all([
    getUnreadCount(user.id),
    listRecentNotifications(user.id, 10),
  ])

  return NextResponse.json({
    unread,
    recent: recent.map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt,
    })),
  })
}
