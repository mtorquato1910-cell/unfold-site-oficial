import type { CollectionConfig } from 'payload'

/**
 * Redirects 301/302 servidos via middleware.ts (cache 60s).
 * Detecção de loops/chains feita no save (S10 AC11).
 */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'fromPath',
    defaultColumns: ['fromPath', 'toPath', 'type', 'enabled'],
    group: 'SEO',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'super-admin',
    update: ({ req }) => req.user?.role === 'super-admin',
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const fromPath = (data?.fromPath as string)?.trim()
        const toPath = (data?.toPath as string)?.trim()
        if (!fromPath || !toPath) return data

        // Self-redirect
        if (fromPath === toPath) {
          throw new Error(`Redirect inválido: ${fromPath} → ${toPath} (self-redirect)`)
        }

        // Detecta loop/chain: se toPath também é um fromPath, vira chain
        try {
          const others = await req.payload.find({
            collection: 'redirects',
            where: {
              and: [
                { fromPath: { equals: toPath } },
                ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
              ],
            },
            limit: 1,
          })
          if (others.docs.length > 0) {
            const target = others.docs[0] as any
            if (target.toPath === fromPath) {
              throw new Error(`Redirect cria loop: ${fromPath} → ${toPath} → ${fromPath}`)
            }
            throw new Error(
              `Redirect cria chain: ${fromPath} → ${toPath} → ${target.toPath}. Use destino final.`,
            )
          }
        } catch (err: any) {
          if (err?.message?.includes('loop') || err?.message?.includes('chain')) throw err
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'fromPath',
      type: 'text',
      required: true,
      unique: true,
      label: 'Origem (de)',
      admin: { description: 'Ex: /old-url ou /lighthouse/cases' },
    },
    {
      name: 'toPath',
      type: 'text',
      required: true,
      label: 'Destino (para)',
      admin: { description: 'Ex: /blog/novo-post' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [
        { label: '301 — Permanente', value: '301' },
        { label: '302 — Temporário', value: '302' },
      ],
    },
    { name: 'enabled', type: 'checkbox', defaultValue: true, index: true },
    { name: 'note', type: 'textarea', admin: { description: 'Anotação interna (opcional)' } },
  ],
  timestamps: true,
}

export default Redirects
