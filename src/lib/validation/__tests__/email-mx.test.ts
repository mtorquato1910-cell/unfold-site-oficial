/**
 * Testes de verifyEmailDeliverable — sintaxe + descartável + MX/DNS (fail-open).
 * O módulo node:dns é mockado para controlar o resultado do lookup.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const resolveMx = vi.fn()
const resolve = vi.fn()

vi.mock('node:dns', () => ({
  promises: {
    resolveMx: (...args: unknown[]) => resolveMx(...args),
    resolve: (...args: unknown[]) => resolve(...args),
  },
}))

// Import depois do mock para garantir que o módulo use o dns mockado.
const { verifyEmailDeliverable } = await import('../email-mx')

beforeEach(() => {
  resolveMx.mockReset()
  resolve.mockReset()
})

describe('verifyEmailDeliverable — sintaxe', () => {
  it('reprova sintaxe inválida sem consultar DNS', async () => {
    const r = await verifyEmailDeliverable('sem-arroba')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('sintaxe')
    expect(resolveMx).not.toHaveBeenCalled()
  })

  it('normaliza para lowercase + trim', async () => {
    resolveMx.mockResolvedValue([{ exchange: 'mx.x.com', priority: 10 }])
    const r = await verifyEmailDeliverable('  JOAO@Empresa.COM  ')
    expect(r.email).toBe('joao@empresa.com')
    expect(r.ok).toBe(true)
  })
})

describe('verifyEmailDeliverable — descartáveis', () => {
  it('reprova domínio descartável', async () => {
    const r = await verifyEmailDeliverable('a@mailinator.com')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('descartavel')
  })
})

describe('verifyEmailDeliverable — MX/DNS', () => {
  it('aprova quando há registros MX', async () => {
    resolveMx.mockResolvedValue([{ exchange: 'aspmx.l.google.com', priority: 1 }])
    const r = await verifyEmailDeliverable('user@gmail.com')
    expect(r.ok).toBe(true)
    expect(r.reason).toBeUndefined()
  })

  it('reprova domínio inexistente (NXDOMAIN) sem registro A', async () => {
    const err = Object.assign(new Error('nope'), { code: 'ENOTFOUND' })
    resolveMx.mockRejectedValue(err)
    resolve.mockRejectedValue(err)
    const r = await verifyEmailDeliverable('user@dominio-que-nao-existe-xyz.con')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('sem_mx')
  })

  it('aprova via fallback de registro A quando não há MX', async () => {
    resolveMx.mockRejectedValue(Object.assign(new Error('no mx'), { code: 'ENODATA' }))
    resolve.mockResolvedValue(['1.2.3.4'])
    const r = await verifyEmailDeliverable('user@dominio-so-com-A.com')
    expect(r.ok).toBe(true)
  })

  it('FAIL-OPEN: aprova (assumed) quando o DNS dá timeout/erro de rede', async () => {
    resolveMx.mockRejectedValue(Object.assign(new Error('servfail'), { code: 'ESERVFAIL' }))
    const r = await verifyEmailDeliverable('user@timeout-domain.com')
    expect(r.ok).toBe(true)
    expect(r.assumed).toBe(true)
  })
})
