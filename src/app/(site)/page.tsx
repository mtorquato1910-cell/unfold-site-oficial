import { Hero } from '@/components/home/Hero'
import { ClientLogos } from '@/components/home/ClientLogos'
import { Methodology } from '@/components/home/Methodology'
import { Solutions } from '@/components/home/Solutions'
import { Partners } from '@/components/home/Partners'
import { Services } from '@/components/home/Services'
import { FeaturedCase } from '@/components/home/FeaturedCase'
import { Tools } from '@/components/home/Tools'
import { Insights } from '@/components/home/Insights'
import { Testimonials } from '@/components/home/Testimonials'
import { FinalCTA } from '@/components/home/FinalCTA'
import type { Metadata } from 'next'
import { withSeo } from '@/lib/seo/canonical'

export const revalidate = 60

// og:url + og:image padrão da home (S04). Título/descrição vêm do layout.
export const metadata: Metadata = withSeo('/')

export default async function HomePage() {
  return (
    <>
      <Hero />
      <ClientLogos />
      <Methodology />
      <Solutions />
      <Partners />
      <Services />
      <FeaturedCase />
      <Tools />
      <Insights />
      <Testimonials />
      <FinalCTA />
    </>
  )
}
