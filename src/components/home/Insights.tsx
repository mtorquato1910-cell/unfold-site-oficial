import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const POSTS = [
  {
    cat: "Estratégia",
    title: "Como maximizar seu orçamento de marketing B2B em 2026",
    author: "Beatriz Andrade",
    date: "12 Abr 2026",
    excerpt: "Frameworks práticos para alocar verba entre canais, evitar desperdício e provar ROI para o C-level.",
  },
  {
    cat: "ABM",
    title: "Playbook de ABM: o framework usado pela Unfold em clientes enterprise",
    author: "Rafael Costa",
    date: "05 Abr 2026",
    excerpt: "O passo a passo completo de Account-Based Marketing que aplicamos em contas de R$ 500k+ ARR.",
  },
  {
    cat: "Vertical",
    title: "Marketing para o agronegócio: 7 estratégias práticas",
    author: "Julia Mendes",
    date: "28 Mar 2026",
    excerpt: "O que aprendemos rodando campanhas para agtechs e cooperativas de grande porte no Brasil.",
  },
];

const GRADIENTS = [
  "from-primary/30 via-secondary/20 to-tertiary/30",
  "from-secondary/30 via-primary/20 to-tertiary/30",
  "from-tertiary/40 via-secondary/20 to-primary/30",
];

export function Insights() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-5">
              Insights
            </p>
            <h2 className="font-sans font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
              Conteúdo direto da nossa operação.
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary font-medium group"
          >
            Ver todos os posts
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {POSTS.map((p, i) => (
            <Link
              key={p.title}
              to="/blog"
              className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card/40 hover:bg-card transition-colors"
            >
              <div className={`aspect-[16/9] bg-gradient-to-br ${GRADIENTS[i]}`} />
              <div className="p-6 flex-1 flex flex-col">
                <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-3">
                  {p.cat}
                </p>
                <h3 className="font-sans font-semibold text-lg leading-snug mb-3 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-foreground/65 leading-relaxed flex-1">{p.excerpt}</p>
                <p className="text-xs text-foreground/45 mt-5">
                  Por {p.author} · {p.date}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}