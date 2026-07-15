'use client'

import { useEffect, useState } from 'react'

export interface HeatPoint {
  gx: number
  gy: number
  weight: number
}
export interface HeatSelector {
  selector: string
  off_x: number
  off_y: number
  weight: number
}
export interface HeatPage {
  page_path: string
  events: number
}
export interface ScrollBucket {
  depth_pct: number
  sessions: number
}

export interface HeatmapResponse {
  ok: boolean
  mode: string
  pages: HeatPage[]
  grid?: number
  points?: HeatPoint[]
  selectors?: HeatSelector[]
  maxWeight?: number
  totalWeight?: number
  scroll?: ScrollBucket[]
}

export interface HeatmapFilters {
  path: string
  device: 'desktop' | 'tablet' | 'mobile'
  mode: string
  from: string
  to: string
}

interface State {
  data: HeatmapResponse | null
  loading: boolean
  error: string | null
}

export function useHeatmapData(filters: HeatmapFilters): State {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))

    const qs = new URLSearchParams({
      path: filters.path,
      device: filters.device,
      mode: filters.mode,
      from: filters.from,
      to: filters.to,
    })

    fetch(`/api/heatmap/points?${qs.toString()}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 401 ? 'Sessão expirada' : `Erro ${r.status}`)
        return (await r.json()) as HeatmapResponse
      })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: e instanceof Error ? e.message : 'Falha' })
      })

    return () => {
      cancelled = true
    }
  }, [filters.path, filters.device, filters.mode, filters.from, filters.to])

  return state
}
