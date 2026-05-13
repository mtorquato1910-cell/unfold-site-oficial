import type { CollectionConfig } from 'payload'

/**
 * Append-only event store do Diagnóstico de Growth v2.
 * Captura os 9 eventos de mensuração da spec §10.3.
 *
 * Cresce linearmente — índice composto em (event_name, created_at desc) é importante.
 * Sprint 6+ pode migrar para Tinybird/ClickHouse se passar de 100k linhas/mês.
 */
export const DiagnosticoEvents: CollectionConfig = {
  slug: 'diagnostico-events',
  admin: {
    useAsTitle: 'event_name',
    defaultColumns: ['event_name', 'result_hash', 'lead_email', 'createdAt'],
    group: 'Diagnóstico',
    description: 'Histórico de eventos do funil de diagnóstico (somente leitura).',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true, // criação aberta — chamadas vêm de routes/cron com validação própria
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
        { label: 'Diagnóstico iniciado', value: 'diagnostico_iniciado' },
        { label: 'Etapa 1 concluída', value: 'etapa_1_concluida' },
        { label: 'Pergunta respondida', value: 'etapa_2_pergunta' },
        { label: 'Diagnóstico concluído', value: 'diagnostico_concluido' },
        { label: 'PDF baixado', value: 'pdf_baixado' },
        { label: 'Resultado compartilhado', value: 'resultado_compartilhado' },
        { label: 'Opt-in nutrição', value: 'opt_in_nutricao' },
        { label: 'Agendamento iniciado', value: 'agendamento_iniciado' },
        { label: 'Agendamento concluído', value: 'agendamento_concluido' },
        { label: 'RD webhook', value: 'rd_webhook' },
      ],
    },
    {
      name: 'session_id',
      type: 'text',
      index: true,
      admin: { description: 'Identificador da sessão do browser (anti-flood) — gerado client-side.' },
    },
    {
      name: 'result_hash',
      type: 'text',
      index: true,
      admin: { description: 'Hash do DiagnosticoResults associado, quando aplicável.' },
    },
    {
      name: 'lead_email',
      type: 'email',
      index: true,
      admin: { description: 'Email do lead (quando conhecido).' },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: { description: 'Dados livres do evento (ex: ordem da pergunta, faixa Fit, source UTM).' },
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

export default DiagnosticoEvents
