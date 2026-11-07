import Link from 'next/link'
import { categoryPath } from '@/lib/blog-categories'
import type { BlogCategory } from '@/lib/blog-data'

/**
 * Filtros do blog: "Todos" + categorias com artigos (links rastreáveis para as
 * páginas de categoria — Tarefa 3 do relatório de SEO de 06/11/2026).
 */
export default function CategoryNav({ categories, current }: { categories: BlogCategory[]; current?: string }) {
  const visible = categories.filter((c) => c.count > 0)
  if (visible.length === 0) return null
  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm transition-colors ${
      active
        ? 'border-primary/50 bg-primary/10 text-primary'
        : 'border-border bg-card/50 text-foreground/75 hover:border-primary/40 hover:text-primary'
    }`
  return (
    <nav aria-label="Categorias do blog" className="mb-10">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link href="/blog" className={chip(!current)} aria-current={!current ? 'page' : undefined}>
            Todos
          </Link>
        </li>
        {visible.map((c) => (
          <li key={c.id}>
            <Link
              href={categoryPath(c.slug)}
              className={chip(current === c.slug)}
              aria-current={current === c.slug ? 'page' : undefined}
            >
              {c.nome}
              <span className="font-mono text-[11px] opacity-60">{c.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
