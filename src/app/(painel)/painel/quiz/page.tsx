import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import QuizClient from './QuizClient'

export default async function QuizPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('quiz-questions', { sort: 'order', limit: 200 })

  return (
    <PainelLayout user={user}>
      <QuizClient initialQuestions={result.docs ?? []} />
    </PainelLayout>
  )
}
