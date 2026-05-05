import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import DiagnosticoClient from './DiagnosticoClient'

export default async function DiagnosticoPage() {
  const user = await getSession()
  if (!user) redirect('/painel/login')

  const result = await getCollection('diagnostico-results', { limit: 20, sort: '-createdAt' })

  return (
    <PainelLayout user={user}>
      <DiagnosticoClient initialResults={result.docs ?? []} />
    </PainelLayout>
  )
}
