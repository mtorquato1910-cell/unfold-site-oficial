import type { GlobalConfig } from 'payload'

/**
 * Textos editáveis dos cabeçalhos (hero) de cada página do site.
 *
 * A home NÃO fica aqui — o hero da home já é editado em HomeSettings
 * (home-settings). Este global cobre as demais páginas: Método, Atuação,
 * Cases, Ferramentas, Sobre, Blog e o Guia de Eleições.
 *
 * Convenção de destaque nos títulos: envolva o trecho colorido com
 * {{primary}}...{{/primary}} (mint) ou {{secondary}}...{{/secondary}}.
 */
const hero = (
  label: string,
  eyebrow: string,
  title: string,
  subtitle: string,
) => ({
  label,
  fields: [
    {
      name: `${label.toLowerCase()}_eyebrow`,
      type: 'text' as const,
      label: 'Tagline pequena (mono uppercase)',
      defaultValue: eyebrow,
    },
    {
      name: `${label.toLowerCase()}_title`,
      type: 'textarea' as const,
      label: 'Título principal',
      required: true,
      defaultValue: title,
      admin: {
        description:
          'Use {{primary}}texto{{/primary}} (mint) ou {{secondary}}texto{{/secondary}} para destacar um trecho.',
      },
    },
    {
      name: `${label.toLowerCase()}_subtitle`,
      type: 'textarea' as const,
      label: 'Subtítulo / descrição',
      required: true,
      defaultValue: subtitle,
    },
  ],
})

const SiteTexts: GlobalConfig = {
  slug: 'site-texts',
  label: 'Textos das páginas',
  admin: {
    group: 'Configurações',
    description: 'Cabeçalhos (hero) editáveis de cada página do site',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        hero(
          'metodo',
          'Método Unfold',
          'O Unfold Growth System.',
          'Um framework de crescimento estruturado para operações com vendas complexas. Quatro pilares, uma lógica integrada.',
        ),
        hero(
          'atuacao',
          'Atuação',
          'Verticais onde o UGS opera.',
          'Cada setor tem suas próprias dinâmicas de compra, vocabulário e gargalos. Aplicamos o Unfold Growth System com micro-ângulos específicos por vertical.',
        ),
        hero(
          'cases',
          'Resultados comprovados',
          'Cases de crescimento {{secondary}}estruturado.{{/secondary}}',
          'Cada case é a prova do método UGS aplicado a uma operação real — com diagnóstico, estrutura e resultado mensurável.',
        ),
        hero(
          'ferramentas',
          'Ferramentas gratuitas',
          'Ferramentas para diagnosticar e {{primary}}escalar sua operação.{{/primary}}',
          'Projeções e diagnósticos práticos para entender onde sua operação de crescimento está e o que está travando — sem compromisso.',
        ),
        hero(
          'sobre',
          'Sobre a Unfold Growth',
          'Crescimento organizado, {{primary}}resultado previsível.{{/primary}}',
          'Somos uma consultoria especializada em estruturar sistemas de crescimento para empresas com vendas complexas — conectando marketing, vendas, CRM e automação em uma operação integrada e orientada a resultado.',
        ),
        hero(
          'blog',
          'Blog',
          'Conteúdo técnico sobre {{secondary}}crescimento estruturado.{{/secondary}}',
          'Diagnóstico, estrutura e operação — os três pilares do método UGS em forma de conhecimento aplicado.',
        ),
        hero(
          'guia',
          'ESTUDO · ELEIÇÕES 2026 · UNFOLD ✕ FEAT.WORK',
          'Guia de anúncios digitais para as {{primary}}Eleições de 2026{{/primary}}.',
          'Regras, plataformas, riscos e oportunidades da operação política online.',
        ),
      ],
    },
  ],
}

export default SiteTexts
