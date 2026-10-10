import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Página não encontrada', robots: { index: false, follow: true } }

/**
 * Catch-all de URLs sem rota (S04 — épico seo-tecnico-2026-10).
 *
 * O app tem vários layouts-raiz (grupos (site), (painel), (payload)) e nenhum
 * `app/layout.tsx`, então uma URL inexistente caía na 404 padrão do Next (inglês,
 * sem menu). Esta rota pega o que nenhuma outra pegou e delega para
 * `app/(site)/not-found.tsx`, dentro do layout do site, com status 404.
 * Rotas específicas (/painel, /api, arquivos de /public, sitemap, robots) têm
 * prioridade sobre um catch-all e não são afetadas.
 */
export default function CatchAllNotFound() {
  notFound()
}
