import { Reveal } from '@/components/ui/Reveal'

const PARTNERS = ['RD STATION', 'META BUSINESS', 'ASSESPRO ALAGOAS', 'KOMMO', 'ABRADI ALAGOAS']

export function Partners() {
  return (
    <section className="bg-background border-t border-border py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-foreground/50 mb-8">
            Parceiros e certificações
          </p>
        </Reveal>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 mb-8">
          {PARTNERS.map((p, i) => (
            <Reveal key={p} delay={i * 60}>
              <span className="font-sans font-semibold text-sm tracking-wide text-foreground/45 hover:text-foreground/90 transition-colors">
                {p}
              </span>
            </Reveal>
          ))}
        </div>
        <Reveal delay={360}>
          <p className="text-center text-sm text-foreground/50 max-w-xl mx-auto">
            Não achou sua ferramenta ou tecnologia? Possuímos um setor interno de tecnologia pronto
            para se adaptar à realidade do seu negócio.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
