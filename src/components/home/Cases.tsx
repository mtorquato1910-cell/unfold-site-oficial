import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const CASES = [
  { vertical: "SaaS B2B", client: "Northwind", result: "+R$ 6Mi em pipeline em 12 meses", color: "from-primary/20 to-secondary/10" },
  { vertical: "Indústria", client: "Forge Co.", result: "3,2× ROI em mídia paga", color: "from-secondary/20 to-tertiary/10" },
  { vertical: "Agronegócio", client: "Helios", result: "+412% leads qualificados", color: "from-primary/20 to-tertiary/10" },
  { vertical: "Eventos", client: "Stratus", result: "Sold out em 21 dias", color: "from-secondary/20 to-primary/10" },
  { vertical: "Educação", client: "Polaris", result: "CAC reduzido em 38%", color: "from-tertiary/20 to-primary/10" },
  { vertical: "Logística", client: "Vector", result: "+R$ 2,4Mi em receita nova", color: "from-primary/20 to-secondary/10" },
];

export function Cases() {
  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="container mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="font-mono-label text-primary mb-5">[ Cases ]</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Resultados que falam por si.
          </h2>
        </div>
        <Link to="/cases" className="font-mono-label text-foreground/60 hover:text-primary transition-colors">
          Todos os cases →
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        <div className="container">
          <div className="flex gap-5 md:grid md:grid-cols-3 md:gap-6">
            {CASES.map((c, i) => (
              <Link
                to="/cases"
                key={i}
                className="group relative shrink-0 w-[300px] md:w-auto rounded-2xl border border-border bg-card p-7 overflow-hidden transition-all hover:border-primary/40 hover:-translate-y-1 hover:shadow-card"
              >
                <div className={`absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl opacity-60 bg-gradient-to-br ${c.color}`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-12">
                    <span className="font-mono-label text-foreground/50 [writing-mode:vertical-rl] rotate-180">
                      {c.vertical}
                    </span>
                    <span className="font-display text-2xl font-bold text-foreground/30">{c.client}</span>
                  </div>
                  <p className="font-display text-2xl md:text-3xl font-semibold leading-tight tracking-tight min-h-[5rem]">
                    {c.result}
                  </p>
                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                    <span className="font-mono text-xs text-foreground/60">Ver case completo</span>
                    <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}