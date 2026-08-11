import type { CollectionConfig } from 'payload'

const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Configurações',
    description: 'Imagens e arquivos de mídia do site',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo (SEO)',
      admin: { description: 'Descreva a imagem para acessibilidade e SEO (obrigatório)' },
      // Obrigatório só no create (item 1.6): novas imagens exigem descrição;
      // docs legados sem alt continuam editáveis sem travar. Não altera schema.
      validate: (value: unknown, { operation }: { operation?: string }) => {
        if (operation === 'create' && (!value || !String(value).trim())) {
          return 'A descrição (alt) é obrigatória ao enviar uma imagem.'
        }
        return true
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Legenda',
    },
  ],
}

export default Media
