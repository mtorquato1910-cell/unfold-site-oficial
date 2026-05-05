'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import { Loader2, Sparkles } from 'lucide-react'

export default function PainelLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null })

  return (
    <div className="painel-root relative min-h-screen overflow-hidden bg-mesh">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full"
        style={{ background: 'hsl(158 92% 70% / 0.1)', filter: 'blur(120px)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full"
        style={{ background: 'hsl(217 93% 78% / 0.1)', filter: 'blur(120px)' }}
      />

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="mb-10 flex flex-col items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl ring-1"
              style={{ background: 'hsl(158 92% 70% / 0.1)', borderColor: 'hsl(158 92% 70% / 0.2)' }}
            >
              <Sparkles className="h-6 w-6" style={{ color: 'hsl(158 92% 70%)' }} />
            </div>
            <div className="text-center">
              <h1
                className="text-2xl font-semibold"
                style={{ letterSpacing: '-0.022em', color: 'hsl(0 0% 91%)' }}
              >
                Unfold Growth
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-dim">
                Painel Admin
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-8">
            <h2 className="mb-1 text-lg font-medium" style={{ color: 'hsl(0 0% 91%)' }}>
              Acessar painel
            </h2>
            <p className="mb-6 text-sm text-dim-2">
              Entre com suas credenciais
            </p>

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs uppercase tracking-wider text-dim-2"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="voce@unfoldgrowth.com"
                  className="h-11 w-full px-3 text-[13px] rounded-lg"
                  style={{
                    background: 'hsl(0 0% 100% / 0.02)',
                    border: '1px solid hsl(158 92% 70% / 0.1)',
                    color: 'hsl(0 0% 91%)',
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs uppercase tracking-wider text-dim-2"
                  >
                    Senha
                  </label>
                  <span
                    className="text-xs cursor-pointer"
                    style={{ color: 'hsl(158 92% 70%)' }}
                  >
                    Esqueci minha senha
                  </span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 w-full px-3 text-[13px] rounded-lg"
                  style={{
                    background: 'hsl(0 0% 100% / 0.02)',
                    border: '1px solid hsl(158 92% 70% / 0.1)',
                    color: 'hsl(0 0% 91%)',
                  }}
                />
              </div>

              {state.error && (
                <div
                  className="rounded-lg px-4 py-3 text-[13px]"
                  style={{
                    background: 'hsl(0 70% 60% / 0.1)',
                    border: '1px solid hsl(0 70% 60% / 0.25)',
                    color: 'hsl(0 70% 80%)',
                  }}
                >
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="btn-premium h-11 w-full rounded-lg font-medium text-[13px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
