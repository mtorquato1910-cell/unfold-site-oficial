import type { CollectionConfig } from 'payload'
import { randomBytes } from 'crypto'
import { sendEmail } from '../lib/email/adapter'
import { templateResultadoDiagnosticoV2 } from '../lib/email/templates/resultado-diagnostico-v2'
import { syncDiagnosticoToRD } from '../lib/crm/rd-station'
import { notifyGabriel } from '../lib/notifications/gabriel'
import type { CodigoCaminho, CodigoInsight, FaixaFit, FaixaMaturidade } from '../lib/scoring/types'

export const DiagnosticoResults: CollectionConfig = {
  slug: 'diagnostico-results',
  admin: {
    useAsTitle: 'lead_email',
    defaultColumns: ['lead_email', 'score_total', 'nivel_fit', 'email_enviado', 'createdAt'],
    group: 'Diagnóstico',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Gera hash idempotente da URL pública apenas na criação.
        if (operation === 'create' && !data.url_resultado_hash) {
          data.url_resultado_hash = randomBytes(6).toString('hex') // 12 chars
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Apenas na criação do documento + bandeiras de idempotência (G4.6).
        if (operation !== 'create') return doc

        const faixaFit = doc.faixa_fit as FaixaFit | undefined
        const faixaConsolidada = doc.faixa_consolidada as FaixaMaturidade | undefined
        const hash = doc.url_resultado_hash as string | undefined
        const primeiroNome = String(doc.lead_email).split('@')[0]

        // ── 1. Email do resultado para o lead (v2, link /r/{hash}) ──────
        if (!doc.email_enviado && hash && faixaFit && faixaConsolidada) {
          try {
            const r = await sendEmail({
              to: doc.lead_email,
              subject: `Seu diagnóstico de growth — Score ${doc.score_total}/100`,
              html: templateResultadoDiagnosticoV2({
                primeiroNome,
                score_consolidado: doc.score_total ?? 0,
                faixa_consolidada: faixaConsolidada,
                faixa_fit: faixaFit,
                url_resultado_hash: hash,
              }),
            })
            if (r.success) {
              console.log(`[DiagnosticoResults] email enviado (${r.mode}): ${r.message_id}`)
            }
          } catch (err) {
            console.error('[DiagnosticoResults] email v2 erro:', err)
          }
        }

        // ── 2. Sincronizar com RD Station (modo mock por padrão) ────────
        if (hash) {
          try {
            const r = await syncDiagnosticoToRD({
              email: doc.lead_email,
              nome: primeiroNome,
              empresa: undefined,
              cargo: undefined,
              setor: undefined,
              faturamento_faixa: undefined,
              urgencia: undefined,
              score_consolidado: doc.score_total ?? 0,
              faixa_consolidada: faixaConsolidada ?? 'critica',
              score_fit: (doc.score_fit as number | undefined) ?? 0,
              faixa_fit: faixaFit ?? 'desfit',
              padroes_acionados: Array.isArray(doc.padroes_acionados)
                ? (doc.padroes_acionados as string[])
                : [],
              padroes_exibidos: Array.isArray(doc.padroes_exibidos)
                ? (doc.padroes_exibidos as CodigoInsight[])
                : [],
              caminhos_exibidos: Array.isArray(doc.caminhos_exibidos)
                ? (doc.caminhos_exibidos as CodigoCaminho[])
                : [],
              url_resultado: `/diagnostico/r/${hash}`,
              concluido_em: new Date().toISOString(),
            })
            if (!r.success) console.warn('[DiagnosticoResults] RD sync falhou:', r.error)
          } catch (err) {
            console.error('[DiagnosticoResults] RD sync erro:', err)
          }
        }

        // ── 3. Notificar Gabriel (Fit Alto/Médio) com idempotência ──────
        const deveNotificar =
          (faixaFit === 'fit-alto' || faixaFit === 'fit-medio') && !doc.notificado_at && hash

        if (deveNotificar) {
          try {
            const r = await notifyGabriel({
              nome_lead: primeiroNome,
              email_lead: doc.lead_email,
              empresa: undefined,
              setor: undefined,
              faixa_fit: faixaFit,
              score_consolidado: doc.score_total ?? 0,
              score_fit: (doc.score_fit as number | undefined) ?? 0,
              padroes_exibidos: Array.isArray(doc.padroes_exibidos)
                ? (doc.padroes_exibidos as string[])
                : [],
              url_resultado: `/diagnostico/r/${hash}`,
            })
            if (r.success) {
              // Marca para idempotência (sem voltar a disparar afterChange recursivamente).
              try {
                await req.payload.update({
                  collection: 'diagnostico-results',
                  id: doc.id,
                  data: { notificado_at: new Date().toISOString() } as never,
                })
              } catch (e) {
                console.warn('[DiagnosticoResults] não foi possível persistir notificado_at:', e)
              }
            }
          } catch (err) {
            console.error('[DiagnosticoResults] notify Gabriel erro:', err)
          }
        }

        return doc
      },
    ],
  },
  fields: [
    { name: 'lead_email', type: 'email', required: true },
    { name: 'lead_id', type: 'relationship', relationTo: 'leads', hasMany: false },
    {
      name: 'score_total',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      admin: { description: 'Score percentual total (0–100)' },
    },
    {
      name: 'score_diagnosticar',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Score do pilar Diagnosticar (0–100)' },
    },
    {
      name: 'score_estruturar',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Score do pilar Estruturar (0–100)' },
    },
    {
      name: 'score_operar',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Score do pilar Operar (0–100)' },
    },
    {
      name: 'score_evoluir',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Score do pilar Evoluir (0–100)' },
    },
    {
      name: 'nivel_fit',
      type: 'select',
      admin: { description: 'Legado v0 — substituído por `faixa_fit` na v2.' },
      options: [
        { label: 'Alto', value: 'alto' },
        { label: 'Médio', value: 'medio' },
        { label: 'Baixo', value: 'baixo' },
      ],
    },
    {
      name: 'respostas_raw',
      type: 'textarea',
      admin: { description: 'Array de respostas em JSON (gerado automaticamente)', readOnly: true },
    },
    { name: 'insight_id', type: 'relationship', relationTo: 'insights-variations', hasMany: false },
    {
      name: 'token_jwt',
      type: 'text',
      admin: { readOnly: true, description: 'JWT usado para acessar este resultado (legado v0)' },
    },
    {
      name: 'email_enviado',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Email de resultado enviado ao lead' },
    },

    // ── Camada 1 v2 — 5º eixo Gestão + faixa consolidada (spec §5.4, §9.2) ──
    {
      name: 'score_gestao',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Score do 5º eixo Gestão (0–100) — 3 sinais cruzados.' },
    },
    {
      name: 'faixa_consolidada',
      type: 'select',
      admin: { description: 'Faixa de maturidade do score consolidado (spec §5.5).' },
      options: [
        { label: 'Crítica', value: 'critica' },
        { label: 'Em formação', value: 'em-formacao' },
        { label: 'Estruturada', value: 'estruturada' },
        { label: 'Madura', value: 'madura' },
      ],
    },

    // ── Camada 2 v2 — Fit Comercial (spec §6) ──────────────────────────────
    {
      name: 'fit_estrutural',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Fit Estrutural (40% do score_fit) — setor + cargo + faturamento + ciclo.' },
    },
    {
      name: 'fit_dor',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Fit de Dor (30%) — curva U invertido sobre Q4+Q5+Q7.' },
    },
    {
      name: 'fit_cabeca',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Fit de Cabeça (20%) — espelho do score Gestão.' },
    },
    {
      name: 'fit_urgencia',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Fit de Urgência (10%) — vindo do campo urgência da Etapa 1.' },
    },
    {
      name: 'score_fit',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Score de Fit Comercial consolidado (0–100).' },
    },
    {
      name: 'faixa_fit',
      type: 'select',
      admin: { description: 'Roteia o CTA de agendamento (spec §6.7, §9.6).' },
      options: [
        { label: 'Fit Alto', value: 'fit-alto' },
        { label: 'Fit Médio', value: 'fit-medio' },
        { label: 'Fit Baixo', value: 'fit-baixo' },
        { label: 'Desfit', value: 'desfit' },
      ],
    },

    // ── Camada 3 v2 — Padrões + caminhos (spec §7, §8) ─────────────────────
    {
      name: 'padroes_acionados',
      type: 'json',
      admin: {
        description: 'Array com TODOS os padrões P1–P8 acionados (ex: ["P1","P3","P4"]).',
      },
    },
    {
      name: 'padroes_exibidos',
      type: 'json',
      admin: {
        description: 'Array com os 3 padrões selecionados para exibição, na ordem (top-3 ou NEUTRO_POSITIVO).',
      },
    },
    {
      name: 'caminhos_exibidos',
      type: 'json',
      admin: {
        description: 'Array com os 3 caminhos C1–C5 selecionados, na ordem.',
      },
    },

    // ── Metadados de sessão + URL pública (spec §10.1) ─────────────────────
    {
      name: 'url_resultado_hash',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Hash único da URL pública /diagnostico/r/[hash] — gerado em afterChange.',
      },
    },
    {
      name: 'data_inicio',
      type: 'date',
      admin: { description: 'Quando o lead começou a Etapa 1.' },
    },
    {
      name: 'data_conclusao',
      type: 'date',
      admin: { description: 'Quando o lead finalizou a Etapa 2.' },
    },
    {
      name: 'tempo_total_segundos',
      type: 'number',
      admin: { description: 'Duração total da sessão (Etapa 1 + Etapa 2).' },
    },
    {
      name: 'agendou',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Atualizado pelo webhook do Calendly.' },
    },
    {
      name: 'slot_agendado',
      type: 'date',
      admin: { description: 'Data/hora do slot agendado, se houver.' },
    },
    {
      name: 'respostas_etapa1_raw',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Snapshot das respostas da Etapa 1 (inclui q4_raw com a letra original, preservando semântica E vs A).',
      },
    },
    {
      name: 'notificado_at',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Quando o time interno (Gabriel) foi notificado deste resultado — flag de idempotência.',
      },
    },
    {
      name: 'nutricao_enviada_at',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Quando o email de nutrição (Automação 4) foi disparado — idempotência do cron.',
      },
    },
  ],
  timestamps: true,
}

export default DiagnosticoResults
