import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getSiteSettings } from '@/lib/actions/site-settings-actions'
import PainelLayout from '@/components/painel/PainelLayout'
import SiteConfigClient from './SiteConfigClient'

export default async function SiteConfigPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')
  if (user.role !== 'admin') redirect('/admin')

  const settings: any = await getSiteSettings()

  return (
    <PainelLayout user={user}>
      <SiteConfigClient
        initial={{
          tagline: settings?.tagline ?? '',
          cidade: settings?.cidade ?? '',
          email_contato: settings?.email_contato ?? '',
          email_notificacoes: settings?.email_notificacoes ?? '',
          email_dpo: settings?.email_dpo ?? '',
          telefone: settings?.telefone ?? '',
          whatsapp: settings?.whatsapp ?? '',
          linkedin: settings?.linkedin ?? '',
          instagram: settings?.instagram ?? '',
          youtube: settings?.youtube ?? '',
          facebook: settings?.facebook ?? '',
          twitter: settings?.twitter ?? '',
          endereco: settings?.endereco ?? '',
          cnpj: settings?.cnpj ?? '',
        }}
      />
    </PainelLayout>
  )
}
