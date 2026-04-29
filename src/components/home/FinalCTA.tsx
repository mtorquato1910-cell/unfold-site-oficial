import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="container pb-24 md:pb-32 pt-8">
      <div
        className="relative overflow-hidden rounded-3xl p-10 md:p-20 text-center grain isolate"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div className="absolute inset-0 opacity-30 mix-blend-overlay"
             style={{
               backgroundImage:
                 "linear-gradient(hsl(195 100% 8% / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(195 100% 8% / 0.4) 1px, transparent 1px)",
               backgroundSize: "60px 60px",
             }}
        />
        <div className="relative max-w-3xl mx-auto">
          <p className="font-mono-label text-primary-foreground/70 mb-6">[ Vamos conversar ]</p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground tracking-tight leading-[1.05]">
            Pronto para destravar seu crescimento?
          </h2>
          <p className="mt-6 text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Em 30 minutos identificamos onde sua operação está perdendo receita — e o que fazer a respeito.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-10 h-14 px-8 text-base bg-background text-foreground hover:bg-background/90 group"
          >
            <Link to="/contato">
              Falar com a equipe
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}