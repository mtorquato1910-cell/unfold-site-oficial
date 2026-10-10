# S07 — Autores reais: collection, página `/autor/[slug]`, ProfilePage e Person no Article

**Origem:** Plano de Ação (crítica: "trocar o author para Person, com página de autor") · Checklist M08 (Autoridade do autor) · Decisão D4 · Planilha `Autores_Artigos_Blog_Unfold.xlsx`
**Prioridade:** 🔥 P1 · **Risco:** Médio-alto (nova collection + relação em posts + migração de 42 artigos) · **Executor:** @dev (+ @data-engineer na migration) · **Revisão:** @qa
**Dependências:** S06 (`@id` da Organization para `worksFor`). Dados do cliente **P6**.
**Status:** 🟢 Implementado (2026-10-10). Autoria dos 42 posts migrada. **Falta do cliente (P6):** cargo, bios, LinkedIn, formação e experiência, preenchidos em /painel/autores. Sem bio completa, as páginas de autor ficam noindex e fora do sitemap

---

## Contexto

Hoje `autor` é texto livre em `Posts.ts:80` (default "Equipe Unfold Growth") exibido em `blog/[slug]/page.tsx:209`; o schema marca o autor como `Organization`. O Checklist M08 é explícito: "Nada de 'Equipe [empresa]'… em artigo de blog" e "Perfis de autor inventados são tratados como engano".

## Dados disponíveis

