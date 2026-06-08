import type { CollectionConfig } from 'payload'

/**
 * Eventos de funil do Radar de Comitê (analytics server-side).
 * Espelha DiagnosticoEvents/CalculadoraEvents.
 */
export const MapaIcpEvents: CollectionConfig = {
  slug: 'mapa-icp-events',
  labels: { singular: 'Evento Radar', plural: 'Eventos Radar' },
  admin: {
    useAsTitle: 'event_name',
    defaultColumns: ['event_name', 'step_id', 'result_token', 'createdAt'],
    group: 'Sistema',
    hidden: true,
  },
  access: {
    read: ({ req }) => req.user?.role === 'super-admin',
    create: () => true,
    update: () => false,
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'event_name',
      type: 'select',
      required: true,
      options: [
        'tool_start', 'step_complete', 'step_abandon', 'lead_capture',
        'result_view', 'cta_diagnostico_click', 'pdf_download', 'payload_error',
      ].map((v) => ({ label: v, value: v })),
    },
    { name: 'step_id', type: 'text' },
    { name: 'result_token', type: 'text' },
    { name: 'metadata', type: 'json' },
  ],
  timestamps: true,
}

export default MapaIcpEvents
