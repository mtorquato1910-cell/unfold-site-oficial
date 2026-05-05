import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getHomeSettingsRaw } from '@/lib/actions/home-settings-actions'
import PainelLayout from '@/components/painel/PainelLayout'
import HomeConfigClient from './HomeConfigClient'

export default async function HomeConfigPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')
  if (user.role !== 'admin') redirect('/admin')

  const settings: any = await getHomeSettingsRaw()

  const initial = {
    hero_eyebrow: settings?.hero_eyebrow ?? '',
    hero_title: settings?.hero_title ?? '',
    hero_subtitle: settings?.hero_subtitle ?? '',
    hero_cta_primary_label: settings?.hero_cta_primary_label ?? '',
    hero_cta_primary_href: settings?.hero_cta_primary_href ?? '',
    hero_cta_secondary_label: settings?.hero_cta_secondary_label ?? '',
    hero_cta_secondary_href: settings?.hero_cta_secondary_href ?? '',
    hero_video_url: settings?.hero_video_url ?? '',
    stats: Array.isArray(settings?.stats)
      ? settings.stats.map((s: any) => ({
          prefix: s.prefix || '',
          value: s.value || 0,
          suffix: s.suffix || '',
          label: s.label || '',
        }))
      : [],
    stats_extra_text: settings?.stats_extra_text ?? '',
    client_logos_title: settings?.client_logos_title ?? '',
    client_logos: Array.isArray(settings?.client_logos)
      ? settings.client_logos.map((l: any) => ({
          name: l.name || '',
          website: l.website || '',
        }))
      : [],
  }

  return (
    <PainelLayout user={user}>
      <HomeConfigClient initial={initial} />
    </PainelLayout>
  )
}
