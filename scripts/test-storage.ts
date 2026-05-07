/**
 * Testa o storage configurado fazendo upload de uma imagem 1x1 PNG via Payload Local API.
 * - Cria um Media doc temporário
 * - Mostra a URL retornada (se for do supabase.co/storage → storage S3 OK)
 * - Apaga o doc no final
 */
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true })
dotenv.config({ path: path.join(projectRoot, '.env') })

const { getPayload } = await import('payload')
const { default: config } = await import('../payload.config')

// PNG 1x1 transparente (smallest valid PNG)
const PNG_1X1 = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63fcffff3f0306000005010102f3e7e2380000000049454e44ae426082',
  'hex',
)

async function main() {
  const useS3 = Boolean(
    process.env.SUPABASE_S3_ACCESS_KEY_ID &&
      process.env.SUPABASE_S3_SECRET_ACCESS_KEY &&
      process.env.SUPABASE_S3_ENDPOINT &&
      process.env.SUPABASE_S3_BUCKET,
  )
  console.log(`📦 Storage configurado: ${useS3 ? 'Supabase S3 ✓' : 'Local/Vercel'}`)
  console.log(`   Endpoint: ${process.env.SUPABASE_S3_ENDPOINT || '(não setado)'}`)
  console.log(`   Bucket:   ${process.env.SUPABASE_S3_BUCKET || '(não setado)'}`)

  const payload = await getPayload({ config })
  console.log('\n🚀 Fazendo upload de teste (test-pixel.png)...')

  const filename = `test-pixel-${Date.now()}.png`
  let createdId: string | number | null = null

  try {
    const media: any = await payload.create({
      collection: 'media',
      data: { alt: 'Pixel de teste — pode apagar' } as any,
      file: {
        data: PNG_1X1,
        mimetype: 'image/png',
        name: filename,
        size: PNG_1X1.length,
      },
    })
    createdId = media.id
    console.log('\n✅ Upload concluído!')
    console.log(`   ID:       ${media.id}`)
    console.log(`   Filename: ${media.filename}`)
    console.log(`   URL:      ${media.url}`)
    console.log(`   MIME:     ${media.mimeType}`)
    console.log(`   Size:     ${media.filesize} bytes`)

    if (typeof media.url === 'string' && media.url.includes('supabase')) {
      console.log('\n🎉 STORAGE FUNCIONANDO — arquivo está no Supabase Storage!')
    } else if (typeof media.url === 'string' && media.url.startsWith('/api')) {
      console.log('\n⚠️  URL aponta pro filesystem local (Payload route /api/media/file).')
      console.log('   Storage S3 não está ativo. Confira as 4 vars SUPABASE_S3_* no .env.local.')
    } else {
      console.log('\nℹ️  Verifique a URL acima — se contém "supabase.co", está OK.')
    }
  } finally {
    if (createdId) {
      try {
        await payload.delete({ collection: 'media', id: createdId })
        console.log(`\n🧹 Doc de teste apagado (id ${createdId}).`)
      } catch (e) {
        console.log(`\n⚠️  Não consegui apagar o doc de teste (id ${createdId}). Apague manualmente em /admin/collections/media`)
      }
    }
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Teste falhou:', err)
  process.exit(1)
})
