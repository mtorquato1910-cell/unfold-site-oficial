import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SEED_CASES } from '@/scripts/seed-cases'

// Disponível apenas em desenvolvimento
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const payload = await getPayload({ config: configPromise })

  const results: Array<{ slug: string; action: string; reason?: string; error?: string }> = []
  for (const caseData of SEED_CASES) {
    try {
      const existing = await payload.find({
        collection: 'cases',
        where: { slug: { equals: caseData.slug } },
      })

      if (existing.docs.length > 0) {
        results.push({ slug: caseData.slug, action: 'skipped', reason: 'already exists' })
        continue
      }

      await payload.create({ collection: 'cases', data: caseData })
      results.push({ slug: caseData.slug, action: 'created' })
    } catch (err) {
      results.push({ slug: caseData.slug, action: 'error', error: String(err) })
    }
  }

  return NextResponse.json({ ok: true, results })
}
