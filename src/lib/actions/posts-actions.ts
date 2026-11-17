'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireRole } from '@/lib/painel-auth'
import { sanitizeRichHtml, htmlToPlainText } from '@/lib/html-sanitize'
import { notifyIndexNow } from '@/lib/indexnow'
import { createSlugRedirect } from '@/lib/slug-redirect'

/**
 * Posts actions com mapping inglês → PT-BR.
 * Aceita campos antigos (title/excerpt/category) e converte para schema real
 * (titulo/resumo/categoria) antes de persistir no Payload.
 */

type FlexibleData = Record<string, any>

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

/**
 * Confere se o id de mídia referenciado realmente existe em `media`.
 * O upload do painel pode devolver um id "fantasma" quando o storage de produção
 * reverte a transação (sequence avança, registro não persiste). Sem esta checagem,
 * o INSERT do post viola a FK posts_imagem_destaque_id_media_id_fk e o Postgres
 * rejeita a query inteira — o autor perde todo o conteúdo digitado.
 * Retorna true se existe; false se o id não corresponde a nenhum registro.
 */
async function mediaExists(payload: any, id: unknown): Promise<boolean> {
  if (id == null || id === '' ) return false
  try {
    const doc = await payload.findByID({ collection: 'media', id: id as any, depth: 0 })
    return Boolean(doc?.id)
  } catch {
    return false
  }
}

