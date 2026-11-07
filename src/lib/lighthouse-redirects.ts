/**
 * Domínio antigo agencialighthouse.com → Unfold (relatório técnico de SEO de
 * 06/11/2026 — Tarefa 5). Servido pelo next.config.ts ANTES dos demais redirects,
 * para cada URL antiga ir direto ao destino final (308, sem cadeia).
 *
 * Só funciona depois que agencialighthouse.com e www.agencialighthouse.com forem
 * adicionados ao projeto na Vercel e o DNS (GoDaddy) apontar para lá — sem isso a
 * requisição nem chega ao site. Manter por pelo menos 12 meses (até 11/2027).
 * A ordem importa: específicas primeiro, o catch-all `/:path*` por último.
 */
export const LIGHTHOUSE_HOST = [{ type: 'host' as const, value: '(www\\.)?agencialighthouse\\.com' }]
const UNFOLD = 'https://unfoldgrowth.com.br'

const MAP: [source: string, destination: string][] = [
  [
    '/blog/marketing-digital-1/2025/04/14/panorama-da-geracao-de-leads-no-brasil-2025-o-que-os-dados-da-leadster-revelam-e-como-sua-empresa-deve-reagir',
    '/blog/conversao-de-leads-em-2026-o-que-o-panorama-da-leadster-revela-sobre-vendas-complexas-e-por-que-o-problema-nunca-foi-gerar-leads',
  ],
  ['/blog/marketing-digital-agricola/2025/02/26/guia-definitivo-de-marketing-digital-para-o-agronegocio-do-engajamento-a-conversao', '/atuacao'],
  ['/blog/marketing-digital-agricola/2025/03/24/whats-app-no-agro-como-usar-o-canal-que-o-produtor-acessa', '/atuacao'],
  ['/blog/undefined/2025/03/24/trafego-pago-no-agronegocio-estrategias-de-segmentacao-que-geram-resultado-1', '/atuacao'],
  ['/quem-somos', '/sobre'],
  ['/contato', '/contato'],
  ['/cases/:path*', '/cases'],
  ['/blog/:path*', '/blog'],
  ['/:path*', '/'],
]

export const LIGHTHOUSE_REDIRECTS = MAP.map(([source, path]) => ({
  source,
  has: LIGHTHOUSE_HOST,
  destination: UNFOLD + path,
  permanent: true as const,
}))
