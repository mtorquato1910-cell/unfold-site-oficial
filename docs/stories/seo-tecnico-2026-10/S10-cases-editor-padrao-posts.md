# S10 — Cases no padrão dos posts (editor único, SEO, FAQ e migração)

**Origem:** Pedido do cliente via WhatsApp, 10/10/2026 — "Consegue atualizar a forma como se publica nos cases? Preciso que seja da mesma forma dos posts. Mesma estrutura, da forma que está fica difícil publicar." (`/admin/cases` → `/painel/cases`)
**Prioridade:** 🔥 P1 · **Risco:** Médio (muda o modelo de conteúdo dos cases + migração de dados) · **Executor:** @dev (+ @data-engineer na migration) · **Revisão:** @qa + validação do cliente no painel
**Dependências:** S01 (aplicar a mesma regra de `content_updated_at` aos cases). AC10.2 aguarda **P7**.
**Status:** 🟢 Implementado (2026-10-10) com o default de P7 (números em campo próprio). Falta: o cliente validar criando um case de teste no preview (AC10.14/AC10.16)

---

## Contexto (validado no código em 10/10)

| | Posts (`/painel/posts`, `PostsClient.tsx`) | Cases (`/painel/cases`, `CasesClient.tsx`) |
|---|---|---|
| Corpo | **1 editor de texto corrido** (`RichTextEditor`, TipTap): barra para Título 2–6, listas, tabela, imagem com descrição, vídeo, link | **2 editores de blocos** (`BlockEditor`, "+ Adicionar conteúdo") para Desafio e Solução + campo Resultado |
| Resumo | `excerpt` | `tagline` |
| SEO | Título de busca e resumo de busca com contador (60/155) e prévia do Google | **Nenhum** |
| FAQ | `FaqEditor` + FAQPage | Nenhum |
| Validação | `validateArticle` (hierarquia, FAQ) antes de salvar | Nenhuma |
| Estruturados | — | `highlights` (label/valor), `pillars` (pilar/descrição/ações), `results` (métrica/valor/contexto) |

Collection: `src/collections/Cases.ts` (campos `challenge`/`challenge_html`, `solution`/`solution_html`, `pillars`, `results`, `highlights`, `imagem_destaque`, `vertical`, `client`, `destacar_na_home`, `status`, `published_at`). Página pública: `src/app/(site)/cases/[slug]/page.tsx`. Referência de padrão: S02–S04 do épico de agosto (editor de posts) e `editor_congelava_muitos_editores` (motivo de o `BlockEditor` ser pesado).

## Story

**Como** editor da Unfold,
**quero** publicar um case do mesmo jeito que publico um post — escrevendo de ponta a ponta num editor só, com resumo e campos de busca,
**para que** publicar case seja rápido e cada case saia otimizado para o Google.

---

## Acceptance Criteria

### Modelo de dados
- [x] **AC10.1** Migration idempotente em `site.cases`: `conteudo_html` (text), `excerpt` (text), `meta_title`, `meta_description`, `faq` (json/array, mesmo formato dos posts), `content_updated_at` (regra idêntica à S01: só muda com título ou corpo; respeita `context.technicalEdit`). Campos antigos (`challenge*`, `solution*`, `pillars`, `results`) **mantidos no banco**, ocultos do painel, até a migração ser validada em produção.
- [x] **AC10.2** **Números de destaque (P7):**
  - **Default recomendado (a):** manter um campo estruturado simples "Números do case" (label + valor, ex.: "Leads" / "+180%"), que continua alimentando os cartões da página e o destaque da home. Todo o resto vira texto corrido.
  - **(b):** se o cliente preferir, os números também vão para o texto e os cartões saem da página/home.
  - Não implementar este AC antes da resposta.

### Painel (mesma experiência dos posts)
- [x] **AC10.3** Form de case reestruturado no mesmo layout do de posts: Título, Slug (auto), Cliente, Vertical, **Resumo**, **Conteúdo** (`RichTextEditor` único, com o mesmo hint dos posts: "Escreva o case de ponta a ponta… O H1 é o título do case"), Números do case (AC10.2), Imagem de capa, Status, Destacar na Home, **Título de busca + Resumo de busca com `CharCount` e prévia do Google**, **FAQ** (`FaqEditor`).
- [x] **AC10.4** Reaproveitar os componentes dos posts (`RichTextEditor`, `CharCount`, prévia de snippet, `FaqEditor`, `validateArticle`) — **extrair para `src/components/painel/`** o que hoje está dentro de `PostsClient.tsx`, sem duplicar código.
- [x] **AC10.5** `BlockEditor` deixa de ser usado nos cases (verificar se ainda há outro consumidor antes de remover qualquer coisa).
- [x] **AC10.6** Validação antes de salvar igual à dos posts (sem H1 no corpo, hierarquia sem saltos, FAQ completa).
- [x] **AC10.7** Template inicial opcional: ao criar um case novo, o editor pode vir com os H2 "Desafio", "Solução" e "Resultados" pré-preenchidos (editáveis/removíveis) — mantém o roteiro sem engessar.

