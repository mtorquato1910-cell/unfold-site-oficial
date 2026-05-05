import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getCollection } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import FAQsClient from './FAQsClient'

function richTextToPlain(rt: any): string {
  if (!rt?.root?.children) return ''
  const out: string[] = []
  const walk = (nodes: any[]) => {
    for (const n of nodes) {
      if (n.text) out.push(n.text)
      if (n.children) walk(n.children)
    }
  }
  walk(rt.root.children)
  return out.join('\n').trim()
}

export default async function FAQsPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const result = await getCollection('faqs', { limit: 100, sort: 'order' })
  const faqs = (result.docs || []).map((f: any) => ({
    id: f.id,
    question: f.question,
    answer: typeof f.answer === 'string' ? f.answer : richTextToPlain(f.answer),
    category: f.category || 'geral',
    order: f.order ?? 0,
    published: !!f.published,
    createdAt: f.createdAt,
  }))

  return (
    <PainelLayout user={user}>
      <FAQsClient initialFaqs={faqs} canDelete={user.role === 'admin'} />
    </PainelLayout>
  )
}
