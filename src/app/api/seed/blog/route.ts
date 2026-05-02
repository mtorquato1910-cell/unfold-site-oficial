import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SEED_POSTS } from '@/scripts/seed-blog'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }
  const payload = await getPayload({ config: configPromise })
  const results: Array<{ slug: string; action: string; error?: string }> = []
  for (const post of SEED_POSTS) {
    try {
      const existing = await payload.find({ collection: 'posts', where: { slug: { equals: post.slug } } })
      if (existing.docs.length > 0) { results.push({ slug: post.slug, action: 'skipped' }); continue }
      await payload.create({ collection: 'posts', data: post as Record<string, unknown> })
      results.push({ slug: post.slug, action: 'created' })
    } catch (err) {
      results.push({ slug: post.slug, action: 'error', error: String(err) })
    }
  }
  return NextResponse.json({ ok: true, results })
}
