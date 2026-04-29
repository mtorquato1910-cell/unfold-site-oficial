import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const SERVICES = [
  {
    n: "01",
    title: "Demand Generation",
    desc: "Geração de leads qualificados via tráfego pago e automação.",
    bullets: ["Estratégia de mídia paga (Meta, Google, LinkedIn)", "Automação de nutrição e qualificação", "Lead scoring e SLA com vendas", "Otimização contínua de CPL e CAC"],
  },
  {
    n: "02",
    title: "Social Performance",
    desc: "Conteúdo e mídia social que gera awareness e conversão.",
    bullets: ["Planejamento editorial orientado a funil", "Produção de conteúdo (vídeo, carrossel, copy)", "Mídia paga social com criativos testáveis", "Relatórios de impacto e attribution"],
  },
  {
    n: "03",
    title: "Inbound Marketing",
    desc: "Funil completo de aquisição, nutrição e conversão.",
    bullets: ["SEO técnico e de conteúdo", "Blog e topic clusters", "Materiais ricos e landing pages", "Automação RD Station / HubSpot"],
  },
  {
    n: "04",
    title: "Consultoria de Marketing e Branding",
    desc: "Projetos estratégicos sob medida.",
    bullets: ["Diagnóstico e plano estratégico", "Posicionamento e arquitetura de marca", "Implementação de stack mar-tech", "Treinamento e mentoria de times"],
  },
];

export function Services() {
  return (
    <section className="bg-[#E7E7E7] text-[#001E29] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0a8a5f] mb-5">
          Nossos serviços
        </p>
        <h2 className="font-sans font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1] max-w-3xl mb-14">
          Marketing-vendas que entrega.
        </h2>

        <div className="space-y-4">
          {SERVICES.map((s) => (
            <article
              key={s.n}
              className="group bg-white border border-[#001E29]/10 rounded-xl p-7 md:p-9 hover:border-[#001E29]/30 transition-colors"
            >
              <div className="grid md:grid-cols-12 gap-6 md:gap-10">
                <div className="md:col-span-4">
                  <span className="font-mono text-sm text-[#0a8a5f]">{s.n}.</span>
                  <h3 className="font-sans font-bold text-2xl mt-2">{s.title}</h3>
                  <p className="text-sm text-[#001E29]/65 mt-2 leading-relaxed">{s.desc}</p>
                </div>
                <div className="md:col-span-6">
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-[#001E29]/80">
                        <span className="text-[#0a8a5f] mt-1">→</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-2 flex md:justify-end md:items-end">
                  <Link
                    to="/servicos"
                    className="inline-flex items-center gap-1 text-sm font-medium border-b border-[#001E29]/30 hover:border-[#001E29] pb-0.5 transition-colors"
                  >
                    Ver mais
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}