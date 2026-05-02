import type { CollectionConfig } from 'payload'

export const DiagnosticoResults: CollectionConfig = {
  slug: 'diagnostico-results',
  admin: {
    useAsTitle: 'lead_email',
    defaultColumns: ['lead_email', 'score_total', 'nivel_fit', 'createdAt'],
    group: 'Diagnóstico',
  },
  fields: [
    { name: 'lead_email', type: 'email', required: true },
    { name: 'lead_id', type: 'relationship', relationTo: 'leads', hasMany: false },
    {
      name: 'score_total',
      type: 'number',
      required: true,
      admin: { description: 'Score percentual total (0–100)' },
    },
    {
      name: 'score_diagnosticar',
      type: 'number',
      admin: { description: 'Score do pilar Diagnosticar (0–100)' },
    },
    {
      name: 'score_estruturar',
      type: 'number',
      admin: { description: 'Score do pilar Estruturar (0–100)' },
    },
    {
      name: 'score_operar',
      type: 'number',
      admin: { description: 'Score do pilar Operar (0–100)' },
    },
    {
      name: 'nivel_fit',
      type: 'select',
      options: [
        { label: 'Alto', value: 'alto' },
        { label: 'Médio', value: 'medio' },
        { label: 'Baixo', value: 'baixo' },
      ],
    },
    {
      name: 'respostas_raw',
      type: 'json',
      admin: { description: 'Array de { question_id, valor, pilar, peso }' },
    },
    { name: 'insight_id', type: 'relationship', relationTo: 'insights-variations', hasMany: false },
    {
      name: 'token_jwt',
      type: 'text',
      admin: { readOnly: true, description: 'JWT usado para acessar este resultado' },
    },
    {
      name: 'email_enviado',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Email de resultado enviado ao lead' },
    },
  ],
  timestamps: true,
}

export default DiagnosticoResults
