'use client'

import { clearSession } from '../_lib/session'
import { POLITICA_URL, DPO_EMAIL } from '../_lib/links'

/** Rodapé do hotsite: LGPD (política + DPO) e reset de cadastro (RF-38, RNF-14). */
export function GuiaFooter() {
  function handleClear() {
    clearSession()
    try {
      sessionStorage.removeItem('modal_reaberto_30s')
    } catch {
      /* noop */
    }
    window.location.reload()
  }

  return (
    <footer
      className="flex flex-col items-center gap-3 px-6 py-10 text-center"
      style={{ background: '#2a2a2a', color: 'rgba(231,231,231,0.55)', fontFamily: 'var(--font-guia-mono)' }}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
        <a href={POLITICA_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">
          Política de Privacidade
        </a>
        <span aria-hidden="true">·</span>
        <a href={`mailto:${DPO_EMAIL}`} className="underline underline-offset-2 hover:opacity-80">
          Encarregado de Dados (DPO): {DPO_EMAIL}
        </a>
        <span aria-hidden="true">·</span>
        <button type="button" onClick={handleClear} className="underline underline-offset-2 hover:opacity-80">
          Limpar meu cadastro deste dispositivo
        </button>
      </div>
      <p className="text-[11px]" style={{ color: 'rgba(231,231,231,0.4)' }}>
        © 2026 Unfold × Feat.Work. Tratamos a intenção de candidatura com base no legítimo
        interesse para qualificação comercial, conforme a LGPD.
      </p>
    </footer>
  )
}
