/**
 * Testes do adapter RD do guia (S5.7): montagem do payload da conversão legacy,
 * identificador canônico, tags e custom fields; e o modo mock.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const postMock = vi.fn()
vi.mock('../rd-legacy-client', () => ({
  postRDLegacyConversion: (...args: unknown[]) => postMock(...args),
}))

const { syncGuiaToRD } = await import('../rd-guia-eleicoes')

const base = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.com',
  telefone: '11999998888',
  perfil: 'candidato' as const,
  utm_source: 'linkedin',
  utm_medium: 'cpc',
  referrer: 'https://google.com',
  data_cadastro: '2026-06-01T00:00:00.000Z',
}

describe('syncGuiaToRD', () => {
  beforeEach(() => {
    postMock.mockReset().mockResolvedValue({ success: true, status: 200 })
    process.env.CRM_MODE = 'rd-station'
  })

  it('envia identificador canônico, tags e custom fields corretos', async () => {
    const r = await syncGuiaToRD(base)
    expect(r.success).toBe(true)
    expect(postMock).toHaveBeenCalledOnce()
    const arg = postMock.mock.calls[0][0] as Record<string, unknown>
    expect(arg.identificador).toBe('guia-eleicoes-2026')
    expect(arg.tags).toEqual(['guia-eleicoes-2026', 'perfil-candidato'])
    expect(arg.celular).toBe('11999998888')
    const cf = arg.customFields as Record<string, unknown>
    expect(cf.cf_caminho_do_lead).toBe('Guia Eleições 2026')
    expect(cf.cf_perfil_eleitoral_2026).toBe('Sim, sou candidato ou pré-candidato')
    expect(cf.cf_origem_hotsite).toBe('guia-eleicoes-2026')
    expect(cf.cf_utm_source).toBe('linkedin')
    expect(cf.cf_lead_referrer).toBe('https://google.com')
  })

  it('propaga falha do RD como success:false', async () => {
    postMock.mockResolvedValue({ success: false, status: 500, error: 'boom' })
    const r = await syncGuiaToRD(base)
    expect(r.success).toBe(false)
  })

  it('em modo mock não chama a API e retorna mode mock', async () => {
    process.env.CRM_MODE = 'mock'
    const r = await syncGuiaToRD({ ...base, perfil: 'outro' })
    expect(r.mode).toBe('mock')
    expect(r.success).toBe(true)
    expect(postMock).not.toHaveBeenCalled()
  })
})
