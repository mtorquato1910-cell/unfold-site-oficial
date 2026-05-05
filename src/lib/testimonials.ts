import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

export type PublicTestimonial = {
  id: string
  nome: string
  cargo: string
  empresa: string
  depoimento: string
  vertical: string
  initials: string
}

const FALLBACK: PublicTestimonial[] = [
  {
    id: 'fallback-1',
    nome: 'Mariana Lopes',
    cargo: 'Head of Marketing',
    empresa: 'Northwind Tech',
    depoimento:
      'A Unfold trouxe a camada estratégica que faltava no nosso marketing. Em 8 meses, dobramos o pipeline qualificado e finalmente alinhamos marketing e vendas.',
    vertical: 'tech',
    initials: 'ML',
  },
  {
    id: 'fallback-2',
    nome: 'Rafael Andrade',
    cargo: 'CEO',
    empresa: 'Forge Co.',
    depoimento:
      'Pararam de me entregar relatório bonito e começaram a entregar receita. Esse é o tipo de parceria que escala um negócio B2B de verdade.',
    vertical: 'industrias',
    initials: 'RA',
  },
  {
    id: 'fallback-3',
    nome: 'Camila Rocha',
    cargo: 'CMO',
    empresa: 'Helios Agro',
    depoimento:
      'Sentimos a diferença logo no primeiro trimestre. Operação madura, dados na mesa e decisões muito mais rápidas. Recomendo sem hesitar.',
    vertical: 'agro',
    initials: 'CR',
  },
]

function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

async function fetchPublicTestimonials(): Promise<PublicTestimonial[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'testimonials',
      where: {
        and: [{ destaque: { equals: true } }, { ativo: { equals: true } }],
      },
      sort: 'ordem',
      limit: 12,
      depth: 0,
    })
    if (result.docs.length === 0) return FALLBACK
    return result.docs.map((t: any) => ({
      id: String(t.id),
      nome: t.nome || '',
      cargo: t.cargo || '',
      empresa: t.empresa || '',
      depoimento: t.depoimento || '',
      vertical: t.vertical || '',
      initials: getInitials(t.nome || '?'),
    }))
  } catch {
    return FALLBACK
  }
}

export const getPublicTestimonials = unstable_cache(
  fetchPublicTestimonials,
  ['public-testimonials'],
  {
    tags: ['testimonials'],
    revalidate: 60,
  },
)
