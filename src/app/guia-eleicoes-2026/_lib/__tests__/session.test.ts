/**
 * @vitest-environment jsdom
 *
 * Testes da sessão local (S5.7, cenário 3 — localStorage corrompido/parcial).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readSession, isUnlocked, persistUnlock, clearSession } from '../session'

beforeEach(() => localStorage.clear())

describe('sessão local (RF-35..38)', () => {
  it('sem dados → não desbloqueado', () => {
    expect(readSession()).toBeNull()
    expect(isUnlocked()).toBe(false)
  })

  it('round-trip de persistUnlock', () => {
    persistUnlock({
      cadastro_timestamp: '2026-06-01T00:00:00.000Z',
      lead_perfil: 'candidato',
      lead_email_hash: 'abcd1234',
      lead_id: '42',
    })
    const s = readSession()
    expect(s?.hotsite_unlocked).toBe(true)
    expect(s?.lead_email_hash).toBe('abcd1234')
    expect(isUnlocked()).toBe(true)
  })

  it('JSON corrompido não quebra (trata como não autenticado)', () => {
    localStorage.setItem('hotsite_unlocked', '{ isto não é json válido')
    expect(readSession()).toBeNull()
    expect(isUnlocked()).toBe(false)
  })

  it('flag sem hotsite_unlocked=true é ignorada', () => {
    localStorage.setItem('hotsite_unlocked', JSON.stringify({ lead_id: '1' }))
    expect(readSession()).toBeNull()
  })

  it('clearSession remove a sessão', () => {
    persistUnlock({ cadastro_timestamp: 'x', lead_perfil: 'outro' })
    expect(isUnlocked()).toBe(true)
    clearSession()
    expect(isUnlocked()).toBe(false)
  })
})
