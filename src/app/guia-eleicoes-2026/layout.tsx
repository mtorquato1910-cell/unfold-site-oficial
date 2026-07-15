import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono, Fraunces } from 'next/font/google'
import GTMScript, { GTMNoScript } from '@/components/analytics/GTMScript'
import RDStationScript from '@/components/analytics/RDStationScript'
import '../globals.css'
import './_content/guia.css'
import './_content/guia-responsive.css'
import './_content/guia-blur.css'

/**
 * Layout próprio do hotsite "Guia Eleições 2026".
 *
 * Independente do site principal (sem Navbar/Footer) — o guia tem header
 * próprio (Sprint 4). Cada route group define seu <html>/<body>, então o
 * isolamento é total. Mantém GTM/GA4 para o tracking de eventos do funil.
 *
 * Fontes do mockup (RF-11 / RNF-06): Space Grotesk, Inter, JetBrains Mono,
 * expostas nas variáveis que `guia.css` referencia (--font-guia-*).
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-guia-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-guia-body',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-guia-mono',
  display: 'swap',
  weight: ['400', '500'],
})

// Serif editorial do redesign (RF-11): Fraunces, exposta na var que editorial.css usa.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-guia-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})

// URL pública do hotsite (subdomínio). OG/canonical devem usar esta URL — NÃO o apex
// (corrige o bug do metadataBase apontar para unfoldgrowth.com.br — item 13).
const GUIA_URL =
  process.env.NEXT_PUBLIC_GUIA_URL || 'https://eleicoes.unfoldgrowth.com.br/featwork'

const TITLE = 'Guia de Anúncios Digitais para as Eleições de 2026 — Unfold × Feat.Work'
const DESCRIPTION =
  'Estudo completo sobre a operação de anúncios digitais nas eleições de 2026: regras do TSE, plataformas, IA e deepfake, LGPD, prestação de contas e checklists. Por Unfold × Feat.Work.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(GUIA_URL),
  alternates: { canonical: GUIA_URL },
  openGraph: {
    type: 'article',
    locale: 'pt_BR',
    url: GUIA_URL,
    siteName: 'Unfold × Feat.Work',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/guia/og-guia-eleicoes.png', width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/guia/og-guia-eleicoes.png'],
  },
  robots: { index: true, follow: true },
}

export default function GuiaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      {/* Fundo papel do redesign editorial (a classe é estilizada em editorial.css,
          carregado pela página principal). As rotas /preview trazem o próprio fundo. */}
      <body className="guia-editorial">
        <GTMNoScript />
        <GTMScript />
        <RDStationScript />
        {children}
      </body>
    </html>
  )
}
