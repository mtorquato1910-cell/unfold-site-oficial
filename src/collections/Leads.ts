import type { CollectionConfig } from 'payload'
import { syncContact } from '../lib/crm/adapter'

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
        // Origens que já sincronizam com o RD pelo próprio endpoint (sync dedicada).
        // Sem esta guarda, o hook genérico dispararia uma 2ª conversão `lead_capturado`
        // junto da conversão dedicada → dupla conversão no RD. 'calculadora' incluída
        // porque tinha o mesmo bug latente.
        const ORIGENS_COM_SYNC_PROPRIA = ['calculadora', 'guia-eleicoes']
        if (ORIGENS_COM_SYNC_PROPRIA.includes(doc.origem)) return doc
        const caminhoMap: Record<string, 'Diagnóstico' | 'Calculadora' | 'Newsletter' | undefined> = {
          diagnostico: 'Diagnóstico',
          calculadora: 'Calculadora',
          'newsletter-site': 'Newsletter',
          'diagnostico-optin': 'Newsletter',
        }
        try {
          const result = await syncContact({
            nome: doc.nome,
            email: doc.email,
            empresa: doc.empresa,
            cargo: doc.cargo,
            telefone: doc.telefone,
            origem: doc.origem,
            caminho_do_lead: caminhoMap[doc.origem],
            custom: {
              setor: doc.setor,
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
    // ── Campos legados (v0) — mantidos para compat até Sprint 6+ ───────────
    {
      name: 'tamanho_equipe',
      type: 'select',
      admin: { description: 'Legado v0 — substituído por `setor`+`faturamento_faixa` na v2.' },
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
      admin: { description: 'Legado v0 — substituído por `faturamento_faixa` (mensal) na v2.' },
      options: [
        { label: 'Até R$1MM', value: 'ate-1mm' },
        { label: 'R$1MM – R$5MM', value: '1mm-5mm' },
        { label: 'R$5MM – R$20MM', value: '5mm-20mm' },
        { label: 'R$20MM – R$100MM', value: '20mm-100mm' },
        { label: 'Acima de R$100MM', value: '100mm+' },
      ],
    },

    // ── Campos novos v2 — Etapa 1 do Diagnóstico (spec §3.2) ──────────────
    {
      name: 'setor',
      type: 'select',
      admin: { description: 'Setor da empresa — alimenta Fit Estrutural (Camada 2).' },
      options: [
        { label: 'Construção Civil / Incorporação', value: 'construcao' },
        { label: 'Agronegócio / Agroindústria', value: 'agro' },
        { label: 'Tecnologia / SaaS B2B', value: 'saas' },
        { label: 'Automotivo / Concessionárias', value: 'automotivo' },
        { label: 'Indústria', value: 'industria' },
        { label: 'Serviços B2B', value: 'servicos' },
        { label: 'Outro', value: 'outro' },
      ],
    },
    {
      name: 'faturamento_faixa',
      type: 'select',
      admin: { description: 'Faturamento mensal estimado — alimenta Fit Estrutural.' },
      options: [
        { label: 'Até R$ 50.000', value: 'ate-50k' },
        { label: 'De R$ 50.000 a R$ 200.000', value: '50k-200k' },
        { label: 'De R$ 200.000 a R$ 500.000', value: '200k-500k' },
        { label: 'Acima de R$ 500.000', value: 'acima-500k' },
        { label: 'Prefiro não informar', value: 'prefiro-nao-informar' },
      ],
    },
    {
      name: 'urgencia',
      type: 'select',
      admin: { description: 'Urgência declarada — alimenta Fit de Urgência (Camada 2).' },
      options: [
        { label: 'Neste trimestre', value: 'trimestre' },
        { label: 'Nos próximos 6 meses', value: '6-meses' },
        { label: 'Sem prazo definido, mas é prioridade', value: 'sem-prazo' },
        { label: 'Estou apenas pesquisando', value: 'pesquisando' },
      ],
    },
    {
      name: 'origem',
      type: 'select',
      required: true,
      options: [
        { label: 'Diagnóstico', value: 'diagnostico' },
        { label: 'Calculadora', value: 'calculadora' },
        { label: 'Guia Eleições 2026', value: 'guia-eleicoes' },
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
    {
      name: 'reengajamento_enviado_at',
      type: 'date',
      admin: {
        readOnly: true,
        description:
          'Quando o cron de drop-off enviou o email de retomada — idempotência (Débito 1 do QA).',
      },
    },
    {
      name: 'rd_sync_attempts',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, description: 'Número de tentativas de sync (cron incrementa)' },
    },
    { name: 'telefone', type: 'text' },
    { name: 'consentimento_lgpd', type: 'checkbox', defaultValue: false },
    { name: 'ip_address', type: 'text', admin: { readOnly: true } },
    { name: 'utm_source', type: 'text' },
    { name: 'utm_medium', type: 'text' },
    { name: 'utm_campaign', type: 'text' },
  ],
  timestamps: true,
}

export default Leads
