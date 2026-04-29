import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="relative bg-background py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,hsl(158_92%_70%/0.18),transparent_45%),radial-gradient(circle_at_70%_30%,hsl(218_94%_78%/0.12),transparent_50%),radial-gradient(circle_at_95%_80%,hsl(250_64%_55%/0.20),transparent_45%)]" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8">
            <h2 className="font-sans font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.05] max-w-3xl">
              Pronto para destravar seu crescimento?
            </h2>
            <p className="mt-6 text-base md:text-lg text-foreground/70 max-w-2xl leading-relaxed">
              Conte para nós seu desafio. Em até 24h alguém da equipe entra em contato com um
              diagnóstico inicial.
            </p>
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <Button asChild size="lg" className="h-14 px-7 text-base group">
              <Link to="/contato">
                Falar com a equipe
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}