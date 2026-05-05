'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions/notification-actions'

type Notif = {
  id: string
  type: string
  title: string
  message?: string
  link?: string
  read: boolean
  createdAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

export default function BellDropdown() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<Notif[]>([])
  const [, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  async function fetchData() {
    try {
      const res = await fetch('/api/notifications/me', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setUnread(data.unread || 0)
      setItems(data.recent || [])
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleItemClick(n: Notif) {
    if (!n.read) {
      startTransition(async () => {
        await markNotificationRead(n.id)
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
        setUnread((c) => Math.max(0, c - 1))
      })
    }
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead()
      setItems((prev) => prev.map((x) => ({ ...x, read: true })))
      setUnread(0)
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="icon-btn relative rounded-lg p-2"
        title="Notificações"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-semibold px-1"
            style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)', boxShadow: '0 0 6px hsl(158 92% 70%)' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
          style={{
            background: 'hsl(197 100% 7%)',
            border: '1px solid hsl(158 92% 70% / 0.15)',
            boxShadow: '0 24px 64px hsl(0 0% 0% / 0.5)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim-2">
              Notificações {unread > 0 && `(${unread})`}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[11px] text-mint hover:opacity-80"
              >
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-dim">
                Sem notificações
              </div>
            ) : (
              items.map((n) => {
                const Wrapper: any = n.link ? Link : 'div'
                const wrapperProps = n.link ? { href: n.link } : {}
                return (
                  <Wrapper
                    key={n.id}
                    {...wrapperProps}
                    onClick={() => handleItemClick(n)}
                    className="block px-4 py-3 cursor-pointer transition"
                    style={{
                      borderBottom: '1px solid hsl(0 0% 100% / 0.04)',
                      background: n.read ? 'transparent' : 'hsl(158 92% 70% / 0.04)',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span
                          className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: 'hsl(158 92% 70%)' }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-medium text-fg">{n.title}</div>
                        {n.message && (
                          <div className="text-[11px] text-dim-2 mt-0.5 line-clamp-2">
                            {n.message}
                          </div>
                        )}
                        <div className="text-[10px] text-dim mt-1">{timeAgo(n.createdAt)}</div>
                      </div>
                    </div>
                  </Wrapper>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
