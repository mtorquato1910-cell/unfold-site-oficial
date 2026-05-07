import { Reveal } from '@/components/ui/Reveal'
import { getHomeSettings } from '@/lib/home-settings'
import { getIcon } from '@/lib/icons-map'

export async function Solutions() {
  const settings = await getHomeSettings()
  const items = settings.solutions
  if (items.length === 0) return null

  return (
    <section className="bg-background py-20 md:py-28 relative overflow-hidden dot-grid">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal className="max-w-3xl mb-14">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-5">
            {settings.solutions_eyebrow}
          </p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
            {settings.solutions_title}
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {items.map((item, i) => {
            const Icon = getIcon(item.icon, 'Target')
            return (
              <Reveal key={`${item.title}-${i}`} delay={Math.min(i % 4, 4) * 70}>
                <article className="group p-7 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary/40 transition-all h-full">
                  <Icon className="h-7 w-7 text-primary mb-6" strokeWidth={1.6} />
                  <h3 className="font-sans font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/65 leading-relaxed">{item.desc}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
