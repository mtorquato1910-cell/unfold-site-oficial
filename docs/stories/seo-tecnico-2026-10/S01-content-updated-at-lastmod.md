# S01 — `content_updated_at`: lastmod real no sitemap e dateModified no Article

**Origem:** Plano de Ação (3 tarefas críticas de lastmod) · Decisão D3 · Reunião 07/10 ("o L mode é o mais prioritário")
**Prioridade:** 🔥 P1 · **Risco:** Médio (migration + hook em collection central) · **Executor:** @dev · **Revisão:** @qa
**Dependências:** nenhuma. **Bloqueia:** S03 (o script de links precisa da flag de edição técnica).
**Status:** 🟢 Código implementado (branch `feat/seo-s01-content-updated-at`, 2026-10-10) — falta deploy + AC1.16/1.17 em produção

---

## Contexto

O sitemap usa `updatedAt` do post (`src/app/sitemap.ts:322-333`), que o Payload atualiza em **qualquer** `payload.update` — inclusive scripts. O script `scripts/migrate-articles-headings.ts` (07/08) regravou 29 posts de uma vez, por isso 25 posts aparecem com lastmod 07/08/2026 21h23–21h24. O Google recebe uma data de "atualização" que não corresponde a mudança editorial e não prioriza o recrawl das otimizações reais (ex.: sdr, funil-de-vendas, processo-comercial atualizados em 30/09–01/10).

As 10 páginas institucionais usam `STATIC_LASTMOD = new Date('2026-07-01T00:00:00Z')` (`sitemap.ts:286`).

## Story

**Como** responsável pelo SEO da Unfold,
**quero** que a data de atualização publicada (sitemap e schema) só mude quando o conteúdo muda de verdade,
**para que** o Google recrawleie os posts que realmente foram otimizados e confie no `lastmod` do site.

---

## Acceptance Criteria

### Modelo de dados
- [x] **AC1.1** Migration idempotente (padrão de `src/migrations/20260807_120000_posts_seo_fields.ts`: SQL cru com `IF NOT EXISTS`) adiciona `content_updated_at timestamptz` em `site.posts`. Registrada em `src/migrations/index.ts`.
- [x] **AC1.2** Campo `content_updated_at` (type `date`, com hora) na collection `Posts` (`src/collections/Posts.ts`), **read-only no admin** e fora do formulário do `/painel` (é calculado, não editado).
- [x] **AC1.3** Backfill na mesma migration:
  - `sdr`, `funil-de-vendas`, `processo-comercial`, `growth-marketing`, `vendas-b2b` → `2026-10-01T00:00:00-03:00`
  - todos os demais posts → `publicado_em` (fallback `created_at` quando `publicado_em` for nulo)
  - posts com `content_updated_at` já preenchido **não** são sobrescritos (reexecução segura).

### Regra de atualização (hook)
- [x] **AC1.4** Hook `beforeChange` em `Posts`:
  - **create:** `content_updated_at = publicado_em ?? now()`.
  - **update:** compara `title` e `conteudo_html` (normalizados: trim + colapso de espaços) do documento original com os novos. Se algum mudou → `content_updated_at = now()`. Se não → mantém o valor anterior.
  - **Escape técnico:** se `req.context.technicalEdit === true`, **nunca** altera `content_updated_at` (usado por scripts: S03, futuras migrações de HTML, normalização de imagens).
- [x] **AC1.5** Mudanças em resumo, SEO, categoria, tags, capa, status, FAQ ou destaque **não** alteram a data (decisão D3: só título ou corpo).
- [x] **AC1.6** Testes unitários do hook: (a) edição de título muda; (b) edição de corpo muda; (c) só espaço/quebra de linha não muda; (d) mudança de meta_description não muda; (e) `technicalEdit` não muda nem com corpo alterado; (f) create usa `publicado_em`.

