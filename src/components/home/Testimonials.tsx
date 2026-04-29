import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const ITEMS = [
  {
    quote: "A Unfold trouxe a camada estratégica que faltava no nosso marketing. Em 8 meses, dobramos o pipeline qualificado e finalmente alinhamos marketing e vendas.",
    name: "Mariana Lopes", role: "Head of Marketing", company: "Northwind Tech",
    initials: "ML",
  },
  {
    quote: "Pararam de me entregar relatório bonito e começaram a entregar receita. Esse é o tipo de parceria que escala um negócio B2B de verdade.",
    name: "Rafael Andrade", role: "CEO", company: "Forge Co.",
    initials: "RA",
  },
  {
    quote: "Sentimos a diferença logo no primeiro trimestre. Operação madura, dados na mesa e decisões muito mais rápidas. Recomendo sem hesitar.",
    name: "Camila Rocha", role: "CMO", company: "Helios Agro",
    initials: "CR",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const t = ITEMS[i];

  return (
    <section className="bg-[#E7E7E7] text-[#001E29] py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <Quote className="h-10 w-10 text-[#0a8a5f] mb-8" strokeWidth={1.6} />
        <blockquote className="font-sans text-2xl md:text-3xl lg:text-4xl leading-snug font-normal italic max-w-4xl">
          "{t.quote}"
        </blockquote>
        <div className="mt-12 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#001E29] text-[#6DF9C6] grid place-items-center font-sans font-bold text-sm">
              {t.initials}
            </div>
            <div>
              <p className="font-sans font-bold">{t.name}</p>
              <p className="text-sm text-[#001E29]/60">{t.role} · {t.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setI((i - 1 + ITEMS.length) % ITEMS.length)}
              className="h-10 w-10 grid place-items-center rounded-full border border-[#001E29]/20 hover:border-[#001E29] transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setI((i + 1) % ITEMS.length)}
              className="h-10 w-10 grid place-items-center rounded-full border border-[#001E29]/20 hover:border-[#001E29] transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="ml-3 font-mono text-xs text-[#001E29]/50">
              {String(i + 1).padStart(2, "0")} / {String(ITEMS.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}