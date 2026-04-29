import { useState } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const SERVICES = [
  {
    name: "Demand Generation",
    desc: "Geração de demanda qualificada com mídia paga, ABM e operação de outbound integrada ao CRM.",
    deliverables: ["Estratégia de canais", "Operação de mídia", "ABM playbooks", "Sales enablement"],
  },
  {
    name: "Social Performance",
    desc: "Conteúdo orgânico e paid social que constrói autoridade e gera conversa comercial real.",
    deliverables: ["Content strategy", "Produção de conteúdo", "Comunidade", "Paid social"],
  },
  {
    name: "Inbound Marketing",
    desc: "Funil de inbound completo: SEO técnico, conteúdo, automação e nutrição até o handoff de vendas.",
    deliverables: ["SEO técnico + on-page", "Editorial calendar", "Automação RD/HubSpot", "Lead scoring"],
  },
  {
    name: "Consultoria",
    desc: "Diagnóstico, planejamento e implementação. Quando o problema é estratégia, não execução.",
    deliverables: ["Diagnóstico de maturidade", "Planejamento anual", "Stack & processos", "Mentoria de time"],
  },
];

export function Services() {
  const [open, setOpen] = useState(0);

  return (
    <section className="container py-24 md:py-32">
      <div className="grid lg:grid-cols-12 gap-12 mb-14">
        <div className="lg:col-span-5">
          <p className="font-mono-label text-primary mb-5">[ Serviços ]</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Quatro frentes, um sistema.
          </h2>
        </div>
        <p className="lg:col-span-6 lg:col-start-7 text-foreground/65 text-lg leading-relaxed">
          Cada serviço pode rodar isolado, mas o crescimento acontece quando eles operam juntos.
        </p>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden">
        {SERVICES.map((s, i) => {
          const isOpen = open === i;
          return (
            <div
              key={s.name}
              className={cn(
                "border-b border-border last:border-b-0 transition-colors",
                isOpen ? "bg-card" : "bg-background hover:bg-card/60"
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full text-left p-6 md:p-8 flex items-center gap-6 group"
                aria-expanded={isOpen}
              >
                <span className="font-mono text-sm text-primary w-10 shrink-0">0{i + 1}</span>
                <h3 className="font-display text-2xl md:text-3xl font-semibold flex-1 tracking-tight">
                  {s.name}
                </h3>
                <span className="h-9 w-9 rounded-full border border-border grid place-items-center text-foreground/60 group-hover:text-primary group-hover:border-primary/40 transition-colors">
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-6 md:px-8 pb-8 md:pl-24 grid md:grid-cols-2 gap-8">
                    <p className="text-foreground/70 leading-relaxed">{s.desc}</p>
                    <div>
                      <p className="font-mono-label text-foreground/40 mb-3">Entregáveis</p>
                      <ul className="space-y-2">
                        {s.deliverables.map((d) => (
                          <li key={d} className="flex items-center gap-2 text-sm text-foreground/80">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {d}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/servicos"
                        className="inline-flex items-center gap-2 text-primary text-sm font-medium mt-6 group/link"
                      >
                        Ver mais
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}