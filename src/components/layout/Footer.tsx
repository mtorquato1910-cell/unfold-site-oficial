import Link from 'next/link'
import { Linkedin, Instagram, Youtube, Facebook, Twitter, Phone } from 'lucide-react'
import { UnfoldLogo } from '@/components/brand/UnfoldSymbol'
import { getPublicSiteSettings } from '@/lib/site-settings'
import NewsletterForm from './NewsletterForm'

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

export async function Footer() {
  const s = await getPublicSiteSettings()

  const socials = [
    { Icon: Linkedin, label: 'LinkedIn', href: s.linkedin },
    { Icon: Instagram, label: 'Instagram', href: s.instagram },
    { Icon: Youtube, label: 'YouTube', href: s.youtube },
    { Icon: Facebook, label: 'Facebook', href: s.facebook },
    { Icon: Twitter, label: 'X / Twitter', href: s.twitter },
  ].filter((sn) => sn.href)

  const year = new Date().getFullYear()

  return (
    <footer className="bg-background">
      {/* Newsletter */}
      <div
        id="newsletter"
        className="max-w-7xl mx-auto px-6 lg:px-8 py-14 border-b border-border"
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-3">
              Newsletter
            </p>
            <h3 className="font-display font-bold tracking-tight text-2xl md:text-3xl max-w-xl">
              Insights de growth para vendas complexas, direto no seu email.
            </h3>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <UnfoldLogo />
          <p className="mt-4 text-sm text-foreground/70 max-w-xs leading-relaxed">{s.tagline}</p>
          <div className="mt-6 space-y-1.5 text-sm text-foreground/75">
            <p>{s.cidade}</p>
            {s.email_contato && (
              <a
                href={`mailto:${s.email_contato}`}
                className="block hover:text-primary transition-colors"
              >
                {s.email_contato}
              </a>
            )}
            {s.telefone && (
              <a
                href={`tel:${s.telefone.replace(/\D/g, '')}`}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {s.telefone}
              </a>
            )}
            {s.whatsapp && (
              <a
                href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-primary transition-colors"
              >
                WhatsApp
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 grid place-items-center rounded-full border border-border text-foreground/75 hover:text-primary hover:border-primary/50 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70 mb-4">
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

      {/* Barra inferior */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-foreground/70">
          <p className="font-mono">
            © {year} {s.site_name}
            {s.cnpj ? ` · CNPJ ${s.cnpj}` : ''}
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/politica-de-privacidade"
              className="hover:text-foreground transition-colors"
            >
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
