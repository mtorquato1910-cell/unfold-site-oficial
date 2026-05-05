import { redirect } from 'next/navigation'
import { getSession, adminListUsers } from '@/lib/painel-auth'
import PainelLayout from '@/components/painel/PainelLayout'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')
  if (user.role !== 'admin') redirect('/admin')

  let users: Awaited<ReturnType<typeof adminListUsers>> = []
  let listError: string | null = null
  try {
    users = await adminListUsers()
  } catch (err: any) {
    listError = err?.message || 'Falha ao carregar usuários do Supabase'
  }

  return (
    <PainelLayout user={user}>
      <UsersClient initialUsers={users} currentUserId={user.id} listError={listError} />
    </PainelLayout>
  )
}
