import { Link } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";

const POSTS = [
  { cat: "Marketing B2B", title: "Por que MQL morreu (e o que medir no lugar)", author: "Equipe Unfold", date: "12 Abr 2026", read: "8 min" },
  { cat: "IA & Growth", title: "Operando funil B2B com agentes de IA: o stack que funciona", author: "Pedro Vasques", date: "02 Abr 2026", read: "11 min" },
  { cat: "Demand Gen", title: "ABM em 2026: menos lista, mais sinal de intenção", author: "Mariana Lopes", date: "21 Mar 2026", read: "6 min" },
];

export function BlogPreview() {
  return (
    <section className="container py-24 md:py-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div className="max-w-2xl">
          <p className="font-mono-label text-primary mb-5">[ Insights ]</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            O que estamos pensando.
          </h2>
        </div>
        <Link to="/blog" className="font-mono-label text-foreground/60 hover:text-primary transition-colors">
          Ver todos os posts →
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {POSTS.map((p, i) => (
          <Link
            to="/blog"
            key={i}
            className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:-translate-y-1 transition-all"
          >
            <div
              className="h-44 relative"
              style={{ background: i % 2 ? "var(--gradient-brand)" : "linear-gradient(135deg, hsl(218 94% 78% / 0.6), hsl(250 64% 45% / 0.6))" }}
            >
              <div className="absolute inset-0 grain opacity-30" />
              <span className="absolute top-4 left-4 font-mono-label bg-background/80 backdrop-blur px-2 py-1 rounded">
                {p.cat}
              </span>
              <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-semibold leading-snug mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                {p.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-foreground/50 font-mono">
                <span>{p.author} · {p.date}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.read}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}