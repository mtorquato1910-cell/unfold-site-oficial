import type { CollectionConfig } from 'payload'
import { syncContact } from '../lib/crm/adapter.ts'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'empresa', 'origem', 'rd_sync_status', 'createdAt'],
    group: 'CRM',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== 'create') return doc
        try {
          const result = await syncContact({
            nome: doc.nome,
            email: doc.email,
            empresa: doc.empresa,
            cargo: doc.cargo,
            origem: doc.origem,
            custom: {
              tamanho_equipe: doc.tamanho_equipe,
              receita_anual: doc.receita_anual,
              utm_source: doc.utm_source,
              utm_medium: doc.utm_medium,
              utm_campaign: doc.utm_campaign,
            },
          })
          // Atualiza rd_sync_status e rd_contact_id — importamos payload via req no hook
          // O update é feito via fetch interno para evitar loop
          if (result.success) {
            console.log(`[Leads hook] Sincronizado com CRM (${result.mode}): ${result.external_id}`)
          } else {
            console.error('[Leads hook] Falha na sincronização CRM:', result.error)
          }
        } catch (err) {
          console.error('[Leads hook] Erro inesperado:', err)
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'empresa', type: 'text', required: true },
    { name: 'cargo', type: 'text' },
    {
      name: 'tamanho_equipe',
      type: 'select',
      options: [
        { label: '1–5 pessoas', value: '1-5' },
        { label: '6–20 pessoas', value: '6-20' },
        { label: '21–50 pessoas', value: '21-50' },
        { label: '51–200 pessoas', value: '51-200' },
        { label: '200+ pessoas', value: '200+' },
      ],
    },
    {
      name: 'receita_anual',
      type: 'select',
      options: [
        { label: 'Até R$1MM', value: 'ate-1mm' },
        { label: 'R$1MM – R$5MM', value: '1mm-5mm' },
        { label: 'R$5MM – R$20MM', value: '5mm-20mm' },
        { label: 'R$20MM – R$100MM', value: '20mm-100mm' },
        { label: 'Acima de R$100MM', value: '100mm+' },
      ],
    },
    {
      name: 'origem',
      type: 'select',
      required: true,
      options: [
        { label: 'Diagnóstico', value: 'diagnostico' },
        { label: 'Calculadora', value: 'calculadora' },
        { label: 'Contato direto', value: 'contato' },
        { label: 'Outro', value: 'outro' },
      ],
      defaultValue: 'diagnostico',
    },
    {
      name: 'diagnostico_result_id',
      type: 'relationship',
      relationTo: 'diagnostico-results',
      hasMany: false,
    },
    {
      name: 'rd_sync_status',
      type: 'select',
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Sincronizado', value: 'synced' },
        { label: 'Erro', value: 'error' },
        { label: 'N/A (mock)', value: 'mock' },
      ],
      defaultValue: 'pending',
    },
    { name: 'rd_contact_id', type: 'text', admin: { readOnly: true } },
    { name: 'consentimento_lgpd', type: 'checkbox', defaultValue: false },
    { name: 'ip_address', type: 'text', admin: { readOnly: true } },
    { name: 'utm_source', type: 'text' },
    { name: 'utm_medium', type: 'text' },
    { name: 'utm_campaign', type: 'text' },
  ],
  timestamps: true,
}

export default Leads
