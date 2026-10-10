import { ValidationError, type CollectionConfig } from 'payload'
import { computeContentUpdatedAt } from '../lib/content-date'
import { publishMissingAuthor } from '../lib/authors'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'categoria', 'status', 'publicado_em'],
    group: 'Blog',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL amigável — use apenas letras minúsculas, números e hífens' },
    },
    {
      name: 'resumo',
      type: 'textarea',
      required: true,
      admin: { description: 'Resumo para cards e meta description (max 160 chars)' },
    },
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
    },
    {
      name: 'pilar',
      type: 'select',
      options: [
        { label: 'Diagnosticar', value: 'diagnosticar' },
        { label: 'Estruturar', value: 'estruturar' },
        { label: 'Operar', value: 'operar' },
        { label: 'Evoluir', value: 'evoluir' },
        { label: 'Geral', value: 'geral' },
      ],
      defaultValue: 'geral',
    },
    {
      name: 'imagem_destaque',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem de destaque',
      admin: { description: 'Imagem OG e card (1200x630 recomendado)' },
    },
    { name: 'conteudo', type: 'richText', required: true },
    {
      name: 'conteudo_html',
      type: 'textarea',
      admin: {
        description:
          'Conteúdo rico (HTML) gerado pelo editor do painel/formulário. Quando preenchido, é a fonte usada no site. Posts antigos sem este campo continuam usando "conteudo" (Lexical).',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Aguardando Revisão', value: 'pending_review' },
        { label: 'Publicado', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: {
        description: 'Rascunho → Aguardando Revisão (enviado pelo autor) → Publicado (aprovado pelo admin)',
      },
    },
    { name: 'publicado_em', type: 'date' },
    {
      // Data de atualização EDITORIAL (S01 seo-tecnico-2026-10). Calculada pelo hook
      // abaixo — só muda quando título ou corpo mudam. É a fonte do <lastmod> do
      // sitemap e do dateModified do Article. NÃO usar updatedAt para isso.
      // Scripts que reescrevem HTML (links, normalização, migrações) DEVEM passar
      // `context: { technicalEdit: true }` no payload.update para não alterar a data.
      name: 'content_updated_at',
      type: 'date',
      label: 'Conteúdo atualizado em',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Automático: muda só quando o título ou o corpo do post são editados.',
      },
    },
    {
      // Autores reais (S07 seo-tecnico-2026-10). Obrigatório para publicar (hook abaixo).
      name: 'autores',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      label: 'Autores',
      admin: { description: 'Pessoa(s) que assinam o artigo. Obrigatório para publicar.' },
    },
    {
      name: 'revisor',
      type: 'relationship',
      relationTo: 'authors',
      label: 'Revisado por',
      admin: { description: 'Especialista que revisou o texto (opcional).' },
    },
    {
      // DEPRECADO (S07): texto livre antigo. Mantido só como fallback de exibição até a
      // migração para `autores` ser validada em produção. Não usar em código novo.
      name: 'autor',
      type: 'text',
      defaultValue: 'Equipe Unfold Growth',
      admin: { hidden: true },
    },
    {
      name: 'tempo_leitura',
      type: 'number',
      min: 1,
      admin: { description: 'Tempo de leitura estimado em minutos' },
    },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },

    // ── SEO / Busca (item 1.5 — cabeçalho de publicação) ──────────
    // "Resumo de busca" é SEPARADO do `resumo` (que é o texto do card do blog).
    // Quando vazios, o site usa o título/resumo do post como fallback.
    {
      name: 'meta_title',
      type: 'text',
      label: 'Título de busca (SEO)',
      admin: {
        description:
          'Título exibido no resultado do Google. Vazio = usa o título do post. Ideal até 60 caracteres.',
      },
    },
    {
      name: 'meta_description',
      type: 'textarea',
      label: 'Resumo de busca (SEO)',
      admin: {
        description:
          'Texto exibido abaixo do título no Google — separado do resumo do card. Ideal até 155 caracteres.',
      },
    },

    // ── Perguntas frequentes (item 1.4) ───────────────────────────
    // JSON (array de { pergunta, resposta }). Gera a seção visível + o
    // FAQPage (JSON-LD) no site. Editado no painel custom (/painel/posts).
    {
      name: 'faq',
      type: 'json',
      label: 'Perguntas frequentes (FAQ)',
      admin: {
        description:
          'Pares pergunta/resposta (3–8). Gera a seção visível no artigo + a marcação FAQPage para citação por IA/Bing.',
      },
    },

    // ── Destaque na Home ──────────────────────────────────────────
    {
      name: 'destaque_home',
      type: 'checkbox',
      label: 'Exibir nos Insights da Home',
      defaultValue: false,
      index: true,
      admin: {
        description:
          'Marque para que este post apareça na seção "Insights" da página inicial. A home exibe até 6 posts marcados (ordenados pelo campo abaixo).',
      },
    },
    {
      name: 'ordem_home',
      type: 'number',
      label: 'Ordem na Home',
      defaultValue: 0,
      admin: {
        description: 'Número menor aparece primeiro. Usado apenas quando "Exibir nos Insights da Home" está marcado.',
      },
    },

    // ── Submissão externa (S8 Workflow Editorial) ─────────────────
    {
      name: 'isExternalSubmission',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: 'Marcado quando o post veio do formulário público /blog/submit' },
    },
    {
      name: 'submittedByName',
      type: 'text',
      admin: { description: 'Nome do autor externo (apenas se isExternalSubmission=true)' },
    },
    {
      name: 'submittedByEmail',
      type: 'email',
      admin: { description: 'Email do autor externo' },
    },
    {
      name: 'submittedByCompany',
      type: 'text',
      admin: { description: 'Empresa do autor externo' },
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      admin: { description: 'Motivo da rejeição (se aplicável)' },
    },
    {
      name: 'reviewedBy',
      type: 'text',
      admin: { description: 'ID do admin que aprovou/rejeitou (Supabase user id)' },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      admin: { description: 'Quando foi aprovado/rejeitado' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Carimba publicado_em na primeira vez que o post vira "published".
        // Preserva a data original em edições posteriores.
        if (data?.status === 'published' && !data.publicado_em && !originalDoc?.publicado_em) {
          data.publicado_em = new Date().toISOString()
        }
        return data
      },
      // S07: post publicado precisa de ao menos um autor real (Checklist SEO M08).
      // Exceções: edição técnica (scripts) e submissão externa (o autor é o convidado).
      ({ data, originalDoc, req }) => {
        if (data && publishMissingAuthor(data, originalDoc, req?.context)) {
          throw new ValidationError({
            collection: 'posts',
            errors: [{ path: 'autores', message: 'Selecione ao menos um autor para publicar o artigo.' }],
          })
        }
        return data
      },
      // Roda DEPOIS do carimbo de publicado_em (usa a data de publicação como piso).
      ({ data, originalDoc, operation, req }) => {
        if (!data || (operation !== 'create' && operation !== 'update')) return data
        // Valor vindo do cliente é ignorado: o campo é sempre calculado aqui.
        delete data.content_updated_at
        const next = computeContentUpdatedAt({
          operation,
          data,
          originalDoc,
          context: req?.context,
          titleField: 'titulo',
          htmlField: 'conteudo_html',
          publishedField: 'publicado_em',
        })
        if (next) data.content_updated_at = next
        return data
      },
    ],
  },
  timestamps: true,
}

export default Posts
