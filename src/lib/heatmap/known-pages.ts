/**
 * Rotas âncora do site público — usadas para popular o seletor de página do
 * mapa de calor mesmo quando ainda NÃO há eventos capturados naquela rota.
 *
 * O dropdown final é a UNIÃO destas com as rotas que já têm eventos (vindas do
 * RPC get_heatmap_pages), então sub-rotas dinâmicas com tráfego (ex.: um post
 * específico /blog/algum-post) também aparecem — mas o usuário nunca fica preso
 * só ao que já foi coletado.
 *
 * Mantida em sincronia com as rotas de src/app/(site). Não inclui rotas
 * dinâmicas ([slug]/[token]/[hash]) nem áreas privadas (/painel, /admin).
 */
export const KNOWN_PAGES: string[] = [
  '/',
  '/atuacao',
  '/metodo',
  '/sobre',
  '/cases',
  '/blog',
  '/blog/contribuir',
  '/diagnostico',
  '/diagnostico/privacidade',
  '/ferramentas',
  '/ferramentas/calculadora-trafego',
  '/ferramentas/mapa-icp',
  '/ferramentas/mapa-icp/montar',
  '/lgpd',
  '/politica-de-privacidade',
  '/termos',
]
