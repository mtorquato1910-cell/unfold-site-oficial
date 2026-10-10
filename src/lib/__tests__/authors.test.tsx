import { describe, it, expect, vi } from 'vitest'

// SchemaOrg importa o global do Payload (OrganizationSchema); não é usado aqui.
vi.mock('@/lib/site-settings', () => ({ getPublicSiteSettings: async () => ({}) }))
import { renderToString } from 'react-dom/server'
import {
  authorIndexable,
  authorNames,
  authorPhoto,
  authorProfiles,
  postAuthors,
  publishMissingAuthor,
} from '../authors'
import { ArticleSchema, ProfilePageSchema } from '@/components/SchemaOrg'

const gabriel = { id: 1, nome: 'Gabriel Calheiros', slug: 'gabriel-calheiros', foto_url: '/autores/gabriel-calheiros.webp' }
const davi = { id: 2, nome: 'Davi Brito', slug: 'davi-brito', foto: { url: 'https://cdn/x.webp' }, ativo: true }

describe('publishMissingAuthor (S07: publicar exige autor)', () => {
  it('bloqueia publicar sem autor', () => {
    expect(publishMissingAuthor({ status: 'published', autores: [] })).toBe(true)
    expect(publishMissingAuthor({ status: 'published' }, { autores: [] })).toBe(true)
  })
  it('libera com autor (no data ou já salvo no documento)', () => {
    expect(publishMissingAuthor({ status: 'published', autores: [1] })).toBe(false)
    expect(publishMissingAuthor({ resumo: 'x' }, { status: 'published', autores: [1] })).toBe(false)
  })
  it('rascunho, edição técnica e submissão externa não exigem', () => {
    expect(publishMissingAuthor({ status: 'draft', autores: [] })).toBe(false)
    expect(publishMissingAuthor({ status: 'published', autores: [] }, null, { technicalEdit: true })).toBe(false)
    expect(publishMissingAuthor({ status: 'published', isExternalSubmission: true })).toBe(false)
  })
})

describe('helpers de autor', () => {
  it('foto: upload tem prioridade sobre foto_url', () => {
    expect(authorPhoto(gabriel)).toBe('/autores/gabriel-calheiros.webp')
    expect(authorPhoto(davi)).toBe('https://cdn/x.webp')
  })
  it('perfis: LinkedIn + lista, só URLs http(s)', () => {
    expect(
      authorProfiles({ ...gabriel, linkedin: 'https://linkedin.com/in/g', perfis: ['https://g.com', 'lixo', ''] }),
    ).toEqual(['https://linkedin.com/in/g', 'https://g.com'])
  })
  it('página indexável só com bio completa', () => {
    expect(authorIndexable(gabriel)).toBe(false)
    expect(authorIndexable({ ...gabriel, bio_completa: '  ' })).toBe(false)
    expect(authorIndexable({ ...gabriel, bio_completa: 'Bio.' })).toBe(true)
  })
  it('postAuthors ignora ids não populados e inativos; authorNames formata', () => {
    expect(postAuthors({ autores: [gabriel, 3, { ...davi, ativo: false }] }).map((a) => a.slug)).toEqual([
      'gabriel-calheiros',
    ])
    expect(authorNames({ autores: [gabriel, davi] })).toBe('Gabriel Calheiros e Davi Brito')
    expect(authorNames({ autores: [], autor: 'Equipe Unfold Growth' })).toBe('Equipe Unfold Growth')
  })
})

function jsonLdAll(html: string): any[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
}
const jsonLd = (html: string) => jsonLdAll(html)[0]

describe('schema (S07)', () => {
  it('Article: author = lista de Person com url da página de autor', () => {
    const [data, page] = jsonLdAll(
      renderToString(
        <ArticleSchema
          title="t"
          description="d"
          url="/blog/sdr"
          datePublished="2026-07-19T12:39:54-03:00"
          authors={[{ name: 'Gabriel Calheiros', url: '/autor/gabriel-calheiros' }]}
          reviewer={{ name: 'Davi Brito', url: '/autor/davi-brito' }}
          image={{ url: 'https://unfoldgrowth.com.br/capa.webp', width: 1200, height: 630 }}
        />,
      ),
    )
    expect(data.author).toEqual([
      expect.objectContaining({ '@type': 'Person', name: 'Gabriel Calheiros', url: 'https://unfoldgrowth.com.br/autor/gabriel-calheiros' }),
    ])
    // reviewedBy fica num nó WebPage (no schema.org não é propriedade de Article).
    expect(data.reviewedBy).toBeUndefined()
    expect(page['@type']).toBe('WebPage')
    expect(page.reviewedBy.name).toBe('Davi Brito')
    expect(page.mainEntity['@id']).toBe('https://unfoldgrowth.com.br/blog/sdr#article')
    expect(data.image).toEqual({ '@type': 'ImageObject', url: 'https://unfoldgrowth.com.br/capa.webp', width: 1200, height: 630 })
    expect(data.publisher['@id']).toBe('https://unfoldgrowth.com.br/#organization')
  })

  it('sem autor: convidado vira Person; senão a própria empresa (sem nome conflitante)', () => {
    const guest = jsonLd(renderToString(<ArticleSchema title="t" description="d" url="/blog/x" datePublished="d" guestAuthor="Maria Souza" />))
    expect(guest.author).toEqual({ '@type': 'Person', name: 'Maria Souza' })
    const org = jsonLd(renderToString(<ArticleSchema title="t" description="d" url="/blog/x" datePublished="d" author="Equipe X" />))
    expect(org.author).toEqual({ '@type': 'Organization', '@id': 'https://unfoldgrowth.com.br/#organization', name: 'Unfold Growth' })
  })

  it('JSON-LD escapa "<" (título com </script> não quebra a página)', () => {
    const html = renderToString(
      <ArticleSchema title="Ataque </script><script>alert(1)</script>" description="d" url="/blog/x" datePublished="2026-01-01" />,
    )
    expect(html).not.toContain('</script><script>')
    expect(jsonLd(html).headline).toBe('Ataque </script><script>alert(1)</script>')
  })

  it('ProfilePage: Person com worksFor → Organization', () => {
    const data = jsonLd(
      renderToString(<ProfilePageSchema name="Gabriel Calheiros" url="/autor/gabriel-calheiros" image="/autores/g.webp" />),
    )
    expect(data['@type']).toBe('ProfilePage')
    expect(data.mainEntity['@type']).toBe('Person')
    expect(data.mainEntity.image).toBe('https://unfoldgrowth.com.br/autores/g.webp')
    expect(data.mainEntity.worksFor['@id']).toBe('https://unfoldgrowth.com.br/#organization')
  })
})
