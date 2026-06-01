/**
 * Construção de links de compartilhamento com UTMs de viralização (RF-31..RF-33).
 * A URL base é o subdomínio público (NEXT_PUBLIC_GUIA_URL); `utm_content` carrega
 * o hash do e-mail do compartilhador para atribuir conversões secundárias (RF-33).
 */

const GUIA_URL =
  process.env.NEXT_PUBLIC_GUIA_URL || 'https://eleicoes.unfoldgrowth.com.br/featwork'

export type ShareChannel = 'whatsapp' | 'email'

function buildShareUrl(channel: ShareChannel, emailHash?: string): string {
  const u = new URL(GUIA_URL)
  u.searchParams.set('utm_source', 'share')
  u.searchParams.set('utm_medium', channel)
  u.searchParams.set('utm_campaign', 'guia-eleicoes-2026')
  if (emailHash) u.searchParams.set('utm_content', emailHash)
  return u.toString()
}

function message(url: string): string {
  return `Acabei de ler o "Guia de Anúncios Digitais para as Eleições de 2026" da Unfold × Feat.Work. Vale a leitura para quem está pensando em 2026. Acessa aqui: ${url}`
}

export function buildWhatsappUrl(emailHash?: string): string {
  const url = buildShareUrl('whatsapp', emailHash)
  return `https://wa.me/?text=${encodeURIComponent(message(url))}`
}

export function buildMailtoUrl(emailHash?: string): string {
  const url = buildShareUrl('email', emailHash)
  const subject =
    'Guia de Anúncios Digitais para as Eleições de 2026 — Unfold × Feat.Work'
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message(url))}`
}
