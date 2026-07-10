import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
import { getPayload } from 'payload'
import config from './payload.config.ts'

const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63f8cfc0f01f0005000101a5f645400000000049454e44ae426082','hex')
async function main() {
  const payload = await getPayload({ config })
  console.log('payload pronto')
  try {
    const doc: any = await payload.create({
      collection: 'media',
      file: { data: png, mimetype: 'image/png', name: 'diag-repro.png', size: png.length },
      data: { alt: 'diag' },
    })
    console.log('CREATE ok id=', doc?.id, 'url=', doc?.url)
    const check: any = await payload.findByID({ collection: 'media', id: doc.id, depth: 0 }).catch((e:any)=>({__err:e.message}))
    console.log('findByID:', check?.id ? 'EXISTE id='+check.id : 'NAO EXISTE -> '+JSON.stringify(check))
    if (check?.id) { await payload.delete({ collection: 'media', id: check.id }).catch(()=>{}) }
  } catch (e:any) {
    console.log('CREATE FALHOU ->', e?.name, ':', e?.message)
    console.log('STACK:', String(e?.stack).split('\n').slice(0,6).join(' | '))
  }
  process.exit(0)
}
main().catch(e=>{ console.log('FATAL:', e?.message); process.exit(1) })
