/**
 * Paleta e escala do overlay de calor (estilo Microsoft Clarity / Hotjar).
 * Frio (azul) → quente (vermelho), conforme o briefing.
 */

/** Stops para o simpleheat (`0` é implícito/transparente via minOpacity). */
export const HEAT_GRADIENT: Record<number, string> = {
  0.25: '#2B5CE6', // azul
  0.45: '#22D3EE', // ciano
  0.6: '#4ADE80', // verde
  0.75: '#FDE047', // amarelo
  0.9: '#FB923C', // laranja
  1.0: '#EF4444', // vermelho
}

/** CSS gradient para a legenda (frio → quente). */
export const LEGEND_CSS =
  'linear-gradient(to right, #2B5CE6 0%, #22D3EE 25%, #4ADE80 45%, #FDE047 65%, #FB923C 82%, #EF4444 100%)'

/** Raio base do ponto de calor, proporcional à escala do iframe. */
export function heatRadius(scale: number): { radius: number; blur: number } {
  const radius = Math.max(8, Math.round(22 * scale))
  return { radius, blur: Math.round(radius * 0.7) }
}
