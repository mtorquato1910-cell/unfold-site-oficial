'use client'

import Link from 'next/link'
import { Linkedin, Instagram, Youtube, ArrowRight } from 'lucide-react'
import { UnfoldLogo } from '@/components/brand/UnfoldSymbol'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Brief: estrutura simplificada — sem /servicos, /podcast, /materiais (v2)
const COLS = [
  {
    title: 'Site',
    links: [
      { label: 'Método', href: '/metodo' },
      { label: 'Atuação', href: '/atuacao' },
      { label: 'Cases', href: '/cases' },
      { label: 'Sobre', href: '/sobre' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Ferramenta',
    links: [
      { label: 'Diagnóstico de Growth', href: '/diagnostico' },
      { label: 'Calculadora de Tráfego', href: '/ferramentas/calculadora-trafego' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
      { label: 'Termos de Uso', href: '/termos' },
      { label: 'LGPD', href: '/lgpd' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      {/* Newsletter — wired in Sprint 6 */}
      <div id="newsletter" className="max-w-7xl mx-auto px-6 lg:px-8 py-14 border-b border-border">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-3">
              Newsletter
            </p>
            <h3 className="font-display font-bold tracking-tight text-2xl md:text-3xl max-w-xl">
              Insights de growth B2B direto no seu email.
            </h3>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full gap-2 max-w-md lg:ml-auto"
          >
            <Input
              type="email"
              required
              placeholder="seu@empresa.com.br"
              className="bg-card border-border h-12"
              aria-label="E-mail corporativo"
            />
            <Button type="submit" size="lg" className="h-12 group">
              Assinar
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <UnfoldLogo />
          <p className="mt-4 text-sm text-foreground/65 max-w-xs leading-relaxed">
            Assessoria de growth para empresas com vendas complexas B2B.
          </p>
          <div className="mt-6 space-y-1.5 text-sm text-foreground/60">
            <p>Maceió – AL · Brasil · Atuação nacional</p>
            <a
              href="mailto:oi@unfoldgrowth.com.br"
              className="block hover:text-primary transition-colors"
            >
              oi@unfoldgrowth.com.br
            </a>
          </div>
          <div className="mt-6 flex items-center gap-2">
            {[
              { Icon: Linkedin, label: 'LinkedIn', href: '#' },
              { Icon: Instagram, label: 'Instagram', href: '#' },
              { Icon: Youtube, label: 'YouTube', href: '#' },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="h-9 w-9 grid place-items-center rounded-full border border-border text-foreground/60 hover:text-primary hover:border-primary/50 transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50 mb-4">
              {col.title}
            </p>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-foreground/80 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-foreground/50">
          <p className="font-mono">© 2026 Unfold Growth · CNPJ a confirmar</p>
          <div className="flex items-center gap-5">
            <Link href="/politica-de-privacidade" className="hover:text-foreground transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="hover:text-foreground transition-colors">
              Termos
            </Link>
            <Link href="/lgpd" className="hover:text-foreground transition-colors">
              LGPD
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
