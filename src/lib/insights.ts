import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

export type HomeInsight = {
  id: string
  slug: string
  titulo: string
  resumo: string
  categoria: string
  autor: string
  publicado_em: string | null
  imagemUrl: string | null
}

const HOME_INSIGHTS_LIMIT = 6

function mediaUrl(field: any): string | null {
  if (!field) return null
  if (typeof field === 'string') return null
  return field.url || null
}

function categoriaLabel(field: any): string {
  if (!field) return 'Insights'
  if (typeof field === 'string') return 'Insights'
  return field.nome || field.titulo || field.label || 'Insights'
}

async function fetchHomeInsights(): Promise<HomeInsight[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      where: {
        and: [
          { destaque_home: { equals: true } },
          { status: { equals: 'published' } },
        ],
      },
      sort: 'ordem_home',
      limit: HOME_INSIGHTS_LIMIT,
      depth: 1,
    })
    return result.docs.map((p: any) => ({
      id: String(p.id),
      slug: p.slug || '',
      titulo: p.titulo || '',
      resumo: p.resumo || '',
      categoria: categoriaLabel(p.categoria),
      autor: p.autor || 'Equipe Unfold Growth',
      publicado_em: p.publicado_em || null,
      imagemUrl: mediaUrl(p.imagem_destaque),
    }))
  } catch {
    return []
  }
}

export const getHomeInsights = unstable_cache(fetchHomeInsights, ['home-insights'], {
  tags: ['posts', 'home-insights'],
  revalidate: 60,
})