### Consumidores (o campo precisa ter quem o leia — lição Payload/Conversion)
- [x] **AC1.7** Sitemap — posts: `lastModified = content_updated_at` (fallback `publicado_em`).
- [x] **AC1.8** Sitemap — `/blog`: `lastModified` = maior `content_updated_at` entre os posts publicados.
- [x] **AC1.9** Sitemap — as 10 páginas institucionais (home, sobre, metodo, atuacao, diagnostico, contato, ferramentas, calculadora-trafego, mapa-icp e demais em `STATIC_LASTMOD`) **sem `<lastmod>`**. Remover `STATIC_LASTMOD`.
- [x] **AC1.10** Formato no XML: ISO 8601 com fuso de Brasília, ex. `2026-10-01T00:00:00-03:00` (helper `toBrtIso(date)` em `src/lib/`; usar string em `lastModified`, não `Date`, para não sair em UTC `Z`).
- [x] **AC1.11** Schema Article (`SchemaOrg.tsx:40-67` via `blog/[slug]/page.tsx:167-174`): `dateModified = content_updated_at`; `datePublished` continua `publicado_em || createdAt`. Mesmo formato do AC1.10.
- [x] **AC1.12** Meta `article:modified_time` / `openGraph.modifiedTime` = `content_updated_at`; `article:published_time` = publicação.
- [x] **AC1.13** Data visível no post: "Publicado em DD de mês de AAAA" e, quando `content_updated_at` for de dia diferente da publicação, "Atualizado em DD de mês de AAAA" (mês por extenso, padrão já usado no site) (Checklist M07: data visível coerente com o `dateModified`). Usar `<time dateTime="...">`.
- [x] **AC1.14** Salvar um post no painel continua chamando `revalidatePath` do post, de `/blog` e de `/sitemap.xml` (já existe em `posts-actions.ts`; garantir que segue funcionando).

### Investigação (planilha de autores, 09/10)
- [x] **AC1.15** Investigar por que `como-anunciar-minha-empresa-no-google` e `crm-para-whatsapp` estão **fora do sitemap e da listagem `/blog`**: conferir `status` no banco (já houve bug de `draft` × `publicado`), filtro de `getPosts` (limit 100, sort `-publicado_em`, `publicado_em` nulo?). Corrigir a causa e registrar no Dev Notes. A planilha lista 42 artigos; conferir a contagem de publicados no banco.

### Validação
- [ ] **AC1.16** `curl https://unfoldgrowth.com.br/sitemap.xml` (após deploy): os 5 posts com `2026-10-01T00:00:00-03:00`, os demais com a data de publicação, nenhum com `2026-08-07`, institucionais sem `<lastmod>`.
- [ ] **AC1.17** Teste de Resultados Avançados em `/blog/sdr`: `dateModified` = 2026-10-01.
- [ ] **AC1.18** `npm run lint`, `npm run typecheck`, testes e build verdes.

---

## Tarefas

1. [x] Migration + registro em `index.ts` (AC1.1, AC1.3)
2. [x] Campo + hook em `Posts.ts` (AC1.2, AC1.4, AC1.5) e testes (AC1.6)
3. [x] Helper `toBrtIso` em `src/lib/` com teste
4. [x] `sitemap.ts` (AC1.7–AC1.10)
5. [x] `blog/[slug]/page.tsx` + `SchemaOrg.tsx` + metadata (AC1.11–AC1.13)
6. [x] Investigação dos 2 posts fora da listagem (AC1.15)
7. [x] Documentar a flag `technicalEdit` no topo de `Posts.ts` e no README de scripts — todo script futuro que reescreva HTML deve usá-la.

## Dev Notes

- Payload: `payload.update({ collection: 'posts', id, data, context: { technicalEdit: true } })` — o `context` chega em `req.context` no hook.
- No hook, o documento anterior vem em `originalDoc`. Em `create`, não há `originalDoc`.
- Cases também usam `updatedAt` no sitemap. **Fora do escopo aqui**; a S10 aplica a mesma regra aos cases.
- Não usar `reviewed_at` para isso (tem outro significado no fluxo de aprovação).

## Definition of Done
- ACs marcados, testes verdes, deploy em `main`, AC1.16/AC1.17 conferidos em produção, Ferraz avisado para reenviar o sitemap no GSC.

## Registro de implementação (2026-10-10)

