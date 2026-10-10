import { indexNowKey } from '@/lib/indexnow'

/**
 * Arquivo de verificação do IndexNow (S09): o conteúdo é a própria chave. Lida da
 * env INDEXNOW_KEY (não fica no repositório). Sem chave configurada → 404.
 */
export const dynamic = 'force-dynamic'

export function GET() {
  const key = indexNowKey()
  if (!key) return new Response('Not found', { status: 404 })
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
