/**
 * Roda o seed do Diagnóstico apontando pro Supabase configurado em .env.local.
 * Uso (a partir da raiz do projeto):
 *   npx tsx scripts/seed-diagnostico-prod.ts
 *
 * Não está exposto em produção — o /api/seed/diagnostico bloqueia.
 * Este script é o equivalente seguro para uso manual pelo owner.
 */

import { config as dotenvConfig } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenvConfig({ path: path.resolve(__dirname, '..', '.env.local') })

const { getPayload } = await import('payload')
const configPromise = (await import('../payload.config')).default
const { SEED_QUIZ_QUESTIONS, SEED_INSIGHTS } = await import('../src/scripts/seed-diagnostico')

async function main() {
  const payload = await getPayload({ config: configPromise })

  let createdQ = 0
  let skippedQ = 0
  for (const q of SEED_QUIZ_QUESTIONS) {
    const existing = await payload.find({
      collection: 'quiz-questions',
      where: { pergunta: { equals: q.pergunta } },
    })
    if (existing.docs.length > 0) {
      skippedQ++
      continue
    }
    await payload.create({ collection: 'quiz-questions', data: q })
    createdQ++
  }

  let createdI = 0
  let skippedI = 0
  for (const ins of SEED_INSIGHTS) {
    const existing = await payload.find({
      collection: 'insights-variations',
      where: { nivel_fit: { equals: ins.nivel_fit }, pilar: { equals: ins.pilar } },
    })
    if (existing.docs.length > 0) {
      skippedI++
      continue
    }
    await payload.create({ collection: 'insights-variations', data: ins })
    createdI++
  }

  console.log('=== SEED RESULTADO ===')
  console.log(`Quiz questions: ${createdQ} criadas, ${skippedQ} já existiam`)
  console.log(`Insights variations: ${createdI} criados, ${skippedI} já existiam`)
  process.exit(0)
}

main().catch((err) => {
  console.error('SEED FAILED:', err)
  process.exit(1)
})
