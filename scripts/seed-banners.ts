/**
 * Seed inicial dos banners internos do blog (ferramentas da Unfold).
 *
 * Executa: `npm run seed:banners`
 *
 * - Conecta no banco configurado em DATABASE_URL (Supabase em prod, SQLite em dev).
 * - Insere os 3 banners das ferramentas APENAS se a tabela "banners" estiver vazia.
 * - Idempotente: não duplica. Imagens ficam em branco — anexe/edite depois pelo
 *   painel em /admin/banners (o dono troca e exclui por lá).
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

const INITIAL_BANNERS: Array<{
  titulo: string
  tag: string
  descricao: string
  cta_label: string
  link: string
  ordem: number
}> = [
  {
    titulo: 'Descubra a maturidade da sua operação comercial',
    tag: 'Diagnóstico gratuito',
    descricao: '12 perguntas, menos de 5 minutos. Receba um relatório personalizado baseado no método UGS.',
    cta_label: 'Fazer diagnóstico',
    link: '/diagnostico',
    ordem: 1,
  },
  {
    titulo: 'Calculadora de Performance',
    tag: 'Ferramenta gratuita',
    descricao: 'Descubra quanto seu investimento em mídia paga pode realmente retornar — com premissas honestas para vendas complexas B2B.',
    cta_label: 'Abrir calculadora',
    link: '/ferramentas/calculadora-trafego',
    ordem: 2,
  },
  {
    titulo: 'Em venda complexa, você não vende para uma pessoa',
    tag: 'Radar de Comitê de Compra',
    descricao: 'Monte o ICP estrutural do seu negócio e o mapa do comitê de compra — com o ângulo certo para falar com cada decisor.',
    cta_label: 'Montar meu mapa',
    link: '/ferramentas/mapa-icp',
    ordem: 3,
  },
]

async function main() {
  console.log('🌱 Seed: banners internos do blog')
  console.log(`📦 DB: ${process.env.DATABASE_URL?.startsWith('postgres') ? 'Supabase Postgres' : 'SQLite local'}`)

  const payload = await getPayload({ config })

  const existing = await payload.find({ collection: 'banners', limit: 1, depth: 0 })
  if (existing.totalDocs > 0) {
    console.log(`⚠️  Tabela "banners" já tem ${existing.totalDocs} registro(s). Seed abortado.`)
    console.log('    Para re-seed, apague os registros em /admin/banners antes de rodar de novo.')
    process.exit(0)
  }

  console.log(`➕ Inserindo ${INITIAL_BANNERS.length} banners...`)
  for (const b of INITIAL_BANNERS) {
    await payload.create({
      collection: 'banners',
      data: { ...b, ativo: true } as any,
    })
    console.log(`   ✓ ${b.titulo}`)
  }

  console.log(`\n✅ Seed concluído. ${INITIAL_BANNERS.length} banners adicionados.`)
  console.log('   Acesse /admin/banners para anexar imagens, trocar ou excluir.')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed falhou:', err)
  process.exit(1)
})
