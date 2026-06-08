/**
 * Layout do Radar de Comitê de Compra (Mapa de ICP).
 * Carrega as fontes do protótipo (Host Grotesk / Inter / JetBrains Mono) e as
 * expõe como CSS vars --mi-display / --mi-body / --mi-mono. Também define os
 * tokens de cor da identidade (navy/mint/ink/muted) no wrapper .mapa-icp-root.
 * Não substitui as fontes nem o layout global do site.
 */
import type { Metadata } from 'next'
import { Host_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import styles from './mapa-icp.module.css'

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  variable: '--mi-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--mi-body',
  display: 'swap',
  weight: ['400', '500', '600'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--mi-mono',
  display: 'swap',
  weight: ['500', '600'],
})

export const metadata: Metadata = {
  title: 'Radar de Comitê de Compra — Unfold',
  description:
    'Descubra quem realmente vale o seu pipeline e como falar com cada decisor do comitê de compra. Ferramenta gratuita para operações de vendas complexas.',
  openGraph: {
    title: 'Radar de Comitê de Compra — Unfold',
    description:
      'Descubra quem realmente vale o seu pipeline e como falar com cada decisor do comitê de compra. Ferramenta gratuita para operações de vendas complexas.',
    locale: 'pt_BR',
    images: ['/og/mapa-icp.png'],
  },
}

export default function MapaIcpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`mapa-icp-root ${styles.tokens} ${hostGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      {children}
    </div>
  )
}
