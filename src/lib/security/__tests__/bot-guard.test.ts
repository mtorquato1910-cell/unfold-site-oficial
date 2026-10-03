import { describe, it, expect, vi, beforeEach } from 'vitest'

const verifyTurnstileMock = vi.fn()
vi.mock('../turnstile', () => ({ verifyTurnstile: verifyTurnstileMock }))

const { checkBotGuard, pickBotGuardFields, MIN_ELAPSED_MS } = await import('../bot-guard')

describe('checkBotGuard', () => {
  beforeEach(() => {
    verifyTurnstileMock.mockReset()
    verifyTurnstileMock.mockResolvedValue({ ok: true })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('aprova humano: honeypot vazio, tempo ok, Turnstile válido', async () => {
    const r = await checkBotGuard({ website: '', elapsedMs: 8000, turnstileToken: 'tok' }, '1.2.3.4', 't')
    expect(r).toEqual({ ok: true })
    expect(verifyTurnstileMock).toHaveBeenCalledWith('tok', '1.2.3.4')
  })

  it('honeypot preenchido → bloqueio silencioso sem consultar Turnstile', async () => {
    const r = await checkBotGuard({ website: 'http://spam.com', elapsedMs: 8000, turnstileToken: 'tok' }, 'ip', 't')
    expect(r).toMatchObject({ ok: false, silent: true, reason: 'honeypot' })
    expect(verifyTurnstileMock).not.toHaveBeenCalled()
  })

  it('preenchimento rápido demais → bloqueio silencioso', async () => {
    const r = await checkBotGuard({ elapsedMs: MIN_ELAPSED_MS - 1, turnstileToken: 'tok' }, 'ip', 't')
    expect(r).toMatchObject({ ok: false, silent: true })
  })

  it('chamada direta à API sem token → Turnstile reprova (não silencioso)', async () => {
    verifyTurnstileMock.mockResolvedValue({ ok: false, reason: 'token-missing' })
    const r = await checkBotGuard({}, 'ip', 't')
    expect(r).toMatchObject({ ok: false, silent: false, reason: 'turnstile:token-missing' })
  })

  it('não repassa IP "unknown" ao Turnstile', async () => {
    await checkBotGuard({ turnstileToken: 'tok' }, 'unknown', 't')
    expect(verifyTurnstileMock).toHaveBeenCalledWith('tok', undefined)
  })
})

describe('pickBotGuardFields', () => {
  it('extrai só os campos do guard', () => {
    expect(pickBotGuardFields({ email: 'a@b.com', website: 'x', elapsedMs: 1, turnstileToken: 't' })).toEqual({
      website: 'x',
      elapsedMs: 1,
      turnstileToken: 't',
    })
  })
  it('tolera body inválido', () => {
    expect(pickBotGuardFields(null)).toEqual({})
  })
})
