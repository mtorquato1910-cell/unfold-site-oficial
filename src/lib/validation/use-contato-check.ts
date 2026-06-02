'use client'

/**
 * Hook de validação assíncrona de e-mail/WhatsApp (onBlur) compartilhado pelos
 * formulários. Encapsula abort de requisições concorrentes e estados de erro.
 *
 *   const { emailError, phoneError, checkingEmail, checkingPhone, checkEmail, checkPhone }
 *     = useContatoCheck()
 *   <input onBlur={(e) => checkEmail(e.target.value)} />
 *   <input onBlur={(e) => checkPhone(e.target.value, { requirePhone: true })} />
 */

import { useCallback, useRef, useState } from 'react'
import { checkContato } from './client'

export function useContatoCheck() {
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [checkingPhone, setCheckingPhone] = useState(false)
  const emailAbort = useRef<AbortController | null>(null)
  const phoneAbort = useRef<AbortController | null>(null)

  const checkEmail = useCallback(async (email: string): Promise<boolean> => {
    if (!email || !email.trim()) {
      setEmailError(null)
      return true
    }
    emailAbort.current?.abort()
    const ac = new AbortController()
    emailAbort.current = ac
    setCheckingEmail(true)
    const r = await checkContato({ email, signal: ac.signal })
    if (ac.signal.aborted) return true
    setCheckingEmail(false)
    const msg = r.email && !r.email.ok ? r.email.message ?? 'E-mail inválido.' : null
    setEmailError(msg)
    return msg === null
  }, [])

  const checkPhone = useCallback(
    async (telefone: string, opts: { requirePhone?: boolean; mobileOnly?: boolean } = {}): Promise<boolean> => {
      if (!telefone || !telefone.trim()) {
        // Vazio só é erro quando o telefone é obrigatório.
        const msg = opts.requirePhone ? 'Informe seu WhatsApp com DDD.' : null
        setPhoneError(msg)
        return msg === null
      }
      phoneAbort.current?.abort()
      const ac = new AbortController()
      phoneAbort.current = ac
      setCheckingPhone(true)
      const r = await checkContato({
        telefone,
        requirePhone: opts.requirePhone,
        mobileOnly: opts.mobileOnly,
        signal: ac.signal,
      })
      if (ac.signal.aborted) return true
      setCheckingPhone(false)
      const msg = r.whatsapp && !r.whatsapp.ok ? r.whatsapp.message ?? 'WhatsApp inválido.' : null
      setPhoneError(msg)
      return msg === null
    },
    [],
  )

  return {
    emailError,
    phoneError,
    checkingEmail,
    checkingPhone,
    checkEmail,
    checkPhone,
    setEmailError,
    setPhoneError,
  }
}
