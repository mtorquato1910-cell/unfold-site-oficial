import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { UnfoldLogo } from "@/components/brand/UnfoldSymbol";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Quem Somos", href: "/quem-somos" },
  { label: "Cases", href: "/cases" },
  { label: "Serviços", href: "/servicos" },
  { label: "Blog", href: "/blog" },
  { label: "Podcast", href: "/podcast" },
  { label: "Materiais", href: "/materiais" },
  { label: "Ferramentas", href: "/ferramentas" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"PT" | "EN">("PT");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex h-16 md:h-[72px] items-center justify-between">
        <Link to="/" aria-label="Unfold Growth — Início">
          <UnfoldLogo />
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center rounded-full border border-border p-0.5 text-xs font-mono">
            {(["PT", "EN"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "px-2.5 py-1 rounded-full transition-colors",
                  lang === l ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:text-foreground"
                )}
                aria-pressed={lang === l}
              >
                {l}
              </button>
            ))}
          </div>
          <Button asChild variant="default" size="sm" className="hidden md:inline-flex group">
            <Link to="/contato">
              Fale com a equipe
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
          "fixed inset-0 z-50 lg:hidden transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setOpen(false)} />
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border p-6 transition-transform",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between mb-10">
            <UnfoldLogo />
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-2 -mr-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1" aria-label="Menu mobile">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-3 border-b border-border/50 text-lg font-sans font-medium"
              >
                <span><span className="font-mono text-xs text-primary mr-3">0{i + 1}</span>{item.label}</span>
                <ArrowUpRight className="h-4 w-4 text-foreground/40" />
              </Link>
            ))}
          </nav>
          <Button asChild className="mt-8 w-full">
            <Link to="/contato" onClick={() => setOpen(false)}>Fale com a equipe</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}