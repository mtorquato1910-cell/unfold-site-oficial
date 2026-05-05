'use client'

import { useActionState, useEffect } from 'react'
import { loginAction } from './actions'
import { Loader2, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function PainelLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null })

  return (
    <div className="painel-root relative min-h-screen overflow-hidden bg-mesh" style={{ background: 'hsl(194 100% 8%)' }}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full"
           style={{ background: 'hsl(158 92% 70% / 0.1)', filter: 'blur(120px)' }} />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full"
           style={{ background: 'hsl(217 93% 78% / 0.08)', filter: 'blur(120px)' }} />

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">

          {/* Logo */}
          <div className="mb-10 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden ring-1"
                 style={{ background: 'hsl(158 92% 70% / 0.08)', borderColor: 'hsl(158 92% 70% / 0.2)' }}>
              <Image src="/logo.jpeg" alt="Unfold Growth" width={56} height={56} className="object-cover" />
            </div>
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold" style={{ color: 'hsl(0 0% 91%)', letterSpacing: '-0.02em' }}>
                Unfold Growth
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-dim">Painel Admin</p>
            </div>
          </div>

          {/* Form card */}
          <div className="glass rounded-2xl p-8">
            <h2 className="mb-1 text-lg font-medium" style={{ color: 'hsl(0 0% 91%)' }}>Acessar painel</h2>
            <p className="mb-6 text-sm text-dim-2">Entre com suas credenciais</p>

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim-2 block">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="voce@unfoldgrowth.com"
                  className="w-full h-11 px-3 rounded-lg text-[13px]"
                  style={{
                    background: 'hsl(197 100% 10%)',
                    border: '1px solid hsl(158 92% 70% / 0.12)',
                    color: 'hsl(0 0% 91%)',
                    outline: 'none',
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim-2 block">
                    Senha
                  </label>
                  <Link href="#" className="text-xs" style={{ color: 'hsl(158 92% 70%)' }}>
                    Esqueci minha senha
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-11 px-3 rounded-lg text-[13px]"
                  style={{
                    background: 'hsl(197 100% 10%)',
                    border: '1px solid hsl(158 92% 70% / 0.12)',
                    color: 'hsl(0 0% 91%)',
                    outline: 'none',
                  }}
                />
              </div>

              {state.error && (
                <div className="rounded-lg px-4 py-3 text-[13px]"
                     style={{ background: 'hsl(0 70% 60% / 0.1)', border: '1px solid hsl(0 70% 60% / 0.2)', color: 'hsl(0 70% 80%)' }}>
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-lg font-medium text-[13px] flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{
                  background: 'hsl(158 92% 70%)',
                  color: 'hsl(194 100% 8%)',
                  boxShadow: '0 1px 0 hsl(0 0% 100% / 0.3) inset, 0 4px 12px hsl(158 92% 70% / 0.25)',
                }}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
            © Unfold Growth · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
