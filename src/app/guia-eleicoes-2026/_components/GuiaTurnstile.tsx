'use client'

import { useEffect } from 'react'
import TurnstileWidget from '@/components/TurnstileWidget'

/**
 * Wrapper do Turnstile para o hotsite (RNF-13).
 *
 * Em desenvolvimento, faz bypass (token `dev-bypass`) — a site key de produção
 * não completa o challenge em localhost, o que travaria o submit. Em produção,
 * delega ao widget real compartilhado. O endpoint (Sprint 3) aceita o bypass
 * apenas fora de produção.
 */
export function GuiaTurnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const devBypass = process.env.NODE_ENV !== 'production'

  useEffect(() => {
    if (devBypass) onVerify('dev-bypass')
  }, [devBypass, onVerify])

  if (devBypass) return null
  return <TurnstileWidget onVerify={onVerify} />
}
