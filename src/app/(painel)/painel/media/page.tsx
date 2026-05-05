import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import MediaClient from './MediaClient'

export default async function MediaPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('media', { limit: 100, sort: '-createdAt' })

  return (
    <PainelLayout user={user}>
      <MediaClient initialMedia={result.docs ?? []} />
    </PainelLayout>
  )
}
