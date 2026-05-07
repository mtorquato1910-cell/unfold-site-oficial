import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { getHomeSettings } from '@/lib/home-settings'

export async function Services() {
  const settings = await getHomeSettings()
  const services = settings.services
  if (services.length === 0) return null

  return (
    <section className="bg-[#E7E7E7] text-[#001E29] py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0a8a5f] mb-5">
            {settings.services_eyebrow}
          </p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1] max-w-3xl mb-8">
            {settings.services_title}
          </h2>
        </Reveal>

        <div className="space-y-4">
          {services.map((s, i) => (
            <Reveal key={`${s.numero}-${i}`} delay={i * 90}>
              <article className="group bg-white border border-[#001E29]/10 rounded-xl p-7 md:p-9 hover:border-[#001E29]/30 transition-colors">
                <div className="grid md:grid-cols-12 gap-6 md:gap-10">
                  <div className="md:col-span-4">
                    <span className="font-mono text-sm text-[#0a8a5f]">{s.numero}.</span>
                    <h3 className="font-display font-bold text-2xl mt-2">{s.title}</h3>
                    <p className="text-sm text-[#001E29]/65 mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="md:col-span-6">
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                      {s.bullets.map((b, idx) => (
                        <li key={`${b}-${idx}`} className="flex gap-2 text-[#001E29]/80">
                          <span className="text-[#0a8a5f] mt-1">→</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:col-span-2 flex md:justify-end md:items-end">
                    <Link
                      href={s.cta_href}
                      className="inline-flex items-center gap-1 text-sm font-medium border-b border-[#001E29]/30 hover:border-[#001E29] pb-0.5 transition-colors"
                    >
                      {s.cta_label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
