# Relatório técnico de SEO — 06/11/2026 (Gabriel / SEO)

Fonte: `Relatorio_Tecnico_SEO_Unfold_Desenvolvedor.docx` (7 tarefas). Implementado em 07/11/2026.
Dados do banco conferidos antes: 49 posts publicados, 79 links internos com nofollow em 7 posts,
319 de 368 externos com nofollow em 44 posts, nenhum post com categoria — batem com o relatório.

## Status por tarefa

| # | Tarefa | Código | Pendente fora do código |
|---|--------|--------|-------------------------|
| 1 | Remover nofollow dos links | [x] | [ ] rodar `--apply` (backup automático) e pedir rastreio das 49 URLs no GSC |
| 2 | Evento `generate_lead` | [x] | [ ] GTM e GA4 (lista abaixo) |
| 3 | Categorias do blog | [x] | [ ] SEO preencher as intros em /painel/categories |
| 4 | Artigos relacionados | [x] | — |
| 5 | agencialighthouse.com | [x] | [ ] acesso à GoDaddy + domínios na Vercel + DNS |
| 6 | Peso das páginas / GTM | diagnóstico | [ ] remover Clarity do GTM, rodar PageSpeed mobile |
| 7 | llms.txt gerado | [x] | [ ] `node scripts/check-llms-sitemap.mjs` após o deploy |

## O que mudou

**Tarefa 1.** Regra única em `src/lib/link-attrs.ts`, aplicada no save (`html-sanitize.ts`) e no backfill
(`scripts/normalize-content-links.ts`): interno → relativo, sem `rel`/`target`; externo →
`target="_blank" rel="noopener"`. Editor TipTap com `rel: null, target: null`.
Prévia em 07/11: 44 posts · 253 links internos · 319 externos.
`npx tsx scripts/normalize-content-links.ts --apply` (não altera `content_updated_at`; `--rollback <backup>` desfaz).

**Tarefa 2.** `trackLead(formId)` (`src/lib/analytics/lead-event.ts`) faz `dataLayer.push({ event: 'generate_lead', form_id, page_path })`
somente após a resposta de sucesso. `form_id`: `contato`, `diagnostico`, `calculadora-trafego` (1º envio aceito de cada token),
`mapa-icp`, `newsletter`, `guia-eleicoes`, `guia-eleicoes-consultoria`. O formulário /blog/contribuir não é lead e ficou de fora.

Passos no GTM/GA4 (manuais, conta Google):
- [ ] GTM: gatilho de evento personalizado `generate_lead` → tag de evento GA4 `generate_lead` (parâmetros `form_id`, `page_path` via variáveis da camada de dados)
- [ ] GTM: remover gatilhos antigos de envio de formulário que disparam a mesma tag
- [ ] GTM: remover a tag do Clarity (Tarefa 6) e publicar o contêiner
- [ ] GA4: marcar `generate_lead` como evento-chave; desmarcar page_view, session_start, user_engagement, first_visit, scroll, click, file_download, form_start
- [ ] GA4: regra de tráfego interno com os IPs da equipe + ativar o filtro
- [ ] GA4: referências indesejadas `vercel.com` e `search.google.com`
- [ ] Testar cada formulário com envio real no DebugView

**Tarefa 3.** Migration `20261107_120000_blog_categories` (roda no deploy): colunas `categories.intro/meta_description/ordem`
e `posts.llms_optional`; cria as 7 categorias da tabela, liga os 49 posts, marca as 11 URLs da Tarefa 4 como
`llms_optional` e remove as 2 categorias antigas sem post ("Growth Marketing", "Construção e Incorporação").
Testada no banco real com ROLLBACK (`npx tsx scripts/test-migration-categories.ts`): 49/49 posts com categoria.
Rota `/blog/categoria/[slug]` (H1, intro, lista, BreadcrumbList, canonical próprio); categoria sem artigo
responde 404 e fica fora do sitemap. Selo da categoria com link em /blog, na home e no artigo (sem "Geral").
Filtros de categoria no /blog. Painel: Categorias com intro/resumo de busca/ordem; post com seletor de categoria
(antes era texto livre e não salvava) e a opção "Secundário no llms.txt".

