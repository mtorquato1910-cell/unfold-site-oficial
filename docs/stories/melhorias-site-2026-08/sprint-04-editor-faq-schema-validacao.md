# S04 — Editor: FAQ + dados estruturados + validações (etapa 3)

**Itens do doc:** 1.3 etapa 3 · 1.4 (FAQ com marcação técnica)
**Prioridade:** 🟡 P2 · **Risco:** Médio · **Responsável:** Torquato (campo/código) + Ferraz (conteúdo)
**Dependências:** S02, S03
**Estimativa:** 2–3 dias
**Status:** 🟢 Código implementado (branch `feat/seo-quickwins-s01`) · tsc + build OK · 2026-08-07

---

## Status de execução (2026-08-07)

**Feito no código:**
- ✅ Campo `faq` (JSON, evita tabela de array) em `Posts.ts` + migration `20260807_130000_posts_faq` + `mapPost` (filtra itens vazios, grava `null` se nenhum).
- ✅ UI painel: `FaqEditor` (adicionar / remover / reordenar pares pergunta-resposta) na seção "Perguntas frequentes".
- ✅ Render: seção **visível** `<section class="faq"><h2>Perguntas frequentes</h2>` + itens `<h3 id="faq-…">pergunta</h3><p>resposta</p>` (âncoras citáveis) — `blog/[slug]/page.tsx`.
- ✅ **FAQPage** JSON-LD (`FAQSchema`) da MESMA fonte — só emite com itens válidos (nada oculto; regra do Google).
- ✅ **Article** JSON-LD plugado no post (`ArticleSchema` já existente, agora usado) + **BreadcrumbList** novo (`BreadcrumbSchema`: Início › Blog › título). Organization/WebSite já eram globais.
- ✅ **Validações pré-publicação** (`validateArticle`): >800 palavras sem H2, H1 no corpo, salto de nível (H2→H4), imagem sem alt, FAQ <3 ou >8 — avisa ao publicar (confirm), não bloqueia.

**Pendente / notas:**
- ⏳ **Rodar migration** `20260807_130000_posts_faq` em prod (coluna `faq jsonb`).
- ⏳ Validar no browser: editor de FAQ, seção renderizada, e o JSON-LD no **Rich Results Test** (FAQPage + Article).
- ⚠️ **AC13 (pré-visualização do artigo antes de publicar) — parcial:** há a prévia do resultado de busca (SerpPreview, S02), mas não um preview do artigo renderizado. Alternativa atual: salvar como rascunho. Preview dedicado fica como refino.
- ℹ️ Validação de schema via `schema-dts` (sugestão da antiga S10) não aplicada — validação por Rich Results Test.

## Contexto

A ideia nova do documento: um campo de FAQ estruturado que gera **duas saídas ao mesmo tempo** — o HTML visível na página e a marcação técnica (JSON-LD `FAQPage`) — sem intervenção de quem escreve. Valor principal é citação por IA (ChatGPT, Claude, Perplexity, modo IA do Google) e Bing/Copilot; o rich result de FAQ do Google foi restrito em 2023 e não é o alvo.

**Estado atual (validado):**
- Não existe campo de FAQ no post nem schema `FAQPage`.
- `Organization` e `WebSite` schemas **já existem** (`src/components/SchemaOrg.tsx:3,24`, injetados em `layout.tsx:93-94`).
- `ArticleSchema` existe como função (`SchemaOrg.tsx:40`) mas **não está plugado nos posts do blog**.
- `Breadcrumb` schema não existe (há só o componente de UI).
- Existe collection `FAQs.ts` (global, pergunta/resposta/categoria) — **não confundir**: o FAQ do doc é **por artigo**, campo em `Posts`.

---

## Acceptance Criteria

