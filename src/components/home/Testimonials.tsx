import { useState } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS = [
  {
    quote: "A Unfold trouxe a camada estratégica que faltava no nosso marketing. Em 8 meses, dobramos o pipeline qualificado.",
    name: "Mariana Lopes", role: "Head of Marketing", company: "Northwind",
  },
  {
    quote: "Pararam de me entregar relatório bonito e começaram a entregar receita. Esse é o tipo de parceria que escala.",
    name: "Rafael Andrade", role: "CEO", company: "Forge Co.",
  },
  {
    quote: "Sentimos a diferença logo no primeiro trimestre. Operação madura, dados na mesa e decisões muito mais rápidas.",
    name: "Camila Rocha", role: "CMO", company: "Helios Agro",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const t = ITEMS[i];

  return (
    <section className="bg-surface/40 border-y border-border py-24 md:py-32">
      <div className="container max-w-5xl">
        <Quote className="h-10 w-10 text-primary mb-10" />
        <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">
          “{t.quote}”
        </blockquote>
        <div className="mt-12 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="font-display text-lg font-semibold">{t.name}</p>
            <p className="font-mono-label text-foreground/50 mt-1">{t.role} · {t.company}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setI((i - 1 + ITEMS.length) % ITEMS.length)}
              className="h-11 w-11 grid place-items-center rounded-full border border-border hover:border-primary/40 hover:text-primary transition-colors"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setI((i + 1) % ITEMS.length)}
              className="h-11 w-11 grid place-items-center rounded-full border border-border hover:border-primary/40 hover:text-primary transition-colors"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="ml-3 font-mono text-xs text-foreground/40">
              {String(i + 1).padStart(2, "0")} / {String(ITEMS.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}