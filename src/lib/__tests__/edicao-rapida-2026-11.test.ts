import { describe, it, expect } from 'vitest'
import { pickRelated, postTags } from '../blog-categories'
import { fromBrtInput, toBrtInput } from '../content-date'

/**
 * Edição rápida + seção única de SEO (manual do desenvolvedor de 13/11/2026 e
 * respostas do cliente de 17/11/2026).
 */

describe('data de publicação no painel (horário de Brasília)', () => {
  it('ISO UTC → valor do datetime-local em BRT', () => {
    expect(toBrtInput('2026-11-17T13:30:00.000Z')).toBe('2026-11-17T10:30')
    expect(toBrtInput(null)).toBe('')
    expect(toBrtInput('lixo')).toBe('')
  })

  it('datetime-local em BRT → ISO UTC (ida e volta sem perda)', () => {
    expect(fromBrtInput('2026-11-17T10:30')).toBe('2026-11-17T13:30:00.000Z')
    expect(fromBrtInput(toBrtInput('2026-01-02T02:00:00.000Z'))).toBe('2026-01-02T02:00:00.000Z')
  })

  it('vazio ou inválido = null (não grava)', () => {
    expect(fromBrtInput('')).toBeNull()
    expect(fromBrtInput(undefined)).toBeNull()
    expect(fromBrtInput('17/11/2026')).toBeNull()
  })
})

describe('tags', () => {
  it('normaliza maiúsculas, espaços e repetidas', () => {
    expect(postTags({ tags: [{ tag: 'CRM' }, { tag: ' crm ' }, { tag: 'Funil de Vendas' }, { tag: '' }] })).toEqual([
      'crm',
      'funil de vendas',
    ])
    expect(postTags({})).toEqual([])
  })
})

describe('relacionados com tags', () => {
  const post = (slug: string, categoria: number, tags: string[], publicado_em = '2026-01-01') => ({
    slug,
    categoria,
    tags: tags.map((tag) => ({ tag })),
    publicado_em,
  })

  it('tags em comum vêm antes dos recentes da mesma categoria', () => {
    const cands = [
      post('recente-mesma-cat', 1, [], '2026-10-01'),
      post('outra-cat-2-tags', 2, ['crm', 'pipeline']),
      post('mesma-cat-1-tag', 1, ['CRM']),
      post('sem-relacao', 3, ['seo'], '2026-11-01'),
    ]
    const r = pickRelated('atual', cands, 3, [], { tags: ['crm', 'pipeline'], categoryId: '1' }).map((p) => p.slug)
    expect(r).toEqual(['outra-cat-2-tags', 'mesma-cat-1-tag', 'recente-mesma-cat'])
    expect(r).not.toContain('sem-relacao')
  })

  it('com tags em comum, as URLs prioritárias ocupam no máximo n-1 vagas', () => {
    const cands = [
      post('p1', 1, []),
      post('p2', 1, []),
      post('p3', 1, []),
      post('com-tag', 2, ['crm']),
    ]
    const r = pickRelated('atual', cands, 3, ['p1', 'p2', 'p3'], { tags: ['crm'], categoryId: '1' }).map((p) => p.slug)
    expect(r).toHaveLength(3)
    expect(r).toContain('com-tag')
    expect(r.filter((s) => s.startsWith('p'))).toHaveLength(2)
  })

  it('prioritária de outra categoria não entra só por estar na lista', () => {
    const cands = [post('prio-outra-cat', 2, []), post('mesma', 1, [])]
    const r = pickRelated('atual', cands, 3, ['prio-outra-cat'], { tags: [], categoryId: '1' }).map((p) => p.slug)
    expect(r).toEqual(['mesma'])
  })

  it('artigo sem categoria: só entram os que têm tag em comum', () => {
    const cands = [post('com-tag', 1, ['crm']), post('sem-tag', 1, [])]
    const r = pickRelated('atual', cands, 3, [], { tags: ['crm'], categoryId: null }).map((p) => p.slug)
    expect(r).toEqual(['com-tag'])
  })
})
