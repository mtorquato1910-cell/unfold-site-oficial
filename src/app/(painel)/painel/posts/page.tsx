import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import PostsClient from './PostsClient'

export default async function PostsPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const [result, authors, categories] = await Promise.all([
    getCollection('posts', { limit: 100, sort: '-createdAt' }),
    getCollection('authors', { limit: 100, sort: 'nome' }),
    getCollection('categories', { limit: 100, sort: 'ordem' }),
  ])

  return (
    <PainelLayout user={user}>
      <PostsClient
        initialPosts={result.docs ?? []}
        authors={(authors.docs ?? []).map((a: any) => ({ id: String(a.id), nome: a.nome as string, ativo: a.ativo !== false }))}
        categories={(categories.docs ?? []).map((c: any) => ({ id: String(c.id), nome: c.nome as string }))}
        canApprove={user.role === 'admin' || user.role === 'editor'}
      />
    </PainelLayout>
  )
}
