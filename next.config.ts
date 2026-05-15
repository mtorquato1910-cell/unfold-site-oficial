import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

// Sprint hotfix 2026-05-15 (Bug 3): HSTS em deploy gradual.
// Fase 1 (atual): max-age=300 (5min), SEM preload, SEM includeSubDomains — reversível.
// Fase 2 (follow-up, após 48h estável): max-age=2592000 (30d).
// Fase 3 (follow-up, após 7d estável): max-age=63072000; includeSubDomains; preload.
const HSTS_MAX_AGE_PHASE_1 = '300'

const nextConfig: NextConfig = {
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
          // Bug 3 fix — HSTS Fase 1 (reversível). NÃO adicionar preload nem includeSubDomains aqui.
          { key: 'Strict-Transport-Security', value: `max-age=${HSTS_MAX_AGE_PHASE_1}` },
          // Promove qualquer recurso http:// para https:// no nível do browser.
          { key: 'Content-Security-Policy', value: 'upgrade-insecure-requests' },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
