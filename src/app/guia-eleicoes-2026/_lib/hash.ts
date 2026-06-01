/**
 * Hash SHA-256 truncado do e-mail do lead (RF-33/RF-35) — usado em UTM de
 * compartilhamento e na sessão local, para atribuir conversões secundárias
 * sem expor dados pessoais. Usa Web Crypto (disponível em browsers e Node 18+).
 */
export async function sha256Truncate8(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase())
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hex.slice(0, 8)
}
