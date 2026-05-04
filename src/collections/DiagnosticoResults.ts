import type { CollectionConfig } from 'payload'
import { sendEmail, templateResultadoDiagnostico } from '../lib/email/adapter'

const headlinesPorNivel: Record<string, string> = {
  alto: 'Você tem um alto potencial de crescimento com tráfego pago estruturado.',
  medio: 'Com os ajustes certos, sua operação tem capacidade de escalar rapidamente.',
  baixo: 'O diagnóstico indica oportunidades claras de melhoria na sua estrutura comercial.',
}

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
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== 'create') return doc
        if (doc.email_enviado) return doc
        try {
          const headline = headlinesPorNivel[doc.nivel_fit as string] || headlinesPorNivel.medio
          const result = await sendEmail({
            to: doc.lead_email,
            subject: `Seu diagnóstico UGS — Score ${doc.score_total}/100`,
            html: templateResultadoDiagnostico(
              doc.lead_email,
              doc.score_total,
              doc.nivel_fit,
              headline,
            ),
          })
          if (result.success) {
            console.log(`[DiagnosticoResults hook] Email enviado (${result.mode}): ${result.message_id}`)
          } else {
            console.error('[DiagnosticoResults hook] Falha ao enviar email:', result.error)
          }
        } catch (err) {
          console.error('[DiagnosticoResults hook] Erro inesperado:', err)
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
      admin: { readOnly: true, description: 'JWT usado para acessar este resultado' },
    },
    {
      name: 'email_enviado',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Email de resultado enviado ao lead' },
    },
  ],
  timestamps: true,
}

export default DiagnosticoResults