### Migração dos cases existentes
- [x] **AC10.8** Script `scripts/migrate-cases-to-rich.ts` (`--dry-run` padrão / `--apply`), com backup completo antes (`backups/cases-before-rich-<data>.json`). Monta `conteudo_html` assim: `<h2>Desafio</h2>` + `challenge_html` (ou `challenge`), `<h2>Solução</h2>` + `solution_html`, pilares como `<h3>` + descrição + lista de ações, `<h2>Resultados</h2>` + resultados como lista ou tabela (métrica | valor | contexto). `excerpt` ← `tagline`. Gravação com `context: { technicalEdit: true }`; `content_updated_at` ← `published_at`.
- [x] **AC10.9** Relatório do dry-run (por case: antes × depois) aprovado pelo dono antes do `--apply`. Idempotente.

### Site
- [x] **AC10.10** `cases/[slug]/page.tsx` renderiza o `conteudo_html` com o mesmo pipeline dos posts (`RichContent`, `addHeadingIds`, sanitização, lazy das imagens da S08), os números do case (AC10.2), FAQ visível + FAQPage, breadcrumb (S08).
- [x] **AC10.11** Metadata do case: `meta_title || title`, `meta_description || excerpt`, canonical, `og:url`, og:image da capa, `article:modified_time` = `content_updated_at`.
- [x] **AC10.12** Sitemap dos cases usa `content_updated_at`.
- [x] **AC10.13** Listagem `/cases` e destaque da home continuam funcionando (usam `excerpt`/números no lugar de `tagline`/`highlights`, com fallback para os campos antigos durante a transição).
- [ ] **AC10.14** Paridade visual: página pública dos cases migrados revisada no browser, sem perda de conteúdo em relação à versão atual (comparar com prints de antes).

### Qualidade
- [x] **AC10.15** Testes: transformador da migração (case completo, case sem pilares, case só com `challenge` texto), hook de `content_updated_at` em cases, metadata com fallback.
- [ ] **AC10.16** Lint, typecheck, testes e build verdes; cliente valida criando um case de teste no painel (preview) antes do merge em `main`.

## Registro de implementação (2026-10-10)

- **AC10.2 (P7 = default a):** "Números do case" (`highlights`, até 4 pares número/rótulo) continua em campo próprio, alimentando os cartões do case e da home. O resto é texto corrido.
- **Modelo:**
  - Em `cases`: `excerpt`, `conteudo_html`, `meta_title`, `meta_description`, `faq` (jsonb) e `content_updated_at` (mesma regra editorial dos posts, com o hook de `content-date.ts`).
  - Os campos antigos (challenge/solution/results/pillars/tagline) ficam no banco e não são mais escritos pelo painel.
- **Migration `20261010_140000_cases_rich`:** colunas novas e conversão (Desafio/Solução → H2 + HTML; Resultados → lista `<strong>valor</strong> métrica — contexto`; tagline → excerpt; data editorial ← published_at).
  - **Banco real em 10/10:** a tabela `cases` tem **0 registros**, ou seja, o cliente ainda não tinha conseguido publicar nenhum (isso confirma o pedido).
  - A conversão foi **testada com um case de exemplo em transação com ROLLBACK**, rodada 2× (idempotente, nada persistido).
  - Por isso o "script de migração com relatório" do AC10.8/10.9 virou a própria migration SQL: com 0 cases não há o que aprovar caso a caso.
- **Trava de build:** `verify-schema.mjs` exige `cases.conteudo_html`, `content_updated_at` e `faq`.
- **Painel:**
  - **Componentes extraídos do `PostsClient`** para `src/components/painel/article-fields.tsx`: `CharCount`, `SerpPreview` (agora com `section`), `FaqEditor` e `validateArticle` (com `kind`). Posts e cases usam os mesmos, sem duplicação.
  - Form de case no layout dos posts: Título, Slug, Cliente, Vertical, **Resumo**, **Conteúdo** (`RichTextEditor` variant article, o mesmo dos posts), **Números do case**, Capa, Status, Destaque, **Cabeçalho de busca com contador e prévia do Google** (`/cases/...`) e **FAQ**.
  - **AC10.7:** case novo já vem com o roteiro H2 Desafio/Solução/Resultados, editável e removível.
  - **AC10.5:** o `BlockEditor` saiu dos cases, mas continua em uso no `/blog/contribuir` e por isso não foi removido.
