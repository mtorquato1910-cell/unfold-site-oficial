/**
 * Sessão local do hotsite (RF-35..RF-38). Persistência da autenticação por gate
 * em localStorage (1ª parte apenas — RF-37). Na Sprint 2 grava a flag de desbloqueio;
 * a Sprint 3 completa com lead_id real e hash do e-mail.
 */
import type { PerfilEleitoral } from './perfil'

const STORAGE_KEY = 'hotsite_unlocked'

export interface HotsiteSession {
  hotsite_unlocked: true
  lead_id?: string
  lead_email_hash?: string
  lead_perfil?: PerfilEleitoral
  cadastro_timestamp: string
}

export function readSession(): HotsiteSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HotsiteSession
    return parsed?.hotsite_unlocked === true ? parsed : null
  } catch {
    return null // localStorage corrompido (item 16) → trata como não autenticado
  }
}

export function isUnlocked(): boolean {
  return readSession() !== null
}

export function persistUnlock(data: Omit<HotsiteSession, 'hotsite_unlocked'>): void {
  if (typeof window === 'undefined') return
  try {
    const session: HotsiteSession = { hotsite_unlocked: true, ...data }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    /* storage cheio/indisponível — o desbloqueio em memória ainda vale nesta visita */
  }
}

/** RF-38 — "Limpar meu cadastro deste dispositivo" (boa prática LGPD). */
export function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
}
