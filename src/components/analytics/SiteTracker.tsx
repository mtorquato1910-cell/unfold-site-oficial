'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initSiteTracker, trackPageview } from '@/lib/analytics/site-tracker'

/**
 * Monta o tracker de navegação (mapa de calor / jornada de leads) no site público.
 * - initSiteTracker: listeners globais (cliques, submit → identify, flush).
 * - trackPageview a cada mudança de rota (App Router).
 */
export default function SiteTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const cleanup = initSiteTracker()
    return cleanup
  }, [])

  useEffect(() => {
    trackPageview()
  }, [pathname])

  return null
}
