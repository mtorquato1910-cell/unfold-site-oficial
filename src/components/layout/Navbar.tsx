'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function NavLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Ícone principal (logo) — maior */}
      <Image
        src="/icone-c.png"
        alt=""
        width={56}
        height={56}
        priority
        className="shrink-0 h-10 md:h-12 w-auto"
      />
      {/* Wordmark "UNF[ícone]LD" — letras brancas, O = ícone verde, menor que a logo */}
      <span
        className="flex items-baseline text-white font-display font-extrabold uppercase leading-none tracking-tight text-xl md:text-2xl select-none"
        aria-label="Unfold"
      >
        <span>UNF</span>
        <Image
          src="/icone-c.png"
          alt=""
          width={28}
          height={28}
          priority
          className="inline-block h-[0.85em] w-[0.85em] mx-[0.04em] translate-y-[0.06em] align-baseline"
        />
        <span>LD</span>
      </span>
    </div>
  )
}

// Em produção aponta para o subdomínio público; em dev/preview (sem a env),
// usa a rota interna para o link continuar funcionando.
const GUIA_HREF = process.env.NEXT_PUBLIC_GUIA_URL || '/guia-eleicoes-2026'

const NAV = [
  { label: 'Método', href: '/metodo' },
  { label: 'Atuação', href: '/atuacao' },
  { label: 'Cases', href: '/cases' },
  { label: 'Ferramentas', href: '/ferramentas' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Blog', href: '/blog' },
  { label: 'Guia Eleições', href: GUIA_HREF },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex h-16 md:h-[72px] items-center justify-between gap-6">
        <Link href="/" aria-label="Unfold Growth — Início" className="shrink-0">
          <NavLogo />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 whitespace-nowrap" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {/* CTA primário — mint (Brief: CTA único primário = Diagnóstico) */}
          <Button asChild variant="default" size="sm" className="hidden md:inline-flex group">
            <Link href="/diagnostico">
              Solicite um Diagnóstico
              <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Button>

          <button
            className="lg:hidden p-2 -mr-2 text-foreground"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border p-6 transition-transform',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex items-center justify-between mb-10">
            <NavLogo />
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-2 -mr-2">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1" aria-label="Menu mobile">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-3 border-b border-border/50 text-lg font-sans font-medium"
              >
                <span>
                  <span className="font-mono text-xs text-primary mr-3">0{i + 1}</span>
                  {item.label}
                </span>
                <ArrowUpRight className="h-4 w-4 text-foreground/40" />
              </Link>
            ))}
          </nav>

          <Button asChild className="mt-8 w-full">
            <Link href="/diagnostico" onClick={() => setOpen(false)}>
              Solicite um Diagnóstico
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
