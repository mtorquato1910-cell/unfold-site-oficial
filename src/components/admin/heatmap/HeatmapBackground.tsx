'use client'

/**
 * Camada de FUNDO do mapa de calor: renderiza a própria página do site num
 * iframe same-origin (o site é nosso → sem bloqueio de X-Frame-Options) com
 * `?heatmap=1` (o site desliga animações, cookie banner e autoplay nesse modo).
 *
 * Largura fixa por breakpoint (desktop 1440 / tablet 834 / mobile 390) e um
 * `transform: scale()` calculado sobre a largura do container — assim o mapa
 * reflete o mesmo layout que o usuário viu. Reporta ao pai (onReady) o
 * documento renderizado, a escala e a altura total para dimensionar o overlay.
 *
 * Evolução preparada (não usada agora): trocar mode="iframe" por "snapshot"
 * (rrweb) sem refatorar o overlay.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export type Device = 'desktop' | 'tablet' | 'mobile'

export const DEVICE_WIDTH: Record<Device, number> = {
  desktop: 1440,
  tablet: 834,
  mobile: 390,
}

export interface BackgroundInfo {
  doc: Document | null
  deviceWidth: number
  scale: number
  renderWidth: number
  renderHeight: number
  docHeight: number
}

interface Props {
  path: string
  device: Device
  mode?: 'iframe' | 'snapshot'
  reloadKey?: number
  onReady?: (info: BackgroundInfo) => void
  children?: React.ReactNode
}

export default function HeatmapBackground({ path, device, reloadKey = 0, onReady, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [scale, setScale] = useState(1)
  const [docHeight, setDocHeight] = useState(900)
  const [containerW, setContainerW] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const deviceWidth = DEVICE_WIDTH[device]
  const src = `${typeof window !== 'undefined' ? window.location.origin : ''}${path}?heatmap=1`

  // Mede a largura do container (responsivo) e recalcula a escala.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setContainerW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (containerW > 0) setScale(Math.min(1, containerW / deviceWidth))
  }, [containerW, deviceWidth])

  // Guarda os últimos valores reportados para evitar setBg redundante no pai
  // (o onReady criava um objeto novo a cada medição → churn de render).
  const lastInfoRef = useRef<{ docHeight: number; scale: number; doc: Document | null }>({
    docHeight: 0,
    scale: 0,
    doc: null,
  })
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }, [])

  // Lê a altura real do documento renderizado (com re-medições p/ lazy content).
  const measureDoc = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) return
    const h = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight || 0, 600)
    const s = Math.min(1, (containerRef.current?.clientWidth || deviceWidth) / deviceWidth)
    setDocHeight(h)
    setLoaded(true)

    const last = lastInfoRef.current
    if (last.doc === doc && last.docHeight === h && Math.abs(last.scale - s) < 0.001) return
    lastInfoRef.current = { docHeight: h, scale: s, doc }
    onReady?.({
      doc,
      deviceWidth,
      scale: s,
      renderWidth: deviceWidth * s,
      renderHeight: h * s,
      docHeight: h,
    })
  }, [deviceWidth, onReady])

  const onLoad = useCallback(() => {
    clearTimers()
    // Novo iframe: invalida a medição anterior para forçar novo reporte.
    lastInfoRef.current = { docHeight: 0, scale: 0, doc: null }
    measureDoc()
    // Re-mede após imagens/lazy renderizarem.
    timersRef.current.push(window.setTimeout(measureDoc, 500))
    timersRef.current.push(window.setTimeout(measureDoc, 1500))
  }, [measureDoc, clearTimers])

  // Re-reporta quando a escala muda (resize do container).
  useEffect(() => {
    if (loaded) measureDoc()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale])

  // Limpa timers pendentes ao desmontar.
  useEffect(() => clearTimers, [clearTimers])

  const renderHeight = docHeight * scale

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <div style={{ position: 'relative', width: '100%', height: renderHeight }}>
        <iframe
          key={`${path}-${device}-${reloadKey}`}
          ref={iframeRef}
          src={src}
          onLoad={onLoad}
          title={`Prévia de ${path}`}
          tabIndex={-1}
          scrolling="no"
          style={{
            width: deviceWidth,
            height: docHeight,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            background: '#fff',
          }}
        />
        {/* Overlay(s) — canvas de calor / linha da dobra — recebem as dimensões renderizadas. */}
        {children}
      </div>
    </div>
  )
}
