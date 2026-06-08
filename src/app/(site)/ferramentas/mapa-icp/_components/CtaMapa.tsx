'use client'

import { useRouter } from 'next/navigation'
import { useCallback, type ReactNode } from 'react'

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

type CtaLocation = 'hero' | 'nav' | 'final'

interface CtaMapaProps {
  location: CtaLocation
  className?: string
  children: ReactNode
}

/**
 * CTA da LP. Dispara dataLayer.push({event:'cta_click', location}) e navega
 * para /ferramentas/mapa-icp/montar preservando os UTMs atuais.
 * Lê window.location.search no clique (não useSearchParams) para que a LP
 * permaneça estática/indexável — sem exigir Suspense boundary.
 */
export default function CtaMapa({ location, className, children }: CtaMapaProps) {
  const router = useRouter()

  const handleClick = useCallback(() => {
    let qs = ''
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ event: 'cta_click', location })
      qs = window.location.search.replace(/^\?/, '')
    }
    router.push(qs ? `/ferramentas/mapa-icp/montar?${qs}` : '/ferramentas/mapa-icp/montar')
  }, [location, router])

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
