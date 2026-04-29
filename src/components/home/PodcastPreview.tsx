import { Link } from "react-router-dom";
import { Play } from "lucide-react";

const EPS = [
  { num: "#024", title: "ABM, IA e o novo SDR", guest: "Lucas Mendes — VP Sales, Vector" },
  { num: "#023", title: "Como medir marketing em vendas longas", guest: "Beatriz Souza — CMO, Polaris" },
  { num: "#022", title: "Stack de growth enxuto que escala", guest: "André Ramos — Founder, Atlas Co." },
];

export function PodcastPreview() {
  return (
    <section className="border-t border-border bg-surface/30 py-24 md:py-32">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <p className="font-mono-label text-primary mb-5">[ Podcast Unfold ]</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Conversas com quem opera growth de verdade.
            </h2>
          </div>
          <Link to="/podcast" className="font-mono-label text-foreground/60 hover:text-primary transition-colors">
            Todos os episódios →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {EPS.map((e, i) => (
            <Link
              to="/podcast"
              key={i}
              className="group rounded-2xl border border-border bg-card p-6 flex gap-5 hover:border-primary/30 transition-colors"
            >
              <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-tertiary to-secondary grid place-items-center">
                <Play className="h-8 w-8 text-background fill-background" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-primary mb-2">{e.num}</p>
                <h3 className="font-display text-lg font-semibold leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {e.title}
                </h3>
                <p className="text-xs text-foreground/55 leading-relaxed">{e.guest}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}