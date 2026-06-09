'use client'

import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import { Menu, X, Download } from 'lucide-react'
import { Orb } from './Orb'
import { useDownloadGuia } from './actions'

const nav: [string, string][] = [
  ['#parte-00', '00 Cenário'],
  ['#parte-01', '01 Jogo'],
  ['#parte-02', '02 Pode × Não pode'],
  ['#parte-03', '03 Operação'],
  ['#parte-04', '04 Erros'],
  ['#contato', 'Consultoria'],
  ['#convite', 'Convite'],
]

export function CoBrand({ dark = false, size = 'md' }: { dark?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const orbPx = size === 'lg' ? 40 : size === 'sm' ? 26 : 30
  const wordPx = size === 'lg' ? '1.25rem' : size === 'sm' ? '0.95rem' : '1.05rem'
  const ink = dark ? 'var(--paper)' : 'var(--ink)'
  const rule = dark ? 'rgba(246,244,237,0.28)' : 'var(--ink-hair)'
  return (
    <div className="flex items-center" style={{ gap: '1.25rem' }}>
      <a href="#top" className="flex items-center" style={{ gap: '0.6rem' }}>
        <Orb style={{ height: orbPx, width: orbPx }} />
        <span className="font-display font-bold tracking-tight" style={{ color: ink, fontSize: wordPx, letterSpacing: '0.02em' }}>UNFOLD</span>
      </a>
      <span aria-hidden style={{ display: 'inline-block', width: 1, height: 22, background: rule }} />
      <a href="#top" className="font-display font-bold tracking-tight" style={{ color: ink, fontSize: wordPx, letterSpacing: '-0.01em', lineHeight: 1 }}>
        Feat<span style={{ color: 'var(--feat-dot)' }}>.</span>Work
      </a>
    </div>
  )
}

export function Header() {
  const { scrollYProgress, scrollY } = useScroll()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40)) // shrink após 40px
  const download = useDownloadGuia('header')
  return (
    <>
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left" style={{ background: 'var(--mint-deep)', scaleX: scrollYProgress }} />
      <header className="guia-editorial-header sticky top-0 z-40 backdrop-blur-md" style={{ background: 'rgba(0,21,29,0.82)', borderBottom: '1px solid var(--ink-hair)' }}>
        {/* gap-6 separa os três grupos; nav inline só a partir de 1180px, senão drawer */}
        <div className={`container-edit flex items-center justify-between gap-6 transition-[padding] duration-300 ${scrolled ? 'py-2.5' : 'py-4'}`}>
          <CoBrand />
          <nav className="hidden min-[1180px]:flex items-center gap-x-6 font-mono-tag">
            {nav.map(([href, label]) => (
              <a key={href} href={href} className="relative whitespace-nowrap transition-colors hover:text-[var(--mint-deep)] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-[var(--mint-deep)] after:transition-all hover:after:w-full">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={download} className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-display font-medium transition-transform active:scale-95 hover:-translate-y-0.5 motion-reduce:transform-none" style={{ background: 'var(--mint)', color: 'var(--on-accent)', boxShadow: 'var(--glow-mint)' }}>
              <Download className="w-4 h-4" /> Baixar PDF
            </button>
            <button onClick={() => setOpen(true)} className="min-[1180px]:hidden p-3 -mr-2" aria-label="Abrir menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: 'var(--paper)' }}>
          <div className="container-edit py-6 flex items-center justify-between">
            <CoBrand />
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-3 -mr-2"><X /></button>
          </div>
          <nav className="container-edit flex flex-col gap-5 mt-6 font-serif text-2xl">
            {nav.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} style={{ color: 'var(--ink)' }}>{label}</a>
            ))}
          </nav>
          <div className="container-edit mt-auto pb-10 pt-8">
            <button onClick={() => { setOpen(false); download() }} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-medium" style={{ background: 'var(--mint)', color: 'var(--on-accent)', boxShadow: 'var(--glow-mint)' }}>
              <Download className="w-4 h-4" /> Baixar PDF
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export function Footer() {
  return (
    <footer style={{ background: 'var(--paper-band)', borderTop: '1px solid var(--ink-hair)' }}>
      <div className="container-edit py-16 grid md:grid-cols-2 gap-10">
        <div>
          <CoBrand />
          <p className="mt-6 text-sm max-w-xs" style={{ color: 'var(--ink-faint)' }}>
            Este guia não substitui parecer jurídico. Para decisões operacionais, consulte advogado especializado em direito eleitoral.
          </p>
        </div>
        <div>
          <div className="font-mono-tag mb-3">Contato</div>
          <a href="mailto:tecnologia@unfoldgrowth.com.br" className="text-sm underline-offset-2 hover:underline" style={{ color: 'var(--ink-body)' }}>tecnologia@unfoldgrowth.com.br</a>
        </div>
      </div>
      <div className="container-edit pb-10 font-mono-tag flex flex-wrap gap-3 justify-between" style={{ borderTop: '1px solid var(--ink-hair)', paddingTop: '1.5rem' }}>
        <span>© 2026 UNFOLD × FEAT.WORK</span>
        <span>EDIÇÃO 1.0 · MAIO DE 2026</span>
      </div>
    </footer>
  )
}
