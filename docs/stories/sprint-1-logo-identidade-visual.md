# Sprint 1 — Logo & Identidade Visual

**ID:** UNFOLD-S1  
**Tipo:** Enhancement  
**Prioridade:** P0 — Must Have  
**Estimativa:** 1–2 dias  
**Agentes:** @dev  
**Status:** [ ] Pendente

---

## Objetivo

Substituir todos os placeholders de logo/favicon pelo ativo correto da marca Unfold Growth (`logo correta 2.jpeg`) em todas as superfícies visíveis ao usuário: aba do browser (favicon), Apple touch icon, sidebar do Payload CMS e sidebar do novo painel.

---

## User Story

> **Como** visitante ou administrador do site Unfold Growth,  
> **Quero** ver a logo oficial da marca em todos os pontos de contato (aba do browser, painéis admin),  
> **Para que** a identidade visual seja consistente e profissional.

---

## Acceptance Criteria

- [ ] **AC1** — A aba do browser exibe o ícone oficial (fundo roxo, diamante branco) para todas as rotas do site (`/`, `/blog`, `/cases`, etc.)
- [ ] **AC2** — A aba do browser exibe o ícone oficial para todas as rotas do painel (`/painel/*`, `/admin/*`)
- [ ] **AC3** — O Apple touch icon (`180×180`) usa a logo correta
- [ ] **AC4** — O componente `AdminLogo.tsx` (sidebar do Payload CMS) renderiza a imagem real ao invés do SVG hardcoded
- [ ] **AC5** — O componente `AdminIcon.tsx` (breadcrumb do Payload) usa a logo real
- [ ] **AC6** — O arquivo `logo correta 2.jpeg` está em `public/logo.jpeg` e é referenciado via path absoluto
- [ ] **AC7** — Nenhum SVG genérico de placeholder aparece em produção

---

## Tarefas Técnicas

- [ ] **T1** — Copiar `logo correta 2.jpeg` → `public/logo.jpeg`
- [ ] **T2** — Atualizar `src/app/icon.tsx`: usar `<img>` ou `ImageResponse` com a logo real (32×32)
- [ ] **T3** — Atualizar `src/app/apple-icon.tsx`: logo real 180×180
- [ ] **T4** — Atualizar `src/admin/AdminLogo.tsx`: substituir SVG inline por `<Image src="/logo.jpeg" />` (Next.js Image)
- [ ] **T5** — Verificar que `next.config.ts` não bloqueia servir `/logo.jpeg`
- [ ] **T6** — Testar visualmente em dev: `npm run dev` → abrir browser e conferir aba + sidebar

---

## Arquivos Afetados

- `public/logo.jpeg` (novo)
- `src/app/icon.tsx`
- `src/app/apple-icon.tsx`
- `src/admin/AdminLogo.tsx`

---

## Notas

- A logo original está em `logo correta 2.jpeg` na raiz do projeto
- Formato: JPEG, proporção quadrada (~370×370px), fundo roxo escuro (`#2D1B8E` aprox.), diamante branco centralizado
- Para o favicon 32×32, redimensionar/crop via `ImageResponse` mantendo o ícone legível

---

*— Morgan, Sprint 1 definido ✓*
