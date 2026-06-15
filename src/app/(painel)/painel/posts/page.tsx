import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import PostsClient from './PostsClient'

export default async function PostsPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('posts', { limit: 100, sort: '-createdAt' })

  return (
    <PainelLayout user={user}>
      <PostsClient
        initialPosts={result.docs ?? []}
        canApprove={user.role === 'admin' || user.role === 'editor'}
      />
    </PainelLayout>
  )
}
