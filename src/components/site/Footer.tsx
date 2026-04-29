import { Link } from "react-router-dom";
import { Linkedin, Instagram, Youtube, Mail, ArrowRight } from "lucide-react";
import { UnfoldLogo } from "@/components/brand/UnfoldSymbol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COLS = [
  {
    title: "Navegação",
    links: [
      { label: "Quem somos", href: "/quem-somos" },
      { label: "Cases", href: "/cases" },
      { label: "Serviços", href: "/servicos" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Podcast", href: "/podcast" },
      { label: "Materiais", href: "/materiais" },
      { label: "Ferramentas", href: "/ferramentas" },
    ],
  },
  {
    title: "Contato",
    links: [
      { label: "ola@unfold.gr", href: "mailto:ola@unfold.gr" },
      { label: "+55 11 4002-8922", href: "tel:+551140028922" },
      { label: "São Paulo, SP — Brasil", href: "/contato" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40 mt-24">
      {/* Newsletter */}
      <div className="container py-14 border-b border-border">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-mono-label text-primary mb-3">[ Newsletter ]</p>
            <h3 className="text-3xl md:text-4xl font-display tracking-tight max-w-xl">
              Insights de growth toda semana, direto na sua caixa.
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

      <div className="container py-14 grid gap-10 lg:grid-cols-4">
        <div>
          <UnfoldLogo />
          <p className="mt-4 text-sm text-foreground/60 max-w-xs leading-relaxed">
            Growth Intelligence para empresas B2B. Desdobramos dados em crescimento real.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {[Linkedin, Instagram, Youtube, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="h-9 w-9 grid place-items-center rounded-full border border-border text-foreground/60 hover:text-primary hover:border-primary/50 transition-colors"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <p className="font-mono-label text-foreground/50 mb-4">{col.title}</p>
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
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-foreground/50 font-mono">
          <p>© 2026 Unfold Growth · CNPJ 00.000.000/0001-00</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground">Política de Privacidade</a>
            <a href="#" className="hover:text-foreground">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}