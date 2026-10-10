/**
 * IndexNow (S09 — épico seo-tecnico-2026-10; Checklist SEO M07).
 *
 * Avisa o Bing (e os demais buscadores do protocolo) quando uma página é publicada,
 * atualizada ou removida. O Copilot responde a partir do índice do Bing — sem isso
 * a atualização só é vista no próximo rastreio.
 *
 * - Só em produção (`VERCEL_ENV === 'production'`) e com `INDEXNOW_KEY` definida.
 * - A chave é servida em /indexnow-key.txt (keyLocation), não num arquivo commitado.
 * - Fora do caminho crítico: nunca lança erro nem atrasa o save (falha só vai para o log).
 */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
const ENDPOINT = 'https://api.indexnow.org/indexnow'

export function indexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim()
  // Formato do protocolo: 8–128 caracteres [a-zA-Z0-9-].
  return key && /^[a-zA-Z0-9-]{8,128}$/.test(key) ? key : null
}

export function buildIndexNowPayload(paths: string[], key: string, rawBaseUrl = BASE_URL) {
  const baseUrl = rawBaseUrl.replace(/\/+$/, '')
  const host = new URL(baseUrl).host
  const urlList = [...new Set(paths.map((p) => (p.startsWith('http') ? p : `${baseUrl}${p.startsWith('/') ? p : `/${p}`}`)))]
  return { host, key, keyLocation: `${baseUrl}/indexnow-key.txt`, urlList }
}

/** Dispara o aviso (fire-and-forget). Retorna se chegou a enviar. */
export async function pingIndexNow(paths: string[], fetchImpl: typeof fetch = fetch): Promise<boolean> {
  const key = indexNowKey()
  if (process.env.VERCEL_ENV !== 'production' || !key || paths.length === 0) return false
  try {
    const res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(buildIndexNowPayload(paths, key)),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) console.warn(`[indexnow] HTTP ${res.status} para ${paths.join(', ')}`)
    return true
  } catch (e: any) {
    console.warn('[indexnow] falhou:', e?.message)
    return false
  }
}

/**
 * Agenda o aviso para DEPOIS da resposta (`after` do Next): não atrasa o save no
 * painel e não é cortado quando a função serverless responde.
 */
export async function notifyIndexNow(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  try {
    const { after } = await import('next/server')
    after(() => pingIndexNow(paths).then(() => undefined))
  } catch {
    // Fora de um contexto de request (scripts/testes): não avisa.
  }
}
