'use client'

import { useState, useTransition } from 'react'
import { UserCog, AlertTriangle } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState } from '@/components/painel/ui'
import { updateUserRole } from '@/lib/actions/user-actions'

type User = {
  id: string
  name?: string
  email: string
  role: 'admin' | 'editor'
  createdAt: string
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Avatar({ name, email }: { name?: string; email?: string }) {
  const initial = (name || email || 'U')[0].toUpperCase()
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold shrink-0"
      style={{
        background: 'hsl(158 92% 70% / 0.15)',
        border: '1px solid hsl(158 92% 70% / 0.25)',
        color: 'hsl(158 92% 70%)',
      }}
    >
      {initial}
    </div>
  )
}

export default function UsersClient({
  initialUsers,
  currentUserId,
  listError,
}: {
  initialUsers: User[]
  currentUserId: string
  listError: string | null
}) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRoleChange(userId: string, newRole: 'admin' | 'editor') {
    if (userId === currentUserId) {
      setError('Você não pode alterar seu próprio role.')
      setTimeout(() => setError(null), 4000)
      return
    }
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole)
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
        setSuccess('Role atualizado.')
        setTimeout(() => setSuccess(null), 2500)
      } catch (err: any) {
        setError(err?.message || 'Falha ao atualizar role')
        setTimeout(() => setError(null), 4000)
      }
    })
  }

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Administradores e editores do painel"
      />

      {listError && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-[13px] flex items-center gap-2"
          style={{
            background: 'hsl(0 70% 60% / 0.1)',
            color: 'hsl(0 70% 80%)',
            border: '1px solid hsl(0 70% 60% / 0.25)',
          }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {listError}{' '}
          <span className="text-dim-2">
            (configure <code>SUPABASE_SERVICE_ROLE_KEY</code> nas variáveis de ambiente)
          </span>
        </div>
      )}

      {error && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-[13px] font-medium"
          style={{
            background: 'hsl(0 70% 60% / 0.1)',
            color: 'hsl(0 70% 80%)',
            border: '1px solid hsl(0 70% 60% / 0.25)',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-[13px] font-medium"
          style={{
            background: 'hsl(158 92% 70% / 0.1)',
            color: 'hsl(158 92% 70%)',
            border: '1px solid hsl(158 92% 70% / 0.25)',
          }}
        >
          {success}
        </div>
      )}

      <div
        className="mb-6 rounded-lg px-4 py-3 text-[12px] text-dim-2"
        style={{ background: 'hsl(0 0% 100% / 0.02)', border: '1px solid hsl(158 92% 70% / 0.1)' }}
      >
        Para <strong>criar</strong> ou <strong>excluir</strong> usuários, use o Supabase Dashboard → Authentication → Users.
        Aqui você gerencia apenas o <strong>role</strong> (admin/editor).
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Adicione membros pelo Supabase Dashboard."
          icon={UserCog}
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                  {['Usuário', 'Role', 'Membro desde'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: 'hsl(0 0% 91% / 0.42)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const isMe = u.id === currentUserId
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom:
                          i < users.length - 1 ? '1px solid hsl(158 92% 70% / 0.06)' : undefined,
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} email={u.email} />
                          <div>
                            <div className="font-medium flex items-center gap-2 text-fg">
                              {u.name || u.email.split('@')[0]}
                              {isMe && (
                                <span
                                  className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                                  style={{
                                    background: 'hsl(158 92% 70% / 0.15)',
                                    color: 'hsl(158 92% 70%)',
                                  }}
                                >
                                  você
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-dim">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={isMe || isPending}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value as 'admin' | 'editor')
                          }
                          className="rounded-md px-2 py-1 text-[11px] font-mono uppercase tracking-wider outline-none"
                          style={{
                            background: 'hsl(197 100% 10%)',
                            border: '1px solid hsl(158 92% 70% / 0.15)',
                            color: 'hsl(0 0% 91%)',
                            cursor: isMe ? 'not-allowed' : 'pointer',
                            opacity: isMe ? 0.5 : 1,
                          }}
                          title={isMe ? 'Você não pode alterar seu próprio role' : ''}
                        >
                          <option value="admin">admin</option>
                          <option value="editor">editor</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-dim-2">{formatDate(u.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </>
  )
}
