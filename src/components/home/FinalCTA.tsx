import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AmbientOrb } from '@/components/ui/AmbientOrb'
import { Reveal } from '@/components/ui/Reveal'
import { getHomeSettings } from '@/lib/home-settings'

export async function FinalCTA() {
  const s = await getHomeSettings()
  return (
    <section className="relative bg-background py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,hsl(158_92%_70%/0.18),transparent_45%),radial-gradient(circle_at_70%_30%,hsl(218_94%_78%/0.12),transparent_50%),radial-gradient(circle_at_95%_80%,hsl(250_64%_55%/0.20),transparent_45%)]" />
      <AmbientOrb color="mint" size={600} opacity={0.055} className="-top-32 -right-48" duration={14} />
      <AmbientOrb color="blue" size={500} opacity={0.04} className="-bottom-24 left-20" duration={11} style={{ animationName: 'orb-float-alt' }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-8">
            <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.05] max-w-3xl">
              {s.final_cta_title}
            </h2>
            <p className="mt-6 text-base md:text-lg text-foreground/70 max-w-2xl leading-relaxed">
              {s.final_cta_description}
            </p>
          </Reveal>
          <Reveal delay={160} className="lg:col-span-4 lg:flex lg:justify-end">
            <Button asChild size="lg" className="h-14 px-7 text-base group">
              <Link href={s.final_cta_button_href}>
                {s.final_cta_button_label}
                <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
