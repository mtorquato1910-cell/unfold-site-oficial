import Image from 'next/image'
import Link from 'next/link'
import { authorPath, authorPhoto, type AuthorDoc } from '@/lib/authors'

/**
 * Box de autor no fim do artigo (S07 — Checklist SEO M08): foto, nome, cargo, bio curta
 * e link para a página do autor. Um box por autor.
 */
export default function AuthorBox({ author, label = 'Sobre o autor' }: { author: AuthorDoc; label?: string }) {
  const photo = authorPhoto(author)
  return (
    <aside className="mt-12 flex gap-5 rounded-2xl border border-border bg-card/40 p-5 md:p-6" aria-label={label}>
      {photo && (
        <Image
          src={photo}
          alt={`Foto de ${author.nome}`}
          width={80}
          height={80}
          className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-full object-cover"
        />
      )}
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">{label}</p>
        <p className="mt-1 font-display font-bold text-lg leading-tight">
          <Link href={authorPath(author)} className="hover:text-primary transition-colors">
            {author.nome}
          </Link>
        </p>
        {author.cargo && <p className="text-sm text-foreground/70">{author.cargo}</p>}
        {author.bio_curta && <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{author.bio_curta}</p>}
        <Link href={authorPath(author)} className="mt-2 inline-block text-sm text-primary hover:underline">
          Ver todos os artigos de {author.nome.split(' ')[0]}
        </Link>
      </div>
    </aside>
  )
}
