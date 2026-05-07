import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { getHomeSettings } from '@/lib/home-settings'

export async function Partners() {
  const settings = await getHomeSettings()
  const partners = settings.partner_logos
  if (partners.length === 0) return null

  return (
    <section className="bg-background border-y border-border py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary px-4 py-1.5 rounded-full border border-primary/25 bg-primary/8">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {settings.partners_eyebrow}
            </span>
          </div>
        </Reveal>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 mb-8">
          {partners.map((p, i) => {
            const inner = p.logoUrl ? (
              <div className="relative h-8 w-28 md:h-10 md:w-32 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition">
                <Image
                  src={p.logoUrl}
                  alt={p.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 112px, 128px"
                />
              </div>
            ) : (
              <span className="font-sans font-bold text-sm tracking-wide text-foreground/50 hover:text-foreground/80 transition-colors">
                {p.name}
              </span>
            )
            return (
              <Reveal key={`${p.name}-${i}`} delay={i * 60}>
                {p.website ? (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={p.name}
                    className="flex items-center justify-center"
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </Reveal>
            )
          })}
        </div>
        {settings.partners_footer_text && (
          <Reveal delay={360}>
            <p className="text-center text-sm italic text-foreground/40 max-w-xl mx-auto">
              {settings.partners_footer_text}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  )
}
