import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import Cases from './src/collections/Cases'
import Users from './src/collections/Users'
import QuizQuestions from './src/collections/QuizQuestions'
import InsightsVariations from './src/collections/InsightsVariations'
import Leads from './src/collections/Leads'
import DiagnosticoResults from './src/collections/DiagnosticoResults'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Local dev: SQLite (arquivo dev.db). Produção: PostgreSQL (Neon via DATABASE_URL)
const isPostgres = process.env.DATABASE_URL?.startsWith('postgres')

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '— Unfold Growth Admin',
    },
  },
  collections: [
    Users,
    Cases,
    // Sprint 4
    QuizQuestions,
    InsightsVariations,
    DiagnosticoResults,
    Leads,
    // Sprint 5: Posts, Categories, AIPrompts — adicionados em S5.1
    // Sprint 6: AuditLog — adicionado em S6.10
  ],
  globals: [],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: isPostgres
    ? postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URL as string,
        },
      })
    : sqliteAdapter({
        client: {
          url: process.env.DATABASE_URL || 'file:./dev.db',
        },
      }),
})
