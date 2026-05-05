import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import AuditClient from './AuditClient'

export default async function AuditPage() {
  const user = await getSession()
  if (!user) redirect('/painel/login')
  if (user.role !== 'admin') redirect('/painel')

  let logs: any[] = []
  try {
    const result = await getCollection('audit-log', { limit: 20, sort: '-createdAt' })
    logs = result.docs ?? []
  } catch {
    try {
      const result = await getCollection('audit-logs', { limit: 20, sort: '-createdAt' })
      logs = result.docs ?? []
    } catch {
      logs = []
    }
  }

  return (
    <PainelLayout user={user}>
      <AuditClient initialLogs={logs} />
    </PainelLayout>
  )
}
