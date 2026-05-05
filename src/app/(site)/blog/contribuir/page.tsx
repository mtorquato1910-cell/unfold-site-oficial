import type { Metadata } from 'next'
import ContribuirClient from './ContribuirClient'

export const metadata: Metadata = {
  title: 'Contribuir com o blog · Unfold Growth',
  description:
    'Tem algo a compartilhar sobre crescimento B2B, vendas complexas ou método UGS? Submeta seu artigo para revisão editorial.',
  robots: { index: true, follow: true },
}

export default function ContribuirPage() {
  return <ContribuirClient />
}
