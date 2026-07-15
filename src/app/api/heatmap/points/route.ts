/**
 * Consulta agregada do mapa de calor (server-side, via RPCs de binning).
 *
 * Protegida por sessão do painel (getSession) — só admin lê. NUNCA devolve
 * linhas cruas: só os agregados das funções Postgres. Retorna, conforme o modo:
 *  - clicks/move: pontos (grid) + seletores (para reancoragem no DOM) + máximo;
 *  - scroll: distribuição de profundidade por sessão (linha da dobra).
 * Sempre inclui a lista de páginas com atividade (para o seletor de rota).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/painel-auth'
import { getPages, getPoints, getScroll, getSelectors } from '@/lib/heatmap/db'

export const dynamic = 'force-dynamic'

const CLICK_MODES = new Set(['click', 'rage_click', 'dead_click', 'error_click'])

function parseDate(v: string | null, fallback: Date): string {
  if (!v) return fallback.toISOString()
  const d = new Date(v)
  return isNaN(d.getTime()) ? fallback.toISOString() : d.toISOString()
}

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const path = sp.get('path') || '/'
  const device = sp.get('device') || 'desktop'
  const mode = sp.get('mode') || 'click'
  const grid = Math.min(Math.max(parseInt(sp.get('grid') || '200', 10) || 200, 20), 400)

  const now = new Date()
  const from = parseDate(sp.get('from'), new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000))
  const to = parseDate(sp.get('to'), now)

  try {
    // Lista de páginas (sempre) — para popular o dropdown de rotas.
    const pages = await getPages(from, to, 'click')

    if (mode === 'scroll') {
      const scroll = await getScroll(path, device, from, to)
      return NextResponse.json({ ok: true, mode, pages, scroll })
    }

    const eventType = CLICK_MODES.has(mode) ? mode : mode === 'move' ? 'move' : 'click'
    const [points, selectors] = await Promise.all([
      getPoints(path, device, from, to, eventType, grid),
      getSelectors(path, device, from, to, eventType),
    ])

    // Máximo robusto para a escala de cor. Dois riscos a equilibrar:
    //  - saturação: com binning fino há MUITAS células de peso 1 (cliques únicos
    //    espalhados); o p95 sobre TODAS as células cairia em 1 e pintaria tudo de
    //    vermelho. Por isso ignoramos o "ruído" (peso 1) ao calcular a escala.
    //  - outlier: usar o MÁXIMO deixaria um único ponto muito quente achatar o
    //    resto. Por isso usamos o percentil 95 das zonas reais, não o máximo.
    const allWeights = points.map((p) => p.weight)
    const totalWeight = allWeights.reduce((s, w) => s + w, 0)
    const nonTrivial = allWeights.filter((w) => w > 1).sort((a, b) => a - b)
    const pool = nonTrivial.length >= 5 ? nonTrivial : allWeights.slice().sort((a, b) => a - b)
    const p95 =
      pool.length > 0 ? pool[Math.min(pool.length - 1, Math.floor(pool.length * 0.95))] : 1

    return NextResponse.json({
      ok: true,
      mode,
      pages,
      grid,
      points,
      selectors,
      maxWeight: Math.max(1, p95),
      totalWeight,
    })
  } catch (err) {
    console.error('[api/heatmap/points] falhou:', err)
    return NextResponse.json({ ok: false, error: 'query_failed' }, { status: 500 })
  }
}
