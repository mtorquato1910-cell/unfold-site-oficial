'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import { Loader2, Sparkles } from 'lucide-react'

export default function PainelLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null })

  return (
    <div
      className="painel-root relative min-h-screen overflow-hidden"
      style={{ background: 'hsl(194 100% 8%)' }}
    >
      {/* Mesh gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(at 0% 0%, hsl(158 92% 70% / 0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, hsl(217 93% 78% / 0.08) 0px, transparent 50%), radial-gradient(at 50% 100%, hsl(158 92% 70% / 0.05) 0px, transparent 50%)',
        }}
      />

      {/* Ambient glow blobs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full"
        style={{ background: 'hsl(158 92% 70% / 0.1)', filter: 'blur(120px)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full"
        style={{ background: 'hsl(217 93% 78% / 0.08)', filter: 'blur(120px)' }}
      />

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md" style={{ animation: 'painel-fade-in 0.4s ease-out both' }}>

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
                style={{ color: 'hsl(0 0% 91%)', letterSpacing: '-0.02em' }}
              >
                Unfold Growth
              </h1>
              <p
                className="mt-1 font-mono text-xs uppercase"
                style={{ letterSpacing: '0.2em', color: 'hsl(0 0% 91% / 0.42)' }}
              >
                Painel Admin
              </p>
            </div>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.04) 0%, hsl(0 0% 100% / 0.02) 100%)',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              border: '1px solid hsl(158 92% 70% / 0.08)',
              boxShadow: '0 1px 0 hsl(0 0% 100% / 0.05) inset, 0 8px 32px -8px hsl(197 100% 4% / 0.6)',
            }}
          >
            <h2 className="mb-1 text-lg font-medium" style={{ color: 'hsl(0 0% 91%)' }}>
              Acessar painel
            </h2>
            <p className="mb-6 text-sm" style={{ color: 'hsl(0 0% 91% / 0.62)' }}>
              Entre com suas credenciais
            </p>

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block font-mono text-[10px] uppercase"
                  style={{ letterSpacing: '0.18em', color: 'hsl(0 0% 91% / 0.62)' }}
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
                  className="w-full h-11 px-3 rounded-lg text-[13px] transition-colors"
                  style={{
                    background: 'hsl(197 100% 10%)',
                    border: '1px solid hsl(158 92% 70% / 0.12)',
                    color: 'hsl(0 0% 91%)',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'hsl(158 92% 70% / 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'hsl(158 92% 70% / 0.12)')}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block font-mono text-[10px] uppercase"
                    style={{ letterSpacing: '0.18em', color: 'hsl(0 0% 91% / 0.62)' }}
                  >
                    Senha
                  </label>
                  <span
                    className="cursor-pointer text-xs"
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
                  className="w-full h-11 px-3 rounded-lg text-[13px] transition-colors"
                  style={{
                    background: 'hsl(197 100% 10%)',
                    border: '1px solid hsl(158 92% 70% / 0.12)',
                    color: 'hsl(0 0% 91%)',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'hsl(158 92% 70% / 0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'hsl(158 92% 70% / 0.12)')}
                />
              </div>

              {state.error && (
                <div
                  className="rounded-lg px-4 py-3 text-[13px]"
                  style={{
                    background: 'hsl(0 70% 60% / 0.1)',
                    border: '1px solid hsl(0 70% 60% / 0.2)',
                    color: 'hsl(0 70% 80%)',
                  }}
                >
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="h-11 w-full rounded-lg font-medium text-[13px] flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{
                  background: 'linear-gradient(180deg, hsl(158 92% 75%) 0%, hsl(158 92% 65%) 100%)',
                  color: 'hsl(194 100% 8%)',
                  boxShadow:
                    '0 1px 0 hsl(0 0% 100% / 0.3) inset, 0 -1px 0 hsl(158 92% 50% / 0.4) inset, 0 4px 12px hsl(158 92% 70% / 0.25)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                    '0 1px 0 hsl(0 0% 100% / 0.4) inset, 0 -1px 0 hsl(158 92% 50% / 0.5) inset, 0 6px 20px hsl(158 92% 70% / 0.4)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                    '0 1px 0 hsl(0 0% 100% / 0.3) inset, 0 -1px 0 hsl(158 92% 50% / 0.4) inset, 0 4px 12px hsl(158 92% 70% / 0.25)'
                }}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
              </button>
            </form>
          </div>

          <p
            className="mt-8 text-center font-mono text-[11px] uppercase"
            style={{ letterSpacing: '0.2em', color: 'hsl(0 0% 91% / 0.42)' }}
          >
            © Unfold Growth · {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes painel-fade-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
