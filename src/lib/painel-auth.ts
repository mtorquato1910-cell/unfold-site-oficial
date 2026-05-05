import { cookies } from 'next/headers'

const COOKIE_NAME = 'sb-access-token'

function supabaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '')
}

function supabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
}

export type PainelUser = {
  id: string
  email: string
  role: 'admin' | 'editor'
  name?: string
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: PainelUser }> {
  const url = `${supabaseUrl()}/auth/v1/token?grant_type=password`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: supabaseKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.error_description || err.error || err.msg || err.message || `Erro ${res.status}`
    if (!supabaseUrl()) throw new Error('Configuração do servidor incompleta (SUPABASE_URL ausente)')
    if (msg === 'Invalid login credentials') {
      throw new Error('E-mail ou senha incorretos. Verifique no Supabase Dashboard > Authentication > Users se este e-mail existe e a senha está correta.')
    }
    if (msg.includes('Email not confirmed')) {
      throw new Error('E-mail não confirmado. Vá no Supabase Dashboard > Authentication > Users e confirme o e-mail desse usuário.')
    }
    throw new Error(`[Supabase ${res.status}] ${msg}`)
  }

  const data = await res.json()
  const user: PainelUser = {
    id: data.user?.id || '',
    email: data.user?.email || email,
    role: 'admin',
    name: data.user?.user_metadata?.name || data.user?.user_metadata?.full_name,
  }

  return { token: data.access_token, user }
}

export async function getSession(): Promise<PainelUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const res = await fetch(`${supabaseUrl()}/auth/v1/user`, {
      headers: {
        apikey: supabaseKey(),
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) return null

    const user = await res.json()
    return {
      id: user.id,
      email: user.email,
      role: 'admin',
      name: user.user_metadata?.name || user.user_metadata?.full_name,
    }
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string, cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearAuthCookie(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.delete(COOKIE_NAME)
}
