import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { buildLlmsTxt, type LlmsCase, type LlmsPost } from '@/lib/llms-txt'

/**
 * /llms.txt (S09 — épico seo-tecnico-2026-10). Gerado do CMS: posts e cases
 * PUBLICADOS. "Guias e artigos principais" = posts marcados para os Insights da home
 * (`destaque_home`); os demais vão para "Optional". ISR de 1h + revalidatePath nas
 * actions de post/case.
 */
export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'

export async function GET() {
  let posts: LlmsPost[] = []
  let cases: LlmsCase[] = []
  try {
    const payload = await getPayload({ config: configPromise })
    const [p, c] = await Promise.all([
      payload.find({
        collection: 'posts',
        where: { status: { equals: 'published' } },
        sort: '-publicado_em',
        limit: 500,
        depth: 0,
        select: { slug: true, titulo: true, resumo: true, meta_description: true, destaque_home: true },
      }),
      payload.find({
        collection: 'cases',
        where: { status: { equals: 'publicado' } },
        limit: 200,
        depth: 0,
        select: { slug: true, title: true, excerpt: true, meta_description: true, tagline: true },
      }),
    ])
    posts = (p.docs as any[]).map((d) => ({
      slug: d.slug,
      titulo: d.titulo,
      descricao: d.meta_description || d.resumo,
      pilar: !!d.destaque_home,
    }))
    cases = (c.docs as any[]).map((d) => ({
      slug: d.slug,
      titulo: d.title,
      descricao: d.meta_description || d.excerpt || d.tagline,
    }))
  } catch (e) {
    console.error('[llms.txt] falha ao ler o CMS:', e)
    // Fora do build, falha → erro: o ISR mantém a última versão boa em vez de
    // cachear por 1h um llms.txt sem artigos.
    if (process.env.NEXT_PHASE !== 'phase-production-build') throw e
  }

  return new Response(buildLlmsTxt({ baseUrl: BASE_URL, posts, cases }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
