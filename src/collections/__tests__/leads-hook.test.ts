/**
 * Regressão da guarda anti-dupla-conversão no afterChange de `leads` (S3.6 / GAP-A3).
 * Origens com sync própria (endpoint dedicado) NÃO devem acionar o hook genérico;
 * as demais devem continuar sincronizando.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const syncContactMock = vi.fn()
vi.mock('../../lib/crm/adapter', () => ({
  syncContact: (...args: unknown[]) => syncContactMock(...args),
}))

// Import após o mock para garantir a substituição.
const { Leads } = await import('../Leads')

type HookFn = (args: { doc: Record<string, unknown>; operation: string }) => Promise<unknown>
const afterChange = (Leads.hooks!.afterChange as unknown as HookFn[])[0]

function makeDoc(origem: string) {
  return { origem, nome: 'Fulano', email: 'fulano@exemplo.com' }
}

describe('Leads afterChange — guarda anti-dupla-conversão', () => {
  beforeEach(() => {
    syncContactMock.mockReset().mockResolvedValue({ success: true, mode: 'mock', external_id: 'x' })
  })

  it('NÃO sincroniza origens com sync própria (calculadora, guia-eleicoes)', async () => {
    await afterChange({ doc: makeDoc('calculadora'), operation: 'create' })
    await afterChange({ doc: makeDoc('guia-eleicoes'), operation: 'create' })
    expect(syncContactMock).not.toHaveBeenCalled()
  })

  it('sincroniza diagnostico e newsletter pelo hook genérico', async () => {
    await afterChange({ doc: makeDoc('diagnostico'), operation: 'create' })
    await afterChange({ doc: makeDoc('newsletter-site'), operation: 'create' })
    expect(syncContactMock).toHaveBeenCalledTimes(2)
  })

  it('ignora operações que não sejam create', async () => {
    await afterChange({ doc: makeDoc('diagnostico'), operation: 'update' })
    expect(syncContactMock).not.toHaveBeenCalled()
  })
})
