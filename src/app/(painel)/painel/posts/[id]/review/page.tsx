import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, ExternalLink } from 'lucide-react'
import { getSession } from '@/lib/painel-auth'
import { getDocument } from '@/lib/painel-api'
import PainelLayout from '@/components/painel/PainelLayout'
import { GlassCard, PageHeader, StatusBadge } from '@/components/painel/ui'
import RichTextRenderer from '@/components/RichTextRenderer'
import RichContent from '@/components/RichContent'
import ReviewActions from './ReviewActions'

function formatDate(d: string): string {
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function PostReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const post: any = await getDocument('posts', id)
  if (!post) notFound()

  return (
    <PainelLayout user={user}>
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-1.5 text-[12px] text-mint-soft hover:opacity-80 mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para listagem
      </Link>

      <PageHeader
        title={`Revisar: ${post.titulo || '(sem título)'}`}
        description={`Submetido ${post.createdAt ? formatDate(post.createdAt) : ''}`}
        actions={
          (user.role === 'admin' || user.role === 'editor') && post.status === 'pending_review' ? (
            <ReviewActions postId={post.id} />
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar com info do autor */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard>
            <h3 className="font-display text-[15px] font-medium text-fg mb-4">Status</h3>
            <StatusBadge status={post.status || 'draft'} />
            {post.publicado_em && (
              <div className="text-[11px] text-dim mt-3">
                Publicado em {formatDate(post.publicado_em)}
              </div>
            )}
          </GlassCard>

          {post.isExternalSubmission && (
            <GlassCard>
              <h3 className="font-display text-[15px] font-medium text-fg mb-4">Autor externo</h3>
              <dl className="space-y-3 text-[13px]">
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">Nome</dt>
                  <dd className="text-fg">{post.submittedByName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">Email</dt>
                  <dd className="text-fg flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-dim" />
                    {post.submittedByEmail ? (
                      <a href={`mailto:${post.submittedByEmail}`} className="hover:text-mint">
                        {post.submittedByEmail}
                      </a>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                {post.submittedByCompany && (
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">Empresa</dt>
                    <dd className="text-fg">{post.submittedByCompany}</dd>
                  </div>
                )}
              </dl>
            </GlassCard>
          )}

          <GlassCard>
            <h3 className="font-display text-[15px] font-medium text-fg mb-4">Metadados</h3>
            <dl className="space-y-3 text-[13px]">
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">Slug</dt>
                <dd className="text-fg font-mono text-[11px]">/{post.slug || '—'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">Pilar UGS</dt>
                <dd className="text-fg">{post.pilar || '—'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">Autor</dt>
                <dd className="text-fg">{post.autor || '—'}</dd>
              </div>
              {post.rejectionReason && (
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">Última rejeição</dt>
                  <dd className="text-[12px]" style={{ color: 'hsl(0 70% 80%)' }}>
                    {post.rejectionReason}
                  </dd>
                </div>
              )}
            </dl>
            {post.status === 'published' && post.slug && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="mt-4 inline-flex items-center gap-1 text-mint text-[12px] hover:opacity-80"
              >
                Ver no site <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </GlassCard>
        </div>

        {/* Conteúdo principal */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="mb-4">
              <h2 className="font-display text-[24px] font-semibold text-fg">{post.titulo || '—'}</h2>
              {post.resumo && (
                <p className="mt-2 text-[14px] text-dim-2 leading-relaxed">{post.resumo}</p>
              )}
            </div>

            {post.conteudo_html ? (
              <RichContent
                html={post.conteudo_html}
                className="prose prose-sm max-w-none mt-6"
              />
            ) : (
              <div
                className="prose prose-sm max-w-none mt-6"
                style={{ color: 'hsl(0 0% 91% / 0.85)' }}
              >
                {post.conteudo ? (
                  <RichTextRenderer data={post.conteudo} />
                ) : (
                  <p className="text-dim italic">Sem conteúdo (rich text)</p>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PainelLayout>
  )
}
