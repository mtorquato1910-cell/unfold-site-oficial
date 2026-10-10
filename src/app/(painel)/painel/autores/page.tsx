import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import AutoresClient from './AutoresClient'

export default async function AutoresPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('authors', { limit: 100, sort: 'nome' })

  return (
    <PainelLayout user={user}>
      <AutoresClient initialAuthors={result.docs ?? []} />
    </PainelLayout>
  )
}
