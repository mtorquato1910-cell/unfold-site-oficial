import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import TestimonialsClient from './TestimonialsClient'

export default async function TestimonialsPage() {
  const user = await getSession()
  if (!user) redirect('/painel/login')

  const result = await getCollection('testimonials', { limit: 50, sort: '-createdAt' })

  return (
    <PainelLayout user={user}>
      <TestimonialsClient initialTestimonials={result.docs ?? []} />
    </PainelLayout>
  )
}
