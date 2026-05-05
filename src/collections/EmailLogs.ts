import type { CollectionConfig } from 'payload'

export const EmailLogs: CollectionConfig = {
  slug: 'email-logs',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'to', 'status', 'templateSlug', 'createdAt'],
    group: 'Sistema',
  },
  access: {
    read: ({ req }) => req.user?.role === 'super-admin',
    create: () => true,
    update: () => true,
    delete: () => false,
  },
  fields: [
    { name: 'to', type: 'email', required: true, index: true },
    { name: 'from', type: 'text' },
    { name: 'subject', type: 'text', required: true },
    { name: 'templateSlug', type: 'text', index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      options: [
        { label: 'Na fila', value: 'queued' },
        { label: 'Enviado', value: 'sent' },
        { label: 'Falhou', value: 'failed' },
        { label: 'Devolvido (bounce)', value: 'bounced' },
        { label: 'Reclamação (complaint)', value: 'complained' },
      ],
    },
    { name: 'providerMessageId', type: 'text', admin: { description: 'ID do Resend' } },
    { name: 'mode', type: 'select', options: [{ label: 'Resend', value: 'resend' }, { label: 'Mock', value: 'mock-console' }], defaultValue: 'mock-console' },
    { name: 'errorMessage', type: 'textarea' },
    { name: 'variables', type: 'json', admin: { description: 'Variáveis usadas no template' } },
    { name: 'attempts', type: 'number', defaultValue: 1, min: 1 },
    { name: 'sentAt', type: 'date' },
  ],
  timestamps: true,
}

export default EmailLogs
