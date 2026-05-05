import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import InsightsClient from './InsightsClient'

export default async function InsightsPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('insights-variations', { limit: 100, sort: '-createdAt' })

  return (
    <PainelLayout user={user}>
      <InsightsClient initialInsights={result.docs ?? []} />
    </PainelLayout>
  )
}
