import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import Cases from './src/collections/Cases'
import Users from './src/collections/Users'
import QuizQuestions from './src/collections/QuizQuestions'
import InsightsVariations from './src/collections/InsightsVariations'
import Leads from './src/collections/Leads'
import DiagnosticoResults from './src/collections/DiagnosticoResults'
import Posts from './src/collections/Posts'
import Categories from './src/collections/Categories'
import AIPrompts from './src/collections/AIPrompts'
import AuditLog from './src/collections/AuditLog'
import Media from './src/collections/Media'
import SiteSettings from './src/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Local dev: SQLite (arquivo dev.db). Produção: PostgreSQL (Supabase via DATABASE_URL)
const isPostgres = process.env.DATABASE_URL?.startsWith('postgres')

// Vercel Blob só ativo em produção (quando BLOB_READ_WRITE_TOKEN estiver configurado)
const useVercelBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

export default buildConfig({
  admin: {
    user: 'users',
    theme: 'dark',
    css: path.resolve(dirname, 'src/admin/custom.css'),
    meta: {
      titleSuffix: '— Unfold Growth',
      title: 'Admin — Unfold Growth',
      description: 'Painel de gestão de conteúdo — Unfold Growth',
      icons: [{ rel: 'icon', type: 'image/png', url: '/favicon.ico' }],
    },
    components: {
      graphics: {
        Logo: '@/admin/AdminLogo#AdminLogo',
        Icon: '@/admin/AdminLogo#AdminIcon',
      },
      beforeDashboard: ['@/admin/AdminDashboard#AdminDashboard'],
    },
  },
  collections: [
    Users,
    Media,
    Cases,
    // Sprint 4
    QuizQuestions,
    InsightsVariations,
    DiagnosticoResults,
    Leads,
    // Sprint 5
    Posts,
    Categories,
    AIPrompts,
    // Sprint 6
    AuditLog,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    ...(useVercelBlob
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN as string,
          }),
        ]
      : []),
  ],
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
