import { describe, it, expect } from 'vitest'
import { LEGACY_REDIRECTS } from '../legacy-redirects'

describe('LEGACY_REDIRECTS', () => {
  const sources = LEGACY_REDIRECTS.map((r) => r.source)

  it('não tem origem duplicada', () => {
    expect(new Set(sources).size).toBe(sources.length)
  })

  it('nenhum destino é origem de outro redirect (sem cadeia nem loop)', () => {
    for (const r of LEGACY_REDIRECTS) {
      expect(sources).not.toContain(r.destination)
      expect(r.destination).not.toBe(r.source)
    }
  })

  it('todos são permanentes, com caminho absoluto e sem barra final', () => {
    for (const r of LEGACY_REDIRECTS) {
      expect(r.permanent).toBe(true)
      expect(r.source.startsWith('/')).toBe(true)
      expect(r.destination.startsWith('/')).toBe(true)
      if (r.destination !== '/') expect(r.destination.endsWith('/')).toBe(false)
    }
  })

  it('inclui os 10 redirects do Anexo B (S02)', () => {
    const expected: Record<string, string> = {
      '/blog/as-metricas-de-growth-que-importam': '/blog/quais-metricas-e-como-medir-em-growth-marketing',
      '/blog/previsibilidade-comercial-na-incorporadora':
        '/blog/previsibilidade-comercial-como-sair-do-mes-a-mes-na-incorporadora',
      '/blog/geracao-de-demanda-x-geracao-de-leads':
        '/blog/geracao-de-demanda-x-geracao-de-leads-por-que-mais-leads-podem-estar-piorando-suas-vendas-b2b',
      '/blog/marketing-para-incorporadoras-e-construtoras': '/blog/marketing-e-growth-para-incorporadoras-e-construtoras',
      '/blog/por-que-incorporadora-gera-leads-e-nao-vende':
        '/blog/por-que-sua-incorporadora-gera-leads-e-nao-fecha-vendas-e-como-resolver',
      '/blog/crm-para-incorporadora': '/blog/crm-para-incorporadora-como-organizar-o-funil-de-lancamento',
      '/blog/sales-enablement-incorporadora': '/blog/sales-enablement-para-corretores-e-comite-de-compra',
      '/calculadora': '/ferramentas/calculadora-trafego',
      '/processo-comercial': '/blog/processo-comercial',
      '/blog/quanto-investir-para-vender-um-lancamento-imobiliario':
        '/blog/quanto-investir-em-trafego-pago-para-lancamento-imobiliario',
    }
    for (const [source, destination] of Object.entries(expected)) {
      expect(LEGACY_REDIRECTS.find((r) => r.source === source)?.destination).toBe(destination)
    }
  })

  it('NÃO redireciona /blog/receita-previsivel (decisão D1: a URL nunca existiu)', () => {
    expect(sources).not.toContain('/blog/receita-previsivel')
  })
})
