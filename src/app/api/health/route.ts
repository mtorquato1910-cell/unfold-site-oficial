import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { missingProductionEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {}

  // 1. Env vars
  const missing = missingProductionEnv()
  checks.env = missing.length === 0 ? { ok: true } : { ok: false, detail: `missing: ${missing.join(', ')}` }

  // 2. DATABASE_URL presente e formato básico
  const dbUrl = process.env.DATABASE_URL || ''
  const dbPresent = dbUrl.length > 0
  const dbIsPostgres = dbUrl.startsWith('postgres')
  checks.database_url = {
    ok: dbPresent && dbIsPostgres,
    detail: !dbPresent ? 'DATABASE_URL ausente' : !dbIsPostgres ? `formato inesperado (não começa com "postgres")` : `ok (${dbUrl.slice(0, 20)}...)`,
  }

  // 3. Payload / DB connection
  try {
    const payload = await getPayload({ config: configPromise })
    // Faz uma query leve para confirmar que a conexão está ativa
    await payload.find({ collection: 'quiz-questions', limit: 1 })
    checks.payload_db = { ok: true, detail: 'conexão OK' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // Sanitiza: remove possíveis credenciais do stack trace antes de expor
    const safe = msg.replace(/postgres(?:ql)?:\/\/[^@]+@[^/]+/gi, 'postgres://***@***')
    checks.payload_db = { ok: false, detail: safe.slice(0, 300) }
  }

  const allOk = Object.values(checks).every((c) => c.ok)

  return NextResponse.json(
    { ok: allOk, checks },
    { status: allOk ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
