import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { authorNames } from '@/lib/authors'
import { categoryPath, postCategory } from '@/lib/blog-categories'

function mediaUrl(field: any): string | null {
  if (field && typeof field === 'object') return field.url || field.sizes?.card?.url || null
  return null
}

/**
 * Card de artigo do blog (listagem, página de categoria e relacionados).
 * O link do título cobre o card inteiro (::after) e o selo da categoria é um link
 * próprio por cima — sem <a> dentro de <a>, que é HTML inválido.
 */
export default function PostCard({
  post,
  headingLevel = 'h2',
  showCategory = true,
  compact = false,
}: {
  post: any
  headingLevel?: 'h2' | 'h3'
  showCategory?: boolean
  /** Sem imagem e com menos respiro — para colunas estreitas (relacionados). */
  compact?: boolean
}) {
  const imgUrl = compact ? null : mediaUrl(post.imagem_destaque)
  const cat = postCategory(post)
  const Heading = headingLevel
  return (
    <article className={`group relative rounded-2xl border border-border bg-card ${compact ? 'p-5' : 'p-6'} hover:border-primary/40 transition-all duration-300 flex flex-col`}>
      {imgUrl && (
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border/60 mb-5">
          <Image
            src={imgUrl}
            alt={(post.imagem_destaque?.alt as string)?.trim() || (post.titulo as string)}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4 min-h-[26px]'}`}>
        {showCategory && cat ? (
          <Link
            href={categoryPath(cat.slug)}
            className="relative z-10 font-mono text-xs uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            {cat.nome}
          </Link>
        ) : (
          <span />
        )}
        <ArrowUpRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" aria-hidden="true" />
      </div>
      <Heading className={`font-display font-bold ${compact ? 'text-base' : 'text-lg'} leading-snug mb-3 group-hover:text-primary transition-colors flex-1`}>
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
          {post.titulo as string}
        </Link>
      </Heading>
      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 mb-4">{post.resumo as string}</p>
      <div className="flex items-center gap-3 text-xs text-foreground/30 mt-auto pt-4 border-t border-border/50">
        <span>{authorNames(post)}</span>
        {post.tempo_leitura && <span>· {post.tempo_leitura as number} min</span>}
      </div>
    </article>
  )
}
