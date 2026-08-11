# S02 — Editor: hierarquia H2–H6 + cabeçalho de publicação (etapa 1)

**Itens do doc:** 1.3 etapa 1 · 1.5b (campo resumo de busca)
**Prioridade:** 🔥 P1 · **Risco:** Médio · **Responsável:** Torquato
**Dependências:** nenhuma para começar; é a peça de maior valor de SEO do editor
**Estimativa:** 2–3 dias
**Status:** 🟢 Código implementado (branch `feat/seo-quickwins-s01`) · tsc + build OK · 2026-08-07

---

## Status de execução (2026-08-07)

**Feito no código:**
- ✅ Hierarquia H2–H6 no `BlockEditor` (bloco "título": select H2–H6 com nomes técnicos "Título 2 (H2)"…, tipo `2|3|4|5|6`, parse aceita até H6). H1 não é opção no corpo (vem do título).
- ✅ Separar moldura: CTA final "Aplique esse conhecimento" (`blog/[slug]/page.tsx`) e banner lateral (`ToolBanner.tsx`) trocados de `<h2>/<h3>` para `<p>` — visual idêntico, fora da hierarquia.
- ✅ Cabeçalho de busca: campos `meta_title`/`meta_description` agora **persistidos** (schema `Posts.ts` + migration `20260807_120000_posts_seo_fields` + `mapPost`). Antes eram coletados e descartados.
- ✅ UI painel: seção "Cabeçalho de busca (SEO)" com labels "Título de busca"/"Resumo de busca", **contador de caracteres** (60/155) e **prévia do Google** (SERP).
- ✅ Render: meta description usa `meta_description || resumo`; `meta_title` (quando preenchido) vira título de busca **absoluto** (≤60, sem sufixo de marca — respeita a reescrita do Ferraz).
- ✅ Redirect de slug: `updatePost` cria redirect 301 (via `overrideAccess`, contornando `super-admin`) quando o slug de post **publicado** muda; `blog/[slug]/page.tsx` faz `permanentRedirect` consultando a tabela ao não achar o post. (Abordagem segura — não toca o middleware global.)

**Pendente / requer o dono:**
- ⏳ **Rodar a migration em produção** (`payload migrate` no deploy) — sem isso as colunas `meta_title`/`meta_description` não existem em prod.
- ⏳ **Validação no browser** do editor (H2–H6), do contador/prévia e do fluxo de troca de slug → 301.
- ℹ️ Editor de **texto corrido** (substituir o modelo de blocos) é a **S03** — aqui a hierarquia foi entregue no modelo de blocos atual.
- ℹ️ CTA e banners seguem dentro do `<article>` mas já **não são headings**; mover para fora do container é refino opcional (hierarquia já limpa).

---

## Contexto

Esta é a etapa que entrega o ganho de SEO, e é independente do modelo de edição — segundo o próprio documento, "se o escopo precisar encolher, não encolhe aqui". Três frentes: hierarquia de títulos correta, separação do corpo da moldura, e o cabeçalho de publicação com os três campos de busca.

**Estado atual do código:**
- Editor: `src/components/painel/BlockEditor.tsx` — blocos; select de título com 3 níveis rotulados "grande/médio/pequeno" (`BlockEditor.tsx:223-233`), níveis 2/3/4.
- Render público: `src/app/(site)/blog/[slug]/page.tsx` — o CTA final "Aplique esse conhecimento" é `<h2>` (`:203`) e entra no TOC; banners laterais são `<h3>` (`ToolBanner.tsx:49`).
- TOC: já existe (`src/lib/article-toc.ts` + `TableOfContents.tsx`), gera de H2/H3.
- Campo de resumo de busca separado: **não existe** — hoje `resumo` (`Posts.ts:26`) serve card **e** meta description.

---

## Acceptance Criteria

### Hierarquia H2–H6
- [ ] **AC1** O seletor de título passa a oferecer **H2, H3, H4, H5, H6** com nomenclatura técnica: "Título 2 (H2)", "Título 3 (H3)", … (não "grande/médio/pequeno").
- [ ] **AC2** O H1 **não** aparece como opção no corpo — vem exclusivamente do campo Título do cabeçalho, aplicado automaticamente (garante 1 único H1 por página).
- [ ] **AC3** O parsing HTML→editor deixa de forçar clip para [2,4] (`BlockEditor.tsx:106-109`) — passa a aceitar H2–H6.

### Separar corpo da moldura
- [ ] **AC4** O corpo do artigo é renderizado dentro de um container próprio, e a hierarquia H1–H6 existe **apenas** dentro dele.
- [ ] **AC5** Elementos de moldura saem da hierarquia de títulos (visualmente idênticos, muda só a tag): CTA final, "leia também", newsletter, banners laterais, rótulos de formulário, rodapé, navegação. Trocar `<h2>/<h3>` por elemento não-heading (`<p>`/`<div>` estilizado, com `aria-label` onde fizer sentido).
- [ ] **AC6** O TOC continua funcionando, agora refletindo só os headings do corpo do artigo.

