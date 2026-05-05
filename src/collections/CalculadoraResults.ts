import type { CollectionConfig } from 'payload'

/**
 * Resultados da Calculadora de Tráfego.
 * Armazena PII — campos de consent obrigatórios (LGPD).
 */
export const CalculadoraResults: CollectionConfig = {
  slug: 'calculadora-results',
  labels: { singular: 'Resultado Calculadora', plural: 'Resultados Calculadora' },
  admin: {
    useAsTitle: 'empresa',
    defaultColumns: ['nome', 'email', 'empresa', 'createdAt'],
    group: 'Ferramentas',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true, // API pública cria
    update: ({ req }) => req.user?.role === 'super-admin',
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    // Identificação do solicitante
    { name: 'nome', type: 'text', required: true, index: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'empresa', type: 'text', required: true },
    { name: 'cargo', type: 'text' },
    { name: 'telefone', type: 'text' },

    // Vínculo com Lead (dedup)
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      hasMany: false,
      admin: { description: 'Lead vinculado (criado/atualizado automaticamente)' },
    },

    // Inputs do formulário (snapshot)
    {
      name: 'inputs',
      type: 'json',
      label: 'Inputs digitados',
      admin: { description: 'Snapshot completo do que o usuário preencheu' },
    },

    // Output gerado pela IA
    {
      name: 'output',
      type: 'json',
      label: 'Resultado gerado',
      admin: { description: 'Projeção/análise gerada pela IA' },
    },

    // Score (calculado)
    {
      name: 'score',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Score de qualidade do lead (0-100)' },
    },

    // Notificação Slack (alto score)
    {
      name: 'notified_slack',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: 'Marcado quando lead high-score já foi notificado no Slack' },
    },

    // Status do envio do email
    {
      name: 'emailStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Enviado', value: 'sent' },
        { label: 'Falhou', value: 'failed' },
      ],
    },

    // ── LGPD ────────────────────────────────────────────────
    {
      name: 'consent',
      type: 'group',
      label: 'Consentimento LGPD',
      fields: [
        { name: 'given', type: 'checkbox', defaultValue: false, required: true, label: 'Consentiu' },
        { name: 'timestamp', type: 'date', label: 'Quando consentiu' },
        { name: 'ip', type: 'text', label: 'IP no consentimento' },
        { name: 'userAgent', type: 'text', label: 'User-agent' },
        {
          name: 'policyVersion',
          type: 'text',
          defaultValue: 'v1.0',
          label: 'Versão da política',
        },
      ],
    },
    {
      name: 'retentionUntil',
      type: 'date',
      admin: {
        description:
          'Após esta data o registro pode ser anonimizado por job de retenção (default: 24 meses)',
      },
    },
  ],
  timestamps: true,
}

export default CalculadoraResults
