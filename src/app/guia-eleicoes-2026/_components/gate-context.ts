'use client'

import { createContext, useContext } from 'react'
import type { PerfilEleitoral } from '../_lib/perfil'

export interface UnlockData {
  perfil: PerfilEleitoral
  emailHash?: string
  leadId?: string
}

export interface GateContextValue {
  unlocked: boolean
  /** Hash do e-mail do lead (para UTM de compartilhamento), quando disponível. */
  emailHash?: string
  /** CTAs em destaque temporário logo após o desbloqueio (RF-42). */
  highlightCtas: boolean
  /** Abre o modal de cadastro com mensagem contextual opcional (RF-10). */
  openModal: (message?: string) => void
  /** Marca a sessão como desbloqueada e persiste localmente (RF-20/RF-35). */
  unlock: (data: UnlockData) => void
}

export const GateContext = createContext<GateContextValue | null>(null)

export function useGate(): GateContextValue {
  const ctx = useContext(GateContext)
  if (!ctx) throw new Error('useGate deve ser usado dentro de <GateProvider>')
  return ctx
}
