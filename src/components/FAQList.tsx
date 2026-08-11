import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import RichTextRenderer from './RichTextRenderer'

type PublicFAQ = {
  id: string
  question: string
  answer: any
  category: string
  order: number
}

async function fetchFAQs(category?: string): Promise<PublicFAQ[]> {
  try {
    const payload = await getPayload({ config })
    const where: any = { published: { equals: true } }
    if (category) where.category = { equals: category }
    const result = await payload.find({
      collection: 'faqs',
      where,
      sort: 'order',
      limit: 50,
      depth: 0,
    })
    return result.docs.map((f: any) => ({
      id: String(f.id),
      question: f.question,
      answer: f.answer,
      category: f.category,
      order: f.order ?? 0,
    }))
  } catch {
    return []
  }
}

const getFAQs = unstable_cache(fetchFAQs, ['public-faqs'], {
  tags: ['faqs'],
  revalidate: 60,
})

export default async function FAQList({
  category,
  title = 'Perguntas frequentes',
  className = '',
}: {
  category?: string
  title?: string
  className?: string
}) {
  const faqs = await getFAQs(category)
  if (faqs.length === 0) return null

  return (
    <section className={`max-w-4xl mx-auto px-6 lg:px-8 py-16 ${className}`}>
      <h2 className="font-display font-bold text-3xl md:text-4xl mb-10 text-center">
        {title}
      </h2>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="group rounded-xl border border-border bg-card/40 overflow-hidden transition-colors hover:border-primary/30"
          >
            <summary className="cursor-pointer list-none px-6 py-5 flex items-start justify-between gap-4">
              <span className="font-medium text-foreground text-base md:text-lg pr-2">
                {faq.question}
              </span>
              <span
                className="shrink-0 mt-1 grid place-items-center h-6 w-6 rounded-full border border-border text-foreground/80 group-open:bg-primary group-open:text-background group-open:border-primary transition-colors"
                aria-hidden
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  className="group-open:rotate-45 transition-transform"
                >
                  <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-5 prose prose-invert prose-sm max-w-none text-foreground/70">
              <RichTextRenderer data={faq.answer} />
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
