/**
 * Wrapper de eventos GA4 do hotsite via dataLayer/GTM (GTM-M43H2LKF já carregado
 * no layout). Eventos: pagina_carregada, lead_capturado, visita_retorno,
 * pdf_baixado, link_compartilhado (RF-20/29/34/36). Sem schema/collection novos.
 */
export function trackGuia(event: string, props: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...props })
}
