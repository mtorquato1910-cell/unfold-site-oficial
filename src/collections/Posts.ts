import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'categoria', 'status', 'publicado_em'],
    group: 'Blog',
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
    { name: 'resumo', type: 'textarea', required: true, admin: { description: 'Resumo para cards e meta description (max 160 chars)' } },
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
        { label: 'Geral', value: 'geral' },
      ],
      defaultValue: 'geral',
    },
    { name: 'imagem_destaque', type: 'upload', relationTo: 'media' as 'users', admin: { description: 'Imagem OG e card (1200x630)' } },
    { name: 'conteudo', type: 'richText', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Publicado', value: 'published' },
      ],
      defaultValue: 'draft',
    },
    { name: 'publicado_em', type: 'date' },
    { name: 'autor', type: 'text', defaultValue: 'Equipe Unfold Growth' },
    { name: 'tempo_leitura', type: 'number', admin: { description: 'Tempo de leitura estimado em minutos' } },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
  ],
  timestamps: true,
}

export default Posts
