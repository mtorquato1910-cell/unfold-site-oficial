import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Redirect: agencialighthouse.com → unfoldgrowth.com.br (configurar após DNS)
  async redirects() {
    return [
      // Posts migrados da Lighthouse serão adicionados aqui no Sprint 7
    ]
  },
}

export default withPayload(nextConfig)
