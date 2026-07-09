import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import MapaIcpClient from './MapaIcpClient'

export default async function MapaIcpPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('mapa-icp-results', { limit: 50, sort: '-createdAt' })

  // Documentos vêm com os nomes reais do schema (lead_email, nome, empresa…).
  // Normalizamos para o shape que o MapaIcpClient espera.
  const initialResults = result.docs.map((d: any) => ({
    id: String(d.id),
    email: d.lead_email ?? undefined,
    name: d.nome ?? undefined,
    company: d.empresa ?? undefined,
    role: d.cargo ?? undefined,
    phone: d.telefone ?? undefined,
    fitScore: typeof d.fit_score === 'number' ? d.fit_score : undefined,
    fitTier: d.fit_tier ?? undefined,
    ticketRange: d.ticket_range ?? undefined,
    ciclo: d.ciclo ?? undefined,
    modelo: d.modelo ?? undefined,
    nDecisores: d.n_decisores ?? undefined,
    maturidadeIcp: d.maturidade_icp ?? undefined,
    // Respostas abertas / qualitativas
    vende: d.vende ?? undefined,
    transformacao: d.transformacao ?? undefined,
    melhoresClientes: d.melhores_clientes ?? undefined,
    motivosFechamento: d.motivos_fechamento ?? undefined,
    clienteRuim: d.cliente_ruim ?? undefined,
    areasComite: d.areas_comite ?? undefined,
    vetoOwner: d.veto_owner ?? undefined,
    objecaoPrincipal: d.objecao_principal ?? undefined,
    aiResult: d.ai_result ?? null,
    resultHash: d.url_resultado_hash ?? undefined,
    createdAt: d.createdAt,
  }))

  return (
    <PainelLayout user={user}>
      <MapaIcpClient initialResults={initialResults} />
    </PainelLayout>
  )
}
