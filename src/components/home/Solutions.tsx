import {
  Target, TrendingUp, GitMerge, Globe, Sparkles, Compass, ArrowUpRight,
} from "lucide-react";

const SOLUTIONS = [
  { icon: Target, title: "Gerar oportunidades comerciais", desc: "Pipeline qualificado, não só MQLs." },
  { icon: TrendingUp, title: "Aumentar conversões", desc: "Otimização contínua do funil ponta-a-ponta." },
  { icon: GitMerge, title: "Integrar marketing e vendas", desc: "Operação unificada com SLAs claros." },
  { icon: Globe, title: "Melhorar presença digital", desc: "SEO, conteúdo e autoridade de marca." },
  { icon: Sparkles, title: "Diferenciar da concorrência", desc: "Posicionamento que sai do mar de igual." },
  { icon: Compass, title: "Posicionamento digital", desc: "Mensagem certa, canal certo, momento certo." },
];

export function Solutions() {
  return (
    <section className="bg-surface/40 border-y border-border py-24 md:py-32">
      <div className="container">
        <div className="max-w-3xl mb-16">
          <p className="font-mono-label text-primary mb-5">[ Para quem precisa ]</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Onde a Unfold entra no seu jogo.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden">
          {SOLUTIONS.map((s, i) => (
            <article
              key={s.title}
              className="bg-background p-8 group hover:bg-card transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="font-mono text-xs text-foreground/40">0{i + 1} / 06</span>
                <ArrowUpRight className="h-4 w-4 text-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <s.icon className="h-7 w-7 text-primary mb-5" />
              <h3 className="text-xl font-display font-semibold mb-2 leading-tight">{s.title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}