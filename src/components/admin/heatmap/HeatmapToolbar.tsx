'use client'

/**
 * Barra de controles do mapa de calor visual. Segue o design system do painel
 * (dark teal + acento verde menta). Modos expostos = só os que os dados
 * sustentam: Cliques (todos/rage/dead/erro), Movimento do mouse e Rolagem.
 */

import {
  Monitor,
  Tablet,
  Smartphone,
  MousePointerClick,
  Move,
  ChevronsDownUp,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { Device } from './HeatmapBackground'
import type { HeatPage } from './useHeatmapData'
import { LEGEND_CSS } from '@/lib/heatmap/gradient'

export type HeatMode = 'click' | 'rage_click' | 'dead_click' | 'error_click' | 'move' | 'scroll'

interface Props {
  pages: HeatPage[]
  path: string
  onPath: (p: string) => void
  device: Device
  onDevice: (d: Device) => void
  mode: HeatMode
  onMode: (m: HeatMode) => void
  days: number
  onDays: (d: number) => void
  opacity: number
  onOpacity: (o: number) => void
  overlayOn: boolean
  onOverlayOn: (v: boolean) => void
  loading: boolean
}

const CLICK_SUBMODES: { key: HeatMode; label: string }[] = [
  { key: 'click', label: 'Todos' },
  { key: 'rage_click', label: 'Rage' },
  { key: 'dead_click', label: 'Sem efeito' },
  { key: 'error_click', label: 'Erro' },
]

const GROUP: { key: HeatMode; label: string; icon: React.ElementType }[] = [
  { key: 'click', label: 'Cliques', icon: MousePointerClick },
  { key: 'move', label: 'Movimento', icon: Move },
  { key: 'scroll', label: 'Rolagem', icon: ChevronsDownUp },
]

const DEVICES: { key: Device; icon: React.ElementType; label: string }[] = [
  { key: 'desktop', icon: Monitor, label: 'Desktop' },
  { key: 'tablet', icon: Tablet, label: 'Tablet' },
  { key: 'mobile', icon: Smartphone, label: 'Mobile' },
]

function pill(active: boolean) {
  return {
    background: active ? 'hsl(158 92% 70% / 0.14)' : 'hsl(0 0% 100% / 0.04)',
    color: active ? 'hsl(158 92% 70%)' : 'hsl(0 0% 91% / 0.62)',
    border: `1px solid ${active ? 'hsl(158 92% 70% / 0.30)' : 'hsl(0 0% 100% / 0.08)'}`,
  }
}

export default function HeatmapToolbar(props: Props) {
  const { pages, path, device, mode, days, opacity, overlayOn, loading } = props
  const isClickGroup = mode === 'click' || mode === 'rage_click' || mode === 'dead_click' || mode === 'error_click'
  const activeGroup: HeatMode = isClickGroup ? 'click' : mode

  return (
    <div
      className="sticky top-0 z-20 rounded-2xl mb-4"
      style={{ background: 'hsl(197 100% 6% / 0.86)', backdropFilter: 'blur(8px)', border: '1px solid hsl(158 92% 70% / 0.12)' }}
    >
      <div className="flex flex-wrap items-center gap-3 p-3">
        {/* Página */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-dim">Página</span>
          <select
            value={path}
            onChange={(e) => props.onPath(e.target.value)}
            className="rounded-lg px-2.5 py-1.5 text-[12px] max-w-[240px]"
            style={{ background: 'hsl(0 0% 100% / 0.05)', color: 'hsl(0 0% 91%)', border: '1px solid hsl(0 0% 100% / 0.1)' }}
          >
            {pages.length === 0 && <option value={path}>{path}</option>}
            {pages.map((p) => (
              <option key={p.page_path} value={p.page_path}>
                {(p.page_path || '/') + `  (${p.events})`}
              </option>
            ))}
          </select>
        </div>

        {/* Device */}
        <div className="flex items-center gap-1">
          {DEVICES.map((d) => {
            const Icon = d.icon
            const active = device === d.key
            return (
              <button
                key={d.key}
                onClick={() => props.onDevice(d.key)}
                title={d.label}
                className="rounded-lg p-1.5"
                style={pill(active)}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </button>
            )
          })}
        </div>

        {/* Modo (grupo) */}
        <div className="flex items-center gap-1">
          {GROUP.map((g) => {
            const Icon = g.icon
            const active = activeGroup === g.key
            return (
              <button
                key={g.key}
                onClick={() => props.onMode(g.key)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px]"
                style={pill(active)}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {g.label}
              </button>
            )
          })}
        </div>

        {/* Período */}
        <div className="flex items-center gap-1">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => props.onDays(d)}
              className="rounded-lg px-2 py-1.5 text-[11px] font-mono"
              style={pill(days === d)}
            >
              {d}d
            </button>
          ))}
        </div>

        {/* Opacidade + toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(opacity * 100)}
            onChange={(e) => props.onOpacity(Number(e.target.value) / 100)}
            className="w-24 accent-mint"
            title="Opacidade do overlay"
          />
          <button
            onClick={() => props.onOverlayOn(!overlayOn)}
            title={overlayOn ? 'Ocultar overlay' : 'Mostrar overlay'}
            className="rounded-lg p-1.5"
            style={pill(overlayOn)}
          >
            {overlayOn ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Sub-modos de clique */}
      {isClickGroup && (
        <div className="flex flex-wrap items-center gap-1 px-3 pb-3">
          {CLICK_SUBMODES.map((s) => (
            <button
              key={s.key}
              onClick={() => props.onMode(s.key)}
              className="rounded-md px-2 py-1 text-[11px]"
              style={pill(mode === s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Legenda + estado */}
      <div className="flex items-center gap-3 px-3 pb-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-dim">Frio</span>
        <div className="h-2 flex-1 max-w-[240px] rounded-full" style={{ background: LEGEND_CSS }} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-dim">Quente</span>
        {loading && <span className="font-mono text-[10px] text-mint ml-2">carregando…</span>}
      </div>
    </div>
  )
}
