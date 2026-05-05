import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import CasesClient from './CasesClient'

export default async function CasesPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('cases', { limit: 50, sort: '-createdAt' })

  return (
    <PainelLayout user={user}>
      <CasesClient initialCases={result.docs ?? []} />
    </PainelLayout>
  )
}
