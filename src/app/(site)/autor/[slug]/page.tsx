import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Linkedin } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Breadcrumbs from '@/components/site/Breadcrumbs'
import { ProfilePageSchema } from '@/components/SchemaOrg'
import { withSeo } from '@/lib/seo/canonical'
import {
  authorIndexable,
  authorPath,
  authorPhoto,
  authorProfiles,
  authorTopics,
  type AuthorDoc,
} from '@/lib/authors'

/**
 * Página de autor (S07 — épico seo-tecnico-2026-10; Checklist SEO M08).
 * Foto, nome, cargo, bio, formação, experiência, registro, perfis externos e a lista
 * de artigos. Marcada como ProfilePage (Person com worksFor → Organization).
 * Só é indexável quando a bio completa estiver preenchida — sem ela fica noindex e
 * fora do sitemap (página rala não ajuda).
 */
export const revalidate = 300

function profileLabel(url: string): string {
  if (/linkedin\.com/i.test(url)) return 'LinkedIn'
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

type Props = { params: Promise<{ slug: string }> }

async function getAuthor(slug: string): Promise<AuthorDoc | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'authors',
      where: { and: [{ slug: { equals: slug } }, { ativo: { not_equals: false } }] },
      limit: 1,
      depth: 1,
    })
    return (docs[0] as unknown as AuthorDoc) || null
  } catch {
    return null
  }
}

async function getAuthorPosts(id: AuthorDoc['id']) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { and: [{ status: { equals: 'published' } }, { autores: { contains: id } }] },
      sort: '-publicado_em',
      limit: 200,
      depth: 0,
      select: { slug: true, titulo: true, resumo: true, publicado_em: true },
    })
    return docs as { slug: string; titulo: string; resumo?: string; publicado_em?: string }[]
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) return { title: 'Autor não encontrado' }
  const description =
    author.bio_curta?.trim() ||
    `Artigos de ${author.nome}${author.cargo ? `, ${author.cargo}` : ''} sobre growth e vendas complexas B2B.`
  return withSeo(
    authorPath(author),
    { title: `${author.nome} — Autor`, description, openGraph: { type: 'profile' } },
    { image: authorPhoto(author), noindex: !authorIndexable(author) },
  )
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) notFound()
  const posts = await getAuthorPosts(author.id)
  const photo = authorPhoto(author)
  const profiles = authorProfiles(author)
  const topics = authorTopics(author)

  return (
    <main className="min-h-screen">
      <ProfilePageSchema
        name={author.nome}
        url={authorPath(author)}
        jobTitle={author.cargo}
        description={author.bio_completa || author.bio_curta}
        image={photo}
        sameAs={profiles}
        knowsAbout={topics}
      />
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-24 md:pt-40">
        <Breadcrumbs
          className="mb-10"
          items={[
            { name: 'Início', url: '/' },
            { name: 'Blog', url: '/blog' },
            { name: author.nome, url: authorPath(author) },
          ]}
        />

        <header className="flex flex-col sm:flex-row gap-6 sm:items-center">
          {photo && (
            <Image
              src={photo}
              alt={`Foto de ${author.nome}`}
              width={160}
              height={160}
              priority
              className="h-28 w-28 md:h-36 md:w-36 rounded-full object-cover border border-border"
            />
          )}
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-2">Autor</p>
            <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl leading-[1.05]">{author.nome}</h1>
            {author.cargo && <p className="mt-2 text-lg text-foreground/75">{author.cargo} · Unfold Growth</p>}
            {profiles.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-3 text-sm">
                {profiles.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      {/linkedin\.com/i.test(url) && <Linkedin className="h-4 w-4" aria-hidden="true" />}
                      {profileLabel(url)}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        {(author.bio_completa || author.bio_curta) && (
          <section className="mt-10 space-y-4 text-foreground/80 leading-relaxed text-lg" aria-label="Biografia">
            {(author.bio_completa || author.bio_curta || '')
              .split(/\n{2,}/)
              .map((p, i) => (
                <p key={i}>{p.trim()}</p>
              ))}
          </section>
        )}

        {(author.formacao || author.experiencia || author.registro_profissional || topics.length > 0) && (
          <dl className="mt-10 grid sm:grid-cols-2 gap-6 rounded-2xl border border-border bg-card/40 p-6">
            {author.experiencia && (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">Experiência</dt>
                <dd className="mt-1 text-foreground/85">{author.experiencia}</dd>
              </div>
            )}
            {author.formacao && (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">Formação</dt>
                <dd className="mt-1 text-foreground/85">{author.formacao}</dd>
              </div>
            )}
            {author.registro_profissional && (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">Registro profissional</dt>
                <dd className="mt-1 text-foreground/85">{author.registro_profissional}</dd>
              </div>
            )}
            {topics.length > 0 && (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">Temas</dt>
                <dd className="mt-1 text-foreground/85">{topics.join(' · ')}</dd>
              </div>
            )}
          </dl>
        )}

        <section className="mt-14" aria-labelledby="artigos-do-autor">
          <h2 id="artigos-do-autor" className="font-display font-bold text-2xl mb-6">
            Artigos de {author.nome} ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <p className="text-foreground/70">Nenhum artigo publicado ainda.</p>
          ) : (
            <ul className="grid gap-4">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition"
                  >
                    <span>
                      <span className="block font-medium leading-snug group-hover:text-primary transition-colors">
                        {p.titulo}
                      </span>
                      {p.resumo && <span className="mt-1 block text-sm text-foreground/70 line-clamp-2">{p.resumo}</span>}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/30 group-hover:text-primary transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
