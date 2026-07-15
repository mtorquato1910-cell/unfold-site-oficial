'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initSiteTracker, trackPageview } from '@/lib/analytics/site-tracker'
import { initHeatmapTracker, heatmapRouteChanged } from '@/lib/heatmap/tracker'

/**
 * Monta o tracker de navegação (mapa de calor / jornada de leads) no site público.
 * - initSiteTracker: listeners globais (cliques, submit → identify, flush) — relatório.
 * - initHeatmapTracker: captura rica (coordenadas de doc, seletor, scroll, rage/dead)
 *   para o overlay visual — fluxo paralelo e independente do relatório.
 * - trackPageview a cada mudança de rota (App Router).
 */
export default function SiteTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const cleanupSite = initSiteTracker()
    const cleanupHeat = initHeatmapTracker()
    return () => {
      cleanupSite()
      cleanupHeat()
    }
  }, [])

  useEffect(() => {
    trackPageview()
    heatmapRouteChanged()
  }, [pathname])

  return null
}
