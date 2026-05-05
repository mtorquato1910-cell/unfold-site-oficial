import { getPublicSiteSettings } from '@/lib/site-settings'
import CookieBanner from './CookieBanner'

export default async function CookieBannerWrapper() {
  const s = await getPublicSiteSettings()
  return <CookieBanner message={s.lgpd_aviso_cookies} />
}
