import { Calculator, Activity, ScanLine, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const TOOLS = [
  {
    icon: Calculator,
    title: "Calculadora de Investimento × Retorno",
    desc: "Quanto investir em mídia para atingir sua meta de receita? Nossa IA cruza seus dados com benchmarks reais.",
    href: "/ferramentas/calculadora-trafego",
    ai: true,
  },
  {
    icon: Activity,
    title: "Diagnóstico de Maturidade Digital",
    desc: "15 perguntas, 4 dimensões. Saiba exatamente em que estágio sua operação está e o que priorizar agora.",
    href: "/ferramentas/diagnostico",
    ai: false,
  },
  {
    icon: ScanLine,
    title: "Auditoria de Landing Page",
    desc: "Cole a URL e receba um score 0–100 com recomendações acionáveis em headline, copy, CTAs, prova social e SEO.",
    href: "/ferramentas/auditoria-lp",
    ai: true,
  },
];

export function Tools() {
  return (
    <section className="container py-24 md:py-32">
      <div className="max-w-3xl mb-14">
        <p className="font-mono-label text-primary mb-5">[ Ferramentas gratuitas ]</p>
        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
          Inteligência aplicada, em poucos cliques.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {TOOLS.map((t) => (
          <Link
            to={t.href}
            key={t.title}
            className="group relative rounded-2xl bg-card p-8 transition-all hover:-translate-y-1"
            style={{
              backgroundImage: "linear-gradient(hsl(var(--card)), hsl(var(--card)))",
            }}
          >
            {/* gradient border */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl p-px opacity-60 group-hover:opacity-100 transition-opacity"
                 style={{ background: "var(--gradient-brand)", WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="h-12 w-12 grid place-items-center rounded-xl bg-primary/10 text-primary">
                  <t.icon className="h-5 w-5" />
                </div>
                {t.ai && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-tertiary-foreground bg-tertiary/40 border border-tertiary/60 rounded-full px-2 py-1">
                    <Sparkles className="h-3 w-3" /> IA
                  </span>
                )}
              </div>
              <h3 className="font-display text-xl font-semibold leading-tight mb-3">{t.title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">{t.desc}</p>
              <div className="mt-8 flex items-center gap-2 text-primary font-medium text-sm">
                Usar ferramenta
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}