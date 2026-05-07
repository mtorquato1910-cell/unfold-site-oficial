import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

export type PublicClient = {
  id: string
  nome: string
  logoUrl: string | null
  website: string | null
}

const FALLBACK: PublicClient[] = [
  { id: 'fb-1', nome: 'Grupo AV', logoUrl: null, website: null },
  { id: 'fb-2', nome: 'Zest Inc', logoUrl: null, website: null },
  { id: 'fb-3', nome: 'Ypê Investimentos', logoUrl: null, website: null },
  { id: 'fb-4', nome: 'Grupo Luiz Jatobá', logoUrl: null, website: null },
  { id: 'fb-5', nome: 'Inove Engenharia', logoUrl: null, website: null },
  { id: 'fb-6', nome: 'OFM Systems', logoUrl: null, website: null },
  { id: 'fb-7', nome: 'Mesha Tecnologia', logoUrl: null, website: null },
  { id: 'fb-8', nome: 'Roga DX', logoUrl: null, website: null },
  { id: 'fb-9', nome: 'Sementes Ipiranga', logoUrl: null, website: null },
  { id: 'fb-10', nome: 'Grupo Maqnelson', logoUrl: null, website: null },
  { id: 'fb-11', nome: 'Vertical Locações', logoUrl: null, website: null },
  { id: 'fb-12', nome: 'Consórcio Nova Aravel', logoUrl: null, website: null },
]

function mediaUrl(field: any): string | null {
  if (!field) return null
  if (typeof field === 'string') return null
  return field.url || null
}

async function fetchPublicClients(): Promise<PublicClient[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'clients',
      where: { ativo: { equals: true } },
      sort: 'ordem',
      limit: 50,
      depth: 1,
    })
    if (result.docs.length === 0) return FALLBACK
    return result.docs.map((c: any) => ({
      id: String(c.id),
      nome: c.nome || '',
      logoUrl: mediaUrl(c.logo),
      website: c.website || null,
    }))
  } catch {
    return FALLBACK
  }
}

export const getPublicClients = unstable_cache(fetchPublicClients, ['public-clients'], {
  tags: ['clients'],
  revalidate: 60,
})
