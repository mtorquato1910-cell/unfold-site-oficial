'use server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'
import { Agent } from 'undici'

// Alguns sites (ex.: ufsb.edu.br) servem imagens com cadeia de certificado TLS
// incompleta. O browser tolera, o Node rejeita (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
// Usamos este dispatcher só no retry, para "qualquer URL de imagem" funcionar.
const insecureTlsAgent = new Agent({ connect: { rejectUnauthorized: false } })

const isTlsChainError = (e: any) => {
  const code = e?.cause?.code || e?.code || ''
  return /CERT|LEAF_SIGNATURE|SELF_SIGNED|UNABLE_TO_VERIFY|CERT_HAS_EXPIRED|ALT_NAME/i.test(String(code))
}

// Baixa uma imagem de URL de forma robusta: User-Agent (alguns servers bloqueiam
// sem ele), timeout, e fallback de TLS para cadeias de certificado quebradas.
async function fetchImageBytes(url: string): Promise<{ buffer: Buffer; type: string }> {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (compatible; UnfoldGrowthBot/1.0; +https://unfoldgrowth.com.br)',
    Accept: 'image/*,*/*;q=0.8',
  }
  const withTimeout = (extra: Record<string, any> = {}) => {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 20000)
    return fetch(url, { headers, signal: controller.signal, ...extra }).finally(() =>
      clearTimeout(t),
    )
  }

  let resp: Response
  try {
    resp = await withTimeout()
  } catch (e: any) {
    if (isTlsChainError(e)) {
      // Retry ignorando a verificação da cadeia TLS (imagem pública, risco aceitável).
      resp = await withTimeout({ dispatcher: insecureTlsAgent } as any)
    } else if (e?.name === 'AbortError') {
      throw new Error('A imagem demorou demais para responder (timeout 20s).')
    } else {
      throw new Error(`Não foi possível acessar a URL (${e?.cause?.code || e?.message || 'falha de rede'}).`)
    }
  }

  if (!resp.ok) throw new Error(`A URL respondeu ${resp.status} ${resp.statusText}.`)

  let type = resp.headers.get('content-type')?.split(';')[0].trim() || ''
  if (!/^image\//i.test(type)) {
    // Alguns servers mandam content-type genérico; inferimos pela extensão.
    const ext = (url.split('?')[0].split('.').pop() || '').toLowerCase()
    const byExt: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
      gif: 'image/gif', avif: 'image/avif', svg: 'image/svg+xml',
    }
    if (byExt[ext]) type = byExt[ext]
    else throw new Error('A URL não aponta para uma imagem (content-type não reconhecido).')
  }

  const buffer = Buffer.from(await resp.arrayBuffer())
  if (buffer.length === 0) throw new Error('A imagem baixada está vazia.')
  return { buffer, type }
}

// Faz upload de um arquivo (png/jpg/webp) para a collection media (Supabase S3) e retorna id+url.
export async function uploadMedia(formData: FormData) {
  try {
    await requireRole('editor')
    const file = formData.get('file') as File | null
    if (!file) return { ok: false, error: 'Nenhum arquivo enviado' }
    if (!/^image\/(png|jpe?g|webp|gif|avif)$/i.test(file.type)) {
      return { ok: false, error: 'Formato inválido. Envie PNG, JPG ou WEBP.' }
    }
    const alt = (formData.get('alt') as string) || file.name
    const buffer = Buffer.from(await file.arrayBuffer())
    const payload = await getPayload({ config })
    const doc: any = await payload.create({
      collection: 'media',
      file: { data: buffer, mimetype: file.type, name: file.name, size: file.size },
      data: { alt },
    })
    return { ok: true, id: String(doc.id), url: doc.url || doc.sizes?.card?.url || '' }
  } catch (e: any) {
    console.error('[uploadMedia]', e)
    return { ok: false, error: e?.message || 'Falha no upload' }
  }
}

// Baixa uma imagem de uma URL externa e faz upload para media. Para o caso "informar URL".
export async function uploadMediaFromUrl(url: string) {
  try {
    await requireRole('editor')
    const clean = url.trim()
    if (!/^https?:\/\//i.test(clean)) return { ok: false, error: 'URL inválida (precisa começar com http:// ou https://)' }

    const { buffer, type } = await fetchImageBytes(clean)
    const name = (clean.split('/').pop()?.split('?')[0]) || 'imagem.jpg'
    const payload = await getPayload({ config })
    const doc: any = await payload.create({
      collection: 'media',
      file: { data: buffer, mimetype: type, name, size: buffer.length },
      data: { alt: name },
    })
    return { ok: true, id: String(doc.id), url: doc.url || '' }
  } catch (e: any) {
    console.error('[uploadMediaFromUrl]', e)
    return { ok: false, error: e?.message || 'Falha ao importar imagem da URL' }
  }
}

export async function deleteMedia(id: string) {
  try {
    await requireRole('editor')
    const payload = await getPayload({ config })
    await payload.delete({ collection: 'media', id })
    return { ok: true }
  } catch (e: any) {
    console.error('[deleteMedia]', e)
    return { ok: false, error: e?.message || 'Falha ao excluir' }
  }
}
