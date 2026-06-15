import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import BannersClient from './BannersClient'

export const dynamic = 'force-dynamic'

export default async function BannersPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('banners', { limit: 100, sort: 'ordem' })

  return (
    <PainelLayout user={user}>
      <BannersClient initialBanners={result.docs ?? []} />
    </PainelLayout>
  )
}
