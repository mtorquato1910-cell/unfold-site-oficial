import { NextResponse } from 'next/server'

export async function GET() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '')
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

  const result: Record<string, unknown> = {
    has_url: !!url,
    has_key: !!key,
    url_preview: url ? url.slice(0, 30) + '...' : null,
  }

  if (url && key) {
    try {
      const res = await fetch(`${url}/auth/v1/settings`, {
        headers: { apikey: key },
        cache: 'no-store',
      })
      result.supabase_reachable = res.ok
      result.supabase_status = res.status
      const body = await res.json().catch(() => null)
      result.email_enabled = body?.external?.email ?? null
    } catch (err: any) {
      result.supabase_reachable = false
      result.fetch_error = err?.message
    }
  }

  return NextResponse.json(result)
}
