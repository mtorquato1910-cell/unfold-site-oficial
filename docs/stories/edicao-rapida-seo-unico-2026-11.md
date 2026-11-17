# Story — Edição rápida + seção única de SEO (posts e cases)

**Data:** 17/11/2026 · **Origem:** "Manual do desenvolvedor site Unfold Growth" (Gabriel, 13/11/2026) + respostas do Matheus em 17/11/2026
**Status:** EM PRODUÇÃO (main 229338b + fix ebf9518) — migração aplicada e painel validado no Chrome em 17/11/2026

## Contexto

O manual foi escrito para WordPress (hooks `quick_edit_custom_box`/`save_post`). O site é Next.js + painel próprio (`/painel`, servido em `/admin`), então a ideia foi adaptada.

## Decisões (respostas de 17/11/2026)

| # | Pergunta | Decisão |
|---|----------|---------|
| 1 | Formato | Dois acessos na lista, como no WordPress: **Editar** (editor completo) e **Edição rápida** (na própria linha) |
| 2 | TXT da OpenAI no DNS | Pendente: depende do Gabriel (acesso ao DNS) — fora do código |
| 3 | Slug na edição rápida | Sim, com redirect 301 automático do endereço antigo + aviso na tela |
| 4 | Duas seções de SEO | Opção (a): mantém Título (H1) e Resumo do card; uma só seção de SEO com title + meta + categoria + tags |
| 5 | Title vazio | Preencher com o title que o Google recebe hoje (`<título> \| Blog \| Unfold Growth`) — HTML idêntico |
| 6 | Data de publicação | Editável na edição rápida e no editor |
| 7 | Revisão | Sai o status "Aguardando revisão" e o campo "Revisado por" |
| 8 | Tags | Alimentam os artigos relacionados (3 no fim do post) |
| 9 | Autor / categoria | Um autor e uma categoria por post |
| 10 | Cases | Também ganham edição rápida |

## Tarefas

- [x] Edição rápida de posts: título, slug, meta descrição, categoria, tags, data, capa, autor, status (Publicado/Rascunho)
- [x] Edição rápida de cases: título, slug, meta descrição, data, capa, status
- [x] Edição rápida grava só os campos exibidos (`quickUpdatePost`/`quickUpdateCase`) — resumo, destaque, FAQ etc. não são tocados
- [x] Capa: seletor da biblioteca de mídia (`listMedia` + botão "Biblioteca" no `ImageInput`)
- [x] Editor de posts: seção única "SEO — como aparece no Google" (title ≤60 com contador, meta descrição ≤155, categoria, tags, prévia)
- [x] Editor: autor único, data de publicação editável, sem "Revisado por"
- [x] Status só Publicado/Rascunho; envio externo (/blog/contribuir) chega como Rascunho com selo "externo" e link "Revisar envio"
- [x] Redirect 301 automático de slug também para cases (antes só posts) + página `/cases/[slug]` consulta redirects
- [x] Relacionados: prioritárias da Tarefa 4 (máx. n-1 vagas quando há tags em comum) → tags em comum → mesma categoria
- [x] Script `scripts/migrate-seo-unico.mjs` (simulação por padrão; `--apply` grava em transação)
- [x] Rodar `node scripts/migrate-seo-unico.mjs --apply` (9 registros, 17/11/2026)
- [x] Validar no painel (Chrome, logado) e levar para `main`
- [ ] TXT `openai-business-profile` no DNS (Gabriel)

## Testes

- `src/lib/__tests__/edicao-rapida-2026-11.test.ts` (datas BRT, tags, relacionados com tags) — 311/311 verdes
- `tsc --noEmit` limpo; lint sem novos avisos
- Local: `/blog/growth-para-vendas-complexas` → title idêntico ao de produção; 3º relacionado passou de `/revops` (recência) para `/growth-marketing` (tags)

## File List

- `src/components/painel/QuickEdit.tsx` (novo)
- `src/lib/slug-redirect.ts` (novo)
- `scripts/migrate-seo-unico.mjs` (novo)
- `src/lib/__tests__/edicao-rapida-2026-11.test.ts` (novo)
- `src/app/(painel)/painel/posts/PostsClient.tsx`
- `src/app/(painel)/painel/posts/page.tsx`
- `src/app/(painel)/painel/posts/[id]/review/page.tsx`
- `src/app/(painel)/painel/cases/CasesClient.tsx`
- `src/components/painel/ImageInput.tsx`
- `src/lib/actions/posts-actions.ts`
- `src/lib/actions/cases-actions.ts`
- `src/lib/actions/media-actions.ts`
- `src/lib/actions/blog-submit-actions.ts`
- `src/lib/blog-categories.ts`
- `src/lib/content-date.ts`
- `src/app/(site)/blog/[slug]/page.tsx`
- `src/app/(site)/cases/[slug]/page.tsx`
- `src/collections/Posts.ts`

## Observações

- Envio externo aprovado por "Revisar envio" continua mandando e-mail ao autor; se for publicado direto pela edição rápida/editor, o autor externo **não** recebe o e-mail de publicação.
- `pending_review` continua no enum do banco (legado) para não exigir migração de schema.
- Posts com mais de 60 caracteres no title migrado aparecerão com o contador em vermelho — é o title real de hoje, para revisão editorial.

## Teste no painel (17/11/2026, Chrome logado em produção)

| Item | Resultado |
|------|-----------|
| Lista com `Editar \| Edição rápida \| Ver`, sem aba de revisão | OK |
| Edição rápida abre preenchida (9 campos posts / 6 cases) | OK |
| Meta alterada pela edição rápida aparece no HTML do site | OK (testado e restaurado) |
| Campos ocultos intactos (destaque, resumo, tags, content_updated_at) | OK |
| Aviso de troca de slug | OK (não salvo) |
| Biblioteca de mídia | OK (24 imagens + "Carregar mais") |
| Editor completo com seção única de SEO, autor único, data | OK |
| Console | Sem erros |

Bugs encontrados e corrigidos (commit ebf9518):
1. Salvar cortava os segundos da data de publicação (datetime-local sem segundos) — agora a data só é enviada se mudou; data do post de teste restaurada.
2. Status aparecia como "PUBLISHED"/"DRAFT" — StatusBadge agora em português.
