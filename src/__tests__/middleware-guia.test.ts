/**
 * Não-regressão do middleware após o subdomínio do Guia (S6.1/S6.5).
 * Garante que o apex passa intacto e que o subdomínio reescreve/redireciona certo.
 */
import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

function req(url: string, host: string, cookie?: string) {
  const headers = new Headers({ host })
  if (cookie) headers.set('cookie', cookie)
  return new NextRequest(new URL(url), { headers })
}

describe('subdomínio eleicoes.unfoldgrowth.com.br', () => {
  const SUB = 'eleicoes.unfoldgrowth.com.br'

  it('raiz do subdomínio → 308 para /featwork', () => {
    const res = middleware(req('https://x/', SUB))
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toContain('/featwork')
  })

  it('/featwork → rewrite para a rota interna (sem mudar a URL)', () => {
    const res = middleware(req('https://x/featwork', SUB))
    // rewrite expõe o destino interno no header x-middleware-rewrite
    const rewrite = res.headers.get('x-middleware-rewrite')
    expect(rewrite).toContain('/guia-eleicoes-2026')
    expect(res.headers.get('location')).toBeNull() // não é redirect
  })

  it('/featwork/static/arquivo → rewrite preservando o subpath', () => {
    const res = middleware(req('https://x/featwork/static/x.pdf', SUB))
    expect(res.headers.get('x-middleware-rewrite')).toContain('/guia-eleicoes-2026/static/x.pdf')
  })
})

describe('apex unfoldgrowth.com.br — NÃO deve ser afetado (S6.5)', () => {
  const APEX = 'unfoldgrowth.com.br'

  it('home do apex passa intacta (sem redirect/rewrite)', () => {
    const res = middleware(req('https://x/', APEX))
    expect(res.headers.get('location')).toBeNull()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('canonical: apex /guia-eleicoes-2026 → 301 para o subdomínio', () => {
    const res = middleware(req('https://x/guia-eleicoes-2026', APEX))
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('https://eleicoes.unfoldgrowth.com.br/featwork')
  })

  it('/painel sem token → redirect para login (auth preservada)', () => {
    const res = middleware(req('https://x/painel', APEX))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('preview *.vercel.app NÃO redireciona /guia-eleicoes-2026 (rota interna acessível)', () => {
    const res = middleware(req('https://preview-abc.vercel.app/guia-eleicoes-2026', 'preview-abc.vercel.app'))
    expect(res.headers.get('location')).toBeNull()
  })
})
