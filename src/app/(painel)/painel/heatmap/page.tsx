import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getHeatmapData } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import HeatmapClient from './HeatmapClient'

// Dados sempre frescos — event store cresce em tempo real.
export const dynamic = 'force-dynamic'

export default async function HeatmapPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const data = await getHeatmapData(14)

  return (
    <PainelLayout user={user}>
      <HeatmapClient data={data} />
    </PainelLayout>
  )
}
