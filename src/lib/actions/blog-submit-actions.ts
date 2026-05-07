'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole, getSession, adminListUsers } from '@/lib/painel-auth'
import { createNotification } from '@/lib/notifications'
import { sendEmailTemplate } from '@/lib/email/send-template'

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80)
}

function plainToRichText(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: text.split(/\n\n+/).map((para: string) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: para.split('\n').map((line: string) => ({
          type: 'text',
          format: 0,
          text: line,
          version: 1,
          mode: 'normal',
          style: '',
          detail: 0,
        })),
      })),
    },
  }
}

// ── Rate limit em memória (suficiente para MVP, single-region) ────
const submissions = new Map<string, number[]>()
const WINDOW_MS = 60 * 60 * 1000 // 1 hora
const MAX_PER_HOUR = 3

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const arr = submissions.get(ip) || []
  const recent = arr.filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_HOUR) return false
  recent.push(now)
  submissions.set(ip, recent)
  return true
}

export type GuestPostInput = {
  authorName: string
  authorEmail: string
  authorCompany?: string
  title: string
  summary: string
  content: string
  pillar?: 'diagnosticar' | 'estruturar' | 'operar' | 'evoluir' | 'geral'
  consent: boolean
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png']

export async function submitGuestPost(formData: FormData) {
  const input: GuestPostInput = {
    authorName: String(formData.get('authorName') || ''),
    authorEmail: String(formData.get('authorEmail') || ''),
    authorCompany: String(formData.get('authorCompany') || '') || undefined,
    title: String(formData.get('title') || ''),
    summary: String(formData.get('summary') || ''),
    content: String(formData.get('content') || ''),
    pillar: (String(formData.get('pillar') || 'geral') as GuestPostInput['pillar']),
    consent: formData.get('consent') === 'true',
  }
  const coverImage = formData.get('coverImage')
  const hasImage = coverImage instanceof File && coverImage.size > 0

  // ── Validações ────────────────────────────────────────────────
  if (!input.consent) throw new Error('Você precisa aceitar os termos para enviar.')
  if (!input.authorName?.trim()) throw new Error('Nome obrigatório')
  if (!input.authorEmail?.trim() || !input.authorEmail.includes('@')) {
    throw new Error('Email inválido')
  }
  if (!input.title?.trim() || input.title.length < 10) {
    throw new Error('Título precisa ter pelo menos 10 caracteres')
  }
  if (!input.summary?.trim() || input.summary.length < 20) {
    throw new Error('Resumo precisa ter pelo menos 20 caracteres')
  }
  if (input.summary.length > 200) {
    throw new Error('Resumo deve ter no máximo 200 caracteres')
  }
  if (!input.content?.trim() || input.content.length < 200) {
    throw new Error('Conteúdo precisa ter pelo menos 200 caracteres')
  }

  // Honeypot/anti-spam: muitos URLs em poucos caracteres
  const urlCount = (input.content.match(/https?:\/\//g) || []).length
  if (urlCount > 5) throw new Error('Muitos links no conteúdo. Reduza para no máximo 5.')

  if (hasImage) {
    const file = coverImage as File
    if (!ALLOWED_IMAGE_MIMES.includes(file.type)) {
      throw new Error('Imagem deve ser JPG ou PNG.')
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error('Imagem maior que 5MB. Reduza o tamanho.')
    }
  }

  // ── Rate limit por IP ─────────────────────────────────────────
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip)) {
    throw new Error('Muitas submissões deste IP. Tente novamente em 1 hora.')
  }

  // ── Cria post como pending_review ─────────────────────────────
  const payload = await getPayload({ config })

  // Slug único
  let baseSlug = slugify(input.title)
  if (!baseSlug) baseSlug = `post-${Date.now()}`
  let slug = baseSlug
  let n = 1
  while (true) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    if (existing.docs.length === 0) break
    n++
    slug = `${baseSlug}-${n}`
    if (n > 100) {
      slug = `${baseSlug}-${Date.now()}`
      break
    }
  }

  // ── Upload da imagem (opcional) ───────────────────────────────
  let imagemDestaqueId: string | number | undefined
  if (hasImage) {
    try {
      const file = coverImage as File
      const buffer = Buffer.from(await file.arrayBuffer())
      const media = await payload.create({
        collection: 'media',
        data: { alt: input.title.slice(0, 120) } as any,
        file: {
          data: buffer,
          mimetype: file.type,
          name: file.name || `submission-${Date.now()}.${file.type === 'image/png' ? 'png' : 'jpg'}`,
          size: file.size,
        },
      })
      imagemDestaqueId = media.id
    } catch (err) {
      console.error('[submitGuestPost] upload imagem falhou:', err)
      // Não bloqueia: prossegue sem imagem
    }
  }

  const post = await payload.create({
    collection: 'posts',
    data: {
      titulo: input.title,
      slug,
      resumo: input.summary,
      conteudo: plainToRichText(input.content) as any,
      status: 'pending_review',
      pilar: input.pillar || 'geral',
      autor: input.authorName,
      isExternalSubmission: true,
      submittedByName: input.authorName,
      submittedByEmail: input.authorEmail,
      submittedByCompany: input.authorCompany || undefined,
      ...(imagemDestaqueId ? { imagem_destaque: imagemDestaqueId } : {}),
    } as any,
  })

  // ── Notifica admins ───────────────────────────────────────────
  try {
    const admins = (await adminListUsers()).filter((u) => u.role === 'admin')
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: 'post.in_review',
          title: `Nova submissão: "${input.title}"`,
          message: `${input.authorName} (${input.authorEmail}) enviou um post para revisão`,
          link: `/admin/posts/${post.id}/review`,
          metadata: { postId: post.id, slug },
        }),
      ),
    )

    // Email para o primeiro admin (resumo)
    if (admins.length > 0) {
      const { templatePostInReviewHtml } = await import('@/lib/email/templates/post-in-review')
      const html = templatePostInReviewHtml({
        authorName: input.authorName,
        authorEmail: input.authorEmail,
        authorCompany: input.authorCompany || '',
        title: input.title,
        summary: input.summary,
        reviewUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'}/admin/posts`,
      })
      await Promise.all(
        admins.map((admin) =>
          admin.email
            ? sendEmailTemplate({
                to: admin.email,
                subject: `[Unfold] Nova submissão de blog: "${input.title}"`,
                html,
                templateSlug: 'post.in_review.admin',
                variables: { authorName: input.authorName, title: input.title },
              })
            : Promise.resolve(),
        ),
      )
    }
  } catch (err) {
    console.error('[submitGuestPost] notify admins failed:', err)
  }

  // ── Email de confirmação ao autor ─────────────────────────────
  try {
    const { templatePostSubmittedHtml } = await import('@/lib/email/templates/post-submitted')
    const html = templatePostSubmittedHtml({
      authorName: input.authorName,
      title: input.title,
    })
    await sendEmailTemplate({
      to: input.authorEmail,
      subject: '[Unfold Growth] Sua submissão foi recebida',
      html,
      templateSlug: 'post.submitted.author',
      variables: { authorName: input.authorName, title: input.title },
    })
  } catch (err) {
    console.error('[submitGuestPost] notify author failed:', err)
  }

  return { ok: true, id: post.id, slug }
}

