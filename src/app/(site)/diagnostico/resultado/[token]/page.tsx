/**
 * Rota legada — mantida por 30 dias após Sprint 3 como redirect transparente para `/r/[hash]`.
 *
 * Estratégia:
 *  1. Decodifica o JWT antigo.
 *  2. Se houver `resultId` válido, busca no DB o `url_resultado_hash`.
 *  3. Redirect 308 (permanent) para `/diagnostico/r/[hash]`.
 *  4. Fallback: renderiza tela explicativa quando o token é inválido/expirado/sem hash.
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const metadata: Metadata = {
  title: 'Seu Diagnóstico | Unfold Growth',
  robots: { index: false },
}

type Props = { params: Promise<{ token: string }> }

const SECRET = new TextEncoder().encode(
  process.env.PAYLOAD_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION',
)

export default async function DiagnosticoResultadoLegacyPage({ params }: Props) {
  const { token } = await params

  let resultId: string | undefined
  try {
    const { payload } = await jwtVerify(token, SECRET)
    resultId = (payload as { resultId?: string }).resultId
  } catch {
    return <TokenInvalido />
  }

  if (!resultId || resultId.startsWith('mock-')) {
    return <TokenInvalido />
  }

  let hash: string | undefined
  try {
    const payloadCMS = await getPayload({ config: configPromise })
    const doc = await payloadCMS.findByID({
      collection: 'diagnostico-results',
      id: resultId,
    })
    hash = (doc as { url_resultado_hash?: string }).url_resultado_hash
  } catch {
    return <TokenInvalido />
  }

  if (!hash) {
    return <TokenInvalido />
  }

  redirect(`/diagnostico/r/${hash}`)
}

function TokenInvalido() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary mb-4">
          Resultado indisponível
        </p>
        <h1 className="font-display font-bold text-2xl mb-3">
          Este link expirou ou não está mais ativo.
        </h1>
        <p className="text-foreground/80 text-sm mb-8 leading-relaxed">
          Os links antigos do diagnóstico foram migrados para um novo formato. Se você fez o
          diagnóstico recentemente, procure no e-mail pelo link mais novo. Caso contrário, refaça
          em menos de 5 minutos.
        </p>
        <a
          href="/diagnostico"
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
        >
          Fazer diagnóstico
        </a>
      </div>
    </main>
  )
}
