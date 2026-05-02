// 11 placeholder logos — client approvals pending
const LOGOS = [
  'CLIENTE 01',
  'CLIENTE 02',
  'CLIENTE 03',
  'CLIENTE 04',
  'CLIENTE 05',
  'CLIENTE 06',
  'CLIENTE 07',
  'CLIENTE 08',
  'CLIENTE 09',
  'CLIENTE 10',
  'CLIENTE 11',
]

export function ClientLogos() {
  return (
    <section className="bg-background border-y border-border py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-primary mb-10">
          Empresas que confiam na Unfold
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-10 items-center justify-items-center">
          {LOGOS.map((name) => (
            <div
              key={name}
              className="flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              <span className="font-display font-bold text-sm md:text-base tracking-tight whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
