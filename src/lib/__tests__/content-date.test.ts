import { describe, it, expect } from 'vitest'
import { computeContentUpdatedAt, contentSignature, toBrtIso, brtDay } from '../content-date'

const NOW = new Date('2026-10-10T15:00:00.000Z')
const PREV = '2026-10-01T03:00:00.000Z'
const PUB = '2026-07-19T15:39:54.404Z'

const original = {
  titulo: 'SDR: o que faz',
  conteudo_html: '<h2>Intro</h2><p>Texto do post com <a href="/blog/x">link</a>.</p>',
  publicado_em: PUB,
  content_updated_at: PREV,
}

const base = { titleField: 'titulo', htmlField: 'conteudo_html', publishedField: 'publicado_em', now: NOW }

function update(data: Record<string, any>, context?: Record<string, any>) {
  return computeContentUpdatedAt({ ...base, operation: 'update', data, originalDoc: original, context })
}

describe('toBrtIso', () => {
  it('formata em ISO 8601 com o fuso -03:00', () => {
    expect(toBrtIso('2026-10-01T03:00:00.000Z')).toBe('2026-10-01T00:00:00-03:00')
    expect(toBrtIso(new Date('2026-08-07T21:23:50.204Z'))).toBe('2026-08-07T18:23:50-03:00')
  })
  it('retorna undefined para vazio ou inválido', () => {
    expect(toBrtIso(null)).toBeUndefined()
    expect(toBrtIso('')).toBeUndefined()
    expect(toBrtIso('não é data')).toBeUndefined()
  })
  it('brtDay usa o dia civil de Brasília', () => {
    expect(brtDay('2026-10-02T01:00:00.000Z')).toBe('2026-10-01')
  })
})

describe('contentSignature', () => {
  it('ignora diferenças de serialização (espaços, atributos, <br>)', () => {
    const a = '<p class="x">Olá   mundo<br/>fim</p>'
    const b = '<p>Olá mundo<br> fim</p>\n'
    expect(contentSignature(a)).toBe(contentSignature(b))
  })
  it('captura mudança de texto, de estrutura e de imagem', () => {
    const base = '<h2>A</h2><p>texto</p><img src="/a.webp" alt="">'
    expect(contentSignature(base)).not.toBe(contentSignature('<h2>A</h2><p>texto novo</p><img src="/a.webp" alt="">'))
    expect(contentSignature(base)).not.toBe(contentSignature('<h3>A</h3><p>texto</p><img src="/a.webp" alt="">'))
    expect(contentSignature(base)).not.toBe(contentSignature('<h2>A</h2><p>texto</p><img src="/b.webp" alt="">'))
  })
  it('desembrulhar um link mantém a assinatura de texto mas muda a de tags', () => {
    // Por isso scripts técnicos usam context.technicalEdit em vez de contar com a assinatura.
    const withLink = '<p>Veja <a href="/x">isto</a>.</p>'
    const without = '<p>Veja isto.</p>'
    expect(contentSignature(withLink)).not.toBe(contentSignature(without))
  })
})

describe('computeContentUpdatedAt', () => {
  it('(a) edição de título atualiza a data', () => {
    expect(update({ titulo: 'SDR: o que faz e quando contratar' })).toBe(NOW.toISOString())
  })

  it('(b) edição de corpo atualiza a data', () => {
    expect(update({ conteudo_html: original.conteudo_html.replace('Texto', 'Texto revisado') })).toBe(
      NOW.toISOString(),
    )
  })

  it('(c) só espaço/quebra de linha/atributo não atualiza', () => {
    expect(
      update({
        titulo: '  SDR:  o que faz ',
        conteudo_html: '<h2 id="intro">Intro</h2>\n<p>Texto do post com <a href="/blog/y" rel="x">link</a>.</p>',
      }),
    ).toBe(PREV)
  })

  it('(d) mudança de SEO/resumo/status/FAQ não atualiza', () => {
    expect(
      update({
        meta_description: 'nova',
        resumo: 'novo',
        status: 'published',
        faq: [{ pergunta: 'p', resposta: 'r' }],
        conteudo: { root: {} }, // Lexical regerado a cada save do painel — ignorado
      }),
    ).toBe(PREV)
  })

  it('(e) technicalEdit nunca altera, mesmo com corpo diferente', () => {
    expect(update({ conteudo_html: '<p>outro corpo</p>', titulo: 'outro' }, { technicalEdit: true })).toBe(PREV)
  })

  it('(f) create usa a data de publicação', () => {
    expect(
      computeContentUpdatedAt({ ...base, operation: 'create', data: { titulo: 't', publicado_em: PUB } }),
    ).toBe(new Date(PUB).toISOString())
  })

  it('create de rascunho (sem publicação) usa agora', () => {
    expect(computeContentUpdatedAt({ ...base, operation: 'create', data: { titulo: 't' } })).toBe(NOW.toISOString())
  })

  it('nunca fica antes da publicação (rascunho publicado depois)', () => {
    const draft = { titulo: 't', conteudo_html: '<p>a</p>', content_updated_at: '2026-10-01T00:00:00.000Z' }
    const published = '2026-10-05T12:00:00.000Z'
    expect(
      computeContentUpdatedAt({
        ...base,
        operation: 'update',
        data: { status: 'published', publicado_em: published },
        originalDoc: draft,
      }),
    ).toBe(published)
  })

  it('publicação agendada no futuro não gera data futura', () => {
    const future = '2026-12-01T12:00:00.000Z'
    expect(
      computeContentUpdatedAt({ ...base, operation: 'create', data: { titulo: 't', publicado_em: future } }),
    ).toBe(NOW.toISOString())
  })

  it('decodifica entidades sem dupla decodificação', () => {
    expect(contentSignature('<p>a &amp;lt; b</p>')).not.toBe(contentSignature('<p>a &lt; b</p>'))
    expect(contentSignature('<p>a&#8212;b</p>')).toBe(contentSignature('<p>a—b</p>'))
  })

  it('doc antigo sem content_updated_at e sem mudança cai para a publicação', () => {
    const { content_updated_at: _omit, ...legacy } = original
    expect(
      computeContentUpdatedAt({ ...base, operation: 'update', data: { resumo: 'x' }, originalDoc: legacy }),
    ).toBe(new Date(PUB).toISOString())
  })
})

describe('computeContentUpdatedAt — cases (S10: campos title/conteudo_html/published_at)', () => {
  const caseBase = { titleField: 'title', htmlField: 'conteudo_html', publishedField: 'published_at', now: NOW }
  const orig = { title: 'Case Acme', conteudo_html: '<h2>Desafio</h2><p>a</p>', published_at: PUB, content_updated_at: PREV }
  it('muda com o corpo do case e não com resumo/números/SEO', () => {
    expect(
      computeContentUpdatedAt({ ...caseBase, operation: 'update', data: { conteudo_html: '<h2>Desafio</h2><p>b</p>' }, originalDoc: orig }),
    ).toBe(NOW.toISOString())
    expect(
      computeContentUpdatedAt({
        ...caseBase,
        operation: 'update',
        data: { excerpt: 'x', highlights: [{ label: 'Leads', value: '+1' }], meta_title: 'y' },
        originalDoc: orig,
      }),
    ).toBe(PREV)
  })
})
