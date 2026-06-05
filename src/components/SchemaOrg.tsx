const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Unfold Growth',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    description: 'Assessoria de growth para vendas complexas B2B — Método UGS',
    sameAs: [
      'https://www.linkedin.com/company/unfoldgrowth',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'tecnologia@unfoldgrowth.com.br',
      availableLanguage: 'Portuguese',
    },
  }
  return <JsonLd data={schema} />
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Unfold Growth',
    url: BASE_URL,
    inLanguage: 'pt-BR',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  return <JsonLd data={schema} />
}

export function ArticleSchema({ title, description, url, datePublished, dateModified, author }: {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  author?: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${BASE_URL}${url}`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author || 'Equipe Unfold Growth',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Unfold Growth',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.svg` },
    },
  }
  return <JsonLd data={schema} />
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
