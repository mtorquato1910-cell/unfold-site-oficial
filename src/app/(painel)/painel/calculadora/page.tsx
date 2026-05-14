import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import CalculadoraClient from './CalculadoraClient'
import DashboardFunil from './DashboardFunil'
import { carregarDashboard, isoDesde } from '@/lib/calculadora-server/dashboard-queries'

export const revalidate = 300 // cache 5 min — não precisa ser tempo-real

export default async function CalculadoraPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>
}) {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const { periodo: periodoParam } = await searchParams
  const dias = periodoParam === '7' ? 7 : periodoParam === '90' ? 90 : 30
  const periodoLabel =
    dias === 7 ? 'Últimos 7 dias' : dias === 90 ? 'Últimos 90 dias' : 'Últimos 30 dias'
  let dashboardData
  try {
    dashboardData = await carregarDashboard({ desdeIso: isoDesde(dias) })
  } catch (err) {
    console.error('[painel/calculadora] dashboard falhou:', err)
    dashboardData = null
  }

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
      {dashboardData && <DashboardFunil data={dashboardData} periodoLabel={periodoLabel} />}
      <CalculadoraClient initialItems={items} canDelete={user.role === 'admin'} />
    </PainelLayout>
  )
}
