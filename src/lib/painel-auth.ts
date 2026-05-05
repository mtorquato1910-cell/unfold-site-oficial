import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const COOKIE_NAME = 'payload-token'
const PAYLOAD_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export interface PainelUser {
  id: string
  email: string
  role: 'admin' | 'editor'
  name?: string
}

export async function loginUser(email: string, password: string): Promise<{ user: PainelUser; token: string }> {
  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || 'Credenciais inválidas')
  }

  const data = await res.json()
  return {
    user: {
      id: data.user?.id,
      email: data.user?.email,
      role: data.user?.role ?? 'editor',
      name: data.user?.name,
    },
    token: data.token,
  }
}

export async function getSession(): Promise<PainelUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const res = await fetch(`${PAYLOAD_URL}/api/users/me`, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    })

    if (!res.ok) return null
    const data = await res.json()

    return {
      id: data.user?.id,
      email: data.user?.email,
      role: data.user?.role ?? 'editor',
      name: data.user?.name,
    }
  } catch {
    return null
  }
}

export function setAuthCookie(token: string, cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24h
    path: '/',
  })
}

export function clearAuthCookie(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.delete(COOKIE_NAME)
}
