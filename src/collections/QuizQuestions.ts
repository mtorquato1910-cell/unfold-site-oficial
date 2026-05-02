import type { CollectionConfig } from 'payload'

export const QuizQuestions: CollectionConfig = {
  slug: 'quiz-questions',
  admin: {
    useAsTitle: 'pergunta',
    defaultColumns: ['pergunta', 'pilar', 'peso', 'ordem'],
    group: 'Diagnóstico',
  },
  fields: [
    {
      name: 'pergunta',
      type: 'text',
      required: true,
      admin: { description: 'Texto da pergunta exibida ao usuário' },
    },
    {
      name: 'pilar',
      type: 'select',
      required: true,
      options: [
        { label: 'Diagnosticar', value: 'diagnosticar' },
        { label: 'Estruturar', value: 'estruturar' },
        { label: 'Operar', value: 'operar' },
        { label: 'Evoluir', value: 'evoluir' },
      ],
    },
    {
      name: 'peso',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: { description: 'Peso da pergunta no cálculo do score (1–3)' },
    },
    {
      name: 'ordem',
      type: 'number',
      required: true,
      admin: { description: 'Ordem de exibição (1–12)' },
    },
    {
      name: 'opcoes',
      type: 'array',
      required: true,
      minRows: 4,
      maxRows: 5,
      admin: { description: 'Opções de resposta (A, B, C, D)' },
      fields: [
        { name: 'texto', type: 'text', required: true },
        {
          name: 'valor',
          type: 'number',
          required: true,
          admin: { description: 'Valor numérico da opção (0–4)' },
        },
      ],
    },
    {
      name: 'ativo',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'nota_interna',
      type: 'textarea',
      admin: { description: 'Notas internas para substituição futura' },
    },
  ],
}

export default QuizQuestions
