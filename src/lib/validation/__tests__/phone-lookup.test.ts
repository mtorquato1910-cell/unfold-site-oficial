/**
 * Testes de verifyPhoneLookup — conector Twilio Lookup v2 (sempre fail-open).
 * `fetch` é mockado para controlar a resposta da Twilio.
 *
 * NOTA: o módulo mantém um cache em memória por número. Cada teste usa um número
 * ÚNICO para não herdar resultado cacheado de outro teste.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { verifyPhoneLookup } from '../phone-lookup'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  vi.stubEnv('TWILIO_ACCOUNT_SID', 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
  vi.stubEnv('TWILIO_AUTH_TOKEN', 'secret-token')
  vi.stubEnv('PHONE_LOOKUP_ENABLED', '')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function jsonRes(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('verifyPhoneLookup — sem configuração (fail-open)', () => {
  it('pula a checagem quando faltam credenciais', async () => {
    vi.stubEnv('TWILIO_ACCOUNT_SID', '')
    const r = await verifyPhoneLookup('5511970000101')
    expect(r).toEqual({ ok: true, checked: false })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('pula a checagem quando PHONE_LOOKUP_ENABLED=false', async () => {
    vi.stubEnv('PHONE_LOOKUP_ENABLED', 'false')
    const r = await verifyPhoneLookup('5511970000102')
    expect(r.checked).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('verifyPhoneLookup — Twilio responde', () => {
  it('aprova celular válido', async () => {
    fetchMock.mockResolvedValue(
      jsonRes({ valid: true, line_type_intelligence: { type: 'mobile' } }),
    )
    const r = await verifyPhoneLookup('5511970000201')
    expect(r.ok).toBe(true)
    expect(r.checked).toBe(true)
    expect(r.lineType).toBe('mobile')
  })

  it('reprova número inválido (valid=false)', async () => {
    fetchMock.mockResolvedValue(jsonRes({ valid: false }))
    const r = await verifyPhoneLookup('5511970000202')
    expect(r.ok).toBe(false)
    expect(r.checked).toBe(true)
    expect(r.reason).toBe('invalido')
  })

  it('reprova número não provisionado — valid=true + error_code 60600 (caso do fake 82900000000)', async () => {
    // Payload real da Twilio para o número falso do lead.
    fetchMock.mockResolvedValue(
      jsonRes({ valid: true, line_type_intelligence: { type: null, error_code: 60600 } }),
    )
    const r = await verifyPhoneLookup('5511970000203')
    expect(r.ok).toBe(false)
    expect(r.checked).toBe(true)
    expect(r.reason).toBe('invalido')
  })

  it('fail-open em error_code inconclusivo (ex.: 60601, região sem line type)', async () => {
    fetchMock.mockResolvedValue(
      jsonRes({ valid: true, line_type_intelligence: { type: null, error_code: 60601 } }),
    )
    const r = await verifyPhoneLookup('5511970000204')
    expect(r.ok).toBe(true)
  })

  it('reprova telefone fixo (landline — não tem WhatsApp)', async () => {
    fetchMock.mockResolvedValue(
      jsonRes({ valid: true, line_type_intelligence: { type: 'landline' } }),
    )
    const r = await verifyPhoneLookup('5511970000205')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('nao_celular')
  })

  it('envia o número em E.164 com "+" e header Basic', async () => {
    fetchMock.mockResolvedValue(jsonRes({ valid: true, line_type_intelligence: { type: 'mobile' } }))
    await verifyPhoneLookup('5511970000206')
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('%2B5511970000206') // "+" encodado
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: expect.stringMatching(/^Basic /),
    })
  })
})

describe('verifyPhoneLookup — cache (economia de custo)', () => {
  it('reusa o resultado conclusivo e NÃO consulta a Twilio de novo', async () => {
    fetchMock.mockResolvedValue(
      jsonRes({ valid: true, line_type_intelligence: { type: 'mobile' } }),
    )
    const r1 = await verifyPhoneLookup('5511970000301')
    const r2 = await verifyPhoneLookup('5511970000301')
    expect(r1.ok).toBe(true)
    expect(r2).toEqual(r1)
    expect(fetchMock).toHaveBeenCalledTimes(1) // 2ª chamada veio do cache
  })

  it('NÃO cacheia fail-open (erro transitório pode virar sucesso depois)', async () => {
    fetchMock.mockResolvedValue(jsonRes({ message: 'auth' }, 401))
    await verifyPhoneLookup('5511970000302')
    await verifyPhoneLookup('5511970000302')
    expect(fetchMock).toHaveBeenCalledTimes(2) // reconsulta, pois não cacheou
  })
})

describe('verifyPhoneLookup — fail-open em erros', () => {
  it('404 é conclusivo (número inválido)', async () => {
    fetchMock.mockResolvedValue(jsonRes({}, 404))
    const r = await verifyPhoneLookup('5511970000401')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('invalido')
  })

  it('401/500 → fail-open (não bloqueia)', async () => {
    fetchMock.mockResolvedValue(jsonRes({ message: 'auth' }, 401))
    const r = await verifyPhoneLookup('5511970000402')
    expect(r).toEqual({ ok: true, checked: false })
  })

  it('resposta sem "valid" → fail-open', async () => {
    fetchMock.mockResolvedValue(jsonRes({ phone_number: '+5511970000403' }))
    const r = await verifyPhoneLookup('5511970000403')
    expect(r.checked).toBe(false)
  })

  it('timeout / erro de rede → fail-open', async () => {
    fetchMock.mockRejectedValue(new Error('network'))
    const r = await verifyPhoneLookup('5511970000404')
    expect(r).toEqual({ ok: true, checked: false })
  })
})
