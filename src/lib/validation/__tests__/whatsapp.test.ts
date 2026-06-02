/**
 * Testes de verifyWhatsappExists — conector Evolution API (sempre fail-open).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { verifyWhatsappExists } from '../whatsapp'

const fetchMock = vi.fn()

function configureEvolution() {
  vi.stubEnv('EVOLUTION_API_URL', 'https://evo.example.com')
  vi.stubEnv('EVOLUTION_INSTANCE', 'unfold')
  vi.stubEnv('EVOLUTION_API_KEY', 'secret-key')
  vi.stubEnv('WHATSAPP_VALIDATION_ENABLED', '')
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('verifyWhatsappExists — sem configuração', () => {
  it('FAIL-OPEN: não checa quando Evolution não está configurada', async () => {
    vi.stubEnv('EVOLUTION_API_URL', '')
    const r = await verifyWhatsappExists('5511999998888')
    expect(r.ok).toBe(true)
    expect(r.checked).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('desliga via WHATSAPP_VALIDATION_ENABLED=false mesmo com URL', async () => {
    configureEvolution()
    vi.stubEnv('WHATSAPP_VALIDATION_ENABLED', 'false')
    const r = await verifyWhatsappExists('5511999998888')
    expect(r.checked).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('verifyWhatsappExists — Evolution responde', () => {
  beforeEach(configureEvolution)

  it('aprova quando exists=true', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ exists: true, jid: '...', number: '5511999998888' }],
    })
    const r = await verifyWhatsappExists('5511999998888')
    expect(r.ok).toBe(true)
    expect(r.checked).toBe(true)
    expect(r.exists).toBe(true)
  })

  it('reprova quando exists=false', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ exists: false, number: '5511999998888' }],
    })
    const r = await verifyWhatsappExists('5511999998888')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('nao_existe')
  })

  it('envia número no body e apikey no header', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [{ exists: true, number: '5511999998888' }] })
    await verifyWhatsappExists('5511999998888')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/chat/whatsappNumbers/unfold')
    expect(init.headers.apikey).toBe('secret-key')
    expect(JSON.parse(init.body)).toEqual({ numbers: ['5511999998888'] })
  })
})

describe('verifyWhatsappExists — fail-open em erros', () => {
  beforeEach(configureEvolution)

  it('FAIL-OPEN quando a Evolution retorna HTTP erro', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) })
    const r = await verifyWhatsappExists('5511999998888')
    expect(r.ok).toBe(true)
    expect(r.checked).toBe(false)
  })

  it('FAIL-OPEN quando fetch lança (timeout/rede)', async () => {
    fetchMock.mockRejectedValue(new Error('network'))
    const r = await verifyWhatsappExists('5511999998888')
    expect(r.ok).toBe(true)
    expect(r.checked).toBe(false)
  })
})
