import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import { getBlogCategories } from '@/lib/blog-data'
import PainelLayout from '@/components/painel/PainelLayout'
import CategoriesClient from './CategoriesClient'

export default async function CategoriesPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const [result, withCounts] = await Promise.all([
    getCollection('categories', { limit: 100, sort: 'ordem' }),
    getBlogCategories().catch(() => []),
  ])
  const postCounts = Object.fromEntries(withCounts.map((c) => [c.id, c.count]))

  return (
    <PainelLayout user={user}>
      <CategoriesClient initialCategories={result.docs ?? []} postCounts={postCounts} />
    </PainelLayout>
  )
}
