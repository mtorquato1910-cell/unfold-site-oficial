import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { getHomeSettings } from '@/lib/home-settings'

export async function Methodology() {
  const s = await getHomeSettings()
  return (
    <section className="bg-[#E7E7E7] text-[#001E29] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
        <Reveal className="lg:col-span-4 flex flex-col items-start">
          <Image
            src="/icone-a.png"
            alt="Unfold Growth System"
            width={160}
            height={160}
            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain"
          />
        </Reveal>
        <Reveal delay={120} className="lg:col-span-8">
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
            {s.method_title}
          </h2>
          <p className="mt-8 text-base md:text-lg leading-relaxed text-[#001E29]/75 max-w-3xl">
            {s.method_description}
          </p>
          <Link
            href={s.method_cta_href}
            className="mt-8 inline-flex items-center gap-2 text-[#001E29] font-medium border-b border-[#001E29]/30 hover:border-[#001E29] pb-1 transition-colors group"
          >
            {s.method_cta_label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
