import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import { LEGACY_REDIRECTS } from './src/lib/legacy-redirects'

// HSTS em deploy gradual (Bug 3).
// Fase 1: max-age=300 (5min). Fase 2 (2026-06-05): max-age=2592000 (30d).
// Fase 3a (ATUAL, 2026-10-10, S04 seo-tecnico-2026-10 / Plano de Ação do Ferraz):
// max-age de 1 ano no apex (que é sempre HTTPS — sem risco).
// Fase 3b (pendente, OPS): `includeSubDomains` — SÓ depois de exportar a zona DNS
// completa e confirmar HTTPS em TODOS os subdomínios (CNAMEs de clique de e-mail do
// RD/Google e landing pages servidas só em http deixariam de abrir por 1 ano).
// `preload` NÃO ativado (difícil de desfazer) — avaliação futura.
const HSTS_VALUE = 'max-age=31536000'

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
      // Redirects permanentes de URLs antigas (legados + Anexo B do plano de SEO).
      ...LEGACY_REDIRECTS,
    ]
  },
  async headers() {
    // Headers de segurança comuns a todas as respostas (o X-Frame-Options varia abaixo).
    const common = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      // HSTS Fase 3a (1 ano, apex). Ver comentário no topo do arquivo.
      { key: 'Strict-Transport-Security', value: HSTS_VALUE },
      // Promove qualquer recurso http:// para https:// no nível do browser.
      { key: 'Content-Security-Policy', value: 'upgrade-insecure-requests' },
    ]
    return [
      {
        // Cache longo para estáticos de /public (imagens, vídeo, fontes) — item 2.3.
        // /_next/static já é imutável pela Vercel; aqui cobrimos os assets de /public.
        source: '/:path*.:ext(jpg|jpeg|png|gif|webp|avif|svg|ico|mp4|webm|woff|woff2|ttf|otf)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
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
