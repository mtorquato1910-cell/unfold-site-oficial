import type { CollectionConfig } from 'payload'

export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  admin: {
    useAsTitle: 'acao',
    defaultColumns: ['acao', 'entidade', 'actor_email', 'createdAt'],
    group: 'Sistema',
  },
  access: {
    create: () => true,
    read: ({ req }) => req.user?.role === 'super-admin',
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'acao',
      type: 'select',
      required: true,
      options: [
        { label: 'Lead criado', value: 'lead.created' },
        { label: 'Diagnóstico concluído', value: 'diagnostico.completed' },
        { label: 'Calculadora submetida', value: 'calculadora.submitted' },
        { label: 'Consentimento LGPD', value: 'lgpd.consent' },
        { label: 'Solicitação LGPD', value: 'lgpd.request' },
        { label: 'Revogação LGPD', value: 'lgpd.revoke' },
        { label: 'Admin login', value: 'admin.login' },
        { label: 'Email enviado', value: 'email.sent' },
        { label: 'CRM sync', value: 'crm.sync' },
        { label: 'RD Webhook — Convertido', value: 'rd.webhook.converted' },
        { label: 'RD Webhook — Oportunidade', value: 'rd.webhook.opportunity_created' },
      ],
    },
    { name: 'entidade', type: 'text', admin: { description: 'ex: leads:123, diagnostico-results:456' } },
    { name: 'actor_email', type: 'email', admin: { description: 'Email do usuário que executou a ação' } },
    { name: 'ip', type: 'text' },
    { name: 'detalhes', type: 'textarea', admin: { description: 'Dados adicionais em JSON (gerado automaticamente)', readOnly: true } },
    { name: 'status', type: 'select', options: [{ label: 'OK', value: 'ok' }, { label: 'Erro', value: 'error' }], defaultValue: 'ok' },
  ],
  timestamps: true,
}

export default AuditLog
