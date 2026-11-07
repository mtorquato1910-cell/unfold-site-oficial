import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Relatório técnico de SEO de 06/11/2026 — Tarefas 3 (categorias do blog) e 7
 * (llms.txt gerado).
 *
 * Schema:
 *  - categories.intro           → texto da página /blog/categoria/<slug> (editável no painel)
 *  - categories.meta_description→ resumo de busca opcional (vazio = intro)
 *  - categories.ordem           → ordem de exibição dos filtros do blog
 *  - posts.llms_optional        → post vai para a seção "Optional" do /llms.txt
 *
 * Dados (tabela da Tarefa 3): cria as 7 categorias, liga os 49 posts e marca as 11
 * URLs da Tarefa 4 como llms_optional. As categorias antigas sem nenhum post
 * ("Growth Marketing", "Construção e Incorporação", de 06/06) são removidas.
 * Idempotente: categoria existente (mesmo slug) não é recriada e post que já tem
 * categoria não é alterado.
 */

export const CATEGORIES: { nome: string; slug: string; ordem: number; posts: string[] }[] = [
  {
    nome: 'Vendas B2B',
    slug: 'vendas-b2b',
    ordem: 1,
    posts: [
      'vendas-b2b', 'processo-comercial', 'playbook-de-vendas', 'sdr', 'pipeline-de-vendas',
      'forecast-de-vendas', 'prospeccao-de-clientes', 'equipe-de-vendas', 'pos-venda',
      'lead-qualificado', 'mql-e-sql', 'funil-de-vendas', 'como-escolher-o-funil-de-vendas-certo',
      'dashboard-comercial',
    ],
  },
  {
    nome: 'Growth e marketing',
    slug: 'growth-e-marketing',
    ordem: 2,
    posts: [
      'growth-marketing', 'marketing-b2b', 'ltv', 'como-estruturar-um-time-de-growth', 'revops',
      'integracao-entre-marketing-e-vendas',
      'geracao-de-demanda-x-geracao-de-leads-por-que-mais-leads-podem-estar-piorando-suas-vendas-b2b',
      'quais-metricas-e-como-medir-em-growth-marketing', 'growth-para-vendas-complexas',
      'funil-de-marketing-x-funil-de-vendas', 'black-friday-b2b',
      'conversao-de-leads-em-2026-o-que-o-panorama-da-leadster-revela-sobre-vendas-complexas-e-por-que-o-problema-nunca-foi-gerar-leads',
    ],
  },
  {
    nome: 'Tráfego pago',
    slug: 'trafego-pago',
    ordem: 3,
    posts: ['chatgpt-ads', 'linkedin-ads', 'linkedin-para-empresas', 'como-anunciar-minha-empresa-no-google'],
  },
  {
    nome: 'CRM',
    slug: 'crm',
    ordem: 4,
    posts: ['kommo-crm', 'crm-de-vendas', 'crm-para-whatsapp'],
  },
  {
    nome: 'Incorporadoras e construção',
    slug: 'incorporadoras-e-construcao',
    ordem: 5,
    posts: [
      'automacao-de-marketing-e-vendas-para-incorporadora', 'funil-de-vendas-para-construcao-civil',
      'como-calcular-o-cac-da-incorporadora', 'agencia-de-trafego-ou-assessoria-de-growth',
      'permuta-vgv-e-funil-estrutura-financeira-e-vendas',
      'sales-enablement-para-corretores-e-comite-de-compra',
      'estande-de-vendas-digital-integracao-fisico-e-online',
      'previsibilidade-comercial-como-sair-do-mes-a-mes-na-incorporadora',
      'marketing-de-lancamento-imobiliario-antes-durante-e-depois',
      'como-qualificar-e-priorizar-leads-na-incorporadora', 'glossario-de-growth-para-incorporadora',
      'crm-para-incorporadora-como-organizar-o-funil-de-lancamento',
      'quanto-dura-o-ciclo-de-venda-de-um-imovel-na-planta',
      'quanto-investir-em-trafego-pago-para-lancamento-imobiliario',
      'marketing-e-growth-para-incorporadoras-e-construtoras',
      'por-que-sua-incorporadora-gera-leads-e-nao-fecha-vendas-e-como-resolver',
    ],
  },
  { nome: 'SEO', slug: 'seo', ordem: 6, posts: [] },
  { nome: 'Inbound marketing', slug: 'inbound-marketing', ordem: 7, posts: [] },
]

