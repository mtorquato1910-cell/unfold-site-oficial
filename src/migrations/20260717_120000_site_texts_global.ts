import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Global `site-texts` — cabeçalhos (hero) editáveis das páginas do site
 * (Método, Atuação, Cases, Ferramentas, Sobre, Blog e Guia de Eleições).
 *
 * Tabela de global (linha única). IF NOT EXISTS torna idempotente — seguro para
 * re-execução e para o fluxo de dev push + migrate leniente do build.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site"."site_texts" (
      "id" serial PRIMARY KEY NOT NULL,
      "metodo_eyebrow" varchar DEFAULT 'Método Unfold',
      "metodo_title" varchar DEFAULT 'O Unfold Growth System.' NOT NULL,
      "metodo_subtitle" varchar DEFAULT 'Um framework de crescimento estruturado para operações com vendas complexas. Quatro pilares, uma lógica integrada.' NOT NULL,
      "atuacao_eyebrow" varchar DEFAULT 'Atuação',
      "atuacao_title" varchar DEFAULT 'Verticais onde o UGS opera.' NOT NULL,
      "atuacao_subtitle" varchar DEFAULT 'Cada setor tem suas próprias dinâmicas de compra, vocabulário e gargalos. Aplicamos o Unfold Growth System com micro-ângulos específicos por vertical.' NOT NULL,
      "cases_eyebrow" varchar DEFAULT 'Resultados comprovados',
      "cases_title" varchar DEFAULT 'Cases de crescimento {{secondary}}estruturado.{{/secondary}}' NOT NULL,
      "cases_subtitle" varchar DEFAULT 'Cada case é a prova do método UGS aplicado a uma operação real — com diagnóstico, estrutura e resultado mensurável.' NOT NULL,
      "ferramentas_eyebrow" varchar DEFAULT 'Ferramentas gratuitas',
      "ferramentas_title" varchar DEFAULT 'Ferramentas para diagnosticar e {{primary}}escalar sua operação.{{/primary}}' NOT NULL,
      "ferramentas_subtitle" varchar DEFAULT 'Projeções e diagnósticos práticos para entender onde sua operação de crescimento está e o que está travando — sem compromisso.' NOT NULL,
      "sobre_eyebrow" varchar DEFAULT 'Sobre a Unfold Growth',
      "sobre_title" varchar DEFAULT 'Crescimento organizado, {{primary}}resultado previsível.{{/primary}}' NOT NULL,
      "sobre_subtitle" varchar DEFAULT 'Somos uma consultoria especializada em estruturar sistemas de crescimento para empresas com vendas complexas — conectando marketing, vendas, CRM e automação em uma operação integrada e orientada a resultado.' NOT NULL,
      "blog_eyebrow" varchar DEFAULT 'Blog',
      "blog_title" varchar DEFAULT 'Conteúdo técnico sobre {{secondary}}crescimento estruturado.{{/secondary}}' NOT NULL,
      "blog_subtitle" varchar DEFAULT 'Diagnóstico, estrutura e operação — os três pilares do método UGS em forma de conhecimento aplicado.' NOT NULL,
      "guia_eyebrow" varchar DEFAULT 'ESTUDO · ELEIÇÕES 2026 · UNFOLD ✕ FEAT.WORK',
      "guia_title" varchar DEFAULT 'Guia de anúncios digitais para as {{primary}}Eleições de 2026{{/primary}}.' NOT NULL,
      "guia_subtitle" varchar DEFAULT 'Regras, plataformas, riscos e oportunidades da operação política online.' NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "site"."site_texts";`)
}
