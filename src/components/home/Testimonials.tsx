import { getPublicTestimonials } from '@/lib/testimonials'
import TestimonialsClient from './TestimonialsClient'

export async function Testimonials() {
  const items = await getPublicTestimonials()
  if (items.length === 0) return null
  return <TestimonialsClient items={items} />
}
