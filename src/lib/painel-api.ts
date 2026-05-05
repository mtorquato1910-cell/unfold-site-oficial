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
  } catch {
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
  } catch {
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
  } catch {
    return []
  }
}

export async function getCollection(collection: string, options?: { limit?: number; sort?: string; where?: any; page?: number }) {
  try {
    const payload = await getPayloadInstance()
    const result = await payload.find({
      collection: collection as any,
      limit: options?.limit ?? 10,
      sort: options?.sort ?? '-createdAt',
      where: options?.where,
      page: options?.page ?? 1,
    })
    return result
  } catch {
    return { docs: [], totalDocs: 0, totalPages: 1, page: 1 }
  }
}

export async function getDocument(collection: string, id: string) {
  try {
    const payload = await getPayloadInstance()
    return await payload.findByID({ collection: collection as any, id })
  } catch {
    return null
  }
}
