import type { CollectionConfig } from 'payload'

/**
 * Append-only event store da Calculadora de Performance v2.
 * Captura os 9 eventos do spec §10.3.
 *
 * Espelha o pattern de DiagnosticoEvents — Sprint 1.7 (ADR-5).
 * Cresce linearmente — índice composto em (event_name, created_at desc).
 */
export const CalculadoraEvents: CollectionConfig = {
  slug: 'calculadora-events',
  admin: {
    useAsTitle: 'event_name',
    defaultColumns: ['event_name', 'result_token', 'lead_email', 'createdAt'],
    group: 'Ferramentas',
    description: 'Histórico de eventos do funil da Calculadora (somente leitura).',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true, // route handler valida server-side
    update: ({ req }) => req.user?.role === 'super-admin',
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'event_name',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Calculadora iniciada', value: 'calculadora_iniciada' },
        { label: 'Etapa 1 concluída', value: 'etapa_1_concluida' },
        { label: 'Input alterado', value: 'calculadora_input_alterado' },
        { label: 'Premissa alterada', value: 'premissa_alterada' },
        { label: 'Resultado visualizado', value: 'resultado_visualizado' },
        { label: 'Insight exibido', value: 'insight_exibido' },
        { label: 'PDF baixado', value: 'pdf_baixado' },
        { label: 'Resultado compartilhado', value: 'resultado_compartilhado' },
        { label: 'CTA Diagnóstico clicado', value: 'calculadora_para_diagnostico' },
        { label: 'Payload adulterado (warn)', value: 'payload_tampered' },
      ],
    },
    {
      name: 'session_id',
      type: 'text',
      index: true,
      admin: { description: 'Identificador da sessão do browser — gerado client-side.' },
    },
    {
      name: 'result_token',
      type: 'text',
      index: true,
      admin: { description: 'Token UUID do CalculadoraResults associado, quando aplicável.' },
    },
    {
      name: 'lead_email',
      type: 'email',
      index: true,
      admin: { description: 'Email do lead (quando conhecido). Normalizado (lower + trim).' },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: { description: 'Dados livres do evento (ex.: qual input, valor, qual insight).' },
    },
    {
      name: 'ip_address',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'user_agent',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}

export default CalculadoraEvents
