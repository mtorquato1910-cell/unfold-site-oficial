import { describe, it, expect } from 'vitest'
import { linkKind, normalizeLinkAttribs, toRelativeHref } from '../link-attrs'
import { sanitizeRichHtml } from '../html-sanitize'
import { categoryDescription, pickRelated, postCategory, RELATED_PRIORITY_SLUGS } from '../blog-categories'
import { buildSitemapEntries, type SiteIndex } from '../site-index'
import { buildLlmsTxt, llmsUrls } from '../llms-txt'
import { LIGHTHOUSE_REDIRECTS } from '../lighthouse-redirects'
import { CATEGORIES, LLMS_OPTIONAL_SLUGS } from '../../migrations/20261107_120000_blog_categories'

/** Relatório técnico de SEO de 06/11/2026 (Tarefas 1, 3, 4, 5 e 7). */
const BASE = 'https://unfoldgrowth.com.br'

describe('Tarefa 1 — links do corpo sem nofollow', () => {
  it('classifica interno, subdomínio próprio, externo e outros', () => {
    expect(linkKind('/blog/sdr')).toBe('internal')
    expect(linkKind('https://unfoldgrowth.com.br/blog/sdr')).toBe('internal')
    expect(linkKind('https://www.unfoldgrowth.com.br')).toBe('internal')
    expect(linkKind('https://eleicoes.unfoldgrowth.com.br/featwork')).toBe('own-subdomain')
    expect(linkKind('https://unfoldgrowth.com.br.evil.com/x')).toBe('external')
    expect(linkKind('https://hubspot.com/x')).toBe('external')
    expect(linkKind('mailto:a@b.com')).toBe('other')
    expect(linkKind('#faq')).toBe('other')
  })

  it('interno vira relativo, sem rel/target', () => {
    expect(toRelativeHref('https://unfoldgrowth.com.br')).toBe('/')
    expect(toRelativeHref('https://unfoldgrowth.com.br/blog/sdr#x')).toBe('/blog/sdr#x')
    expect(toRelativeHref('https://unfoldgrowth.com.br?utm=1')).toBe('/?utm=1')
    expect(
      normalizeLinkAttribs({ href: 'https://unfoldgrowth.com.br/blog/sdr', rel: 'noopener noreferrer nofollow', target: '_blank' }),
    ).toEqual({ href: '/blog/sdr' })
  })

  it('externo ganha target=_blank e rel=noopener, sem nofollow', () => {
    expect(normalizeLinkAttribs({ href: 'https://hubspot.com', rel: 'noopener noreferrer nofollow' })).toEqual({
      href: 'https://hubspot.com',
      target: '_blank',
      rel: 'noopener',
    })
  })

  it('o sanitizador do save aplica a mesma regra', () => {
    const html = sanitizeRichHtml(
      '<p><a href="https://unfoldgrowth.com.br/blog/sdr" target="_blank" rel="noopener noreferrer nofollow">a</a> ' +
        '<a href="https://g.co" rel="nofollow">b</a></p>',
    )
    expect(html).toBe('<p><a href="/blog/sdr">a</a> <a href="https://g.co" target="_blank" rel="noopener">b</a></p>')
    expect(html).not.toContain('nofollow')
  })
})

describe('Tarefa 3 — categorias', () => {
  it('a tabela cobre os 49 artigos, cada um numa só categoria', () => {
    const all = CATEGORIES.flatMap((c) => c.posts)
    expect(all).toHaveLength(49)
    expect(new Set(all).size).toBe(49)
    expect(CATEGORIES.map((c) => c.slug)).toEqual([
      'vendas-b2b', 'growth-e-marketing', 'trafego-pago', 'crm', 'incorporadoras-e-construcao', 'seo', 'inbound-marketing',
    ])
  })

  it('lê a categoria populada e gera o resumo de busca', () => {
    expect(postCategory({ categoria: { id: 3, nome: 'CRM', slug: 'crm' } })).toEqual({ id: 3, nome: 'CRM', slug: 'crm' })
    expect(postCategory({ categoria: 3 })).toBeNull()
    expect(categoryDescription({ nome: 'CRM', meta_description: ' Própria ' })).toBe('Própria')
    expect(categoryDescription({ nome: 'CRM', intro: 'x'.repeat(200) })).toHaveLength(155)
  })
})