### Cabeçalho de publicação (3 campos)
- [ ] **AC7** Antes do corpo, três campos visíveis lado a lado: **Título (H1)**, **Slug**, **Resumo de busca**.
- [ ] **AC8** Cada campo com contador de caracteres (Título ideal ≤70; Resumo ≤155).
- [ ] **AC9** **Resumo de busca é campo próprio**, separado do `resumo` do card do blog. A meta description do post passa a usar o resumo de busca (com fallback para `resumo` se vazio).
- [ ] **AC10** Pré-visualização de como o resultado aparece na busca do Google (título + url + resumo), estilo WordPress.
- [ ] **AC11** Ao alterar o slug de um artigo já publicado, aviso visível **e** criação automática de redirect 301 do slug antigo → novo.

---

## Tarefas técnicas

### T1 — Níveis de heading (H2–H6)
- [ ] `BlockEditor.tsx:223-233` — expandir o select para H2–H6 com labels técnicos.
- [ ] `RichTextEditor.tsx:52` já configura `heading: { levels: [1,2,3,4] }` — ajustar para `[2,3,4,5,6]` (remover H1 do corpo) e refletir na toolbar (`:161-166`).
- [ ] `BlockEditor.tsx:106-109` — remover o clamp [2,4]; aceitar 2–6.
- [ ] `src/lib/html-sanitize.ts:19` já permite h1–h6 na allowlist — ok.

### T2 — Container do corpo + moldura fora da hierarquia
- [ ] `blog/[slug]/page.tsx` — envolver o `<RichContent>` num container semântico (`<article>`/container dedicado).
- [ ] Trocar o `<h2>` do CTA (`:203`) por elemento não-heading estilizado.
- [ ] `ToolBanner.tsx:49` — `<h3>` do banner → não-heading (ou manter fora do `<article>`).
- [ ] Revisar footer/nav/newsletter/"leia também" — garantir nenhum heading fora do `<article>`.
- [ ] `src/lib/article-toc.ts` — garantir que `addHeadingIds` processa só o HTML do corpo (já recebe `conteudo_html`, então ok; validar que nada de moldura entra).

### T3 — Cabeçalho de publicação + resumo de busca
- [ ] `src/collections/Posts.ts` — adicionar campo `resumo_busca` (textarea, max 155, admin description). Manter `resumo` para card.
- [ ] `blog/[slug]/page.tsx:67` — `description: post.resumo_busca || post.resumo`.
- [ ] UI do painel (form de post em `src/components/painel/` / PostsClient) — três campos no topo com contadores + preview Google.
- [ ] Slug: aviso ao editar publicado + registrar redirect. **Escopo obrigatório (não condicional):** a collection `Redirects` já existe (`src/collections/Redirects.ts`, registrada em `payload.config.ts:112`), mas há dois furos a resolver:
  - **Servir o 301:** o `middleware.ts` atual **não consulta** a tabela `redirects` e o `config.matcher` (`:134-152`) não cobre `/blog/[slug]`. Adicionar lookup de redirect no middleware + estender o matcher (ou fazer `redirect()`/`notFound()` na própria page do slug).
  - **Permissão:** `Redirects.ts:16-18` exige `super-admin` no create, mas todos os usuários do painel são `editor`. Criar o redirect via **server action com Local API privilegiada** (`overrideAccess`), não pela permissão do usuário.
  - **Migration:** o novo campo `resumo_busca` em `Posts` exige migration (Postgres `push:false`).

---

## Definition of Done

- [ ] Escritor consegue aplicar H2–H6 vendo o nome técnico do nível.
- [ ] Não é possível inserir H1 no corpo.
- [ ] `view-source` de um artigo: headings de CTA/newsletter/banner não são mais `<h2>/<h3>`; só o conteúdo do artigo tem hierarquia.
- [ ] Post tem campo de resumo de busca separado, com contador e preview.
- [ ] Trocar slug de post publicado cria 301 e não gera 404.
- [ ] Build + lint verdes; validado no browser (painel + artigo público). Levado a `main`.

---

## Riscos / atenção

- **Regressão visual da moldura:** trocar tag de heading por não-heading pode alterar espaçamento/estilo. Garantir classes equivalentes (visual idêntico).
- **Meta description dupla fonte:** durante transição, posts sem `resumo_busca` caem no `resumo` — comportamento atual preservado, sem quebra.
- **Redirect de slug:** definir onde a tabela de redirects vive (middleware + cache) para não exigir rebuild.

---

*— SM · 2026-08-07*