| Autor | Slug | Artigos | Tema | Foto |
|---|---|---|---|---|
| Gabriel Calheiros | `gabriel-calheiros` | 36 | Estratégia, CRM, vendas, métricas, growth, imobiliário | `assets/gabriel-calheiros.webp` (800×800, rotação EXIF corrigida) |
| Davi Brito | `davi-brito` | 6 | Mídia paga (Google/LinkedIn/ChatGPT Ads, Black Friday, orçamento de tráfego, agência × assessoria) | `assets/davi-brito.webp` (800×800, **sem a marca d'água do Gemini** — confirmar P6 que é o Davi) |

Mapa artigo → autor: `Autores_Artigos_Blog_Unfold.xlsx` (aba "Autores por artigo", 42 linhas; coluna URL → slug).
Faltam (**P6**): cargo, bio curta (2–3 linhas), bio completa (1–2 parágrafos), LinkedIn, formação, experiência, temas.

---

## Acceptance Criteria

### Modelo de dados
- [x] **AC7.1** Collection `authors` (Payload, schema `site`, migration idempotente): `name`, `slug` (único), `job_title`, `bio_short`, `bio_long` (rich/textarea), `photo` (upload → media, alt obrigatório), `linkedin_url`, `same_as` (array de URLs), `education`, `experience`, `topics` (array), `professional_registry` (opcional), `active` (checkbox).
- [x] **AC7.2** Em `posts`: relação `authors` (hasMany → `authors`) e `reviewed_by` (relação opcional → `authors`, Checklist M08 "Revisado por"). **Post não publica sem ao menos um autor** (validação no `beforeChange` quando status = publicado + validação no form do painel).
- [x] **AC7.3** Seed/migration: cria Gabriel e Davi (com as fotos de `assets/` enviadas para o storage de mídia) e associa os 42 artigos conforme a planilha (por slug). Alterar autor é ajuste técnico: usar `context: { technicalEdit: true }` (S01) para **não** mudar `content_updated_at`. Slugs da planilha que não existirem no banco → listados no relatório da migração.
- [x] **AC7.4** Campo texto `autor` antigo mantido (deprecated, oculto no painel) até a migração ser validada em produção; remoção em story futura.

### Painel
- [x] **AC7.5** Aba "Autores" no `/painel` (CRUD com foto, padrão visual do painel).
- [x] **AC7.6** No form de post (`PostsClient.tsx`): seletor de autor(es) obrigatório e revisor opcional; o `validateArticle` passa a avisar "sem autor".

### Site
- [x] **AC7.7** Byline no topo do artigo: "Por [Nome]" com link para `/autor/[slug]`, junto das datas de publicação e atualização (S01 AC1.13).
- [x] **AC7.8** Box de autor no fim do artigo: foto, nome, cargo, bio curta e link para a página do autor. Com 2 autores, um box por autor.
- [x] **AC7.9** _(trilha implementada: Início › Blog › Nome, porque não há índice /autor)_ Página `/autor/[slug]`: foto, nome, cargo, bio completa, formação, experiência, registro (se houver), links externos e **lista dos artigos do autor**. Indexável, com canonical, `og:url` e breadcrumb (Início › Autores › Nome). 404 para slug inexistente ou autor inativo.
- [x] **AC7.10** Páginas de autor no sitemap (`lastModified` = maior `content_updated_at` entre os posts do autor).

### Schema
- [x] **AC7.11** Article: `author` = lista de `Person` com `name` (só o nome, sem cargo) e `url` da página de autor (`@id: https://unfoldgrowth.com.br/autor/<slug>#person`). Com revisor: `reviewedBy` (Person).
- [x] **AC7.12** Página de autor: `ProfilePage` com `mainEntity` Person (`name`, `jobTitle`, `description`, `image`, `sameAs`, `worksFor: { "@id": "https://unfoldgrowth.com.br/#organization" }`).
- [ ] **AC7.13** Teste de Resultados Avançados + Schema Markup Validator sem erros num post e numa página de autor.

### Qualidade
- [x] **AC7.14** _(validação, schema Person e helpers testados; o mapeamento planilha → slugs foi validado contra o banco no dry-run, não em teste unitário)_ Testes: validação "não publica sem autor"; mapeamento planilha → slugs; render do schema Person; página de autor 404.
- [ ] **AC7.15** Lint, typecheck, testes e build verdes; validação no browser (post + página de autor + painel).

## Dev Notes
- Checklist M08 P2: o LinkedIn de cada autor deve citar o cargo na Unfold e linkar o site — ação do autor, registrar no OPS.
- Nenhum artigo pode ficar com "Equipe Unfold Growth" depois do deploy (query de conferência no Dev Notes).

## Definition of Done
- 42 artigos com autor real em produção, páginas de autor indexáveis no sitemap, schemas validados, painel exigindo autor.

## Registro de implementação (2026-10-10)

- **Modelo:**
  - Collection `authors`: nome, slug, cargo, bio_curta, bio_completa, foto (upload), foto_url, linkedin, perfis (json), formacao, experiencia, temas (json), registro_profissional, ativo.
  - Em `posts`: `autores` (hasMany) e `revisor`.
  - O campo texto `autor` ficou oculto e deprecado (fallback de exibição).
- **Migration `20261010_130000_authors`:**
  - Cria `authors`, **`posts_rels`** (não existia: posts não tinha relação hasMany), `posts.revisor_id` e **`payload_locked_documents_rels.authors_id`** (obrigatória para toda collection; sem ela toda escrita falha, ver `20260710_140000`).
  - Seed: Gabriel e Davi com as fotos em `public/autores/` e a autoria de todos os posts.
  - **Validada contra o banco real em transação com ROLLBACK, rodada 2×:** Davi 6 (como-anunciar…, black-friday-b2b, linkedin-ads, chatgpt-ads, agencia-de-trafego…, quanto-investir…), Gabriel 36, **0 posts sem autor**. A 2ª rodada não altera nada.
  - Mexe só em `posts_rels`, então `content_updated_at`/`updated_at` dos posts não mudam.
- **Trava de build:** `verify-schema.mjs` passou a exigir `authors`, `posts_rels.authors_id`, `posts.revisor_id` e `payload_locked_documents_rels.authors_id`.
- **Regra de publicação:** `publishMissingAuthor()` (pura, testada) roda no `beforeChange` e é checada também no form do painel.
  - Exceções: `context.technicalEdit` (scripts) e `isExternalSubmission` (o autor é o convidado).
- **Painel:**
  - `/painel/autores`: CRUD com foto (ImageInput), bios e perfis, mais o indicador "Página indexável / falta bio".
  - Exclusão é bloqueada se o autor assina artigos (o caminho é desativar).
  - No form de post: seleção de autores (checkbox) e "Revisado por".
- **Site:**
  - Byline "Por [Nome]" com link, "Revisado por" e "Publicado/Atualizado em" (S01).
  - Box de autor ao fim do artigo.
  - `/autor/[slug]`: foto, cargo, bio, formação, experiência, registro, temas, perfis (`rel="me"`) e lista de artigos.
  - Cards do /blog com os nomes reais.
- **Schema:**
  - Article virou `BlogPosting`, com `author` = `Person[]` (nome + url da página, `@id …#person`), `reviewedBy`, `image` (capa, S08) e `mainEntityOfPage`.
  - ProfilePage com Person, `worksFor` → `@id` da Organization, `sameAs` e `knowsAbout`.
- **Indexação da página de autor:** só com `bio_completa`. Sem ela, `noindex` e fora do sitemap. Com ela, entra no sitemap com lastmod do artigo mais recente do autor.
- **AC7.13 (validador do Google):** depois do deploy. **AC7.15 (browser):** validar no preview.

## QA Results — 2026-10-10 (Quinn)

**Veredito: FAIL (1 bloqueador de build) → corrigido → PASS com CONCERNS.**

**Alto risco validado com evidência:**
- Migration conferida 1:1 contra o adapter (`@payloadcms/drizzle` 3.84.1: `schema/build.js:456-590`, `traverseFields.js:716-760`): nomes, tipos, índices e FKs de `posts_rels`, `revisor_id`, `authors` e `payload_locked_documents_rels.authors_id`.
- **Dry-run com o Payload real** em transação com ROLLBACK:
  - Migrations: Davi 6, Gabriel 36, 0 sem autor, idempotente.
  - `autores: { contains: id }` e `ativo: { not_equals: false }` funcionam.
  - Update parcial mantém o autor e não mexe em `content_updated_at`.
  - Publicar sem autor é bloqueado; post de convidado é aprovado.
  - Criar e excluir autor funcionam (o lock de documentos com `authors_id` rodou sem erro).
  - Nada persistido.

| Sev. | Achado | Tratamento |
|---|---|---|
| **Alta** | `tsc` TS1501: flag de regex `/s` no teste com target ES2017 → `next build` quebraria | ✅ `[\s\S]*?` |
| Média | `reviewedBy` em BlogPosting não é válido no schema.org (é de WebPage) | ✅ nó `WebPage` próprio (`mainEntity` → `#article`, `reviewedBy`); BlogPosting ganhou `@id …#article` |
| Média | Fallback do author criava Organization com o `@id` da empresa e o nome do convidado | ✅ convidado → `Person {name}`; sem autor → `{@id org, name: Unfold Growth}`; teste novo |
| Média-baixa | Aprovar post interno sem autor dava erro genérico (server action) | ✅ `approvePost` checa antes e devolve `{ ok:false, error }`; `PostsClient` e `ReviewActions` mostram a mensagem |
| Baixa | `find limit:0` só para contar | ✅ `payload.count` |
| Baixa | Remover a foto no painel fazia a `foto_url` "reaparecer" | ✅ remover limpa as duas |
| Baixa | AC7.9 (trilha) e AC7.14 (cobertura) | ✅ notas nos ACs |
| Baixa | Trocar o slug de um autor não cria redirect | Registrado (mudança de slug de autor é rara; story futura se precisar) |
| Baixa | Desativar o único autor de um post faz o post voltar a "Unfold Growth" | Registrado (comportamento esperado; o painel avisa "(inativo)") |

## File List
- `src/collections/Authors.ts` (novo) · `payload.config.ts` (registro)
- `src/collections/Posts.ts`: `autores`, `revisor`, validação de publicação, `autor` oculto
- `src/migrations/20261010_130000_authors.ts` (novo) + `src/migrations/index.ts`
- `scripts/verify-schema.mjs`: itens da S07
- `src/lib/authors.ts` (novo) + `src/lib/__tests__/authors.test.tsx` (novo, 9 testes)
- `src/components/SchemaOrg.tsx`: `ArticleSchema` (Person, reviewedBy, image, BlogPosting) e `ProfilePageSchema`
- `src/components/site/AuthorBox.tsx` (novo)
- `src/app/(site)/autor/[slug]/page.tsx` (novo)
- `src/app/(site)/blog/[slug]/page.tsx`: byline, box, schema
- `src/app/(site)/blog/page.tsx`: nomes nos cards
- `src/app/sitemap.ts`: páginas de autor indexáveis
- `src/lib/actions/authors-actions.ts` (novo) · `src/lib/actions/posts-actions.ts` (autores/revisor)
- `src/app/(painel)/painel/autores/page.tsx` + `AutoresClient.tsx` (novos) · `src/app/(painel)/painel/posts/page.tsx` + `PostsClient.tsx` · `src/components/painel/PainelLayout.tsx` (menu)
- `public/autores/gabriel-calheiros.webp`, `public/autores/davi-brito.webp` (novos)
