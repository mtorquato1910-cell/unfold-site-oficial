import { getPayload } from 'payload'
import config from '@payload-config'

async function getPayloadInstance() {
  return getPayload({ config })
}

export async function getCollectionCount(collection: string): Promise<number> {
  try {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: collection as any,
      limit: 0,
      pagination: false,
    })
    return result.totalDocs ?? 0
  } catch (e) {
    console.error(`[painel-api] getCollectionCount('${collection}') falhou:`, e)
    return 0
  }
}

export async function getDashboardStats() {
  const [posts, cases, leads, diagnosticos, testimonials, prompts] = await Promise.all([
    getCollectionCount('posts'),
    getCollectionCount('cases'),
    getCollectionCount('leads'),
    getCollectionCount('diagnostico-results'),
    getCollectionCount('testimonials'),
    getCollectionCount('ai-prompts'),
  ])
  return { posts, cases, leads, diagnosticos, testimonials, prompts }
}

export async function getRecentLeads(limit = 5) {
  try {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: 'leads',
      limit,
      sort: '-createdAt',
    })
    return result.docs ?? []
  } catch (e) {
    console.error('[painel-api] getRecentLeads falhou:', e)
    return []
  }
}

export async function getRecentDiagnosticos(limit = 4) {
  try {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: 'diagnostico-results',
      limit,
      sort: '-createdAt',
    })
    return result.docs ?? []
  } catch (e) {
    console.error('[painel-api] getRecentDiagnosticos falhou:', e)
    return []
  }
}

export async function getCollection(collection: string, options?: { limit?: number; sort?: string; where?: any; page?: number }): Promise<{ docs: any[]; totalDocs: number; totalPages: number; page: number }> {
  try {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: collection as any,
      limit: options?.limit ?? 10,
      sort: options?.sort ?? '-createdAt',
      where: options?.where,
      page: options?.page ?? 1,
    })
    const docs = (result.docs ?? []).map((d: any) => ({ ...d, id: String(d.id) }))
    return { docs, totalDocs: result.totalDocs ?? 0, totalPages: result.totalPages ?? 1, page: result.page ?? 1 }
  } catch (e) {
    console.error(`[painel-api] getCollection('${collection}') falhou:`, e)
    return { docs: [], totalDocs: 0, totalPages: 1, page: 1 }
  }
}

// ── Mapa de Calor / Jornada de Leads (aba /admin/heatmap) ───────────────────

export interface HeatmapJourney {
  sessionId: string
  leadHash: string | null
  pages: string[]
  pageCount: number
  clickCount: number
  last: string
}

export interface HeatmapData {
  totals: { pageviews: number; clicks: number; sessions: number; leads: number }
  byDay: { date: string; views: number }[]
  topPages: { path: string; views: number }[]
  topClicks: { element: string; count: number }[]
  journeys: HeatmapJourney[]
  hasData: boolean
}

const EMPTY_HEATMAP: HeatmapData = {
  totals: { pageviews: 0, clicks: 0, sessions: 0, leads: 0 },
  byDay: [],
  topPages: [],
  topClicks: [],
  journeys: [],
  hasData: false,
}

// Chave de dia (YYYY-MM-DD) no fuso America/Sao_Paulo — evita deslocamento de
// barras perto da meia-noite (servidor Vercel roda em UTC).
function dayKeySP(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d)
}

/**
 * Agrega os eventos de `tracking-events` dos últimos `days` dias em memória.
 * Para volumes altos (>100k/mês) migrar para agregação SQL/ClickHouse.
 */
export async function getHeatmapData(days = 14): Promise<HeatmapData> {
  try {
    const payload = await getPayloadInstance()
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const res = await payload.find({
      collection: 'tracking-events' as any,
      where: { createdAt: { greater_than_equal: since.toISOString() } },
      sort: '-createdAt',
      limit: 10000,
      pagination: false,
    })
    const docs = (res.docs ?? []) as any[]
    if (docs.length === 0) return EMPTY_HEATMAP

    let pageviews = 0
    let clicks = 0
    const sessions = new Set<string>()
    const leads = new Set<string>()
    const pathCount = new Map<string, number>()
    const elementCount = new Map<string, number>()
    const dayCount = new Map<string, number>()
    const bySession = new Map<string, HeatmapJourney & { _pages: string[] }>()

    for (const d of docs) {
      const type = d.event_type as string
      const sid = (d.session_id as string) || 'anon'
      sessions.add(sid)
      if (d.lead_hash) leads.add(d.lead_hash as string)

      if (type === 'pageview') {
        pageviews++
        if (d.path) pathCount.set(d.path, (pathCount.get(d.path) ?? 0) + 1)
        const day = dayKeySP(new Date(d.createdAt as string))
        dayCount.set(day, (dayCount.get(day) ?? 0) + 1)
      } else if (type === 'click') {
        clicks++
        if (d.element) elementCount.set(d.element, (elementCount.get(d.element) ?? 0) + 1)
      }

      // Jornada por sessão (docs vêm do mais novo p/ o mais antigo).
      let j = bySession.get(sid)
      if (!j) {
        j = { sessionId: sid, leadHash: (d.lead_hash as string) || null, pages: [], _pages: [], pageCount: 0, clickCount: 0, last: d.createdAt as string }
        bySession.set(sid, j)
      }
      if (d.lead_hash && !j.leadHash) j.leadHash = d.lead_hash as string
      if (type === 'pageview' && d.path) j._pages.push(d.path as string)
      if (type === 'click') j.clickCount++
    }

    // byDay preenchendo dias vazios, do mais antigo ao mais novo.
    const byDay: { date: string; views: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = dayKeySP(dt)
      byDay.push({ date: `${key.slice(8, 10)}/${key.slice(5, 7)}`, views: dayCount.get(key) ?? 0 })
    }

    const topPages = Array.from(pathCount.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 12)

    const topClicks = Array.from(elementCount.entries())
      .map(([element, count]) => ({ element, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)

    const journeys = Array.from(bySession.values())
      .map((j) => {
        // _pages está do mais novo p/ o mais antigo → inverter p/ ordem cronológica.
        const chrono = j._pages.slice().reverse()
        return {
          sessionId: j.sessionId,
          leadHash: j.leadHash,
          pages: chrono,
          pageCount: chrono.length,
          clickCount: j.clickCount,
          last: j.last,
        }
      })
      // leads identificados primeiro, depois mais recentes
      .sort((a, b) => {
        if (!!b.leadHash !== !!a.leadHash) return a.leadHash ? -1 : 1
        return new Date(b.last).getTime() - new Date(a.last).getTime()
      })
      .slice(0, 50)

    return {
      totals: { pageviews, clicks, sessions: sessions.size, leads: leads.size },
      byDay,
      topPages,
      topClicks,
      journeys,
      hasData: true,
    }
  } catch (e) {
    console.error('[painel-api] getHeatmapData falhou:', e)
    return EMPTY_HEATMAP
  }
}

export async function getDocument(collection: string, id: string) {
  try {
    const payload = await getPayloadInstance()
    return await payload.findByID({ collection: collection as any, id })
  } catch (e) {
    console.error(`[painel-api] getDocument('${collection}', '${id}') falhou:`, e)
    return null
  }
}
