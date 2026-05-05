import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import PainelLayout from '@/components/painel/PainelLayout'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')
  if (user.role !== 'admin') redirect('/admin')

  let initialData: Record<string, any> = {}
  try {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const res = await fetch(`${serverUrl}/api/globals/site-settings`, {
      cache: 'no-store',
    })
    if (res.ok) {
      initialData = await res.json()
    }
  } catch {
    initialData = {}
  }

  return (
    <PainelLayout user={user}>
      <SettingsClient initialData={initialData} />
    </PainelLayout>
  )
}
