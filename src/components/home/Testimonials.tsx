import { getPublicTestimonials } from '@/lib/testimonials'
import { getHomeSettings } from '@/lib/home-settings'
import TestimonialsClient from './TestimonialsClient'

export async function Testimonials() {
  const settings = await getHomeSettings()
  if (settings.ocultar_depoimentos) return null
  const items = await getPublicTestimonials()
  if (items.length === 0) return null
  return <TestimonialsClient items={items} />
}