/** ISO válido ou null — datas inválidas/vazias não são gravadas. */
function parseDate(v: unknown): string | null {
  if (v == null || v === '') return null
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

function mapPost(input: FlexibleData) {
  // Mapeia campos inglês → PT-BR e mantém PT-BR já corretos
  const titulo = input.titulo ?? input.title ?? ''
  const slug = input.slug ?? ''
  const resumo = input.resumo ?? input.excerpt ?? ''
  const conteudoPlain = input.content ?? input.conteudoText ?? null
  // Editor rico (TipTap) → HTML. Quando presente, é a fonte usada no site.
  const contentHtml = input.contentHtml ?? input.conteudo_html ?? null
  const cleanHtml = contentHtml != null ? sanitizeRichHtml(contentHtml) : null
  const conteudoRT =
    input.conteudo ??
    (conteudoPlain
      ? plainToRichText(conteudoPlain)
      : cleanHtml
        ? plainToRichText(htmlToPlainText(cleanHtml) || ' ')
        : undefined)
  const status = input.status ?? 'draft'
  const pilar = input.pilar ?? input.pillar ?? 'geral'
  const autor = input.autor ?? input.author ?? 'Equipe Unfold Growth'
  const tempo_leitura = input.tempo_leitura ?? input.reading_time ?? undefined
  const tags = Array.isArray(input.tags)
    ? input.tags.map((t: any) => (typeof t === 'string' ? { tag: t } : t))
    : []

  const categoria = input.categoria ?? input.category ?? undefined
  const imagem_destaque = input.imagem_destaque ?? input.cover_image ?? undefined

  // Destaque na Home (seção "Insights"). Sem isto, o post nunca aparece na home —
  // a home filtra por destaque_home === true.
  const destaque_home = input.destaque_home ?? input.featured_home ?? false

  const data: FlexibleData = {
    titulo,
    slug,
    resumo,
    status,
    pilar,
    autor,
    tags,
    destaque_home: !!destaque_home,
  }
  if (input.ordem_home != null && input.ordem_home !== '') {
    data.ordem_home = Number(input.ordem_home) || 0
  }
  // publicado_em é carimbado pelo hook beforeChange da collection (Posts.ts) na
  // primeira vez que o status vira "published". Desde 17/11/2026 o painel também
  // permite editar a data: só grava quando vem uma data válida (vazio = não mexe).
  const publicadoEm = parseDate(input.publicado_em)
  if (publicadoEm) data.publicado_em = publicadoEm
  if (conteudoRT) data.conteudo = conteudoRT
  // Só sobrescreve o HTML quando o editor enviou algo (evita zerar em saves parciais).
  if (cleanHtml != null) data.conteudo_html = cleanHtml
  if (tempo_leitura) data.tempo_leitura = tempo_leitura
  // Categoria (Tarefa 3): id da collection `categories`. No Postgres a relação é
  // integer → coerce para Number (como a imagem). '' = remover; ausente = não mexe.
  if (categoria === '' || categoria === null) {
    data.categoria = null
  } else if (categoria !== undefined) {
    const raw = typeof categoria === 'object' ? (categoria as any)?.id : categoria
    const s = String(raw ?? '')
    if (/^\d+$/.test(s)) data.categoria = Number(s)
  }
  // Seção "Optional" do /llms.txt (Tarefa 7). Ausente = não mexe.
  if (input.llms_optional !== undefined) data.llms_optional = !!input.llms_optional
  // ID de mídia: no Postgres o relacionamento é integer — manda string numérica
  // dava "The following field is invalid: Imagem de destaque". Coerce p/ Number.
  if (imagem_destaque != null && imagem_destaque !== '') {
    const s = String(imagem_destaque)
    if (/^\d+$/.test(s)) data.imagem_destaque = Number(s)
    else if (/^[a-f0-9-]{8,}$/i.test(s)) data.imagem_destaque = imagem_destaque
  } else if (imagem_destaque === '') {
    // Usuário removeu a imagem no painel → desvincula de fato (sem isto, a antiga permanecia).
    data.imagem_destaque = null
  }

  // SEO / resumo de busca (item 1.5). Persistidos separados do resumo do card.
  // Antes eram coletados no form e descartados (não existiam no schema nem aqui).
  if (input.meta_title !== undefined) data.meta_title = input.meta_title || null
  if (input.meta_description !== undefined) data.meta_description = input.meta_description || null

  // Autores reais (S07): ids da collection `authors`. Obrigatório para publicar
  // (validado no hook da collection). Ausente no input = não mexe.
  if (input.autores !== undefined) {
    data.autores = (Array.isArray(input.autores) ? input.autores : [])
      .map((v: any) => Number(v?.id ?? v))
      .filter((n: number) => Number.isFinite(n) && n > 0)
  }
  if (input.revisor !== undefined) {
    const r = Number(input.revisor?.id ?? input.revisor)
    data.revisor = Number.isFinite(r) && r > 0 ? r : null
  }

  // FAQ (item 1.4): array de { pergunta, resposta }. Só guarda itens preenchidos.
  if (input.faq !== undefined) {
    const arr = Array.isArray(input.faq)
      ? input.faq
          .filter((q: any) => (q?.pergunta ?? '').trim() && (q?.resposta ?? '').trim())
          .map((q: any) => ({ pergunta: String(q.pergunta).trim(), resposta: String(q.resposta).trim() }))
      : []
    data.faq = arr.length ? arr : null
  }

  return data
}

/** Revalidação + IndexNow após editar um post (editor completo e edição rápida). */
async function afterPostUpdate(prev: any, updated: any) {
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml') // mantém o sitemap em dia sem depender de deploy
  revalidatePath('/llms.txt') // S09
  revalidatePath('/blog/categoria/[slug]', 'page') // listagens por categoria (Tarefa 3)
  // IndexNow (S09): avisa quando publica, despublica, troca o slug ou o conteúdo muda.
  const wasPub = prev?.status === 'published'
  const isPub = updated?.status === 'published'
  const changed =
    wasPub !== isPub || prev?.slug !== updated?.slug || prev?.content_updated_at !== updated?.content_updated_at
  if ((wasPub || isPub) && changed) {
    const paths = ['/blog', `/blog/${updated.slug}`]
    if (prev?.slug && prev.slug !== updated.slug) paths.push(`/blog/${prev.slug}`)
    await notifyIndexNow(paths)
  }
  revalidatePath('/') // home (seção Insights)
  revalidateTag('posts')
  revalidateTag('home-insights')
  if (updated?.slug) revalidatePath(`/blog/${updated.slug}`)
  if (prev?.slug && prev.slug !== updated?.slug) revalidatePath(`/blog/${prev.slug}`)
  revalidatePath('/autor/[slug]', 'page') // lista de artigos nas páginas de autor (S07)
}

export async function createPost(input: FlexibleData) {
  try {
    await requireRole('editor')
    if (!input.title?.trim() && !input.titulo?.trim()) throw new Error('Título obrigatório')
    if (!input.slug?.trim()) throw new Error('Slug obrigatório')

    const payload = await getPayload({ config })
    const data = mapPost(input)
    // `conteudo` (Lexical) é required no schema. Se o post foi criado só com o editor
    // HTML vazio, garante um corpo mínimo para o save não quebrar com erro genérico
    // (a fonte real do site é conteudo_html quando preenchido).
    if (!data.conteudo) data.conteudo = plainToRichText(' ')
    // Não deixa uma imagem que não persistiu derrubar o INSERT (FK). Salva o post
    // sem a capa em vez de perder todo o conteúdo, e avisa o autor para reanexar.
    let imagemWarning: string | undefined
    if (data.imagem_destaque != null && !(await mediaExists(payload, data.imagem_destaque))) {
      delete data.imagem_destaque
      imagemWarning =
        'A imagem de capa não foi salva (falha no upload) e não foi anexada. O texto foi salvo — reenvie a imagem e salve novamente.'
    }
    const created = await payload.create({ collection: 'posts', data: data as any })
    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    revalidatePath('/sitemap.xml') // mantém o sitemap em dia sem depender de deploy
    revalidatePath('/llms.txt') // S09
    revalidatePath('/blog/categoria/[slug]', 'page') // listagens por categoria (Tarefa 3)
    if ((created as any)?.status === 'published') await notifyIndexNow([`/blog/${created.slug}`, '/blog'])
    revalidatePath('/') // home (seção Insights)
    revalidateTag('posts')
    revalidateTag('home-insights')
    return { ok: true, id: created.id, doc: created, warning: imagemWarning }
  } catch (e: any) {
    console.error('[createPost]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function updatePost(id: string, input: FlexibleData) {
  try {
    await requireRole('editor')
    const payload = await getPayload({ config })
    const data = mapPost(input)
    // Estado anterior, lido uma vez: redirect de slug e aviso ao IndexNow (S09).
    const prev: any = await payload.findByID({ collection: 'posts', id, depth: 0 }).catch(() => null)
    // Slug de post PUBLICADO alterado → cria redirect 301 do antigo p/ o novo (item 1.3).
    await createSlugRedirect(payload, {
      base: '/blog',
      oldSlug: prev?.slug,
      newSlug: data.slug,
      wasPublished: prev?.status === 'published',
      id,
    })
    // Mesma blindagem do createPost: id de imagem inexistente violaria a FK e
    // rejeitaria o UPDATE inteiro. `null` (remoção explícita da capa) é preservado.
    let imagemWarning: string | undefined
    if (data.imagem_destaque != null && !(await mediaExists(payload, data.imagem_destaque))) {
      delete data.imagem_destaque
      imagemWarning =
        'A imagem de capa não foi salva (falha no upload) e não foi anexada. As alterações foram salvas — reenvie a imagem e salve novamente.'
    }
    const updated: any = await payload.update({ collection: 'posts', id, data: data as any })
    await afterPostUpdate(prev, updated)
    return { ok: true, doc: updated, warning: imagemWarning }
  } catch (e: any) {
    console.error('[updatePost]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

/**
 * Edição rápida (manual do desenvolvedor de 13/11/2026 + pedido de 17/11): grava SÓ
 * título, slug, meta descrição, categoria, tags, data de publicação, capa, autor e
 * status. Não passa pelo mapPost, que preenche padrões (resumo, destaque, pilar…) e
 * sobrescreveria campos que a edição rápida não mostra.
 */
export async function quickUpdatePost(id: string, input: FlexibleData) {
  try {
    await requireRole('editor')
    const titulo = String(input.titulo ?? input.title ?? '').trim()
    const slug = slugify(String(input.slug ?? ''))
    if (!titulo) return { ok: false, error: 'Informe o título.' }
    if (!slug) return { ok: false, error: 'Informe o slug.' }
    const status = input.status === 'published' ? 'published' : 'draft'
    const autor = Number(input.autor)
    if (status === 'published' && !(autor > 0)) return { ok: false, error: 'Selecione o autor para publicar.' }

    const payload = await getPayload({ config })
    const prev: any = await payload.findByID({ collection: 'posts', id, depth: 0 }).catch(() => null)
    if (!prev) return { ok: false, error: 'Post não encontrado.' }

    const data: FlexibleData = {
      titulo,
      slug,
      status,
      meta_description: String(input.meta_description ?? '').trim() || null,
      tags: (Array.isArray(input.tags) ? input.tags : String(input.tags ?? '').split(','))
        .map((t: any) => String(t).trim())
        .filter(Boolean)
        .map((tag: string) => ({ tag })),
      autores: autor > 0 ? [autor] : [],
    }
    const cat = String(input.categoria ?? '')
    data.categoria = /^\d+$/.test(cat) ? Number(cat) : null
    const publicadoEm = parseDate(input.publicado_em)
    if (publicadoEm) data.publicado_em = publicadoEm

    let warning: string | undefined
    const img = String(input.imagem_destaque ?? '')
    if (!img) data.imagem_destaque = null
    else if (/^\d+$/.test(img) && (await mediaExists(payload, Number(img)))) data.imagem_destaque = Number(img)
    else warning = 'A capa não foi salva (falha no upload). Reenvie a imagem.'

    if (slug !== prev.slug) {
      const taken = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
      if (taken.docs.length) return { ok: false, error: `O slug "${slug}" já é usado por outro post.` }
    }
    const updated: any = await payload.update({ collection: 'posts', id, data: data as any, depth: 1 })
    // Depois do save: se o update falhar, não sobra redirect apontando para o nada.
    const redirected = await createSlugRedirect(payload, {
      base: '/blog',
      oldSlug: prev.slug,
      newSlug: slug,
      wasPublished: prev.status === 'published',
      id,
    })
    await afterPostUpdate(prev, updated)
    return { ok: true, doc: updated, warning, redirected }
  } catch (e: any) {
    console.error('[quickUpdatePost]', e)
    return { ok: false, error: e?.message || 'Falha ao salvar' }
  }
}

export async function deletePost(id: string) {
  await requireRole('editor')
  const payload = await getPayload({ config })
  const prev: any = await payload.findByID({ collection: 'posts', id, depth: 0 }).catch(() => null)
  await payload.delete({ collection: 'posts', id })
  revalidatePath('/llms.txt') // S09
  revalidatePath('/blog/categoria/[slug]', 'page')
  // Revalida a página do post excluído (senão o cache seguiria servindo 200 ao Bing).
  if (prev?.slug) revalidatePath(`/blog/${prev.slug}`)
  if (prev?.status === 'published') await notifyIndexNow([`/blog/${prev.slug}`, '/blog'])
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml') // mantém o sitemap em dia sem depender de deploy
  return { ok: true }
}
