import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Methodology() {
  return (
    <section className="bg-[#E7E7E7] text-[#001E29] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0a8a5f] mb-5">
            Metodologia Unfold
          </p>
        </div>
        <div className="lg:col-span-8">
          <h2 className="font-sans font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
            Soluções ágeis e integradas para crescer.
          </h2>
          <p className="mt-8 text-base md:text-lg leading-relaxed text-[#001E29]/75 max-w-3xl">
            Os resultados da sua operação de marketing digital ou vendas não estão saindo como
            deveriam? Não consegue gerar resultados consistentes com suas ações? As coisas
            simplesmente não avançam? A gente resolve.
          </p>
          <Link
            to="/servicos"
            className="mt-8 inline-flex items-center gap-2 text-[#001E29] font-medium border-b border-[#001E29]/30 hover:border-[#001E29] pb-1 transition-colors group"
          >
            Conheça nossa metodologia
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}