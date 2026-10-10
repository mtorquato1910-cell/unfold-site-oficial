import type { CollectionConfig } from 'payload'

/**
 * Autores reais dos artigos (S07 — épico seo-tecnico-2026-10; Checklist SEO M08).
 *
 * O Google pede autoria precisa e real (E-E-A-T): todo artigo sai com ao menos uma
 * pessoa como autora, com página própria (/autor/[slug]) e marcada como Person no
 * schema. "Equipe Unfold Growth" não vale como autor de artigo.
 *
 * A página do autor só é indexável quando a bio completa estiver preenchida —
 * página rala (só nome e foto) não ajuda e pode atrapalhar.
 */
export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Autor', plural: 'Autores' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'cargo', 'ativo'],
    group: 'Blog',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'nome', type: 'text', required: true, admin: { description: 'Como o autor assina profissionalmente.' } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL da página do autor: /autor/<slug>' },
    },
    { name: 'cargo', type: 'text', admin: { description: 'Cargo atual na empresa.' } },
    { name: 'bio_curta', type: 'textarea', admin: { description: '2 ou 3 linhas — aparece no box ao fim do artigo.' } },
    {
      name: 'bio_completa',
      type: 'textarea',
      admin: { description: '1 ou 2 parágrafos — página do autor. Sem ela, a página fica fora do Google (noindex).' },
    },
    { name: 'foto', type: 'upload', relationTo: 'media', admin: { description: 'Quadrada, rosto visível.' } },
    {
      name: 'foto_url',
      type: 'text',
      admin: { description: 'Alternativa à foto enviada (ex.: arquivo estático em /autores/).' },
    },
    { name: 'linkedin', type: 'text', admin: { description: 'URL do perfil no LinkedIn.' } },
    {
      name: 'perfis',
      type: 'json',
      admin: { description: 'Outros perfis oficiais (lista de URLs): Instagram profissional, YouTube, Lattes, site pessoal.' },
    },
    { name: 'formacao', type: 'textarea', admin: { description: 'Graduação, pós, cursos relevantes.' } },
    { name: 'experiencia', type: 'textarea', admin: { description: 'Anos de atuação e especialidades.' } },
    { name: 'temas', type: 'json', admin: { description: 'Temas que assina (lista de textos).' } },
    { name: 'registro_profissional', type: 'text', admin: { description: 'OAB, CRM, CRC, CREA etc., quando houver.' } },
    { name: 'ativo', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
}

export default Authors
