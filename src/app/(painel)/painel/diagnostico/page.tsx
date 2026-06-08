import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import DiagnosticoClient from './DiagnosticoClient'

export default async function DiagnosticoPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('diagnostico-results', { limit: 20, sort: '-createdAt' })

  // Os documentos vêm com os nomes reais do schema (lead_email, score_total,
  // faixa_consolidada/nivel_fit). O DiagnosticoClient espera company/responsible/
  // email/score/maturityLevel — normalizamos aqui para não exibir tudo como "—".
  const initialResults = result.docs.map((d: any) => {
    const lead = typeof d.lead_id === 'object' && d.lead_id ? d.lead_id : null
    return {
      id: String(d.id),
      email: d.lead_email ?? lead?.email ?? undefined,
      company: lead?.empresa ?? lead?.company ?? undefined,
      responsible: lead?.nome ?? lead?.name ?? undefined,
      score: d.score_total ?? d.score ?? undefined,
      maturityLevel: d.faixa_consolidada ?? d.nivel_fit ?? undefined,
      createdAt: d.createdAt,
    }
  })

  return (
    <PainelLayout user={user}>
      <DiagnosticoClient initialResults={initialResults} />
    </PainelLayout>
  )
}
