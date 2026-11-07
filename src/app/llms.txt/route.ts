import { buildLlmsTxt } from '@/lib/llms-txt'
import type { SiteIndex } from '@/lib/site-index'
import { getSiteIndex } from '@/lib/site-index-server'

/**
 * /llms.txt (S09 — épico seo-tecnico-2026-10; Tarefa 7 do relatório de SEO de
 * 06/11/2026). Gerado dos mesmos dados do sitemap.xml (getSiteIndex), sem edição
 * manual. ISR de 1h como reserva + revalidatePath('/llms.txt') nas actions de post,
 * case, autor e categoria.
 */
export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'

export async function GET() {
  let index: SiteIndex = { posts: [], cases: [], authors: [], categories: [] }
  try {
    index = await getSiteIndex()
  } catch (e) {
    console.error('[llms.txt] falha ao ler o CMS:', e)
    // Fora do build, falha → erro: o ISR mantém a última versão boa em vez de
    // cachear por 1h um llms.txt sem artigos.
    if (process.env.NEXT_PHASE !== 'phase-production-build') throw e
  }

  return new Response(buildLlmsTxt({ baseUrl: BASE_URL, index }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
