/**
 * Compressão de imagem no browser antes de enviar via Server Action.
 *
 * Vercel/Serverless rejeita requisições com body > ~4.5MB (HTTP 413) ANTES do
 * handler rodar — e uploads passam por Server Action (FormData). Por isso
 * redimensionamos/comprimimos no browser: imagens de conteúdo não precisam de
 * mais que ~1920px, e o Payload gera os tamanhos a partir do que receber.
 *
 * Extraído de ImageInput.tsx para ser reusado também pelo RichTextEditor.
 */

const MAX_DIMENSION = 1920
const TARGET_MAX_BYTES = 3_500_000

export async function compressImage(file: File): Promise<File> {
  // GIF (animado) e SVG não podem passar por canvas sem perder dados — manda como está.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file // formato não decodificável no browser — deixa o servidor validar
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close?.()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  const toBlob = (q: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', q))

  let blob: Blob | null = null
  for (const q of [0.85, 0.72, 0.6, 0.48]) {
    blob = await toBlob(q)
    if (blob && blob.size <= TARGET_MAX_BYTES) break
  }
  if (!blob) return file
  if (blob.size >= file.size) return file

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'imagem'
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
}

export const UPLOAD_TARGET_MAX_BYTES = TARGET_MAX_BYTES