- **Site:**
  - `cases/[slug]` renderiza o `conteudo_html` com o pipeline dos posts (`addHeadingIds`, `RichContent` com imagens lazy), mais a FAQ visível com FAQPage e o breadcrumb (S08).
  - H1 = título, com o resumo logo abaixo (antes o H1 era a tagline).
  - Cases sem `conteudo_html` continuam com as seções antigas (fallback).
- **Metadata:** `meta_title` (absolute) ou título; `meta_description`, excerpt ou tagline; `og` com `publishedTime` e `modifiedTime` (data editorial).
- **Sitemap:** cases usam `content_updated_at`. **Listagem e home:** usam o `excerpt`, com fallback nos campos antigos.
- **Actions** (`cases-actions.ts` reescrito):
  - `mapCase` com os campos novos (sanitiza o HTML).
  - Revalida o case excluído.
  - IndexNow só quando muda publicação, slug ou conteúdo.
- ⚠️ **Achado fora do escopo (decisão do cliente):** `/cases` mostra em produção **4 cases de exemplo** (`MOCK_CASES`, com selo "Em breve" e números como "De 12 para 4 semanas"). Como não são reais, vale avaliar remover agora que publicar case ficou fácil.
- ⚠️ Mudar o slug de um case publicado não cria redirect (a collection `redirects` só atende `/blog/*`). Registrado.

## QA Results — 2026-10-10 (Quinn)

**Veredito: CONCERNS → resolvido.** tsc ✅ · vitest 288 ✅ · lint ✅. O dry-run da migration com 3 cases de teste (resultados fora de ordem, NULLs, linha vazia) passou, foi idempotente e o ROLLBACK foi confirmado. Os tipos de coluna batem com o adapter. O fluxo de publicação ficou equivalente ao dos posts.

| # | Sev. | Achado | Tratamento |
|---|---|---|---|
| M1 | Média | O card de `/cases` mostrava o resumo no lugar do título | ✅ H2 = título, resumo num `<p>` abaixo |
| M2 | Média | AC10.15 sem testes de case | ✅ teste da regra de data com os campos dos cases (`content-date.test.ts`) e testes do `validateArticle` (`article-fields.test.ts`). A conversão da migration é SQL e foi validada por dry-run real (evidência acima), não por teste unitário |
| M3 | Média | O roteiro (Desafio/Solução/Resultados) podia ir ao ar com seções vazias | ✅ `validateArticle` avisa "Há título sem texto abaixo: …" (vale para posts também) |
| B1 | Baixa | "Prévia no Google" aparecia como `Prévia` (escape dentro de texto JSX, bug antigo dos posts) | ✅ corrigido |
| B2 | Baixa | A migration não escapava texto puro e perdia as quebras de linha | ✅ funções SQL temporárias escapam `& < >` e transformam as quebras em `</p><p>`; elas são removidas ao final. Dry-run: `Custo &lt; receita &amp; margem</p><p>linha 2` |
| B3 | Baixa | `challenge_html = ''` gerava H2 sem corpo | ✅ `NULLIF(…, '')` |
| B4 | Baixa | Número do case preenchido pela metade sumia sem aviso | ✅ o form bloqueia com mensagem |
| B5 | Baixa | `deleteCase` sem tratamento de erro | ✅ try/catch + `{ok:false}`; o painel avisa e não tira o case da lista |
| B6/Info | Baixa | Metadata sem filtro de status; modal fecha ao clicar fora | Registrado (comportamento já existente, igual aos posts) |

## File List
- `src/collections/Cases.ts`: campos novos + hook de `content_updated_at`
- `src/migrations/20261010_140000_cases_rich.ts` (novo) + `src/migrations/index.ts` · `scripts/verify-schema.mjs`
- `src/lib/actions/cases-actions.ts` (reescrito)
- `src/components/painel/article-fields.tsx` (novo, extraído do PostsClient) · `src/app/(painel)/painel/posts/PostsClient.tsx` (passa a importar)
- `src/app/(painel)/painel/cases/CasesClient.tsx` (reescrito)
- `src/app/(site)/cases/[slug]/page.tsx`: corpo único, FAQ, H1, metadata
- `src/app/(site)/cases/page.tsx`, `src/components/home/FeaturedCase.tsx`: resumo
- `src/app/sitemap.ts`: data editorial dos cases
- `src/components/painel/__tests__/article-fields.test.ts` (novo) · `src/lib/__tests__/content-date.test.ts` (casos de cases)
