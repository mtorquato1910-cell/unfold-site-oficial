# Sprint 2 — Design System & Tokens

**ID:** UNFOLD-S2  
**Tipo:** Foundation  
**Prioridade:** P0 — Must Have  
**Estimativa:** 1 dia  
**Agentes:** @dev  
**Depende de:** Sprint 1  
**Status:** [ ] Pendente

---

## Objetivo

Importar e adaptar o design system premium da Lovable para o projeto Next.js, estabelecendo os tokens de design, componentes base e utilitários CSS que serão usados em todos os sprints subsequentes do painel.

---

## User Story

> **Como** desenvolvedor do painel admin,  
> **Quero** ter os tokens de design (cores, glass, aurora, animações) disponíveis no projeto Next.js,  
> **Para que** todos os componentes do painel possam usar o mesmo design system premium mint/dark.

---

## Acceptance Criteria

- [ ] **AC1** — CSS variables da Lovable (`--background`, `--primary`, `--sidebar-bg`, etc.) disponíveis globalmente via `src/app/(painel)/painel-globals.css`
- [ ] **AC2** — Classes utilitárias disponíveis: `.glass`, `.glass-strong`, `.glass-hover`, `.bg-aurora`, `.bg-mesh`, `.noise`, `.nav-active`, `.text-dim`, `.text-dim-2`, `.border-mint-soft`, `.text-gradient-mint`, `.glow-mint`, `.btn-premium`
- [ ] **AC3** — `tailwind.config.ts` estendido com cores Lovable: `mint`, `accent-blue`, `sidebar.*`, animações `fade-in`, `glow-pulse`
- [ ] **AC4** — Fonte IBM Plex Mono carregada via `next/font/google` sem layout shift
- [ ] **AC5** — Componente `GlassCard` criado em `src/components/painel/GlassCard.tsx`
- [ ] **AC6** — Componente `StatCard` criado em `src/components/painel/StatCard.tsx`
- [ ] **AC7** — Scrollbar customizado (mint) aplicado globalmente no escopo do painel

---

## Tarefas Técnicas

- [ ] **T1** — Criar `src/app/(painel)/painel-globals.css` com todas as CSS variables e classes utilitárias copiadas da Lovable (`index.css`)
- [ ] **T2** — Estender `tailwind.config.ts`: adicionar `mint`, `accent.blue`, cores `sidebar.*`, keyframes `fade-in` e `glow-pulse`, animações correspondentes
- [ ] **T3** — Adicionar `IBM_Plex_Mono` ao `src/app/layout.tsx` via `next/font/google` (subset latin, weights 400/500)
- [ ] **T4** — Criar `src/components/painel/GlassCard.tsx`: wrapper `<div>` com className `glass rounded-2xl p-6` + suporte a `className` prop
- [ ] **T5** — Criar `src/components/painel/StatCard.tsx`: card com label, value (número grande), hint text, trend badge opcional — mesma estrutura do Lovable
- [ ] **T6** — Criar `src/lib/painel-utils.ts`: exportar `cn()` via `clsx + tailwind-merge` (se não existir)
- [ ] **T7** — Testar visualmente: renderizar GlassCard e StatCard em uma rota de teste

---

## Arquivos Afetados

- `src/app/(painel)/painel-globals.css` (novo)
- `tailwind.config.ts` (atualizar)
- `src/app/layout.tsx` (adicionar fonte)
- `src/components/painel/GlassCard.tsx` (novo)
- `src/components/painel/StatCard.tsx` (novo)
- `src/lib/painel-utils.ts` (novo ou atualizar)

---

## Referência de Design

### CSS Variables a importar (da Lovable `index.css`)
```css
--background: 194 100% 8%;
--primary: 158 92% 70%;       /* mint #6DF9C6 */
--accent-blue: 217 93% 78%;   /* azul #93BAFB */
--sidebar-bg: 197 100% 6%;
--foreground: 0 0% 91%;
```

### Animações
```css
fade-in: 0% { opacity:0; transform:translateY(8px) } → 100% { opacity:1; transform:translateY(0) }
glow-pulse: 0%/100% { box-shadow: 0 0 20px mint/0.2 } → 50% { box-shadow: 0 0 40px mint/0.4 }
```

---

*— Morgan, Sprint 2 definido ✓*
