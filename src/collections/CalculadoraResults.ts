import type { CollectionConfig } from 'payload'
import { dispatchSlack } from '@/lib/webhooks/dispatcher'

/**
 * Resultados da Calculadora de Performance.
 *
 * v1 (legacy): campos `inputs` (json) e `output` (json) — preservados para
 *   manter renderização dos registros antigos no painel.
 * v2 (atual): 30+ campos nominados conforme spec §10.1.
 *
 * Todos os campos v2 são opcionais (não-`required`) para não quebrar registros legados.
 * O painel usa a presença de `calc_insight_principal` como flag de "registro v2".
 *
 * Armazena PII — campos de consent obrigatórios (LGPD).
 */
export const CalculadoraResults: CollectionConfig = {
  slug: 'calculadora-results',
  labels: { singular: 'Resultado Calculadora', plural: 'Resultados Calculadora' },
  admin: {
    useAsTitle: 'empresa',
    defaultColumns: ['nome', 'email', 'empresa', 'setor', 'calc_insight_principal', 'createdAt'],
    group: 'Ferramentas',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true, // API pública cria
    update: ({ req }) => req.user?.role === 'super-admin',
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // S4.4: notifica alto-valor — ticket > 50k && CRM=Sim && ROI período < 0%.
        // Idempotente via flag notified_slack já existente na collection.
        if (operation === 'update' && doc.notified_slack) return doc
        const t = Number(doc.calc_ticket_medio ?? 0)
        const crm = Boolean(doc.calc_crm_funcional)
        const roi = Number(doc.calc_roi_periodo ?? 0)
        if (!(t > 50000 && crm && roi < 0)) return doc

        const slackUrl = process.env.SLACK_WEBHOOK_URL
        if (!slackUrl) return doc

        try {
          const text = [
            `⚠️ Lead alto-valor (Calculadora) com ROI negativo`,
            `*${doc.nome}* (${doc.empresa}) — ${doc.email}`,
            `Ticket: R$ ${Math.round(t).toLocaleString('pt-BR')} · CRM: Sim · ROI: ${Math.round(roi)}%`,
            `Insight: ${doc.calc_insight_principal} · Setor: ${doc.setor}`,
          ].join('\n')
          const sent = await dispatchSlack(slackUrl, text)
          if (sent.ok) {
            // Marca como notificado sem disparar afterChange recursivo
            await req.payload.update({
              collection: 'calculadora-results',
              id: doc.id,
              data: { notified_slack: true } as never,
              depth: 0,
            })
          }
        } catch (err) {
          console.error('[calculadora afterChange] slack falhou:', err)
        }
        return doc
      },
    ],
  },
  fields: [
    // ── Identificação (Etapa 1) ─────────────────────────────────────
    { name: 'nome', type: 'text', required: true, index: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'empresa', type: 'text', required: true },
    { name: 'cargo', type: 'text' },
    { name: 'telefone', type: 'text' },
    {
      name: 'setor',
      type: 'select',
      index: true,
      options: [
        { label: 'Construção Civil / Incorporação', value: 'construcao' },
        { label: 'Agronegócio / Agroindústria', value: 'agro' },
        { label: 'Tecnologia / SaaS B2B', value: 'saas' },
        { label: 'Automotivo / Concessionárias', value: 'automotivo' },
        { label: 'Indústria', value: 'industria' },
        { label: 'Serviços B2B', value: 'servicos_b2b' },
        { label: 'Outro', value: 'outro' },
      ],
      admin: { description: 'Setor selecionado na Etapa 1 (v2). Vazio em registros legados.' },
    },

    // ── Vínculo com Lead (dedup) ────────────────────────────────────
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      hasMany: false,
      admin: { description: 'Lead vinculado (criado/atualizado automaticamente)' },
    },

    // ── Inputs Etapa 2 (v2) ─────────────────────────────────────────
    {
      name: 'calc_investimento_mensal',
      type: 'number',
      admin: { description: 'R$ por mês — Etapa 2 input 1', step: 1 },
    },
    {
      name: 'calc_canais_selecionados',
      type: 'json',
      admin: { description: 'Array de canais ex.: ["google","linkedin"]' },
    },
    { name: 'calc_ticket_medio', type: 'number', admin: { step: 1 } },
    {
      name: 'calc_modelo_negocio',
      type: 'select',
      options: [
        { label: 'B2B', value: 'b2b' },
        { label: 'B2C', value: 'b2c' },
      ],
    },
    {
      name: 'calc_periodo_meses',
      type: 'select',
      options: [
        { label: '3 meses', value: '3' },
        { label: '6 meses', value: '6' },
        { label: '12 meses', value: '12' },
      ],
    },
    { name: 'calc_crm_funcional', type: 'checkbox' },

    // ── Premissas finais (após edições, se houver) ──────────────────
    { name: 'calc_premissa_cpl', type: 'number' },
    { name: 'calc_premissa_taxa_qualif', type: 'number' },
    { name: 'calc_premissa_conv_mql_cliente', type: 'number' },
    { name: 'calc_premissa_ciclo_dias', type: 'number' },
    {
      name: 'calc_premissas_editadas',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'true se o lead alterou alguma das 4 premissas' },
    },

    // ── Resultados calculados ───────────────────────────────────────
    { name: 'calc_investimento_total', type: 'number' },
    { name: 'calc_leads_gerados', type: 'number' },
    { name: 'calc_mqls', type: 'number' },
    { name: 'calc_clientes_total', type: 'number' },
    { name: 'calc_clientes_no_periodo', type: 'number' },
    { name: 'calc_clientes_pipeline', type: 'number' },
    { name: 'calc_receita_periodo', type: 'number' },
    { name: 'calc_receita_pipeline', type: 'number' },
    {
      name: 'calc_roi_periodo',
      type: 'number',
      admin: { description: 'Percentual ROI no período. Pode ser negativo.' },
    },
    { name: 'calc_roi_total', type: 'number' },

    // ── Insight exibido ─────────────────────────────────────────────
    {
      name: 'calc_insight_principal',
      type: 'select',
      index: true,
      options: [
        { label: 'I-A — Sistema validado', value: 'I-A' },
        { label: 'I-B — Investimento incompatível', value: 'I-B' },
        { label: 'I-C — Resultado frágil sem CRM', value: 'I-C' },
        { label: 'I-D — Problema estrutural', value: 'I-D' },
      ],
      admin: { description: 'Presença deste campo identifica registros v2.' },
    },
    {
      name: 'calc_insight_override',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'true se I-E override foi exibido junto com o principal.' },
    },

    // ── Metadados de fluxo ──────────────────────────────────────────
    {
      name: 'calc_url_resultado',
      type: 'text',
      index: true,
      unique: true,
      admin: { description: 'Token UUID v4 (32 chars hex) — usado em /r/[token].' },
    },
    {
      name: 'calc_avancou_para_diagnostico',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    { name: 'calc_data_avancou_diagnostico', type: 'date' },
    {
      name: 'nutricao_step_atual',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'D+1 enviado', value: 'd1_sent' },
        { label: 'D+3 enviado', value: 'd3_sent' },
        { label: 'D+7 enviado', value: 'd7_sent' },
        { label: 'D+14 enviado', value: 'd14_sent' },
        { label: 'D+21 enviado', value: 'd21_sent' },
        { label: 'Base passiva', value: 'base_passiva' },
        { label: 'Pausada (avançou)', value: 'pausada_avancou' },
        { label: 'Pausada (consent withdrawn)', value: 'pausada_consent' },
      ],
    },

    // ── Legacy v1 (preservar para registros antigos) ────────────────
    {
      name: 'inputs',
      type: 'json',
      label: 'Inputs digitados (v1 legacy)',
      admin: {
        description: 'Snapshot v1. Usado apenas para renderizar registros antes da v2.',
        condition: (data) => !data?.calc_insight_principal,
      },
    },
    {
      name: 'output',
      type: 'json',
      label: 'Resultado gerado (v1 legacy)',
      admin: {
        description: 'Saída da IA v1. Não usado em registros v2.',
        condition: (data) => !data?.calc_insight_principal,
      },
    },

    // ── Score / lead-qualidade ──────────────────────────────────────
    {
      name: 'score',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Score de qualidade do lead (0-100) — recalculado v2.' },
    },
    {
      name: 'notified_slack',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: 'Marcado quando lead high-score já foi notificado no Slack' },
    },
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
    {
      name: 'rd_sync_status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Sincronizado', value: 'synced' },
        { label: 'Falhou', value: 'failed' },
        { label: 'Skip (feature flag)', value: 'skipped' },
      ],
    },

    // ── LGPD ────────────────────────────────────────────────────────
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
        {
          name: 'withdrawn',
          type: 'checkbox',
          defaultValue: false,
          label: 'Consent retirado (ADR-9 pausa nutrição)',
        },
        { name: 'withdrawnAt', type: 'date' },
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
