import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

// HSTS em deploy gradual (Bug 3).
// Fase 1: max-age=300 (5min). Fase 2 (ATUAL, 2026-06-05): max-age=2592000 (30d),
// ainda SEM includeSubDomains/preload — reversível. Fase 3 (follow-up, após estável):
// max-age=63072000; includeSubDomains; preload.
const HSTS_MAX_AGE = '2592000'

const nextConfig: NextConfig = {
  // Inclui o PDF privado (fora de /public) no bundle do endpoint que o serve.
  outputFileTracingIncludes: {
    '/api/guia-eleicoes/pdf': ['./private-assets/**'],
  },
  experimental: {
    // Uploads de imagem do painel passam por Server Actions (uploadMedia recebe
    // o File via FormData). O default do Next é 1MB, o que estoura com quase
    // qualquer foto e dispara "An unexpected response was received from the server"
    // ANTES do handler rodar (por isso o try/catch do action nunca pega). 10MB cobre
    // imagens de capa/destaque sem permitir uploads abusivos.
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  async rewrites() {
    return [
      { source: '/admin', destination: '/painel' },
      { source: '/admin/:path*', destination: '/painel/:path*' },
    ]
  },
  async redirects() {
    return [
      // Sprint hotfix 2026-05-15 (Bug 3): www → apex canônico (301).
      // O cert SSL precisa cobrir ambos os hostnames na Vercel — esta regra
      // não substitui essa configuração no painel.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.unfoldgrowth.com.br' }],
        destination: 'https://unfoldgrowth.com.br/:path*',
        permanent: true,
      },
      // Redirects 301 de URLs legados (Lighthouse / antigos)
      { source: '/agencia', destination: '/', permanent: true },
      { source: '/servicos', destination: '/atuacao', permanent: true },
      { source: '/portfolio', destination: '/cases', permanent: true },
      // /contato agora é uma página própria (formulário de contato) — redirect legado removido.
      { source: '/blog/trafego-pago', destination: '/ferramentas/calculadora-trafego', permanent: true },
    ]
  },
  async headers() {
    // Headers de segurança comuns a todas as respostas (o X-Frame-Options varia abaixo).
    const common = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      // HSTS Fase 2 (30d). NÃO adicionar preload nem includeSubDomains até a Fase 3.
      { key: 'Strict-Transport-Security', value: `max-age=${HSTS_MAX_AGE}` },
      // Promove qualquer recurso http:// para https:// no nível do browser.
      { key: 'Content-Security-Policy', value: 'upgrade-insecure-requests' },
    ]
    return [
      {
        // Prévia do mapa de calor (?heatmap=1): o painel embute a página num
        // iframe same-origin. SAMEORIGIN permite só o nosso domínio — nada externo.
        source: '/(.*)',
        has: [{ type: 'query', key: 'heatmap', value: '1' }],
        headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }, ...common],
      },
      {
        // Demais requests (heatmap ausente ou ≠ 1): bloqueia qualquer framing (clickjacking).
        source: '/(.*)',
        missing: [{ type: 'query', key: 'heatmap', value: '1' }],
        headers: [{ key: 'X-Frame-Options', value: 'DENY' }, ...common],
      },
    ]
  },
}

export default withPayload(nextConfig)
