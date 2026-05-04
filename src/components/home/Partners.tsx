import { Reveal } from '@/components/ui/Reveal'

const PARTNERS = ['RD STATION', 'META BUSINESS', 'ASSESPRO ALAGOAS', 'KOMMO', 'ABRADI ALAGOAS']

export function Partners() {
  return (
    <section className="bg-background border-y border-border py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary px-4 py-1.5 rounded-full border border-primary/25 bg-primary/8">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Parceiros e certificações
            </span>
          </div>
        </Reveal>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 mb-8">
          {PARTNERS.map((p, i) => (
            <Reveal key={p} delay={i * 60}>
              <span className="font-sans font-bold text-sm tracking-wide text-foreground/50 hover:text-foreground/80 transition-colors">
                {p}
              </span>
            </Reveal>
          ))}
        </div>
        <Reveal delay={360}>
          <p className="text-center text-sm italic text-foreground/40 max-w-xl mx-auto">
            Não achou sua ferramenta ou tecnologia? Possuímos um setor interno de tecnologia pronto
            para se adaptar à realidade do seu negócio.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
