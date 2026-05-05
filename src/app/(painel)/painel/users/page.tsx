import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')
  if (user.role !== 'admin') redirect('/admin')

  const result = await getCollection('users', { limit: 50, sort: '-createdAt' })

  return (
    <PainelLayout user={user}>
      <UsersClient initialUsers={result.docs ?? []} />
    </PainelLayout>
  )
}
