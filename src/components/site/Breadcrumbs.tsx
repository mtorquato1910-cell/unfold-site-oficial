import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { BreadcrumbSchema } from '@/components/SchemaOrg'

export type Crumb = { name: string; url: string }

/**
 * Trilha de navegação VISÍVEL + BreadcrumbList (S08 — épico seo-tecnico-2026-10;
 * Checklist SEO M06). Um único array alimenta as duas coisas, então o caminho visível
 * e o JSON-LD são sempre idênticos. Cada nível é um <a href> rastreável; o último
 * (página atual) não tem link e leva aria-current="page".
 */
export default function Breadcrumbs({ items, className = '' }: { items: Crumb[]; className?: string }) {
  if (items.length === 0) return null
  return (
    <>
      <BreadcrumbSchema items={items} />
      <nav aria-label="Trilha de navegação" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-foreground/70">
          {items.map((it, i) => {
            const last = i === items.length - 1
            return (
              <li key={it.url} className="flex items-center gap-1.5 min-w-0">
                {last ? (
                  <span aria-current="page" className="text-foreground/85 truncate max-w-[60vw] md:max-w-md">
                    {it.name}
                  </span>
                ) : (
                  <>
                    <Link href={it.url} className="hover:text-primary transition-colors">
                      {it.name}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-foreground/40" aria-hidden="true" />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
