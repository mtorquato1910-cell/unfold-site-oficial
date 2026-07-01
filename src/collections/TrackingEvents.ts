import type { CollectionConfig } from 'payload'

/**
 * Event store append-only de navegação do site (mapa de calor / jornada de leads).
 *
 * Captura pageviews e cliques anônimos (sem PII): identificamos o visitante por
 * `session_id` (por aba/sessão) e, quando ele vira lead, por `lead_hash` (hash do
 * e-mail — NUNCA o e-mail em claro). Isso alimenta a aba /admin/heatmap.
 *
 * Cresce linearmente. Índices em (session_id), (lead_hash), (path), (created_at)
 * são importantes. Se passar de ~100k linhas/mês, migrar para Tinybird/ClickHouse
 * (mesmo racional de DiagnosticoEvents).
 */
export const TrackingEvents: CollectionConfig = {
  slug: 'tracking-events',
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['event_type', 'path', 'session_id', 'lead_hash', 'createdAt'],
    group: 'Analytics',
    description: 'Eventos de navegação (pageviews/cliques) — somente leitura.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true, // criação aberta — vem da route /api/track com validação própria
    update: () => false,
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'event_type',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'pageview | click' },
    },
    {
      name: 'path',
      type: 'text',
      index: true,
      admin: { description: 'Caminho da página (ex: /cases/foo).' },
    },
    {
      name: 'session_id',
      type: 'text',
      index: true,
      admin: { description: 'ID anônimo da sessão do browser (gerado client-side).' },
    },
    {
      name: 'lead_hash',
      type: 'text',
      index: true,
      admin: { description: 'Hash do e-mail do lead (quando identificado). Sem PII.' },
    },
    {
      name: 'referrer',
      type: 'text',
      admin: { description: 'Origem do acesso (document.referrer).' },
    },
    {
      name: 'element',
      type: 'text',
      admin: { description: 'Descrição do elemento clicado (tag/id/label).' },
    },
    { name: 'x', type: 'number', admin: { description: 'Coordenada X do clique (viewport).' } },
    { name: 'y', type: 'number', admin: { description: 'Coordenada Y do clique (viewport).' } },
    { name: 'viewport_w', type: 'number', admin: { description: 'Largura do viewport no evento.' } },
    {
      name: 'metadata',
      type: 'json',
      admin: { description: 'Dados livres (UTM, título etc.).' },
    },
    { name: 'ip_address', type: 'text', admin: { readOnly: true } },
    { name: 'user_agent', type: 'text', admin: { readOnly: true } },
  ],
  timestamps: true,
}

export default TrackingEvents
