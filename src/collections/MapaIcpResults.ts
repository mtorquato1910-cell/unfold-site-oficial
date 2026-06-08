import type { CollectionConfig } from 'payload'

/**
 * Resultados do Radar de Comitê de Compra (Mapa de ICP).
 * Persiste respostas + JSON da IA + fit_score (PRD da ferramenta §8).
 * Leitura no painel; criação pelo endpoint público /api/mapa-icp.
 */
export const MapaIcpResults: CollectionConfig = {
  slug: 'mapa-icp-results',
  labels: { singular: 'Radar de Comitê', plural: 'Radar de Comitê' },
  admin: {
    useAsTitle: 'lead_email',
    defaultColumns: ['lead_email', 'empresa', 'fit_tier', 'fit_score', 'createdAt'],
    group: 'Leads & CRM',
    description: 'Leads gerados pela ferramenta Radar de Comitê de Compra (Mapa de ICP).',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true, // criado pelo endpoint público
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    // ── Lead ──
    { name: 'lead_email', type: 'email', required: true, label: 'E-mail' },
    { name: 'nome', type: 'text' },
    { name: 'empresa', type: 'text' },
    { name: 'cargo', type: 'text' },
    { name: 'telefone', type: 'text' },
    { name: 'lead', type: 'relationship', relationTo: 'leads' },

    // ── Respostas estruturadas ──
    { name: 'vende', type: 'textarea', label: 'O que vende (A1)' },
    { name: 'transformacao', type: 'textarea', label: 'Transformação (A2)' },
    { name: 'ticket_range', type: 'text', label: 'Ticket (A3)' },
    { name: 'ciclo', type: 'text', label: 'Ciclo (A4)' },
    { name: 'modelo', type: 'text', label: 'Modelo (A5)' },
    { name: 'melhores_clientes', type: 'textarea', label: 'Melhores clientes (B1)' },
    { name: 'motivos_fechamento', type: 'json', label: 'Por que fecham (B2)' },
    { name: 'cliente_ruim', type: 'textarea', label: 'Cliente que não vale (B3)' },
    { name: 'n_decisores', type: 'text', label: 'Nº decisores (C1)' },
    { name: 'areas_comite', type: 'json', label: 'Áreas do comitê (C2)' },
    { name: 'veto_owner', type: 'text', label: 'Poder de veto (C3)' },
    { name: 'objecao_principal', type: 'json', label: 'Objeção/perda (D1)' },
    { name: 'maturidade_icp', type: 'text', label: 'ICP definido (D2)' },

    // ── Saída da IA + fit ──
    { name: 'ai_result', type: 'json', label: 'Mapa gerado (JSON IA)' },
    { name: 'fit_score', type: 'number', label: 'Fit score (interno)' },
    {
      name: 'fit_tier',
      type: 'select',
      label: 'Fit tier',
      options: [
        { label: 'Alto', value: 'fit_alto' },
        { label: 'Médio', value: 'fit_medio' },
        { label: 'Baixo', value: 'fit_baixo' },
      ],
    },

    // ── Metadados ──
    { name: 'url_resultado_hash', type: 'text', unique: true, index: true },
    { name: 'origem', type: 'text', defaultValue: 'mapa-icp' },
    {
      name: 'rd_sync_status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Sincronizado', value: 'synced' },
        { label: 'Pulado', value: 'skipped' },
        { label: 'Falhou', value: 'failed' },
      ],
    },
    { name: 'email_enviado', type: 'checkbox', defaultValue: false },
    {
      name: 'consent',
      type: 'group',
      fields: [
        { name: 'given', type: 'checkbox' },
        { name: 'timestamp', type: 'text' },
        { name: 'ip', type: 'text' },
        { name: 'userAgent', type: 'text' },
        { name: 'policyVersion', type: 'text' },
      ],
    },
    { name: 'retentionUntil', type: 'text' },
    { name: 'utm', type: 'json', label: 'UTMs' },
  ],
  timestamps: true,
}

export default MapaIcpResults
