import type { Metadata } from 'next'
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import CookieBanner from '@/components/CookieBanner'
import '../globals.css'

// S1.2 — Display tech: Space Grotesk (substituto Relicus)
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// S1.2 — Body: Inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

// S1.2 — Mono/tags: IBM Plex Mono
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono-label',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: {
    default: 'Unfold Growth — Assessoria de Growth para Vendas Complexas B2B',
    template: '%s | Unfold Growth',
  },
  description:
    'Estruturamos sistemas de crescimento que conectam marketing, vendas, CRM e automação em uma lógica integrada, previsível e orientada a resultado comercial.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  ),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Unfold Growth',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