### FAQ por artigo (item 1.4)
- [ ] **AC1** Campo de FAQ no post: pares pergunta/resposta, botão adicionar, reordenação. Fora do corpo do texto.
- [ ] **AC2** Renderiza HTML visível na página no padrão: `<section class="faq" aria-labelledby="faq-titulo"> <h2 id="faq-titulo"> <div class="faq-item"> <h3 id="faq-..."> + <p>`.
- [ ] **AC3** Gera automaticamente o JSON-LD `FAQPage` com `mainEntity[]` de `Question`/`acceptedAnswer`.
- [ ] **AC4** **Tudo que está na marcação está visível na página** (regra do Google; conteúdo oculto marcado = punição). A mesma fonte gera visível + JSON-LD.
- [ ] **AC5** Cada pergunta tem `id` próprio (âncora citável).
- [ ] **AC6** `h3` das perguntas dentro de uma `section` com `h2` — hierarquia correta (não repete o erro de 1.3).
- [ ] **AC7** Só habilita/exibe a seção com 3–8 perguntas preenchidas (o doc: <3 não justifica, >8 dilui — validação suave/aviso).

### Demais dados estruturados (aproveitar a mesma passada)
- [ ] **AC8** `Article` (JSON-LD) plugado nas páginas de post do blog (usar `ArticleSchema` de `SchemaOrg.tsx:40`), com autor, datas, publisher.
- [ ] **AC9** `BreadcrumbList` (JSON-LD) nas páginas com hierarquia (blog/artigo, cases).
- [ ] **AC10** Organization já existe — não duplicar.

### Validações antes de publicar
- [ ] **AC11** Aviso se: artigo >800 palavras sem nenhum H2; mais de um H1; salto de nível na hierarquia (ex.: H2→H4).
- [ ] **AC12** Aviso se há imagem sem alt (reforça 1.6).
- [ ] **AC13** Pré-visualização do artigo antes de publicar.

---

## Tarefas técnicas

### T1 — Campo FAQ + dupla saída
- [ ] `src/collections/Posts.ts` — campo `faq` (array de `{ pergunta, resposta }`).
- [ ] Helper `src/lib/seo/faq.ts` — gera (a) HTML visível e (b) objeto JSON-LD FAQPage a partir do mesmo array. Ids via slugify (reusar o slugify corrigido em S01/T5).
- [ ] `blog/[slug]/page.tsx` — renderizar a `<section class="faq">` após o corpo + injetar `<script type="application/ld+json">`.

### T2 — Article + Breadcrumb
- [ ] Plugar `ArticleSchema(...)` de `SchemaOrg.tsx` no `blog/[slug]/page.tsx`.
- [ ] Criar `BreadcrumbSchema` em `SchemaOrg.tsx` e injetar em blog/artigo e cases.
- [ ] `PageSpeed` lista "dados estruturados não validados" como verificação manual — validar contra schema.org (a Sprint 10 AC14 sugeria `schema-dts` em build time; reaproveitar).

### T3 — Validações pré-publicação
- [ ] Módulo de validação client-side no editor: conta palavras, headings, H1, saltos de nível, imgs sem alt. Bloqueia/avisa no publish.
- [ ] Pré-visualização (rota/preview do post antes de `published`).

---

## Definition of Done

- [ ] Redator adiciona 3–8 perguntas; a página mostra a seção FAQ e o `view-source` traz `FAQPage` JSON-LD válido, batendo 1:1 com o texto visível.
- [ ] Teste no Rich Results Test do Google passa para FAQPage e Article.
- [ ] Publicar artigo com 1.000 palavras sem H2 dispara aviso.
- [ ] Breadcrumb aparece nos dados estruturados de um artigo.
- [ ] Build + lint verdes; validado no browser. Levado a `main`.

---

## Riscos / atenção

- **Conteúdo oculto:** garantir que nenhuma pergunta/resposta entre no JSON-LD sem estar visível (ex.: FAQ vazio não deve emitir schema).
- **Colisão com `FAQs.ts`:** confirmar se a collection global de FAQ é usada em alguma página institucional antes de decidir reaproveitar ou deixar separada.
- **Conteúdo do FAQ é do Ferraz** (S07) seguindo as regras de escrita para IA — o campo pode nascer aqui vazio e ser preenchido depois.

---

*— SM · 2026-08-07*
