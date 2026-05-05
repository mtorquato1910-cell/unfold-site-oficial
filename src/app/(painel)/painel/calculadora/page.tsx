import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import CalculadoraClient from './CalculadoraClient'

export default async function CalculadoraPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('calculadora-results', { limit: 100, sort: '-createdAt' })

  const items = (result.docs || []).map((r: any) => ({
    id: r.id,
    nome: r.nome,
    email: r.email,
    empresa: r.empresa,
    cargo: r.cargo || null,
    telefone: r.telefone || null,
    score: r.score ?? null,
    leadId: typeof r.lead === 'object' ? r.lead?.id : r.lead || null,
    inputs: r.inputs,
    output: r.output,
    createdAt: r.createdAt,
  }))

  return (
    <PainelLayout user={user}>
      <CalculadoraClient initialItems={items} canDelete={user.role === 'admin'} />
    </PainelLayout>
  )
}