**Tarefa 4.** Bloco "Leia também" no artigo (HTML do servidor, `<a>` simples): 3 da mesma categoria, as 11 URLs
prioritárias primeiro (com rotação por artigo para todas receberem links — coberto por teste), completando com
as mais recentes.

**Tarefa 5.** `src/lib/lighthouse-redirects.ts`, primeiro bloco do `redirects()` no `next.config.ts`.
Pendente: acesso GoDaddy → adicionar `agencialighthouse.com` e `www.agencialighthouse.com` ao projeto na Vercel →
apontar DNS → `curl -I` nas URLs com e sem www (esperado: 308 direto, destino 200). Manter até 11/2027.

**Tarefa 6 (diagnóstico de 07/11).** A API pública do PageSpeed estava sem cota; medir manualmente.
- GTM-M43H2LKF: 170 KB comprimido (504 KB sem compressão) e **ainda contém o Clarity**.
- PostHog: está em produção (chave no bundle), mas só carrega após o aceite de cookies (LGPD, `lazyOnload`), por isso
  não aparece no HTML nem no Lighthouse.
- JS+CSS do próprio site: ~200 KB comprimido em / e em /blog/kommo-crm. Imagens do kommo-crm: capa ~33 KB (otimizada),
  imagem do corpo ~60 KB. O peso restante vem de terceiros (GTM, Clarity, RD) e do vídeo do hero.
- [ ] PageSpeed mobile em `/` e `/blog/kommo-crm`: registrar elemento de LCP e as 5 requisições mais pesadas.

**Tarefa 7.** Fonte única `src/lib/site-index.ts` (+ `site-index-server.ts`) para o `sitemap.xml` e o `/llms.txt`.
O llms.txt passa a ter /ferramentas, autores, seções por categoria e "Optional" (`llms_optional`).
Revalidação em posts, cases, autores e categorias. Teste de paridade no `vercel-build.sh` (falha o build se divergir)
e `scripts/check-llms-sitemap.mjs` para o site no ar (em 07/11, antes do deploy: 63 × 60, faltando /ferramentas e os 2 autores).

## File List

- `src/lib/link-attrs.ts`, `src/lib/html-sanitize.ts`, `src/components/painel/RichTextEditor.tsx`, `scripts/normalize-content-links.ts`
- `src/lib/analytics/lead-event.ts` + 7 formulários
- `src/migrations/20261107_120000_blog_categories.ts`, `src/migrations/index.ts`, `scripts/verify-schema.mjs`, `scripts/test-migration-categories.ts`
- `src/collections/Categories.ts`, `src/collections/Posts.ts`
- `src/lib/blog-categories.ts`, `src/lib/blog-data.ts`, `src/components/site/PostCard.tsx`, `src/components/site/CategoryNav.tsx`
- `src/app/(site)/blog/page.tsx`, `src/app/(site)/blog/[slug]/page.tsx`, `src/app/(site)/blog/categoria/[slug]/page.tsx`
- `src/lib/insights.ts`, `src/components/home/Insights.tsx`
- `src/app/(painel)/painel/categories/*`, `src/app/(painel)/painel/posts/*`, `src/lib/actions/{categories,posts,authors}-actions.ts`
- `src/lib/lighthouse-redirects.ts`, `next.config.ts`
- `src/lib/site-index.ts`, `src/lib/site-index-server.ts`, `src/lib/llms-txt.ts`, `src/app/llms.txt/route.ts`, `src/app/sitemap.ts`
- `scripts/check-llms-sitemap.mjs`, `scripts/vercel-build.sh`
- Testes: `src/lib/__tests__/seo-relatorio-2026-11.test.ts`, `src/lib/__tests__/llms-indexnow.test.ts`
