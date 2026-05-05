import { getHomeSettings } from '@/lib/home-settings'
import HeroClient from './HeroClient'

export async function Hero() {
  const settings = await getHomeSettings()
  return <HeroClient settings={settings} />
}
