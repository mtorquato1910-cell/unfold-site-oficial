'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { loginUser, setAuthCookie } from '@/lib/painel-auth'

export async function loginAction(prevState: { error: string | null }, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios' }
  }

  try {
    const { token } = await loginUser(email, password)
    const cookieStore = await cookies()
    setAuthCookie(token, cookieStore)
  } catch (err: any) {
    return { error: err.message || 'Erro ao fazer login' }
  }

  redirect('/painel')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  redirect('/painel/login')
}
