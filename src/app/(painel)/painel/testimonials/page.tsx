import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import TestimonialsClient from './TestimonialsClient'

export default async function TestimonialsPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('testimonials', { limit: 100, sort: 'ordem' })

  const items = (result.docs || []).map((t: any) => ({
    id: t.id,
    nome: t.nome ?? '',
    cargo: t.cargo ?? '',
    empresa: t.empresa ?? '',
    depoimento: t.depoimento ?? '',
    vertical: t.vertical ?? '',
    avaliacao: t.avaliacao ?? 5,
    destaque: !!t.destaque,
    ativo: t.ativo ?? true,
    ordem: t.ordem ?? 0,
    createdAt: t.createdAt,
  }))

  return (
    <PainelLayout user={user}>
      <TestimonialsClient
        initialTestimonials={items}
        canDelete={true}
      />
    </PainelLayout>
  )
}