/** As 11 URLs da Tarefa 4 (rastreadas e fora do índice) → seção "Optional" do llms.txt. */
export const LLMS_OPTIONAL_SLUGS = [
  'funil-de-vendas-para-construcao-civil',
  'permuta-vgv-e-funil-estrutura-financeira-e-vendas',
  'sales-enablement-para-corretores-e-comite-de-compra',
  'como-qualificar-e-priorizar-leads-na-incorporadora',
  'funil-de-marketing-x-funil-de-vendas',
  'marketing-e-growth-para-incorporadoras-e-construtoras',
  'playbook-de-vendas',
  'dashboard-comercial',
  'pipeline-de-vendas',
  'por-que-sua-incorporadora-gera-leads-e-nao-fecha-vendas-e-como-resolver',
  'integracao-entre-marketing-e-vendas',
]

const lit = (s: string) => `'${s.replace(/'/g, "''")}'`
const list = (xs: string[]) => xs.map(lit).join(', ')

/** SQL puro (testável em transação com ROLLBACK — scripts/test-migration-categories.ts). */
export function upStatements(): string[] {
  const keep = CATEGORIES.map((c) => c.slug)
  return [
    `ALTER TABLE "site"."categories" ADD COLUMN IF NOT EXISTS "intro" varchar;`,
    `ALTER TABLE "site"."categories" ADD COLUMN IF NOT EXISTS "meta_description" varchar;`,
    `ALTER TABLE "site"."categories" ADD COLUMN IF NOT EXISTS "ordem" numeric DEFAULT 0;`,
    `ALTER TABLE "site"."posts" ADD COLUMN IF NOT EXISTS "llms_optional" boolean DEFAULT false;`,
    `UPDATE "site"."posts" SET "llms_optional" = false WHERE "llms_optional" IS NULL;`,
    // Antigas sem post: removidas (o FK de posts é ON DELETE SET NULL, mas só apaga as sem uso).
    `DELETE FROM "site"."categories" c
      WHERE c."slug" NOT IN (${list(keep)})
        AND NOT EXISTS (SELECT 1 FROM "site"."posts" p WHERE p."categoria_id" = c."id");`,
    ...CATEGORIES.map(
      (c) => `INSERT INTO "site"."categories" ("nome", "slug", "pilar", "ordem", "updated_at", "created_at")
        VALUES (${lit(c.nome)}, ${lit(c.slug)}, 'geral', ${c.ordem}, now(), now())
        ON CONFLICT ("slug") DO NOTHING;`,
    ),
    ...CATEGORIES.filter((c) => c.posts.length).map(
      (c) => `UPDATE "site"."posts" SET "categoria_id" = (SELECT "id" FROM "site"."categories" WHERE "slug" = ${lit(c.slug)})
        WHERE "categoria_id" IS NULL AND "slug" IN (${list(c.posts)});`,
    ),
    `UPDATE "site"."posts" SET "llms_optional" = true WHERE "slug" IN (${list(LLMS_OPTIONAL_SLUGS)});`,
  ]
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const stmt of upStatements()) await db.execute(sql.raw(stmt))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Dados (categorias criadas/ligações) ficam; só remove as colunas novas.
  await db.execute(sql`ALTER TABLE "site"."posts" DROP COLUMN IF EXISTS "llms_optional";`)
  await db.execute(sql`ALTER TABLE "site"."categories" DROP COLUMN IF EXISTS "ordem";`)
  await db.execute(sql`ALTER TABLE "site"."categories" DROP COLUMN IF EXISTS "meta_description";`)
  await db.execute(sql`ALTER TABLE "site"."categories" DROP COLUMN IF EXISTS "intro";`)
}
