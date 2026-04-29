import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Manifesto() {
  return (
    <section className="container py-24 md:py-32">
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <p className="font-mono-label text-primary mb-6">[ Tese ]</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight">
            Unimos estratégia, dados e <span className="text-gradient-brand">IA</span> para destravar crescimento.
          </h2>
        </div>
        <div className="lg:col-span-6 lg:col-start-7 space-y-6 text-foreground/70 text-lg leading-relaxed">
          <p>
            Marketing B2B parou de ser sobre criatividade isolada. Hoje, vence quem opera o funil como um sistema:
            dados de mercado, sinais de intenção, automação e times comerciais alinhados.
          </p>
          <p>
            A Unfold existe para dar essa camada de inteligência. Não vendemos entregáveis — entregamos o que os
            números dizem que você ainda não viu.
          </p>
          <Link
            to="/quem-somos"
            className="inline-flex items-center gap-2 text-primary font-medium group pt-2"
          >
            Conhecer a tese completa
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}