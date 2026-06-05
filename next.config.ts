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
      { source: '/contato', destination: '/diagnostico', permanent: true },
      { source: '/blog/trafego-pago', destination: '/ferramentas/calculadora-trafego', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // HSTS Fase 2 (30d). NÃO adicionar preload nem includeSubDomains até a Fase 3.
          { key: 'Strict-Transport-Security', value: `max-age=${HSTS_MAX_AGE}` },
          // Promove qualquer recurso http:// para https:// no nível do browser.
          { key: 'Content-Security-Policy', value: 'upgrade-insecure-requests' },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
