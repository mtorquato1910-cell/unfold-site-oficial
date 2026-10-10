import { getPublicSiteSettings } from '@/lib/site-settings'
import { buildOrganizationSchema, COMPANY, ORGANIZATION_ID_PATH, WEBSITE_ID_PATH } from '@/lib/company'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
const ORG_ID = `${BASE_URL}${ORGANIZATION_ID_PATH}`

/** Referência ao Organization do layout + name/logo (robusto em validadores que não
 *  resolvem @id entre scripts). Antes o Article apontava para /logo.svg, que não existe. */
const PUBLISHER = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: COMPANY.name,
  logo: { '@type': 'ImageObject', url: `${BASE_URL}${COMPANY.logo.path}` },
}

/**
 * Organization com @id fixo (S06 — épico seo-tecnico-2026-10). Dados de contato,
 * endereço, CNPJ e redes vêm do mesmo global que o rodapé e o /contato usam, então o
 * schema sempre bate com o que está visível. O @id é reutilizado como `publisher`
 * dos artigos e `worksFor` dos autores.
 */
export async function OrganizationSchema() {
  const settings = await getPublicSiteSettings()
  return <JsonLd data={buildOrganizationSchema(BASE_URL, settings)} />
}

/**
 * WebSite. Sem SearchAction (S08, decisão padrão enquanto P2 não for respondida):
 * apontava para /blog?q=, busca que não existe.
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}${WEBSITE_ID_PATH}`,
    name: 'Unfold Growth',
    url: BASE_URL,
    inLanguage: 'pt-BR',
    publisher: PUBLISHER,
  }
  return <JsonLd data={schema} />
}

type SchemaPerson = { name: string; url: string }

const person = (p: SchemaPerson) => ({
  '@type': 'Person',
  '@id': `${BASE_URL}${p.url}#person`,
  // Só o nome — sem cargo, empresa ou "por" (Checklist SEO M08).
  name: p.name,
  url: `${BASE_URL}${p.url}`,
})

export function ArticleSchema({ title, description, url, datePublished, dateModified, authors, reviewer, guestAuthor, image }: {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  /** Autores reais (S07): um Person por autor, com url da página de autor. */
  authors?: SchemaPerson[]
  reviewer?: SchemaPerson | null
  /** Texto livre antigo (deprecado): não vira mais nome de Organization no schema. */
  author?: string
  /** Post de convidado (submissão externa): o autor é uma pessoa de fora. */
  guestAuthor?: string | null
  /** Capa do post (S08): ImageObject com dimensões quando conhecidas. */
  image?: { url: string; width?: number; height?: number } | null
}) {
  const pageUrl = `${BASE_URL}${url}`
  const fallbackAuthor = guestAuthor?.trim()
    ? { '@type': 'Person', name: guestAuthor.trim() }
    : // Sem autor real: a própria empresa (mesmo nó do layout, sem nome conflitante).
      { '@type': 'Organization', '@id': ORG_ID, name: COMPANY.name }
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${pageUrl}#article`,
    headline: title,
    description,
    url: `${BASE_URL}${url}`,
    mainEntityOfPage: `${BASE_URL}${url}`,
    ...(image
      ? {
          image: {
            '@type': 'ImageObject',
            url: image.url,
            ...(image.width && image.height ? { width: image.width, height: image.height } : {}),
          },
        }
      : {}),
    datePublished,
    dateModified: dateModified || datePublished,
    author: authors && authors.length > 0 ? authors.map(person) : fallbackAuthor,
    publisher: PUBLISHER,
  }
  // `reviewedBy` é propriedade de WebPage (não de Article) no schema.org → nó próprio.
  const page = reviewer
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        mainEntity: { '@id': `${pageUrl}#article` },
        reviewedBy: person(reviewer),
      }
    : null
  return (
    <>
      <JsonLd data={schema} />
      {page && <JsonLd data={page} />}
    </>
  )
}

/**
 * Página de autor (S07): ProfilePage com mainEntity Person (Checklist SEO M08).
 * worksFor aponta para o @id da Organization do layout.
 */
export function ProfilePageSchema({ name, url, jobTitle, description, image, sameAs, knowsAbout }: {
  name: string
  url: string
  jobTitle?: string | null
  description?: string | null
  image?: string | null
  sameAs?: string[]
  knowsAbout?: string[]
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${BASE_URL}${url}`,
    mainEntity: {
      '@type': 'Person',
      '@id': `${BASE_URL}${url}#person`,
      name,
      url: `${BASE_URL}${url}`,
      ...(jobTitle ? { jobTitle } : {}),
      ...(description ? { description } : {}),
      ...(image ? { image: image.startsWith('http') ? image : `${BASE_URL}${image}` } : {}),
      ...(sameAs && sameAs.length ? { sameAs } : {}),
      ...(knowsAbout && knowsAbout.length ? { knowsAbout } : {}),
      worksFor: { '@id': ORG_ID },
    },
  }
  return <JsonLd data={schema} />
}

/**
 * Serviços (S08 — Plano de Ação): um Service por item VISÍVEL na página (o schema
 * precisa bater com o conteúdo). provider → Organization do layout.
 */
export function ServiceSchema({ services, url }: {
  services: { name: string; description: string; offers?: { name: string; description: string }[] }[]
  url: string
}) {
  const data = services.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.description,
    url: `${BASE_URL}${url}`,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Brasil' },
    ...(s.offers?.length
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: s.name,
            itemListElement: s.offers.map((o) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: o.name, description: o.description },
            })),
          },
        }
      : {}),
  }))
  return (
    <>
      {data.map((d) => (
        <JsonLd key={d.name} data={d} />
      ))}
    </>
  )
}

/** Índice do blog (S08): CollectionPage com a lista de artigos exibidos. */
export function CollectionPageSchema({ name, description, url, items }: {
  name: string
  description: string
  url: string
  items: { name: string; url: string }[]
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${BASE_URL}${url}`,
    isPartOf: { '@id': `${BASE_URL}${WEBSITE_ID_PATH}` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: `${BASE_URL}${it.url}`,
      })),
    },
  }
  return <JsonLd data={schema} />
}

/** Trilha de navegação (item 1.4) — ajuda buscadores/IA a situarem a página. */
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${BASE_URL}${it.url}`,
    })),
  }
  return <JsonLd data={schema} />
}

/**
 * FAQPage (item 1.4) — marca pares pergunta/resposta para citação por IA
 * (ChatGPT, Claude, Perplexity, modo IA do Google) e Bing/Copilot.
 * Só emite quando há itens válidos, e o mesmo conteúdo é renderizado VISÍVEL
 * na página (regra do Google: nada de marcação oculta).
 */
export function FAQSchema({ items }: { items: { pergunta: string; resposta: string }[] }) {
  const valid = (items || []).filter((q) => q?.pergunta?.trim() && q?.resposta?.trim())
  if (valid.length === 0) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: valid.map((q) => ({
      '@type': 'Question',
      name: q.pergunta.trim(),
      acceptedAnswer: { '@type': 'Answer', text: q.resposta.trim() },
    })),
  }
  return <JsonLd data={schema} />
}

/** Sequência \u003c (barra invertida + u003c): o JSON continua válido e o "<" não fecha o script. */
const LT_ESCAPED = String.fromCharCode(92) + 'u003c'

function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Escapa "<" — um título com "</script>" fecharia o script e quebraria a página.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, LT_ESCAPED) }}
    />
  )
}
