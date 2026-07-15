'use client'

/**
 * Seção do mapa de calor VISUAL (overlay tipo Clarity) — entra ABAIXO do
 * relatório agregado, sem alterá-lo. Orquestra toolbar + iframe de fundo +
 * overlay (calor de cliques/movimento ou heat de rolagem) e os estados de
 * carregamento/vazio/baixa amostragem.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Flame, AlertTriangle, RefreshCw } from 'lucide-react'
import { GlassCard } from '@/components/painel/ui'
import HeatmapToolbar, { type HeatMode } from './HeatmapToolbar'
import HeatmapBackground, { type Device, type BackgroundInfo } from './HeatmapBackground'
import HeatmapCanvas from './HeatmapCanvas'
import ScrollDepthOverlay from './ScrollDepthOverlay'
import { useHeatmapData, type HeatmapFilters, type HeatPage } from './useHeatmapData'
import { KNOWN_PAGES } from '@/lib/heatmap/known-pages'

const LOW_SAMPLE = 20

/** União das rotas conhecidas do site com as que já têm eventos (RPC). */
function mergePages(rpcPages: HeatPage[] = [], currentPath: string): HeatPage[] {
  const map = new Map<string, number>()
  for (const p of KNOWN_PAGES) map.set(p, 0)
  for (const p of rpcPages) map.set(p.page_path, p.events)
  if (!map.has(currentPath)) map.set(currentPath, 0)
  return Array.from(map.entries())
    .map(([page_path, events]) => ({ page_path, events }))
    .sort((a, b) => b.events - a.events || a.page_path.localeCompare(b.page_path))
}

