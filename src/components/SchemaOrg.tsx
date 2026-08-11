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

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
