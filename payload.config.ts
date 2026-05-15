import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import Cases from './src/collections/Cases'
import Users from './src/collections/Users'
import QuizQuestions from './src/collections/QuizQuestions'
import InsightsVariations from './src/collections/InsightsVariations'
import Leads from './src/collections/Leads'
import DiagnosticoResults from './src/collections/DiagnosticoResults'
import DiagnosticoEvents from './src/collections/DiagnosticoEvents'
import Posts from './src/collections/Posts'
import Categories from './src/collections/Categories'
import AIPrompts from './src/collections/AIPrompts'
import AuditLog from './src/collections/AuditLog'
import Media from './src/collections/Media'
import Testimonials from './src/collections/Testimonials'
import Clients from './src/collections/Clients'
import NewsletterSubscribers from './src/collections/NewsletterSubscribers'
import Notifications from './src/collections/Notifications'
import EmailLogs from './src/collections/EmailLogs'
import FAQs from './src/collections/FAQs'
import CalculadoraResults from './src/collections/CalculadoraResults'
import CalculadoraEvents from './src/collections/CalculadoraEvents'
import Redirects from './src/collections/Redirects'
import SiteSettings from './src/globals/SiteSettings'
import HomeSettings from './src/globals/HomeSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Local dev: SQLite (arquivo dev.db). Produção: PostgreSQL (Supabase via DATABASE_URL)
const isPostgres = process.env.DATABASE_URL?.startsWith('postgres')

// Storage de mídia — prioridade:
//   1. Supabase Storage (S3-compatible)  — se SUPABASE_S3_* preenchidos
//   2. Vercel Blob                        — se BLOB_READ_WRITE_TOKEN preenchido
//   3. Filesystem local (public/media)    — fallback dev
const useSupabaseS3 = Boolean(
  process.env.SUPABASE_S3_ACCESS_KEY_ID &&
    process.env.SUPABASE_S3_SECRET_ACCESS_KEY &&
    process.env.SUPABASE_S3_ENDPOINT &&
    process.env.SUPABASE_S3_BUCKET,
)
const useVercelBlob = !useSupabaseS3 && Boolean(process.env.BLOB_READ_WRITE_TOKEN)

export default buildConfig({
  admin: {
    user: 'users',
    theme: 'dark',
    meta: {
      titleSuffix: '— Unfold Growth',
      title: 'Admin — Unfold Growth',
      description: 'Painel de gestão de conteúdo — Unfold Growth',
      icons: [
        { rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' },
        { rel: 'shortcut icon', url: '/favicon.svg' },
      ],
    },
    components: {
      graphics: {
        Logo: '@/admin/AdminLogo#AdminLogo',
        Icon: '@/admin/AdminLogo#AdminIcon',
      },
      Nav: '@/admin/AdminNav#AdminNav',
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
    DiagnosticoEvents,
    Leads,
    // Sprint 5
    Posts,
    Categories,
    AIPrompts,
    // Sprint 6
    AuditLog,
    // Sprint 7
    Testimonials,
    Clients,
    NewsletterSubscribers,
    // Sprint 13 (Notifications & Email)
    Notifications,
    EmailLogs,
    // Sprint 9 (Site Editor)
    FAQs,
    // Sprint 15 (Curadoria + Tool Usage)
    CalculadoraResults,
    // Calculadora v2 — Sprint 1 (S1.7)
    CalculadoraEvents,
    // Sprint 10 (SEO Manager)
    Redirects,
  ],
  globals: [SiteSettings, HomeSettings],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    ...(useSupabaseS3
      ? [
          s3Storage({
            collections: {
              media: {
                disablePayloadAccessControl: true,
                generateFileURL: ({ filename }) => {
                  // Supabase serve uploads públicos em /storage/v1/object/public/{bucket}/{key}
                  // (o endpoint S3 .../s3 é só pra upload autenticado)
                  const base = (process.env.SUPABASE_S3_ENDPOINT as string).replace(/\/storage\/v1\/s3\/?$/, '')
                  const bucket = process.env.SUPABASE_S3_BUCKET as string
                  return `${base}/storage/v1/object/public/${bucket}/${filename}`
                },
              },
            },
            bucket: process.env.SUPABASE_S3_BUCKET as string,
            config: {
              endpoint: process.env.SUPABASE_S3_ENDPOINT as string,
              region: process.env.SUPABASE_S3_REGION || 'us-east-1',
              credentials: {
                accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY as string,
              },
              forcePathStyle: true,
            },
          }),
        ]
      : useVercelBlob
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
        // TODO sprint+1: migrar tabelas para schema "site" via `payload migrate:create`
        // regenerando as migrations. Tentativa anterior (2026-05-15) falhou porque
        // as migrations existentes (20260504/20260505) criam em `public.*` e adicionar
        // `schemaName: 'site'` faz o runtime esperar em `site.*` — divergência.
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
