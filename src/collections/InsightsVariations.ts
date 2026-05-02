import type { CollectionConfig } from 'payload'

export const InsightsVariations: CollectionConfig = {
  slug: 'insights-variations',
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'nivel_fit', 'pilar'],
    group: 'Diagnóstico',
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      required: true,
    },
    {
      name: 'nivel_fit',
      type: 'select',
      required: true,
      options: [
        { label: 'Alto Fit (score ≥ 70)', value: 'alto' },
        { label: 'Médio Fit (score 40–69)', value: 'medio' },
        { label: 'Baixo Fit (score < 40)', value: 'baixo' },
      ],
      admin: { description: 'Nível de fit com o método UGS' },
    },
    {
      name: 'pilar',
      type: 'select',
      options: [
        { label: 'Geral (todos os pilares)', value: 'geral' },
        { label: 'Diagnosticar', value: 'diagnosticar' },
        { label: 'Estruturar', value: 'estruturar' },
        { label: 'Operar', value: 'operar' },
      ],
      defaultValue: 'geral',
      admin: { description: 'Pilar mais fraco a que este insight se aplica' },
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
      admin: { description: 'Título do insight exibido ao usuário' },
    },
    {
      name: 'corpo',
      type: 'textarea',
      required: true,
      admin: { description: 'Texto completo do insight personalizado' },
    },
    {
      name: 'cta_texto',
      type: 'text',
      defaultValue: 'Agendar conversa estratégica',
    },
    {
      name: 'ativo',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'nota_interna',
      type: 'textarea',
      admin: { description: 'Notas internas para substituição futura' },
    },
  ],
}

export default InsightsVariations
