import { ArrowRight, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroPattern } from "./HeroPattern";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 grain isolate">
      <HeroPattern />
      <div className="container relative z-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <span className="h-2 w-2 rounded-full bg-primary shadow-glow" />
          <p className="font-mono-label text-primary">[ Growth Intelligence ]</p>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-bold max-w-5xl">
          Desdobramos <span className="text-gradient-brand">dados</span> em crescimento real para o seu negócio.
        </h1>

        <p className="mt-8 text-lg md:text-xl text-foreground/70 max-w-2xl leading-relaxed">
          Inteligência aplicada ao funil B2B. Estratégia, dados e IA trabalhando juntos para destravar receita —
          não só métricas de vaidade.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button asChild size="lg" className="group h-12 px-6 text-base">
            <Link to="/contato">
              Fale com a equipe
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="group h-12 px-6 text-base text-foreground hover:bg-card hover:text-primary">
            <Link to="/ferramentas">
              Conheça nossas ferramentas
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* meta row */}
        <div className="mt-20 flex flex-wrap items-center gap-x-10 gap-y-4 font-mono text-xs text-foreground/50">
          <span>[ B2B ]</span>
          <span>[ DEMAND GEN ]</span>
          <span>[ INBOUND ]</span>
          <span>[ AI POWERED ]</span>
          <span>[ EST. 2018 ]</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-foreground/40 font-mono text-[10px] uppercase tracking-widest">
        <span>scroll</span>
        <ArrowDown className="h-3 w-3 animate-bounce" />
      </div>
    </section>
  );
}