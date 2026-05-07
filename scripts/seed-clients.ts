/**
 * Seed inicial das empresas que confiam na Unfold.
 *
 * Executa: `npm run seed:clients`
 *
 * - Conecta no banco configurado em DATABASE_URL (Supabase em prod, SQLite em dev).
 * - Insere as empresas iniciais APENAS se a tabela "clients" estiver vazia.
 * - Idempotente: pode ser rodado várias vezes sem duplicar registros.
 */
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// Carrega .env.local primeiro (override = true), depois .env como fallback
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true })
dotenv.config({ path: path.join(projectRoot, '.env') })

const { getPayload } = await import('payload')
const { default: config } = await import('../payload.config')

const INITIAL_CLIENTS: Array<{ nome: string; ordem: number }> = [
  { nome: 'Grupo AV', ordem: 1 },
  { nome: 'Zest Inc', ordem: 2 },
  { nome: 'Ypê Investimentos', ordem: 3 },
  { nome: 'Grupo Luiz Jatobá', ordem: 4 },
  { nome: 'Inove Engenharia', ordem: 5 },
  { nome: 'OFM Systems', ordem: 6 },
  { nome: 'Mesha Tecnologia', ordem: 7 },
  { nome: 'Roga DX', ordem: 8 },
  { nome: 'Sementes Ipiranga', ordem: 9 },
  { nome: 'Grupo Maqnelson', ordem: 10 },
  { nome: 'Vertical Locações', ordem: 11 },
  { nome: 'Consórcio Nova Aravel', ordem: 12 },
]

async function main() {
  console.log('🌱 Seed: empresas que confiam na Unfold')
  console.log(`📦 DB: ${process.env.DATABASE_URL?.startsWith('postgres') ? 'Supabase Postgres' : 'SQLite local'}`)

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'clients',
    limit: 1,
    depth: 0,
  })

  if (existing.totalDocs > 0) {
    console.log(`⚠️  Tabela "clients" já tem ${existing.totalDocs} registro(s). Seed abortado.`)
    console.log('    Para re-seed, apague os registros no admin antes de rodar de novo.')
    process.exit(0)
  }

  console.log(`➕ Inserindo ${INITIAL_CLIENTS.length} empresas...`)

  for (const c of INITIAL_CLIENTS) {
    await payload.create({
      collection: 'clients',
      data: {
        nome: c.nome,
        ordem: c.ordem,
        ativo: true,
      } as any,
    })
    console.log(`   ✓ ${c.nome}`)
  }

  console.log(`\n✅ Seed concluído. ${INITIAL_CLIENTS.length} empresas adicionadas.`)
  console.log('   Acesse /admin/collections/clients para editar logos e sites.')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Seed falhou:', err)
  process.exit(1)
})
