import { Reveal } from '@/components/ui/Reveal'

const LOGOS = [
  'Grupo AV',
  'Zest Inc',
  'Ypê Investimentos',
  'Grupo Luiz Jatobá',
  'Inove Engenharia',
  'OFM Systems',
  'Mesha Tecnologia',
  'Roga DX',
  'Sementes Ipiranga',
  'Grupo Maqnelson',
  'Vertical Locações',
  'Consórcio Nova Aravel',
]

export function ClientLogos() {
  return (
    <section className="bg-background border-y border-border py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-primary mb-10">
            Empresas que confiam na Unfold
          </p>
        </Reveal>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-10 items-center justify-items-center">
          {LOGOS.map((name, i) => (
            <Reveal key={name} delay={Math.min(i, 5) * 55}>
              <div className="flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
                <span className="font-display font-bold text-sm md:text-base tracking-tight text-center">
                  {name}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
