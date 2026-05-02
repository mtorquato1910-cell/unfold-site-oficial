import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SEED_QUIZ_QUESTIONS, SEED_INSIGHTS } from '@/scripts/seed-diagnostico'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const payload = await getPayload({ config: configPromise })
  const results: Record<string, unknown[]> = { questions: [], insights: [] }

  for (const q of SEED_QUIZ_QUESTIONS) {
    try {
      const existing = await payload.find({
        collection: 'quiz-questions',
        where: { pergunta: { equals: q.pergunta } },
      })
      if (existing.docs.length > 0) {
        results.questions.push({ ordem: q.ordem, action: 'skipped' })
        continue
      }
      await payload.create({ collection: 'quiz-questions', data: q })
      results.questions.push({ ordem: q.ordem, action: 'created' })
    } catch (err) {
      results.questions.push({ ordem: q.ordem, action: 'error', error: String(err) })
    }
  }

  for (const ins of SEED_INSIGHTS) {
    try {
      const existing = await payload.find({
        collection: 'insights-variations',
        where: { nivel_fit: { equals: ins.nivel_fit }, pilar: { equals: ins.pilar } },
      })
      if (existing.docs.length > 0) {
        results.insights.push({ nivel: ins.nivel_fit, action: 'skipped' })
        continue
      }
      await payload.create({ collection: 'insights-variations', data: ins })
      results.insights.push({ nivel: ins.nivel_fit, action: 'created' })
    } catch (err) {
      results.insights.push({ nivel: ins.nivel_fit, action: 'error', error: String(err) })
    }
  }

  return NextResponse.json({ ok: true, results })
}
