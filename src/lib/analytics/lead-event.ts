/**
 * Evento de conversão de lead para o GTM/GA4 (Tarefa 2 do relatório técnico de SEO
 * de 06/11/2026). O GA4 recebia `form_start` mas nenhum `form_submit`/`generate_lead`:
 * os gatilhos de "envio de formulário" do GTM não pegam envios via fetch.
 *
 * Regra: chamar SOMENTE depois da resposta de sucesso do servidor. No GTM, o gatilho
 * é o evento personalizado `generate_lead`, que alimenta a tag de evento do GA4.
 */
export type LeadFormId =
  | 'contato'
  | 'diagnostico'
  | 'calculadora-trafego'
  | 'mapa-icp'
  | 'newsletter'
  | 'guia-eleicoes'
  | 'guia-eleicoes-consultoria'

export function trackLead(formId: LeadFormId): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({
    event: 'generate_lead',
    form_id: formId,
    page_path: window.location.pathname,
  })
}
