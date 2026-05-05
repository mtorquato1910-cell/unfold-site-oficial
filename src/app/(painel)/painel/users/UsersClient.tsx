'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, UserCog } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState, Field, MintButton } from '@/components/painel/ui'
import { createUser, updateUserRole, deleteUser } from '@/lib/actions/content-actions'

type User = {
  id: string
  name?: string
  email?: string
  role?: string
  createdAt?: string
}

type FormData = {
  name: string
  email: string
  password: string
  role: string
}

const EMPTY_FORM: FormData = { name: '', email: '', password: '', role: 'editor' }

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Avatar({ name, email }: { name?: string; email?: string }) {
  const initial = (name || email || 'U')[0].toUpperCase()
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold shrink-0"
      style={{ background: 'hsl(158 92% 70% / 0.15)', border: '1px solid hsl(158 92% 70% / 0.25)', color: 'hsl(158 92% 70%)' }}
    >
      {initial}
    </div>
  )
}

function RoleBadge({ role }: { role?: string }) {
  const isAdmin = role === 'admin'
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
      style={isAdmin
        ? { background: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)', border: '1px solid hsl(158 92% 70% / 0.25)' }
        : { background: 'hsl(217 93% 78% / 0.12)', color: 'hsl(217 93% 78%)', border: '1px solid hsl(217 93% 78% / 0.25)' }
      }
    >
      {role || 'editor'}
    </span>
  )
}

export default function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  function handleSubmit() {
    startTransition(async () => {
      await createUser({ name: form.name, email: form.email, password: form.password, role: form.role })
      setUsers((prev) => [...prev, {
        id: Date.now().toString(),
        name: form.name,
        email: form.email,
        role: form.role,
        createdAt: new Date().toISOString(),
      }])
      showSuccess('Usuário criado!')
      closeModal()
    })
  }

  function handleRoleChange(id: string, newRole: string) {
    startTransition(async () => {
      await updateUserRole(id, newRole)
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u))
    })
  }

  function handleDelete(id: string) {
    if (!window.confirm('Remover este usuário permanentemente?')) return
    startTransition(async () => {
      await deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    })
  }

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Administradores e editores do painel"
        actions={
          <MintButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo usuário
          </MintButton>
        }
      />

      {successMsg && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-[13px] font-medium"
          style={{ background: 'hsl(158 92% 70% / 0.1)', color: 'hsl(158 92% 70%)', border: '1px solid hsl(158 92% 70% / 0.2)' }}
        >
          {successMsg}
        </div>
      )}

      {users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Adicione membros da equipe com acesso ao painel."
          icon={UserCog}
          action={<MintButton onClick={openCreate}><Plus className="h-4 w-4" /> Novo Usuário</MintButton>}
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                  {['Usuário', 'Role', 'Membro desde', 'Ações'].map((h) => (
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
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    className="transition-colors"
                    style={{ borderBottom: i < users.length - 1 ? '1px solid hsl(158 92% 70% / 0.06)' : undefined }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(158 92% 70% / 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} email={u.email} />
                        <div>
                          <div className="font-medium" style={{ color: 'hsl(0 0% 91%)' }}>
                            {u.name || u.email?.split('@')[0] || '—'}
                          </div>
                          <div className="text-[11px]" style={{ color: 'hsl(0 0% 91% / 0.5)' }}>
                            {u.email || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role || 'editor'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-md px-2 py-1 text-[11px] font-mono uppercase tracking-wider outline-none cursor-pointer"
                        style={{
                          background: 'hsl(197 100% 10%)',
                          border: '1px solid hsl(158 92% 70% / 0.15)',
                          color: 'hsl(0 0% 91%)',
                        }}
                      >
                        <option value="admin">admin</option>
                        <option value="editor">editor</option>
                      </select>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.5)' }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="rounded-lg p-1.5 transition-colors"
                        style={{ color: 'hsl(0 0% 91% / 0.35)' }}
                        title="Remover usuário"
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(0 0% 91% / 0.35)')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 8% / 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: 'hsl(197 100% 10%)',
              border: '1px solid hsl(158 92% 70% / 0.15)',
              boxShadow: '0 24px 64px hsl(0 0% 0% / 0.5)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-[18px] font-semibold" style={{ color: 'hsl(0 0% 91%)' }}>
                Novo Usuário
              </h3>
              <button onClick={closeModal} style={{ color: 'hsl(0 0% 91% / 0.5)' }}>✕</button>
            </div>

            <div className="space-y-4">
              <Field label="Nome">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nome completo..."
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                  style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@empresa.com"
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                  style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                />
              </Field>
              <Field label="Senha">
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Senha segura..."
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                  style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                />
              </Field>
              <Field label="Role">
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                  style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-[13px] font-medium"
                style={{ color: 'hsl(0 0% 91% / 0.6)', background: 'hsl(0 0% 100% / 0.05)' }}
              >
                Cancelar
              </button>
              <MintButton onClick={handleSubmit} disabled={isPending || !form.email.trim() || !form.password.trim()}>
                {isPending ? 'Criando...' : 'Criar usuário'}
              </MintButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
