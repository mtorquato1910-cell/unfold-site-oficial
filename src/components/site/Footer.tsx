import { Link } from "react-router-dom";
import { Linkedin, Instagram, Youtube, ArrowRight } from "lucide-react";
import { UnfoldLogo } from "@/components/brand/UnfoldSymbol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COLS = [
  {
    title: "Soluções",
    links: [
      { label: "Demand Generation", href: "/servicos#demand" },
      { label: "Social Performance", href: "/servicos#social" },
      { label: "Inbound Marketing", href: "/servicos#inbound" },
      { label: "Consultoria", href: "/servicos#consultoria" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Podcast", href: "/podcast" },
      { label: "Materiais", href: "/materiais" },
      { label: "Newsletter", href: "#newsletter" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Quem Somos", href: "/quem-somos" },
      { label: "Cases", href: "/cases" },
      { label: "Carreiras", href: "/carreiras" },
      { label: "Fale Conosco", href: "/contato" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      {/* Newsletter */}
      <div id="newsletter" className="max-w-7xl mx-auto px-6 lg:px-8 py-14 border-b border-border">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-3">
              Newsletter
            </p>
            <h3 className="font-sans font-bold tracking-tight text-2xl md:text-3xl max-w-xl">
              Receba insights de growth direto no seu email.
            </h3>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full gap-2 max-w-md lg:ml-auto"
          >
            <Input
              type="email"
              required
              placeholder="seu@email.com"
              className="bg-card border-border h-12"
              aria-label="E-mail"
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
            Growth Intelligence para B2B.
          </p>
          <div className="mt-6 space-y-1.5 text-sm text-foreground/60">
            <p>Maceió - AL · Brasil</p>
            <a href="mailto:oi@unfoldgrowth.com.br" className="block hover:text-primary transition-colors">
              oi@unfoldgrowth.com.br
            </a>
          </div>
          <div className="mt-6 flex items-center gap-2">
            {[
              { Icon: Linkedin, label: "LinkedIn" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Youtube, label: "YouTube" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
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
                  <Link to={l.href} className="text-sm text-foreground/80 hover:text-primary transition-colors">
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
          <p className="font-mono">© 2026 Unfold Growth · CNPJ XX.XXX.XXX/0001-XX</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
            <a href="#" className="hover:text-foreground transition-colors">LGPD</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
