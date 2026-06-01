'use client'

import { Lock } from 'lucide-react'

/** CTA fixo no canto inferior direito que reabre o modal (RF-13). */
export function StickyUnlockButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
      style={{
        background: '#6DF9C6',
        color: '#001E29',
        fontFamily: 'var(--font-guia-display)',
      }}
    >
      <Lock className="h-4 w-4" aria-hidden="true" />
      Desbloquear estudo
    </button>
  )
}
