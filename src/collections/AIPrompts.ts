import type { CollectionConfig } from 'payload'

export const AIPrompts: CollectionConfig = {
  slug: 'ai-prompts',
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'tipo', 'modelo', 'ativo'],
    group: 'IA',
    hidden: true,
  },
  fields: [
    { name: 'nome', type: 'text', required: true },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      options: [
        { label: 'Calculadora de Tráfego', value: 'calculadora' },
        { label: 'Diagnóstico', value: 'diagnostico' },
        { label: 'Geral', value: 'geral' },
      ],
    },
    { name: 'system_prompt', type: 'textarea', required: true },
    { name: 'user_prompt_template', type: 'textarea', required: true, admin: { description: 'Template com variáveis {{variavel}}' } },
    { name: 'modelo', type: 'text', defaultValue: 'anthropic/claude-sonnet-4-5' },
    { name: 'temperatura', type: 'number', defaultValue: 0.7 },
    { name: 'max_tokens', type: 'number', defaultValue: 1500 },
    { name: 'versao', type: 'number', defaultValue: 1 },
    { name: 'ativo', type: 'checkbox', defaultValue: true },
    { name: 'notas', type: 'textarea' },
  ],
  timestamps: true,
}

export default AIPrompts
