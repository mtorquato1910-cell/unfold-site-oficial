import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import RichTextRenderer from '@/components/RichTextRenderer'
import RichContent from '@/components/RichContent'
import TableOfContents from '@/components/site/TableOfContents'
import ToolBanner, { type BannerData } from '@/components/site/ToolBanner'
import { addHeadingIds } from '@/lib/article-toc'
import { ArticleSchema, FAQSchema } from '@/components/SchemaOrg'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import AuthorBox from '@/components/site/AuthorBox'
import { authorPath, postAuthors, postReviewer } from '@/lib/authors'
import { toBrtIso, brtDay } from '@/lib/content-date'
import { withSeo, DEFAULT_OG_IMAGE } from '@/lib/seo/canonical'

export const revalidate = 60

// Tipografia do conteúdo dentro da folha branco gelo: texto preto sobre branco.
// Mapeia as variáveis do plugin @tailwindcss/typography para os tokens claros
// definidos em `.article-reading` (globals.css), no lugar do antigo prose-invert.
const PROSE_CLASS =
  'prose prose-lg max-w-none ' +
  '[--tw-prose-body:hsl(var(--foreground)/0.92)] ' +
  '[--tw-prose-headings:hsl(var(--foreground))] ' +
  '[--tw-prose-bold:hsl(var(--foreground))] ' +
  '[--tw-prose-links:hsl(var(--primary))] ' +
  '[--tw-prose-quotes:hsl(var(--foreground)/0.75)] ' +
  '[--tw-prose-quote-borders:hsl(var(--border))] ' +
  '[--tw-prose-bullets:hsl(var(--foreground)/0.45)] ' +
  '[--tw-prose-counters:hsl(var(--foreground)/0.6)] ' +
  '[--tw-prose-hr:hsl(var(--border))] ' +
  '[--tw-prose-captions:hsl(var(--foreground)/0.6)] ' +
  '[--tw-prose-code:hsl(var(--foreground))] ' +
  '[--tw-prose-th-borders:hsl(var(--border))] ' +
  '[--tw-prose-td-borders:hsl(var(--border))]'

// Extrai a URL da mídia (campo upload populado com depth>=1).
function mediaUrl(field: any): string | null {
  if (field && typeof field === 'object') return field.url || field.sizes?.og?.url || null
  return null
}

type Props = { params: Promise<{ slug: string }> }

/** Data de atualização editorial (S01): content_updated_at, com fallback na publicação. */
function contentUpdatedAt(post: any): string | undefined {
  return (post?.content_updated_at as string) || (post?.publicado_em as string) || undefined
}

function formatDateBr(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo',
  })
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      select: { slug: true },
    })
    return docs.map((p) => ({ slug: p.slug as string }))
  } catch {
    return []
  }
}

