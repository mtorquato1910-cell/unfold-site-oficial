import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-28">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.pexels.com/videos/3129957/free-video-3129957.jpg?auto=compress&w=1600"
        className="absolute inset-0 h-full w-full object-cover -z-20"
      >
        <source
          src="https://videos.pexels.com/video-files/3129957/3129957-uhd_3840_2160_25fps.mp4"
          type="video/mp4"
        />
      </video>
      {/* Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/95 via-background/85 to-background/55" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(158_92%_70%/0.10),transparent_55%)]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6 animate-fade-in">
          Growth Intelligence
        </p>
        <h1 className="font-sans font-bold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-5xl animate-fade-in">
          Acelere seus resultados de marketing e vendas com{" "}
          <span className="text-primary">inteligência aplicada.</span>
        </h1>
        <p className="mt-7 text-lg md:text-xl text-foreground/75 max-w-2xl leading-relaxed animate-fade-in">
          Estruturamos operações de marketing-vendas orientadas a dados e IA. Da geração de demanda
          à conversão, transformamos como sua marca cresce no digital.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in">
          <Button asChild size="lg" className="h-12 px-6 text-base group">
            <Link to="/contato">
              Fale com nossa equipe
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-6 text-base bg-transparent border-foreground/20 text-foreground hover:bg-foreground/5 hover:text-primary"
          >
            <Link to="/quem-somos">Conhecer a metodologia</Link>
          </Button>
        </div>

        {/* Stats inline */}
        <div className="mt-16 pt-8 border-t border-foreground/10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-foreground/60">
          <span><span className="font-mono text-primary font-medium">+R$ 40mi</span> gerados</span>
          <span className="text-foreground/30">·</span>
          <span><span className="font-mono text-primary font-medium">+55</span> campanhas</span>
          <span className="text-foreground/30">·</span>
          <span><span className="font-mono text-primary font-medium">+25mil</span> conteúdos</span>
          <span className="text-foreground/30">·</span>
          <span>Parceiros RD Station, Meta, Kommo</span>
        </div>
      </div>
    </section>
  );
}