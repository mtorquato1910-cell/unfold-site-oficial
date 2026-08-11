# S05 — Migração dos 31 artigos (etapa 4)

**Item do doc:** 1.3 etapa 4
**Prioridade:** 🔥 P1 · **Risco:** Médio-alto · **Responsável:** Torquato
**Dependências:** S02, S03, S04 estáveis
**Estimativa:** 1,5–2 dias
**Status:** 🟡 SCRIPT ENTREGUE (`scripts/migrate-articles-headings.ts`) — **rodar é do dono** (precisa do banco + snapshot); 2026-08-07

---

## Status de execução (2026-08-07)

**Feito:**
- ✅ Script `scripts/migrate-articles-headings.ts` — normalização de heading sobre o `conteudo_html` (HTML único), **não conversão de formato**. Regras: (1) H1 do corpo → H2; (2) sem H2 mas com H3+ → sobe todos em 1 (h3→h2…). Molduras já saíram da hierarquia no render (S02), então só o corpo é tratado.
- ✅ **Dry-run por padrão** (imprime diff de headings por artigo); `--apply` grava; `--limit N` para o piloto de 3.

**Requer o dono (não executável por mim — sem acesso ao banco):**
- ⏳ Rodar `npx tsx scripts/migrate-articles-headings.ts --limit 3` (dry) → revisar → `--apply --limit 3` (piloto) → revisar render → `--apply` (31).
- ⏳ **Snapshot do banco antes do `--apply`** (o script loga o HTML original; ainda assim, backup do Postgres é obrigatório).
- ⏳ Rodar as migrations pendentes (`payload migrate`) antes: `posts_seo_fields`, `posts_faq`.
- ℹ️ Item 1.2b (varredura de links absolutos→relativos, de S01) pode ser incorporado nesta mesma passada com snapshot único, conforme a revisão (C3).

## Contexto

Os 31 artigos precisam entrar no novo formato. Validado nesta sessão: como o conteúdo já é **HTML único** (`conteudo_html`), a migração **não é conversão de formato — é normalização de nível de heading** sobre HTML pronto. É a versão pequena que o documento previu ("se for HTML único, deixa de ser conversão e vira normalização, que é bem menor").

Exceção: posts antigos que ainda usam só o campo Lexical `conteudo` (`Posts.ts:56`) — esses são a única parte que é conversão de verdade (Lexical → HTML).

---

## Acceptance Criteria

- [ ] **AC1** Conversão **automática, feita uma vez**, não artigo por artigo à mão.
- [ ] **AC2** Na mesma passada: subir os títulos de seção para o nível correto (o que hoje é H3-de-capítulo vira H2).
- [ ] **AC3** Retirar da hierarquia os elementos que não são do artigo (se algum ficou embutido no `conteudo_html`).
- [ ] **AC4** Garantir **um único H1** por página (H1 vem do título; nenhum H1 no corpo).
- [ ] **AC5** **Piloto de segurança:** converter 3 artigos primeiro, revisar manualmente, só depois rodar nos 31.
- [ ] **AC6** Posts legados só-Lexical convertidos para `conteudo_html` (ou identificados e tratados).
- [ ] **AC7** Backup/rollback: dá para reverter se a conversão sair errada (não sobrescrever destrutivamente sem cópia).

---

## Tarefas técnicas

### T1 — Script de normalização
- [ ] Script único (ex.: `scripts/migrate-articles-headings.ts`) que lê `conteudo_html` de cada post, normaliza a hierarquia (regras AC2–AC4) e grava.
- [ ] Reusar/estender `src/lib/article-toc.ts` e `html-sanitize.ts` para parsing seguro.
- [ ] **Dry-run** primeiro: gera diff por artigo sem gravar.

### T2 — Piloto
- [ ] Rodar em 3 artigos representativos (um longo com muitos H3, um curto, um com tabela/imagem). Revisar HTML e render.
- [ ] Ajustar regras conforme achados.

### T3 — Lote + legados
- [ ] Rodar nos 31 após aprovação do piloto.
- [ ] Identificar posts só-Lexical (`conteudo` sem `conteudo_html`) e convertê-los.
- [ ] Snapshot antes (export dos campos) para rollback.

---

## Definition of Done

- [ ] Os 31 artigos abrem no novo editor sem perda de conteúdo.
- [ ] Cada artigo tem 1 H1, H2 nos capítulos, sem salto de nível.
- [ ] TOC de cada artigo reflete a hierarquia correta.
- [ ] Nenhum artigo com heading de moldura no corpo.
- [ ] Rollback testado (consigo restaurar um artigo ao estado anterior).
- [ ] Levado a `main`; validado no browser numa amostra.

---

## Riscos / atenção

- **Heurística de "H3 de capítulo → H2":** nem todo H3 é capítulo. O piloto existe justamente para calibrar. Preferir conservador + revisão a automático agressivo.
- **Perda de conteúdo:** obrigatório snapshot antes. Não rodar direto em produção sem dry-run aprovado.
- **Ordem:** só rodar depois de S02–S04 estáveis, senão migra para um alvo que ainda muda.

---

*— SM · 2026-08-07*
