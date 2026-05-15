import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

// Stubs dos módulos importados pelo route. Definidos antes do `import` do route.
const payloadCreate = vi.fn()
const payloadFind = vi.fn()
const payloadUpdate = vi.fn()
const verifyTurnstileMock = vi.fn()
const trackEventServerMock = vi.fn()
const missingProductionEnvMock = vi.fn<[], string[]>()

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    create: payloadCreate,
    find: payloadFind,
    update: payloadUpdate,
  })),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/lib/analytics/diagnostico-events-server', () => ({
  trackEventServer: trackEventServerMock,
}))
vi.mock('@/lib/security/turnstile', () => ({
  verifyTurnstile: verifyTurnstileMock,
}))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: () => ({ ok: true, resetAt: Date.now() + 60_000 }),
  resolveClientIP: () => '127.0.0.1',
}))
vi.mock('@/lib/env', () => ({
  missingProductionEnv: () => missingProductionEnvMock(),
}))
vi.mock('@/lib/observability/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const validBody = {
  nome: 'Marina Costa',
  email: 'marina@inova.com.br',
  empresa: 'Inova Sementes',
  cargo: 'ceo' as const,
  setor: 'agro' as const,
  faturamento_faixa: 'acima-500k' as const,
  urgencia: 'trimestre' as const,
  consentimento: true,
}

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/diagnostico/etapa-1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest
}

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  payloadFind.mockResolvedValue({ docs: [] })
  payloadCreate.mockResolvedValue({ id: 'lead_123' })
  payloadUpdate.mockResolvedValue({ id: 'lead_123' })
  verifyTurnstileMock.mockResolvedValue({ ok: true })
  missingProductionEnvMock.mockReturnValue([])
  process.env.PAYLOAD_SECRET = 'a'.repeat(32)
  process.env.TURNSTILE_SECRET_KEY = 'test-secret'
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('POST /api/diagnostico/etapa-1 — Sprint hotfix 2026-05-15', () => {
  it('retorna 503 com code ENV_NOT_CONFIGURED quando env crítica está ausente em prod', async () => {
    missingProductionEnvMock.mockReturnValue(['DATABASE_URL'])
    const { POST } = await import('../route')
    const res = await POST(makeRequest(validBody))
    const json = await res.json()
    expect(res.status).toBe(503)
    expect(json.code).toBe('ENV_NOT_CONFIGURED')
    expect(json.missing).toContain('DATABASE_URL')
  })

  it('retorna 500 com code PAYLOAD_FIND_FAILED quando payload.find lança — SEM mock leadId', async () => {
    payloadFind.mockRejectedValue(new Error('connection refused'))
    const { POST } = await import('../route')
    const res = await POST(makeRequest(validBody))
    const json = await res.json()
    expect(res.status).toBe(500)
    expect(json.code).toBe('PAYLOAD_FIND_FAILED')
    expect(json.token).toBeUndefined()
    expect(JSON.stringify(json)).not.toMatch(/^mock-/m)
  })

  it('retorna 400 VALIDATION_FAILED para body inválido', async () => {
    const { POST } = await import('../route')
    const res = await POST(makeRequest({ ...validBody, email: 'invalido' }))
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.code).toBe('VALIDATION_FAILED')
  })

  it('retorna 400 CAPTCHA_FAILED quando Turnstile rejeita o token', async () => {
    verifyTurnstileMock.mockResolvedValue({ ok: false, reason: 'bad-request' })
    const { POST } = await import('../route')
    const res = await POST(makeRequest(validBody))
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.code).toBe('CAPTCHA_FAILED')
  })

  it('Turnstile token ausente em prod com secret configurada → CAPTCHA_FAILED (I-5)', async () => {
    verifyTurnstileMock.mockResolvedValue({ ok: false, reason: 'token-missing' })
    const { POST } = await import('../route')
    const { turnstile_token: _omit, ...bodyWithoutToken } = validBody as never
    const res = await POST(makeRequest(bodyWithoutToken))
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.code).toBe('CAPTCHA_FAILED')
  })

  it('eco do X-Request-Id no header X-Diag-Trace-Id da resposta', async () => {
    const { POST } = await import('../route')
    const res = await POST(makeRequest(validBody, { 'X-Request-Id': 'abc12345-test' }))
    expect(res.headers.get('X-Diag-Trace-Id')).toBe('abc12345-test')
  })

  it('responde 200 + token JWT no caminho feliz', async () => {
    const { POST } = await import('../route')
    const res = await POST(makeRequest(validBody))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(typeof json.token).toBe('string')
    expect(json.leadId).toBe('lead_123')
  })
})
