import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { getHomeSettings } from '@/lib/home-settings'
import { getIcon } from '@/lib/icons-map'

export async function Tools() {
  const settings = await getHomeSettings()
  const tools = settings.tools
  if (tools.length === 0) return null

  return (
    <section className="bg-[#E7E7E7] text-[#001E29] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal className="max-w-3xl mb-14">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0a8a5f] mb-5">
            {settings.tools_eyebrow}
          </p>
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
            {settings.tools_title}
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
          {tools.map((t, i) => {
            const Icon = getIcon(t.icon, 'Calculator')
            return (
              <Reveal key={`${t.title}-${i}`} delay={i * 100}>
                <Link
                  href={t.href}
                  className="group relative bg-white border border-[#001E29]/10 rounded-xl p-7 hover:border-[#001E29]/30 hover:-translate-y-0.5 transition-all block"
                >
                  {t.ai && (
                    <span className="absolute top-5 right-5 font-mono text-[10px] uppercase tracking-wider text-[#0a8a5f] border border-[#0a8a5f]/30 rounded-full px-2 py-0.5 bg-[#6DF9C6]/10">
                      AI Powered
                    </span>
                  )}
                  <Icon className="h-7 w-7 text-[#0a8a5f] mb-6" strokeWidth={1.6} />
                  <h3 className="font-display font-semibold text-lg mb-2 leading-snug pr-12">
                    {t.title}
                  </h3>
                  <p className="text-sm text-[#001E29]/65 leading-relaxed mb-6">{t.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#001E29] border-b border-[#001E29]/30 group-hover:border-[#001E29] pb-0.5">
                    {t.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
