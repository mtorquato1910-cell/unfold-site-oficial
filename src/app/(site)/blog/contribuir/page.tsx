import type { Metadata } from 'next'
import ContribuirClient from './ContribuirClient'

export const metadata: Metadata = {
  title: 'Contribuir com o blog',
  description:
    'Tem algo a compartilhar sobre crescimento B2B, vendas complexas ou método UGS? Submeta seu artigo para revisão editorial.',
  // Página operacional (item 1.7/1.8): fora da busca.
  robots: { index: false, follow: true },
}

export default function ContribuirPage() {
  return <ContribuirClient />
}
