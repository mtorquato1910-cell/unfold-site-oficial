import type { CollectionConfig } from 'payload'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  labels: {
    singular: 'Assinante Newsletter',
    plural: 'Newsletter — Assinantes',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'source', 'rdSyncStatus', 'createdAt'],
    group: 'Marketing',
    description:
      'Lista de assinantes da newsletter (capturados via formulário do rodapé). Sincronizados automaticamente com RD Station quando CRM_MODE=rd-station.',
  },
  access: {
    // Cadastro pelo público (form do site) — handled na API com validação
    create: () => true,
    // Leitura/edição/delete só para admins logados
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      label: 'Email',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'subscribed',
      options: [
        { label: 'Inscrito', value: 'subscribed' },
        { label: 'Cancelado', value: 'unsubscribed' },
        { label: 'Bounce', value: 'bounced' },
      ],
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'site-footer',
      admin: { description: 'Origem da inscrição (ex: site-footer, blog-cta, etc.)' },
    },
    {
      name: 'rdSyncStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Sincronizado', value: 'synced' },
        { label: 'Mock', value: 'mock' },
        { label: 'Erro', value: 'error' },
      ],
      admin: { description: 'Status da sincronização com RD Station' },
    },
    {
      name: 'rdContactId',
      type: 'text',
      admin: { description: 'ID do contato no RD Station (UUID retornado pela API)' },
    },
    {
      name: 'rdSyncedAt',
      type: 'date',
      admin: { description: 'Última vez que foi sincronizado com RD Station' },
    },
    {
      name: 'rdSyncError',
      type: 'textarea',
      admin: { description: 'Última mensagem de erro do sync (se aplicável)' },
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
      admin: { description: 'Data em que cancelou a inscrição' },
    },
  ],
  timestamps: true,
}

export default NewsletterSubscribers
