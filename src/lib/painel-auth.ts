import { cookies } from 'next/headers'

const COOKIE_NAME = 'sb-access-token'

function supabaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '')
}

function supabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
}

function supabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

export type PainelRole = 'admin' | 'editor'

export type PainelUser = {
  id: string
  email: string
  role: PainelRole
  name?: string
}

/**
 * Resolve o role do usuário a partir do app_metadata do Supabase.
 * Default: 'editor' (privilégio mínimo) se não tiver role explícita.
 */
function resolveRole(user: any): PainelRole {
  const r = user?.app_metadata?.role
  if (r === 'admin' || r === 'editor') return r
  return 'editor'
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
    role: resolveRole(data.user),
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
      role: resolveRole(user),
      name: user.user_metadata?.name || user.user_metadata?.full_name,
    }
  } catch {
    return null
  }
}

/**
 * Guard server-side. Lança Error se o user não for autenticado ou não tiver o role mínimo exigido.
 * Hierarquia: admin > editor (admin tem todos os direitos de editor).
 */
export async function requireRole(minRole: PainelRole): Promise<PainelUser> {
  const user = await getSession()
  if (!user) throw new Error('UNAUTHENTICATED')
  if (minRole === 'admin' && user.role !== 'admin') throw new Error('FORBIDDEN')
  return user
}

/**
 * Atualiza role de outro usuário via Supabase Admin API.
 * Requer SUPABASE_SERVICE_ROLE_KEY no servidor.
 */
export async function adminUpdateUserRole(userId: string, role: PainelRole): Promise<void> {
  const serviceKey = supabaseServiceRoleKey()
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY ausente no ambiente')

  const res = await fetch(`${supabaseUrl()}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ app_metadata: { role } }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Falha ao atualizar role: ${err.msg || err.error_description || res.status}`)
  }
}

/**
 * Lista todos os usuários do projeto Supabase (paginado).
 * Requer SUPABASE_SERVICE_ROLE_KEY.
 */
export async function adminListUsers(): Promise<Array<{
  id: string
  email: string
  role: PainelRole
  name?: string
  createdAt: string
}>> {
  const serviceKey = supabaseServiceRoleKey()
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY ausente no ambiente')

  const res = await fetch(`${supabaseUrl()}/auth/v1/admin/users?per_page=200`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Falha ao listar usuários: ${res.status}`)

  const data = await res.json()
  const users = data.users || []
  return users.map((u: any) => ({
    id: u.id,
    email: u.email,
    role: resolveRole(u),
    name: u.user_metadata?.name || u.user_metadata?.full_name,
    createdAt: u.created_at,
  }))
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
