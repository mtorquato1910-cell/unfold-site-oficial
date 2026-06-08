'use server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'

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
    if (!/^https?:\/\//i.test(url)) return { ok: false, error: 'URL inválida' }
    const resp = await fetch(url)
    if (!resp.ok) return { ok: false, error: `Não foi possível baixar a imagem (${resp.status})` }
    const type = resp.headers.get('content-type') || 'image/jpeg'
    if (!/^image\//i.test(type)) return { ok: false, error: 'A URL não aponta para uma imagem' }
    const buffer = Buffer.from(await resp.arrayBuffer())
    const name = (url.split('/').pop()?.split('?')[0]) || 'imagem.jpg'
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
