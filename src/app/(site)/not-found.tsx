import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Página 404 do site (S04 — épico seo-tecnico-2026-10).
 *
 * Antes não existia: qualquer URL quebrada caía na 404 padrão do Next, em inglês e
 * sem menu. Agora fica dentro do layout do site (menu + rodapé), responde status
 * 404 de verdade (não é soft-404) e devolve o visitante para o conteúdo: seções
 * principais, posts mais recentes e contato — como sugerido na reunião de 07/10.
 *
 * Chega aqui: `notFound()` de qualquer página do site (post/case inexistente) e
 * qualquer URL sem rota (via `app/(site)/[...rest]/page.tsx`). O Next adiciona
 * `noindex` automaticamente às respostas 404.
 */

const SECTIONS = [
  { href: '/', label: 'Início' },
  { href: '/blog', label: 'Blog' },
  { href: '/cases', label: 'Cases' },
  { href: '/metodo', label: 'Método UGS' },
  { href: '/diagnostico', label: 'Diagnóstico gratuito' },
  { href: '/ferramentas', label: 'Ferramentas' },
]

// Cache de 1h (tag `posts`): varreduras de bots em URLs inexistentes (/wp-login.php,
// /.env…) não podem custar uma consulta ao banco por requisição.
const getRecentPosts = unstable_cache(fetchRecentPosts, ['not-found-recent-posts'], {
  revalidate: 3600,
  tags: ['posts'],
})

async function fetchRecentPosts(): Promise<{ slug: string; titulo: string }[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publicado_em',
      limit: 6,
      depth: 0,
      select: { slug: true, titulo: true },
    })
    return docs.map((d: any) => ({ slug: d.slug as string, titulo: d.titulo as string }))
  } catch {
    return []
  }
}

export default async function NotFound() {
  const posts = await getRecentPosts()

  return (
    <main className="min-h-screen">
      <section className="relative isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(158_92%_70%/0.10),transparent_55%)]" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">Erro 404</p>
          <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl leading-[1.08]">
            Esta página não existe ou mudou de endereço.
          </h1>
          <p className="mt-6 text-lg text-foreground/75 max-w-2xl leading-relaxed">
            O link pode estar desatualizado. Mas você pode continuar por aqui: veja nosso blog, os cases ou
            fale com a gente.
          </p>

          <nav aria-label="Seções do site" className="mt-10 flex flex-wrap gap-3">
            {SECTIONS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground/85 hover:border-primary/40 hover:text-primary transition"
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="pb-16 md:pb-20" aria-labelledby="posts-recentes">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 id="posts-recentes" className="font-display font-bold text-2xl mb-6">
              Artigos recentes
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition"
                  >
                    <span className="font-medium leading-snug group-hover:text-primary transition-colors">
                      {p.titulo}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/30 group-hover:text-primary transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="rounded-3xl border border-primary/25 bg-primary/5 p-8 md:p-10">
            <h2 className="font-display font-bold text-2xl">Procurava algo específico?</h2>
            <p className="mt-3 text-foreground/75 leading-relaxed max-w-2xl">
              Conte o que você precisa e o time da Unfold responde. Ou comece pelo diagnóstico gratuito da sua
              operação comercial.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition"
              >
                Fale com a gente
              </Link>
              <Link
                href="/diagnostico"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary/30 text-primary font-medium text-sm hover:bg-primary/10 transition"
              >
                Fazer o diagnóstico
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
