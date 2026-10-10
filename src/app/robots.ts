import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'

/**
 * robots.txt do apex (S04 — épico seo-tecnico-2026-10).
 *
 * - Fonte ÚNICA: o antigo `public/robots.txt` foi removido (a rota do app já tinha
 *   prioridade; o arquivo estático era código morto e confundia).
 * - Sem a linha `Host:` (diretiva do Yandex, ignorada pelo Google — o plano pediu remover).
 * - `User-agent: *` + `Allow: /` libera todos os rastreadores, inclusive os de IA
 *   (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot, Bingbot) e os de
 *   treinamento (GPTBot, ClaudeBot, Google-Extended) — decisão padrão do Checklist M07.
 *   Para bloquear treinamento, adicionar blocos próprios só para esses user-agents.
 * - Nunca bloquear aqui uma URL que tenha `noindex` (o Google não leria o noindex):
 *   as páginas legais usam meta robots, não Disallow.
 * - O subdomínio `eleicoes.` tem robots próprio (app/guia-seo/robots, via middleware).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/painel/',
          '/api/',
          '/diagnostico/etapa-2/',
          '/diagnostico/resultado/',
          // Busca interna (Plano de Ação): páginas de resultado não têm valor de busca.
          '/*?q=',
          '/*&q=',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
