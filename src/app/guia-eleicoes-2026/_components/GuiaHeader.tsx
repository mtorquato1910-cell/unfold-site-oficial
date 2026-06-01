'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useGate } from './gate-context'
import { DownloadButton } from './DownloadButton'
import { ShareButtons } from './ShareButtons'

/** Header fixo, visível apenas após o desbloqueio (RF-05). */
export function GuiaHeader() {
  const { unlocked } = useGate()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!unlocked) return null

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 border-b backdrop-blur-md"
      style={{ background: 'rgba(0,30,41,0.92)', borderColor: 'rgba(231,231,231,0.12)' }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Marcas Unfold × Feat.Work */}
        <div className="flex items-center gap-3">
          <span
            className="text-base font-bold tracking-wide"
            style={{ color: '#E7E7E7', fontFamily: 'var(--font-guia-display)' }}
          >
            UNFOLD
          </span>
          <span style={{ width: 1, height: 18, background: 'rgba(109,249,198,0.5)' }} />
          <Image
            src="/guia/featwork-branca.png"
            alt="Feat.Work"
            width={120}
            height={36}
            className="h-4 w-auto"
          />
        </div>

        {/* Título central (desktop) */}
        <span
          className="hidden text-sm md:block"
          style={{ color: 'rgba(231,231,231,0.7)', fontFamily: 'var(--font-guia-mono)' }}
        >
          Guia Eleições 2026
        </span>

        {/* Ações (desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          <DownloadButton origem="header" />
          <ShareButtons />
        </div>

        {/* Hamburger (mobile) */}
        <button
          type="button"
          className="md:hidden p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X className="h-5 w-5" style={{ color: '#E7E7E7' }} />
          ) : (
            <Menu className="h-5 w-5" style={{ color: '#E7E7E7' }} />
          )}
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div
          className="flex flex-col gap-3 border-t px-4 py-4 md:hidden"
          style={{ background: 'rgba(0,30,41,0.98)', borderColor: 'rgba(231,231,231,0.12)' }}
        >
          <DownloadButton origem="header" className="w-full" />
          <ShareButtons className="flex-col [&>button]:w-full" />
        </div>
      )}
    </header>
  )
}