describe('Tarefa 4 — artigos relacionados', () => {
  const posts = (slugs: string[]) => slugs.map((slug, i) => ({ slug, publicado_em: `2026-0${(i % 9) + 1}-01` }))

  it('exclui o próprio artigo, prioriza a lista e completa com os recentes', () => {
    const cands = posts(['a', 'b', 'playbook-de-vendas', 'c'])
    const r = pickRelated('a', cands).map((p) => p.slug)
    expect(r).toHaveLength(3)
    expect(r).not.toContain('a')
    expect(r[0]).toBe('playbook-de-vendas')
    expect(r.slice(1)).toEqual(['c', 'b']) // mais recentes primeiro
  })

  it('é determinístico', () => {
    const cands = posts(CATEGORIES[4].posts)
    expect(pickRelated('x', cands)).toEqual(pickRelated('x', cands))
  })

  it('toda URL da lista recebe link do bloco de outros artigos da mesma categoria', () => {
    expect(RELATED_PRIORITY_SLUGS).toEqual(LLMS_OPTIONAL_SLUGS)
    const linked = new Set<string>()
    for (const cat of CATEGORIES) {
      const cands = posts(cat.posts)
      for (const p of cat.posts) for (const r of pickRelated(p, cands)) linked.add(r.slug)
    }
    for (const s of RELATED_PRIORITY_SLUGS) expect(linked.has(s), s).toBe(true)
  })
})

describe('Tarefa 7 — llms.txt = sitemap.xml', () => {
  const index: SiteIndex = {
    posts: [
      { slug: 'sdr', titulo: 'SDR', categoriaId: '1', llmsOptional: false, date: '2026-10-01T03:00:00Z', autorIds: ['9'] },
      { slug: 'playbook-de-vendas', titulo: 'Playbook', categoriaId: '1', llmsOptional: true, date: '2026-09-01T03:00:00Z', autorIds: [] },
      { slug: 'solto', titulo: 'Sem categoria', categoriaId: null, llmsOptional: false, autorIds: [] },
    ],
    cases: [{ slug: 'case-x', titulo: 'Case X', date: '2026-08-01T03:00:00Z' }],
    authors: [{ id: '9', slug: 'gabriel', nome: 'Gabriel', descricao: 'CEO' }],
    categories: [
      { id: '1', slug: 'vendas-b2b', nome: 'Vendas B2B' },
      { id: '2', slug: 'seo', nome: 'SEO' }, // sem artigos: fora dos dois
    ],
  }
  const norm = (u: string) => u.replace(/\/+$/, '')
  const sitemapUrls = buildSitemapEntries(index, BASE).map((e) => norm(e.url)).sort()
  const llms = buildLlmsTxt({ baseUrl: BASE, index })

  it('as duas saídas têm exatamente as mesmas URLs', () => {
    expect(llmsUrls(llms).map(norm).sort()).toEqual(sitemapUrls)
  })

  it('inclui ferramentas, autores, cases e só as categorias com artigos', () => {
    expect(sitemapUrls).toContain(`${BASE}/ferramentas`)
    expect(sitemapUrls).toContain(`${BASE}/autor/gabriel`)
    expect(sitemapUrls).toContain(`${BASE}/cases/case-x`)
    expect(sitemapUrls).toContain(`${BASE}/blog/categoria/vendas-b2b`)
    expect(sitemapUrls).not.toContain(`${BASE}/blog/categoria/seo`)
  })

  it('post llms_optional vai para Optional; sem categoria vai para "Outros artigos"', () => {
    expect(llms).toMatch(/## Optional\n- \[Playbook\]\(https:\/\/unfoldgrowth\.com\.br\/blog\/playbook-de-vendas\)/)
    expect(llms).toContain('## Outros artigos\n- [Sem categoria](https://unfoldgrowth.com.br/blog/solto)')
  })

  it('lastmod da categoria e do autor = artigo mais recente', () => {
    const byUrl = Object.fromEntries(buildSitemapEntries(index, BASE).map((e) => [e.url, e.lastModified]))
    expect(byUrl[`${BASE}/blog/categoria/vendas-b2b`]).toBe('2026-10-01T00:00:00-03:00')
    expect(byUrl[`${BASE}/autor/gabriel`]).toBe('2026-10-01T00:00:00-03:00')
    expect(byUrl[`${BASE}/sobre`]).toBeUndefined()
  })
})

describe('Tarefa 5 — agencialighthouse.com', () => {
  it('todas as regras exigem o host antigo, são permanentes e vão para o apex da Unfold', () => {
    for (const r of LIGHTHOUSE_REDIRECTS) {
      expect(r.has[0].value).toBe('(www\\.)?agencialighthouse\\.com')
      expect(r.permanent).toBe(true)
      expect(r.destination.startsWith('https://unfoldgrowth.com.br/')).toBe(true)
    }
  })

  it('o catch-all é o último e as específicas vêm antes dos curingas', () => {
    const sources = LIGHTHOUSE_REDIRECTS.map((r) => r.source)
    expect(sources[sources.length - 1]).toBe('/:path*')
    expect(sources.indexOf('/blog/:path*')).toBeGreaterThan(sources.indexOf('/quem-somos'))
    const host = new RegExp(`^${LIGHTHOUSE_REDIRECTS[0].has[0].value}$`)
    expect(host.test('agencialighthouse.com')).toBe(true)
    expect(host.test('www.agencialighthouse.com')).toBe(true)
    expect(host.test('unfoldgrowth.com.br')).toBe(false)
  })
})
