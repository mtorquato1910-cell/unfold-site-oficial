import { MetadataRoute } from 'next'
import { buildSitemapEntries, type SiteIndex } from '@/lib/site-index'
import { getSiteIndex } from '@/lib/site-index-server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'

// CRÍTICO (fix 2026-09-21): sem esta linha o Next prerenderiza o sitemap no BUILD
// (prerender-manifest: initialRevalidateSeconds=false) e ele só muda em deploy.
// Como os posts são publicados pelo painel — sem deploy — artigos novos ficavam
// fora do sitemap por dias, e o Google só os descobria por rastreio orgânico
// (daí a necessidade de "Solicitar indexação" manual em todo artigo).
// 1h de ISR + revalidatePath('/sitemap.xml') nas actions de publicação.
export const revalidate = 3600

// As URLs e o lastmod saem de src/lib/site-index.ts — a MESMA fonte do /llms.txt
// (Tarefa 7 do relatório de SEO de 06/11/2026). Regras de lastmod documentadas lá.
// NOTA: o hotsite `eleicoes.unfoldgrowth.com.br` é OUTRO host → tem sitemap PRÓPRIO
// em `app/guia-seo/sitemap` (servido via middleware). Regra do protocolo de sitemap:
// um sitemap só pode listar URLs do mesmo host onde ele é servido.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let index: SiteIndex = { posts: [], cases: [], authors: [], categories: [] }
  try {
    index = await getSiteIndex()
  } catch {
    // DB indisponível — só as páginas institucionais
  }
  return buildSitemapEntries(index, BASE_URL)
}