/** Horário da última atualização (HH:MM:SS). */
function timeLabel(ts: number | null): string {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function HeatmapSection({ initialPath = '/' }: { initialPath?: string }) {
  const [path, setPath] = useState(initialPath)
  const [device, setDevice] = useState<Device>('desktop')
  const [mode, setMode] = useState<HeatMode>('click')
  const [days, setDays] = useState(14)
  const [opacity, setOpacity] = useState(0.7)
  const [overlayOn, setOverlayOn] = useState(true)
  const [bg, setBg] = useState<BackgroundInfo | null>(null)
  const [anchorRate, setAnchorRate] = useState<number | null>(null)
  const autoPicked = useRef(false)

  const filters: HeatmapFilters = { path, device, mode, days }
  const { data, loading, error, refreshing, lastUpdated, refresh } = useHeatmapData(filters)

  const mergedPages = useMemo(() => mergePages(data?.pages, path), [data?.pages, path])

  // Auto-seleciona a página mais visitada na primeira carga (se '/' não tiver dados).
  useEffect(() => {
    if (autoPicked.current || !data?.pages?.length) return
    const has = data.pages.some((p) => p.page_path === path)
    if (!has) setPath(data.pages[0].page_path)
    autoPicked.current = true
  }, [data, path])

  // Taxa de reancoragem: fração do peso de seletores que casa no DOM atual.
  useEffect(() => {
    const doc = bg?.doc
    const sels = data?.selectors
    if (!doc || !sels || sels.length === 0) {
      setAnchorRate(null)
      return
    }
    let matched = 0
    let total = 0
    for (const s of sels) {
      total += s.weight
      try {
        if (s.selector && doc.querySelector(s.selector)) matched += s.weight
      } catch {
        /* seletor inválido no doc atual */
      }
    }
    setAnchorRate(total > 0 ? matched / total : null)
  }, [bg, data])

  // Trocar página/device remonta o iframe → invalida a medição antiga para o
  // overlay não desenhar 1 frame com dimensões do device anterior (flash).
  const changePath = (p: string) => {
    setBg(null)
    setPath(p)
  }
  const changeDevice = (d: Device) => {
    setBg(null)
    setDevice(d)
  }

  const isScroll = mode === 'scroll'
  const totalWeight = data?.totalWeight ?? 0
  const scrollCount = data?.scroll?.reduce((s, b) => Math.max(s, b.sessions), 0) ?? 0
  const sample = isScroll ? scrollCount : totalWeight
  const lowSample = !loading && !error && sample > 0 && sample < LOW_SAMPLE
  const empty = !loading && !error && sample === 0

  return (
    <GlassCard className="mt-8">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Flame className="h-4 w-4 text-mint" strokeWidth={1.75} />
        <h3 className="font-display text-[15px] font-semibold text-fg">
          Mapa de calor visual — cliques e movimento sobre a página
        </h3>
        <div className="ml-auto flex items-center gap-3">
          {anchorRate !== null && (
            <span className="font-mono text-[10px] text-dim hidden sm:inline">
              {Math.round(anchorRate * 100)}% ancorados ao layout
            </span>
          )}
          {/* Indicador "ao vivo" + última atualização + refresh manual */}
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-dim" title="O mapa se atualiza automaticamente">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'hsl(158 92% 70%)', boxShadow: '0 0 6px hsl(158 92% 70%)' }}
            />
            ao vivo{lastUpdated ? ` · ${timeLabel(lastUpdated)}` : ''}
          </span>
          <button
            onClick={refresh}
            disabled={loading || refreshing}
            title="Atualizar agora"
            className="rounded-lg p-1.5"
            style={{ background: 'hsl(0 0% 100% / 0.05)', border: '1px solid hsl(0 0% 100% / 0.1)', color: 'hsl(0 0% 91% / 0.7)' }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <HeatmapToolbar
        pages={mergedPages}
        path={path}
        onPath={changePath}
        device={device}
        onDevice={changeDevice}
        mode={mode}
        onMode={setMode}
        days={days}
        onDays={setDays}
        opacity={opacity}
        onOpacity={setOpacity}
        overlayOn={overlayOn}
        onOverlayOn={setOverlayOn}
        loading={loading}
      />

      {error && (
        <div className="rounded-xl p-4 text-[13px]" style={{ background: 'hsl(0 70% 50% / 0.08)', border: '1px solid hsl(0 70% 50% / 0.2)', color: 'hsl(0 0% 91%)' }}>
          Não foi possível carregar o mapa: {error}
        </div>
      )}

      {lowSample && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: 'hsl(45 95% 65% / 0.1)', border: '1px solid hsl(45 95% 65% / 0.25)', color: 'hsl(45 95% 80%)' }}>
          <AlertTriangle className="h-3.5 w-3.5" />
          Baixa amostragem ({sample} eventos) — o mapa pode não ser representativo ainda.
        </div>
      )}

      {empty ? (
        <div className="rounded-xl text-center py-16 px-6" style={{ background: 'hsl(0 0% 100% / 0.03)', border: '1px solid hsl(0 0% 100% / 0.08)' }}>
          <p className="text-[14px] text-fg font-medium">Sem eventos para esta combinação de filtros</p>
          <p className="mt-1.5 text-[12px] text-dim-2">
            Troque a página, o device ou o período. Lembre: o mapa começa a coletar a partir do deploy do tracker novo.
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(158 92% 70% / 0.15)', background: '#0b1418' }}>
          <HeatmapBackground path={path} device={device} onReady={setBg}>
            {bg && !isScroll && data?.points && (
              <HeatmapCanvas
                points={data.points}
                grid={data.grid ?? 200}
                maxWeight={data.maxWeight ?? 1}
                renderWidth={bg.renderWidth}
                renderHeight={bg.renderHeight}
                scale={bg.scale}
                opacity={opacity}
                visible={overlayOn}
              />
            )}
            {bg && isScroll && data?.scroll && (
              <ScrollDepthOverlay
                buckets={data.scroll}
                renderHeight={bg.renderHeight}
                opacity={opacity}
                visible={overlayOn}
              />
            )}
          </HeatmapBackground>
        </div>
      )}

      <p className="mt-3 text-[11px] text-dim leading-relaxed">
        A prévia é a versão atual da página renderizada num iframe; o calor vem dos eventos
        agregados no banco (nunca linhas cruas). Textos de formulários nunca são capturados (LGPD).
      </p>
    </GlassCard>
  )
}
