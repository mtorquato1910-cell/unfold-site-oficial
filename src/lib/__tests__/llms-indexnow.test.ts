import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildLlmsTxt, oneLine } from '../llms-txt'
import { buildIndexNowPayload, indexNowKey, pingIndexNow } from '../indexnow'

const BASE = 'https://unfoldgrowth.com.br'

describe('buildLlmsTxt', () => {
  const txt = buildLlmsTxt({
    baseUrl: BASE,
    posts: [
      { slug: 'sdr', titulo: 'SDR: o que faz', descricao: 'Guia de pré-venda.\nCom quebra', pilar: true },
      { slug: 'ltv', titulo: 'LTV [guia]', descricao: '', pilar: false },
    ],
    cases: [],
  })

  it('segue o modelo: título, resumo, seções e Optional', () => {
    expect(txt.startsWith('# Unfold Growth\n\n> ')).toBe(true)
    expect(txt).toContain('## Sobre a empresa')
    expect(txt).toContain('## Ferramentas gratuitas')
    expect(txt).toContain('## Guias e artigos principais\n- [SDR: o que faz](https://unfoldgrowth.com.br/blog/sdr): Guia de pré-venda. Com quebra')
    expect(txt).toContain('## Optional\n- [Blog](https://unfoldgrowth.com.br/blog): índice de todos os artigos')
    expect(txt).toContain('- [LTV (guia)](https://unfoldgrowth.com.br/blog/ltv)')
  })

  it('não inclui páginas legais, resultados nem seção de cases vazia', () => {
    expect(txt).not.toMatch(/termos|lgpd|politica-de-privacidade|\/diagnostico\/r\//)
    expect(txt).not.toContain('## Cases')
  })

  it('oneLine remove quebras e markdown (mantém parênteses) e limita o tamanho', () => {
    expect(oneLine('a\n*b* [c](d)')).toBe('a b c')
    expect(oneLine('Custo por Lead (CPL)')).toBe('Custo por Lead (CPL)')
    expect(oneLine('x'.repeat(300)).length).toBe(200)
  })
})

describe('IndexNow', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('monta o payload do protocolo com keyLocation e URLs absolutas sem repetir', () => {
    expect(buildIndexNowPayload(['/blog/sdr', '/blog', '/blog'], 'abc12345', BASE)).toEqual({
      host: 'unfoldgrowth.com.br',
      key: 'abc12345',
      keyLocation: 'https://unfoldgrowth.com.br/indexnow-key.txt',
      urlList: ['https://unfoldgrowth.com.br/blog/sdr', 'https://unfoldgrowth.com.br/blog'],
    })
  })

  it('valida o formato da chave', () => {
    vi.stubEnv('INDEXNOW_KEY', 'curta')
    expect(indexNowKey()).toBeNull()
    vi.stubEnv('INDEXNOW_KEY', 'a1b2c3d4e5f6')
    expect(indexNowKey()).toBe('a1b2c3d4e5f6')
  })

  it('não dispara fora de produção', async () => {
    vi.stubEnv('INDEXNOW_KEY', 'a1b2c3d4e5f6')
    vi.stubEnv('VERCEL_ENV', 'preview')
    const f = vi.fn()
    expect(await pingIndexNow(['/blog'], f as any)).toBe(false)
    expect(f).not.toHaveBeenCalled()
  })

  it('em produção envia POST e não lança erro se a rede falhar', async () => {
    vi.stubEnv('INDEXNOW_KEY', 'a1b2c3d4e5f6')
    vi.stubEnv('VERCEL_ENV', 'production')
    const ok = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    expect(await pingIndexNow(['/blog/sdr'], ok as any)).toBe(true)
    expect(ok.mock.calls[0][0]).toBe('https://api.indexnow.org/indexnow')
    expect(JSON.parse(ok.mock.calls[0][1].body).urlList).toEqual(['https://unfoldgrowth.com.br/blog/sdr'])
    const fail = vi.fn().mockRejectedValue(new Error('offline'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(await pingIndexNow(['/blog/sdr'], fail as any)).toBe(false)
  })
})
