import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'userId', 'read', 'createdAt'],
    group: 'Sistema',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'userId',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Supabase user.id que recebe a notificação' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Post em revisão', value: 'post.in_review' },
        { label: 'Post aprovado', value: 'post.approved' },
        { label: 'Post rejeitado', value: 'post.rejected' },
        { label: 'Post publicado', value: 'post.published' },
        { label: 'Lead novo', value: 'lead.new' },
        { label: 'Lead atribuído', value: 'lead.assigned' },
        { label: 'Diagnóstico concluído', value: 'diagnostico.completed' },
        { label: 'Sistema', value: 'system' },
      ],
    },
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'textarea' },
    { name: 'link', type: 'text', admin: { description: 'URL relativa para abrir ao clicar' } },
    { name: 'read', type: 'checkbox', defaultValue: false, index: true },
    { name: 'metadata', type: 'json', admin: { description: 'Payload extra (ids, refs, etc.)' } },
  ],
  timestamps: true,
}

export default Notifications
