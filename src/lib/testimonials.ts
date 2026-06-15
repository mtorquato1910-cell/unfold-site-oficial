import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

export type PublicTestimonial = {
  id: string
  nome: string
  cargo: string
  empresa: string
  depoimento: string
  depoimentoHtml: string | null
  vertical: string
  initials: string
  fotoUrl: string | null
  logoEmpresaUrl: string | null
}

function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function mediaUrl(field: any): string | null {
  if (!field) return null
  if (typeof field === 'string') return null
  return field.url || null
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
      depth: 1,
    })
    return result.docs.map((t: any) => ({
      id: String(t.id),
      nome: t.nome || '',
      cargo: t.cargo || '',
      empresa: t.empresa || '',
      depoimento: t.depoimento || '',
      depoimentoHtml: t.depoimento_html || null,
      vertical: t.vertical || '',
      initials: getInitials(t.nome || '?'),
      fotoUrl: mediaUrl(t.foto),
      logoEmpresaUrl: mediaUrl(t.logo_empresa),
    }))
  } catch {
    return []
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
