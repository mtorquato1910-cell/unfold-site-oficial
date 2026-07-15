'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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
  days: number
}

interface State {
  data: HeatmapResponse | null
  loading: boolean
  error: string | null
  refreshing: boolean
  lastUpdated: number | null
}

// Intervalo padrão do auto-refresh (silencioso). O mapa se atualiza sozinho
// enquanto a aba está visível; muda-se via prop.
const DEFAULT_REFRESH_MS = 20000

export function useHeatmapData(filters: HeatmapFilters, refreshMs = DEFAULT_REFRESH_MS) {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
    refreshing: false,
    lastUpdated: null,
  })

  // Sempre lê os filtros mais recentes sem recriar o loop de polling.
  const filtersRef = useRef(filters)
  filtersRef.current = filters
  const inFlight = useRef(false)

  const load = useCallback((silent: boolean) => {
    if (inFlight.current) return
    inFlight.current = true
    const f = filtersRef.current
    const now = Date.now()
    // A janela avança até AGORA a cada carga → novos eventos entram no mapa.
    const qs = new URLSearchParams({
      path: f.path,
      device: f.device,
      mode: f.mode,
      from: new Date(now - f.days * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date(now).toISOString(),
    })

    setState((s) => ({
      ...s,
      loading: silent ? s.loading : true,
      refreshing: silent,
      error: silent ? s.error : null,
    }))

    return fetch(`/api/heatmap/points?${qs.toString()}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 401 ? 'Sessão expirada' : `Erro ${r.status}`)
        return (await r.json()) as HeatmapResponse
      })
      .then((data) => {
        setState({ data, loading: false, error: null, refreshing: false, lastUpdated: Date.now() })
      })
      .catch((e: unknown) => {
        // Num refresh silencioso, mantém os dados/erro anteriores (não pisca).
        setState((s) => ({
          ...s,
          loading: false,
          refreshing: false,
          error: silent ? s.error : e instanceof Error ? e.message : 'Falha',
        }))
      })
      .finally(() => {
        inFlight.current = false
      })
  }, [])

  // Carga visível quando um filtro muda.
  useEffect(() => {
    load(false)
  }, [filters.path, filters.device, filters.mode, filters.days, load])

  // Polling silencioso — só enquanto a aba está visível (economiza recursos).
  useEffect(() => {
    if (!refreshMs) return
    const id = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      load(true)
    }, refreshMs)
    return () => window.clearInterval(id)
  }, [refreshMs, load])

  return { ...state, refresh: () => load(false) }
}