- **AC1.3 validado contra o banco real em transação com ROLLBACK:** 5 posts → 01/10/2026 00:00 BRT, 37 → data de publicação; 0 nulos; 0 em 07/08; reexecução altera 0 linhas.
- **AC1.4 — comparação por assinatura, não por string exata:** o painel regera o `conteudo` (Lexical) e o TipTap reserializa o HTML a cada save. `contentSignature()` compara texto + sequência de tags + `src` das imagens e ignora espaços, atributos e `<br>`. Assim, abrir e salvar sem mudar nada não altera a data. `conteudo` (Lexical) não entra na comparação.
- **Piso na publicação:** `content_updated_at` nunca fica antes de `publicado_em` (rascunho criado dias antes de publicar).
- **Valor vindo do cliente é descartado** no hook; o campo é sempre calculado.
- **AC1.14:** `createPost`/`updatePost` já revalidam `/sitemap.xml`, `/blog` e o post (sem mudança).
- **AC1.15 — não era bug:** `crm-para-whatsapp` e `como-anunciar-minha-empresa-no-google` foram publicados em 09/10 (13:00 e 13:35 UTC), mesmo dia da checagem da planilha. Em 10/10 os dois estão no sitemap, no /blog e respondem 200. Banco: 42 posts, todos `published` (bate com a planilha).
- **Tarefa 7:** a flag está documentada em `Posts.ts` e `content-date.ts`; `scripts/migrate-articles-headings.ts` passou a usá-la.
- `openGraph` da página do post agora é sempre emitido (`type: article`, `publishedTime`, `modifiedTime`), repetindo `locale`/`siteName`, porque o da página substitui o do layout.
- Verificação: `tsc --noEmit` ✅ · `next lint` (arquivos alterados) ✅ · `vitest run` 224/224 ✅ (15 novos). `next build` local não rodado: o SWC nativo está bloqueado por política do Windows, e o `vercel-build.sh` aplicaria a migration no banco. O build valida no preview da Vercel.
- ⚠️ **Risco de deploy:** `vercel-build.sh` ignora falha de migration (`|| echo skip`). Se a coluna não for criada, `payload.find` em posts quebra. Após o deploy, conferir que a coluna existe (ver Definition of Done).

## QA Results — 2026-10-10 (Quinn)

**Veredito: CONCERNS → resolvido.** Nenhum bug de lógica bloqueante; tsc ✅, lint ✅, vitest 229/229 ✅. Achados e tratamento:

| # | Sev. | Achado | Tratamento |
|---|---|---|---|
| 1 | Alta | `vercel-build.sh` engole falha de migration → sitemap sem posts / posts com erro | ✅ `scripts/verify-schema.mjs` no build: se `site.posts.content_updated_at` não existir, **o build falha** e a Vercel mantém o deploy anterior. Testado: com a coluna ausente, sai com exit 1. |
| 2 | Média | Preview compartilhando o banco aplica a migration antes do merge | Aceito (aditiva e benigna). Após o merge: conferir `content_updated_at IS NULL` = 0 |
| 3 | Média | "Abrir e salvar sem editar" não validado no browser; post só em Lexical mudaria a data | Banco: **0 de 42** posts só em Lexical (caso inexistente). Teste manual no painel fica no checklist de validação do preview |
| 4 | Baixa | Dupla decodificação de entidades | ✅ `&amp;` decodificado por último + entidades numéricas; teste novo |
| 5 | Baixa | AC1.13 dizia DD/MM/AAAA, código usa mês por extenso | ✅ AC ajustado ao padrão do site |
| 6 | Baixa | `publicado_em` futuro → lastmod futuro | ✅ `content_updated_at` limitado a "agora"; teste novo |
| 7 | Baixa | `-03:00` fixo errado antes de 2019 | Aceito (sem impacto) |
| 8 | Baixa | Cases ainda em `updatedAt` | Escopo da S10 |

## File List
- `src/lib/content-date.ts` (novo) — `toBrtIso`, `brtDay`, `contentSignature`, `computeContentUpdatedAt`
- `src/lib/__tests__/content-date.test.ts` (novo) — 15 testes
- `src/migrations/20261010_120000_posts_content_updated_at.ts` (novo) + `src/migrations/index.ts`
- `src/collections/Posts.ts` — campo `content_updated_at` + hook
- `src/app/sitemap.ts` — lastmod editorial, institucionais sem lastmod, ISO -03:00
- `src/app/(site)/blog/[slug]/page.tsx` — dateModified/datePublished, openGraph article, "Publicado em"/"Atualizado em"
- `scripts/migrate-articles-headings.ts` — `context.technicalEdit`
- `scripts/verify-schema.mjs` (novo) + `scripts/vercel-build.sh` — trava de schema no build (QA #1)
