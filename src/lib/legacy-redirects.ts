/**
 * Redirects permanentes de URLs antigas → URL final (servidos pelo next.config.ts).
 *
 * Fica num módulo próprio para o teste validar a lista sem carregar o config do
 * Payload. `permanent: true` gera 308, que o Google trata como 301.
 *
 * Regras: destino sempre na URL FINAL (nunca outra origem desta lista — sem cadeia)
 * e sem loop. ⚠️ Ao trocar o slug de um post que é DESTINO aqui, atualize esta lista:
 * o painel cria um redirect na collection e esta regra passaria a gerar 2 saltos. Troca de slug de post publicado NÃO entra aqui: o painel grava na
 * collection `redirects`, consultada por `blog/[slug]/page.tsx`.
 */
export type LegacyRedirect = { source: string; destination: string; permanent: true }

export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  // Legados (Lighthouse / site antigo)
  { source: '/agencia', destination: '/', permanent: true },
  { source: '/servicos', destination: '/atuacao', permanent: true },
  { source: '/portfolio', destination: '/cases', permanent: true },
  // /contato agora é uma página própria (formulário de contato) — redirect legado removido.
  { source: '/blog/trafego-pago', destination: '/ferramentas/calculadora-trafego', permanent: true },

  // S02 (épico seo-tecnico-2026-10) — Anexo B do Plano de Ação do Ferraz (07/10/2026):
  // slugs antigos que o Google ainda conhece e que davam 404. Destinos conferidos (200)
  // em 10/10/2026. `/blog/receita-previsivel` fica de FORA de propósito (decisão D1:
  // a URL nunca existiu; os links para ela são removidos dos posts na S03).
  {
    source: '/blog/as-metricas-de-growth-que-importam',
    destination: '/blog/quais-metricas-e-como-medir-em-growth-marketing',
    permanent: true,
  },
  {
    source: '/blog/previsibilidade-comercial-na-incorporadora',
    destination: '/blog/previsibilidade-comercial-como-sair-do-mes-a-mes-na-incorporadora',
    permanent: true,
  },
  {
    source: '/blog/geracao-de-demanda-x-geracao-de-leads',
    destination: '/blog/geracao-de-demanda-x-geracao-de-leads-por-que-mais-leads-podem-estar-piorando-suas-vendas-b2b',
    permanent: true,
  },
  {
    source: '/blog/marketing-para-incorporadoras-e-construtoras',
    destination: '/blog/marketing-e-growth-para-incorporadoras-e-construtoras',
    permanent: true,
  },
  {
    source: '/blog/por-que-incorporadora-gera-leads-e-nao-vende',
    destination: '/blog/por-que-sua-incorporadora-gera-leads-e-nao-fecha-vendas-e-como-resolver',
    permanent: true,
  },
  {
    source: '/blog/crm-para-incorporadora',
    destination: '/blog/crm-para-incorporadora-como-organizar-o-funil-de-lancamento',
    permanent: true,
  },
  {
    source: '/blog/sales-enablement-incorporadora',
    destination: '/blog/sales-enablement-para-corretores-e-comite-de-compra',
    permanent: true,
  },
  { source: '/calculadora', destination: '/ferramentas/calculadora-trafego', permanent: true },
  { source: '/processo-comercial', destination: '/blog/processo-comercial', permanent: true },
  {
    source: '/blog/quanto-investir-para-vender-um-lancamento-imobiliario',
    destination: '/blog/quanto-investir-em-trafego-pago-para-lancamento-imobiliario',
    permanent: true,
  },
]
