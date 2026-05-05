import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import PromptsClient from './PromptsClient'

export default async function PromptsPage() {
  const user = await getSession()
  if (!user) redirect('/painel/login')

  const result = await getCollection('ai-prompts', { limit: 100, sort: '-createdAt' })

  return (
    <PainelLayout user={user}>
      <PromptsClient initialPrompts={result.docs ?? []} />
    </PainelLayout>
  )
}
