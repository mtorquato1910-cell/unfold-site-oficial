'use client'

/**
 * Overlay de calor (canvas + simpleheat) posicionado sobre o iframe de fundo.
 * Desenha os pontos agregados do grid em coordenadas de RENDER (px já escalados).
 *
 * `x = (gx / grid) * renderWidth` e `y = (gy / Y_BINS) * renderHeight` — reprojeta
 * o binning do Postgres (coluna do grid horizontal + faixa vertical NORMALIZADA)
 * para a área renderizada. Usar a fração vertical (y_rel) em vez de px absolutos
 * é o que mantém os pontos alinhados quando a altura do doc renderizado difere
 * da altura no browser do visitante.
 */

import { useEffect, useRef } from 'react'
import simpleheat from 'simpleheat'
import { HEAT_GRADIENT, heatRadius } from '@/lib/heatmap/gradient'
import type { HeatPoint } from './useHeatmapData'

// Nº de faixas verticais normalizadas — DEVE casar com `floor(y_rel * 1000)` da
// função get_heatmap_points na migration.
const Y_BINS = 1000

interface Props {
  points: HeatPoint[]
  grid: number
  maxWeight: number
  renderWidth: number
  renderHeight: number
  scale: number
  opacity: number
  visible: boolean
}

export default function HeatmapCanvas({
  points,
  grid,
  maxWeight,
  renderWidth,
  renderHeight,
  scale,
  opacity,
  visible,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || renderWidth <= 0 || renderHeight <= 0) return

    canvas.width = Math.round(renderWidth)
    canvas.height = Math.round(renderHeight)

    const heat = simpleheat(canvas)
    heat.gradient(HEAT_GRADIENT)
    const { radius, blur } = heatRadius(scale)
    heat.radius(radius, blur)
    heat.max(Math.max(1, maxWeight))

    const data: [number, number, number][] = points.map((p) => [
      (p.gx / grid) * renderWidth,
      (p.gy / Y_BINS) * renderHeight,
      p.weight,
    ])
    heat.data(data)

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      heat.draw(0.05)
    })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [points, grid, maxWeight, renderWidth, renderHeight, scale])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: renderWidth,
        height: renderHeight,
        pointerEvents: 'none',
        zIndex: 10,
        opacity: visible ? opacity : 0,
        transition: 'opacity 150ms ease',
      }}
    />
  )
}