/** Slug curto e estável para a âncora de cada pergunta do FAQ (id citável). */
function slugFaq(text: string, i: number): string {
  const s = (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-[^-]*$/, '')
  return s || `${i + 1}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({ collection: 'posts', where: { slug: { equals: slug } } })
    const post = docs[0]
    if (!post) return { title: 'Post não encontrado' }
    const og = mediaUrl(post.imagem_destaque)
    // Resumo de busca (item 1.5): campo próprio, com fallback para o resumo do card.
    // Cast: os tipos gerados do Payload são regenerados no build; acesso pontual aqui.
    const searchTitle = ((post as any).meta_title as string)?.trim()
    const searchDesc = ((post as any).meta_description as string)?.trim() || (post.resumo as string)
    // withSeo: canonical + og:url + og:image (capa ou padrão) — S04.
    return withSeo(
      `/blog/${slug}`,
      {
        // meta_title, quando preenchido, é o título de busca completo (≤60, sem sufixo
        // de marca) — por isso `absolute`. Vazio: usa o título + template do layout.
        title: searchTitle ? { absolute: searchTitle } : `${post.titulo as string} | Blog`,
        description: searchDesc,
        // article:published_time / modified_time (S01): modified = data EDITORIAL.
        openGraph: {
          type: 'article',
          title: post.titulo as string,
          publishedTime: toBrtIso((post.publicado_em as string) || (post as any).createdAt),
          modifiedTime: toBrtIso(contentUpdatedAt(post)),
        },
      },
      { type: 'article', image: og },
    )
  } catch {
    return { title: 'Blog' }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  let post: any = null
  let banners: BannerData[] = []
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
    })
    post = docs[0] || null

    // Banners internos ativos (ferramentas/diagnóstico/cases).
    try {
      const res = await payload.find({
        collection: 'banners',
        where: { ativo: { equals: true } },
        sort: 'ordem',
        limit: 4,
        depth: 1,
      })
      banners = (res.docs as any[]) || []
    } catch {
      // collection ainda não migrada — segue sem banners
    }
  } catch {
    // DB indisponível
  }

  if (!post) {
    // Slug trocado? Redireciona 308 (permanente) para o novo endereço (item 1.3).
    // permanentRedirect fica FORA do try — lança NEXT_REDIRECT, que não pode ser pego.
    let redirectTo: string | undefined
    try {
      const payload = await getPayload({ config: configPromise })
      const { docs } = await payload.find({
        collection: 'redirects',
        where: { and: [{ fromPath: { equals: `/blog/${slug}` } }, { enabled: { equals: true } }] },
        limit: 1,
      })
      redirectTo = (docs[0]?.toPath as string) || undefined
    } catch {
      // sem coleção/registro de redirect — segue para 404
    }
    if (redirectTo) permanentRedirect(redirectTo)
    notFound()
  }

  const imgUrl = mediaUrl(post.imagem_destaque)

  // Processa o HTML do editor: injeta ids nos títulos e extrai o índice.
  const { html: contentHtml, toc } = post.conteudo_html
    ? addHeadingIds(post.conteudo_html as string)
    : { html: '', toc: [] }

  // Perguntas frequentes (item 1.4): itens válidos geram seção visível + FAQPage.
  const faqItems: { pergunta: string; resposta: string }[] = Array.isArray((post as any).faq)
    ? (post as any).faq.filter((q: any) => q?.pergunta?.trim() && q?.resposta?.trim())
    : []

  // Autores reais (S07): Person no schema, byline e box. Fallback no texto antigo.
  const authors = postAuthors(post)
  const reviewer = postReviewer(post)
  // Imagem do Article (S08): capa com dimensões; sem capa, a og:image padrão do site.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  const cover = post.imagem_destaque && typeof post.imagem_destaque === 'object' ? post.imagem_destaque : null
  const articleImage = imgUrl
    ? {
        url: imgUrl.startsWith('http') ? imgUrl : `${siteUrl}${imgUrl}`,
        width: (cover?.width as number) || undefined,
        height: (cover?.height as number) || undefined,
      }
    : { url: `${siteUrl}${DEFAULT_OG_IMAGE.url}`, width: DEFAULT_OG_IMAGE.width, height: DEFAULT_OG_IMAGE.height }

  const sidebarBanner = banners[0]
  const mobileBanners = banners.slice(0, 2)

  return (
    <main className="min-h-screen">
      {/* Dados estruturados (item 1.4): Article + trilha de navegação + FAQ (se houver). */}
      <ArticleSchema
        title={(post.titulo as string) || ''}
        description={((post as any).meta_description as string)?.trim() || (post.resumo as string) || ''}
        url={`/blog/${slug}`}
        datePublished={toBrtIso((post.publicado_em as string) || (post as any).createdAt) || ''}
        dateModified={toBrtIso(contentUpdatedAt(post))}
        authors={authors.map((a) => ({ name: a.nome, url: authorPath(a) }))}
        reviewer={reviewer ? { name: reviewer.nome, url: authorPath(reviewer) } : null}
        author={post.autor as string}
        guestAuthor={post.isExternalSubmission ? ((post.submittedByName as string) || null) : null}
        image={articleImage}
      />
      <FAQSchema items={faqItems} />
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-32 pb-24 md:pt-40">
        {/* Trilha visível + BreadcrumbList do mesmo array (S08) — substitui o "Voltar ao blog". */}
        <Breadcrumbs
          className="mb-10"
          items={[
            { name: 'Início', url: '/' },
            { name: 'Blog', url: '/blog' },
            { name: (post.titulo as string) || 'Artigo', url: `/blog/${slug}` },
          ]}
        />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          {/* ───── Coluna principal ───── */}
          {/* .article-reading = folha de leitura branco gelo + texto preto
              (tokens redefinidos localmente; ver globals.css). */}
          <article className="article-reading min-w-0 max-w-3xl rounded-3xl border border-border bg-background text-foreground shadow-xl shadow-black/20 px-5 py-8 sm:px-8 md:px-12 md:py-14">
            {/* Header */}
            <header className="mb-10">
              {post.pilar && (
                <span className="font-mono text-xs uppercase tracking-widest text-primary">
                  {post.pilar}
                </span>
              )}
              <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-[1.1] mt-3 mb-5">
                {post.titulo as string}
              </h1>
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">{post.resumo as string}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/70 border-t border-border pt-6">
                {/* Byline com link para a página do autor (S07 — Checklist SEO M08). */}
                {authors.length > 0 ? (
                  <span>
                    Por{' '}
                    {authors.map((a, i) => (
                      <span key={a.slug}>
                        {i > 0 && (i === authors.length - 1 ? ' e ' : ', ')}
                        <Link href={authorPath(a)} className="font-medium text-foreground/85 hover:text-primary">
                          {a.nome}
                        </Link>
                      </span>
                    ))}
                  </span>
                ) : (
                  <span>{post.autor as string}</span>
                )}
                {reviewer && (
                  <span>
                    · Revisado por{' '}
                    <Link href={authorPath(reviewer)} className="hover:text-primary">
                      {reviewer.nome}
                    </Link>
                  </span>
                )}
                {post.tempo_leitura && <span>· {post.tempo_leitura as number} min de leitura</span>}
                {post.publicado_em && (
                  <span>
                    · Publicado em{' '}
                    <time dateTime={toBrtIso(post.publicado_em as string)}>
                      {formatDateBr(post.publicado_em as string)}
                    </time>
                  </span>
                )}
                {/* "Atualizado em" só quando o conteúdo mudou num dia posterior à
                    publicação — mesma data do dateModified (Checklist SEO M07). */}
                {post.publicado_em &&
                  contentUpdatedAt(post) &&
                  brtDay(contentUpdatedAt(post)) !== brtDay(post.publicado_em as string) && (
                    <span>
                      · Atualizado em{' '}
                      <time dateTime={toBrtIso(contentUpdatedAt(post))}>
                        {formatDateBr(contentUpdatedAt(post) as string)}
                      </time>
                    </span>
                  )}
              </div>
            </header>

            {/* Imagem de destaque */}
            {imgUrl && (
              <figure className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-border mb-12 bg-card">
                <Image
                  src={imgUrl}
                  alt={post.titulo as string}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </figure>
            )}

            {/* Índice — versão mobile (no topo do conteúdo, em telas menores) */}
            {toc.length >= 2 && (
              <div className="lg:hidden mb-10 rounded-2xl border border-border bg-card/50 p-5">
                <TableOfContents items={toc} />
              </div>
            )}

            {/* Conteúdo — HTML do editor rico (novo) ou Lexical (posts antigos). */}
            {post.conteudo_html ? (
              <RichContent html={contentHtml} className={PROSE_CLASS} />
            ) : (
              <div className={PROSE_CLASS}>
                {post.conteudo ? (
                  <RichTextRenderer data={post.conteudo} />
                ) : (
                  <p className="text-foreground/70 leading-relaxed">{post.resumo as string}</p>
                )}
              </div>
            )}

            {/* Perguntas frequentes (item 1.4) — visível na página e citável por IA. */}
            {faqItems.length > 0 && (
              <section className="faq mt-16" aria-labelledby="faq-titulo">
                <h2 id="faq-titulo" className="font-display font-bold text-2xl mb-6">
                  Perguntas frequentes
                </h2>
                <div className="space-y-6">
                  {faqItems.map((q, i) => (
                    <div key={i} className="faq-item">
                      <h3 id={`faq-${i + 1}-${slugFaq(q.pergunta, i)}`} className="font-display font-semibold text-lg mb-2">
                        {q.pergunta}
                      </h3>
                      <p className="text-foreground/70 leading-relaxed">{q.resposta}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Box de autor (S07) — um por autor. */}
            {authors.map((a) => (
              <AuthorBox key={a.slug} author={a} label={authors.length > 1 ? 'Autor' : 'Sobre o autor'} />
            ))}

            {/* Banners — versão mobile (após o conteúdo, em telas menores) */}
            {mobileBanners.length > 0 && (
              <div className="lg:hidden mt-12 space-y-5">
                {mobileBanners.map((b) => (
                  <ToolBanner key={b.id} banner={b} />
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-16 rounded-2xl border border-border bg-muted p-8 text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">
                Próximo passo
              </p>
              {/* Não é heading: é moldura fora do artigo (item 1.3). Mantido visual,
                  fora da hierarquia H1–H6 do conteúdo. */}
              <p className="font-display font-bold text-xl mb-4">
                Aplique esse conhecimento na sua operação
              </p>
              <Link
                href="/diagnostico"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Fazer diagnóstico gratuito
              </Link>
            </div>
          </article>

          {/* ───── Sidebar (índice + banner) — desktop ───── */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              {toc.length >= 2 && <TableOfContents items={toc} />}
              {sidebarBanner && <ToolBanner banner={sidebarBanner} />}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
