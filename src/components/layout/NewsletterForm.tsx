'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setState('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Falha ao inscrever. Tente novamente.')
      }
      setState('success')
      setEmail('')
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Falha. Tente novamente.')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-3 max-w-md lg:ml-auto rounded-lg border border-primary/30 bg-primary/5 px-4 py-3.5">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm">
          <span className="font-semibold text-primary">Inscrição confirmada!</span>{' '}
          <span className="text-foreground/70">Você receberá nossos próximos insights.</span>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md lg:ml-auto">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <Input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'loading'}
          placeholder="seu@empresa.com.br"
          className="bg-card border-border h-12"
          aria-label="E-mail corporativo"
        />
        <Button type="submit" size="lg" className="h-12 group" disabled={state === 'loading' || !email}>
          {state === 'loading' ? 'Enviando...' : 'Assinar'}
          {state !== 'loading' && (
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </Button>
      </form>
      {state === 'error' && errorMsg && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errorMsg}
        </p>
      )}
      <p className="mt-2 text-[11px] text-foreground/40">
        Sem spam. Cancele quando quiser.
      </p>
    </div>
  )
}
