/**
 * Links legais do hotsite. Absolutos para o apex, pois no subdomínio
 * `eleicoes.unfoldgrowth.com.br` um caminho relativo não resolveria.
 * Política/DPO finais dependem de D-02/D-04 — configuráveis por env.
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'

export const POLITICA_URL =
  process.env.NEXT_PUBLIC_POLITICA_URL || `${SITE}/politica-de-privacidade`

export const DPO_EMAIL = process.env.NEXT_PUBLIC_DPO_EMAIL || 'privacidade@unfoldgrowth.com.br'
