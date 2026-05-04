'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface StatProps {
  value: number
  prefix: string
  suffix: string
  label: string
}

function StatCounter({ value, prefix, suffix, label }: StatProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1400
          const start = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * value))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          observer.unobserve(el)
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <span>
      <span ref={ref} className="font-mono text-primary font-medium">
        {prefix}{count}{suffix}
      </span>{' '}
      {label}
    </span>
  )
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-28">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.pexels.com/videos/3129957/free-video-3129957.jpg?auto=compress&w=1600"
        className="absolute inset-0 h-full w-full object-cover -z-20"
      >
        <source
          src="https://videos.pexels.com/video-files/3129957/3129957-uhd_3840_2160_25fps.mp4"
          type="video/mp4"
        />
      </video>
      {/* Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/95 via-background/85 to-background/55" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(158_92%_70%/0.10),transparent_55%)]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6 reveal-hidden opacity-0"
          style={{ animation: 'reveal-in 0.58s cubic-bezier(0.16,1,0.3,1) 100ms forwards' }}>
          Growth Intelligence · Geração de demanda
        </p>
        <h1
          className="font-display font-bold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-5xl"
          style={{ animation: 'reveal-in 0.58s cubic-bezier(0.16,1,0.3,1) 200ms forwards', opacity: 0 }}
        >
          Organizamos crescimento em operações com{' '}
          <span className="text-primary">vendas complexas.</span>
        </h1>
        <p
          className="mt-7 text-lg md:text-xl text-foreground/75 max-w-2xl leading-relaxed"
          style={{ animation: 'reveal-in 0.58s cubic-bezier(0.16,1,0.3,1) 320ms forwards', opacity: 0 }}
        >
          Estruturamos sistemas de crescimento que conectam marketing, vendas, CRM e automação em
          uma lógica integrada, previsível e orientada a resultado comercial.
        </p>
        <div
          className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
          style={{ animation: 'reveal-in 0.58s cubic-bezier(0.16,1,0.3,1) 420ms forwards', opacity: 0 }}
        >
          <Button asChild size="lg" className="h-12 px-6 text-base group">
            <Link href="/diagnostico">
              Solicite um Diagnóstico
              <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-6 text-base bg-transparent border-foreground/20 text-foreground hover:bg-foreground/5 hover:text-primary"
          >
            <Link href="/metodo">
              Conhecer o método
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stats inline — animated counters */}
        <div
          className="mt-16 pt-8 border-t border-foreground/10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-foreground/60"
          style={{ animation: 'reveal-in 0.58s cubic-bezier(0.16,1,0.3,1) 540ms forwards', opacity: 0 }}
        >
          <StatCounter value={75} prefix="+R$ " suffix="MM" label="gerados em pipeline" />
          <span className="text-foreground/30">·</span>
          <StatCounter value={850} prefix="+R$ " suffix="k" label="gerenciados em mídia online" />
          <span className="text-foreground/30">·</span>
          <StatCounter value={25} prefix="+" suffix="k" label="conteúdos produzidos" />
          <span className="text-foreground/30">·</span>
          <span>Parceiros RD Station, Meta, Kommo</span>
        </div>
      </div>
    </section>
  )
}