// ── Aprovação / Rejeição (admin) ────────────────────────────────

export async function approvePost(postId: string) {
  const me = await requireRole('admin')
  const payload = await getPayload({ config })

  const post: any = await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      status: 'published',
      publicado_em: new Date().toISOString(),
      reviewedBy: me.id,
      reviewedAt: new Date().toISOString(),
    } as any,
  })

  // Notifica autor (se externo)
  if (post.isExternalSubmission && post.submittedByEmail) {
    try {
      const { templatePostApprovedHtml } = await import('@/lib/email/templates/post-approved')
      const html = templatePostApprovedHtml({
        authorName: post.submittedByName || post.autor || 'autor',
        title: post.titulo,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'}/blog/${post.slug}`,
      })
      await sendEmailTemplate({
        to: post.submittedByEmail,
        subject: `[Unfold Growth] Seu post foi publicado!`,
        html,
        templateSlug: 'post.approved.author',
      })
    } catch (err) {
      console.error('[approvePost] email autor falhou:', err)
    }
  }

  revalidatePath('/admin/posts')
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  return { ok: true }
}

export async function rejectPost(postId: string, reason: string) {
  const me = await requireRole('admin')
  if (!reason?.trim()) throw new Error('Informe um motivo para a rejeição.')

  const payload = await getPayload({ config })
  const post: any = await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      status: 'draft',
      rejectionReason: reason,
      reviewedBy: me.id,
      reviewedAt: new Date().toISOString(),
    } as any,
  })

  if (post.isExternalSubmission && post.submittedByEmail) {
    try {
      const { templatePostRejectedHtml } = await import('@/lib/email/templates/post-rejected')
      const html = templatePostRejectedHtml({
        authorName: post.submittedByName || post.autor || 'autor',
        title: post.titulo,
        reason,
      })
      await sendEmailTemplate({
        to: post.submittedByEmail,
        subject: `[Unfold Growth] Sua submissão precisa de ajustes`,
        html,
        templateSlug: 'post.rejected.author',
      })
    } catch (err) {
      console.error('[rejectPost] email autor falhou:', err)
    }
  }

  revalidatePath('/admin/posts')
  return { ok: true }
}
