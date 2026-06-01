/**
 * Anonimização de IP para logging e persistência (LOG-01, cuidado LGPD do dado político).
 * IPv4 → zera o último octeto (/24). IPv6 → zera os 4 últimos hextets (/64).
 */
export function anonymizeIp(ip: string | undefined | null): string {
  if (!ip) return 'unknown'
  const clean = ip.trim()
  if (clean === 'unknown' || clean === '') return 'unknown'

  // IPv4
  if (clean.includes('.') && !clean.includes(':')) {
    const parts = clean.split('.')
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`
    return 'unknown'
  }

  // IPv6 (mantém os 4 primeiros hextets, zera o resto → /64)
  if (clean.includes(':')) {
    const head = clean.split(':').slice(0, 4).join(':')
    return `${head}::`
  }

  return 'unknown'
}
