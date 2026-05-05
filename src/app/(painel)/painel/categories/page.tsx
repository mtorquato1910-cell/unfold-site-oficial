import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import CategoriesClient from './CategoriesClient'

export default async function CategoriesPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('categories', { limit: 100, sort: 'name' })

  return (
    <PainelLayout user={user}>
      <CategoriesClient initialCategories={result.docs ?? []} />
    </PainelLayout>
  )
}
