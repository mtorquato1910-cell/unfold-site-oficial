import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/painel-auth'

export const dynamic = 'force-dynamic'

/**
 * Diagnóstico de storage (somente leitura, autenticado).
 * Mostra qual adapter de mídia a build ATUAL escolheu e quais variáveis de ambiente
 * estão presentes — sem expor valores/segredos. Útil para conferir, em produção,
 * por que o upload cai no Vercel Blob em vez do Supabase S3.
 *
 * Acesse logado no painel: /api/painel/storage-status
 */
export async function GET() {
  try {
    await requireRole('editor')
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const present = {
    SUPABASE_S3_ENDPOINT: Boolean(process.env.SUPABASE_S3_ENDPOINT),
    SUPABASE_S3_BUCKET: Boolean(process.env.SUPABASE_S3_BUCKET),
    SUPABASE_S3_REGION: Boolean(process.env.SUPABASE_S3_REGION),
    SUPABASE_S3_ACCESS_KEY_ID: Boolean(process.env.SUPABASE_S3_ACCESS_KEY_ID),
    SUPABASE_S3_SECRET_ACCESS_KEY: Boolean(process.env.SUPABASE_S3_SECRET_ACCESS_KEY),
    BLOB_READ_WRITE_TOKEN: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  }

  const useSupabaseS3 =
    present.SUPABASE_S3_ACCESS_KEY_ID &&
    present.SUPABASE_S3_SECRET_ACCESS_KEY &&
    present.SUPABASE_S3_ENDPOINT &&
    present.SUPABASE_S3_BUCKET

  const activeAdapter = useSupabaseS3
    ? 'supabase-s3'
    : present.BLOB_READ_WRITE_TOKEN
      ? 'vercel-blob'
      : 'local-filesystem'

  // Mostra só o host do endpoint (sem credenciais) para confirmar o projeto certo.
  let endpointHost: string | null = null
  try {
    endpointHost = process.env.SUPABASE_S3_ENDPOINT
      ? new URL(process.env.SUPABASE_S3_ENDPOINT).host
      : null
  } catch {
    endpointHost = '(valor inválido — não é uma URL)'
  }

  const missingForSupabase = Object.entries({
    SUPABASE_S3_ENDPOINT: present.SUPABASE_S3_ENDPOINT,
    SUPABASE_S3_BUCKET: present.SUPABASE_S3_BUCKET,
    SUPABASE_S3_ACCESS_KEY_ID: present.SUPABASE_S3_ACCESS_KEY_ID,
    SUPABASE_S3_SECRET_ACCESS_KEY: present.SUPABASE_S3_SECRET_ACCESS_KEY,
  })
    .filter(([, ok]) => !ok)
    .map(([k]) => k)

  return NextResponse.json({
    activeAdapter,
    expected: 'supabase-s3',
    ok: activeAdapter === 'supabase-s3',
    endpointHost,
    bucket: process.env.SUPABASE_S3_BUCKET || null,
    present,
    missingForSupabase,
    hint:
      activeAdapter === 'supabase-s3'
        ? 'Storage OK — uploads vão para o Supabase.'
        : `Faltam estas vars no ambiente atual: ${missingForSupabase.join(', ') || '(nenhuma — verifique nomes exatos)'}. Adicione em Production e faça Redeploy.`,
  })
}
