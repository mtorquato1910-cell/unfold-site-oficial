import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function FeaturedCase() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Visual */}
          <div className="relative rounded-2xl border border-border bg-card overflow-hidden aspect-[4/3] order-last lg:order-first">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(158_92%_70%/0.18),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(218_94%_78%/0.15),transparent_55%)]" />
            <div className="relative h-full p-8 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                </div>
                <span className="font-mono text-[10px] text-foreground/40">DASHBOARD · B2B</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: "Pipeline", v: "R$ 6.2M" },
                  { l: "CPL", v: "-92%" },
                  { l: "Ciclo", v: "-3 mo" },
                ].map((m) => (
                  <div key={m.l} className="rounded-lg border border-border bg-background/40 p-3">
                    <p className="font-mono text-[10px] uppercase text-foreground/45">{m.l}</p>
                    <p className="font-mono text-xl font-semibold text-primary mt-1">{m.v}</p>
                  </div>
                ))}
              </div>
              <div className="flex-1 rounded-lg border border-border bg-background/40 p-4 flex items-end gap-1.5">
                {[18, 28, 22, 38, 32, 48, 42, 58, 55, 70, 65, 82].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 rounded-sm bg-gradient-to-t from-primary/30 to-primary/80"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
              Case de sucesso
            </p>
            <p className="font-sans font-bold text-xl tracking-tight text-foreground/60 mb-3">
              NORTHWIND TECH
            </p>
            <h3 className="font-sans font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
              Marketing e vendas B2B.
            </h3>
            <p className="mt-6 text-base md:text-lg text-foreground/70 leading-relaxed">
              Como geramos um pipeline de mais de R$ 6 milhões, reduzimos em 92% o custo por
              oportunidade e diminuímos em 3 meses o tempo de negociação.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-6">
              <Link
                to="/cases/northwind"
                className="inline-flex items-center gap-2 text-primary font-medium group"
              >
                Conheça o case completo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/cases"
                className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground font-medium"
              >
                Ver todos os cases →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}