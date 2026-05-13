'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Reveal } from '@/components/ui/Reveal'
import type { PublicTestimonial } from '@/lib/testimonials'

type Props = {
  items: PublicTestimonial[]
  eyebrow?: string
  title?: string
}

export default function TestimonialsClient({ items, eyebrow, title }: Props) {
  const [i, setI] = useState(0)
  const t = items[i]
  if (!t) return null

  return (
    <section className="bg-[#E7E7E7] text-[#001E29] py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <Reveal>
          <Quote className="h-10 w-10 text-[#0a8a5f] mb-8" strokeWidth={1.6} />
        </Reveal>
        {(eyebrow || title) && (
          <Reveal delay={40}>
            {eyebrow && (
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0a8a5f] mb-4">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.1] max-w-4xl mb-10">
                {title}
              </h2>
            )}
          </Reveal>
        )}
        <Reveal delay={80}>
          <blockquote className="font-sans text-2xl md:text-3xl lg:text-4xl leading-snug font-normal italic max-w-4xl">
            &ldquo;{t.depoimento}&rdquo;
          </blockquote>
        </Reveal>
        <Reveal delay={160}>
          <div className="mt-12 flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center -space-x-2">
                {t.fotoUrl ? (
                  <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-[#E7E7E7] bg-[#001E29]">
                    <Image
                      src={t.fotoUrl}
                      alt={t.nome}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full ring-2 ring-[#E7E7E7] bg-[#001E29] text-[#6DF9C6] grid place-items-center font-sans font-bold text-sm">
                    {t.initials}
                  </div>
                )}
                {t.logoEmpresaUrl && (
                  <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-[#E7E7E7] bg-white grid place-items-center">
                    <Image
                      src={t.logoEmpresaUrl}
                      alt={t.empresa}
                      fill
                      className="object-contain p-1.5"
                      sizes="48px"
                    />
                  </div>
                )}
              </div>
              <div>
                <p className="font-sans font-bold">{t.nome}</p>
                <p className="text-sm text-[#001E29]/60">
                  {t.cargo ? `${t.cargo} · ` : ''}
                  {t.empresa}
                </p>
              </div>
            </div>
            {items.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setI((i - 1 + items.length) % items.length)}
                  className="h-10 w-10 grid place-items-center rounded-full border border-[#001E29]/20 hover:border-[#001E29] transition-colors"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setI((i + 1) % items.length)}
                  className="h-10 w-10 grid place-items-center rounded-full border border-[#001E29]/20 hover:border-[#001E29] transition-colors"
                  aria-label="Próximo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="ml-3 font-mono text-xs text-[#001E29]/50">
                  {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
