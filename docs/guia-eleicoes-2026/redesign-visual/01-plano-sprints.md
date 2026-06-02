# Repaginação Visual — Hotsite Eleições 2026 (`/featwork`)
## Plano de Sprints — Dark Premium "Dossiê Tech"

> **Orquestração:** Orion (aios-master)
> **Autoria do plano:** @pm · **Validação:** @architect + @qa · **Execução:** @dev + @ux-design-expert
> **Origem:** prompt do cliente (refatoração visual + responsividade) + Auditoria Fase 1 (2026-06-02)

---

## 0. Decisões travadas (input do cliente)

| # | Decisão | Valor |
|---|---|---|
| D1 | Abordagem de conteúdo | **Reconstruir estruturado** — extrair conteúdo para dados (TS) + recriar apresentação em componentes/seções fluidas |
| D2 | Cor de acento | **Mint `#6DF9C6`** (marca Unfold) sobre navy `#001E29` |
| D3 | Direção visual | Dark premium "dossiê tech" |
| D4 | Interatividade | Full hotsite — count-up, gráficos, scroll reveal |

## 1. Guard-rails invioláveis (todas as sprints)

1. **NÃO TOCAR** no fluxo do formulário/captura de lead (`LeadForm.tsx`, `submit-lead.ts`, endpoint `/api/guia-eleicoes/lead`) — inclui a validação MX + Evolution recém-entregue. Só restilizar.
2. **NÃO TOCAR** no mecanismo do gate (`GateProvider.tsx`, sessão, auto-open/reopen). Só restilizar o overlay/modal.
3. **NÃO ALTERAR** o PDF (`/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf`). Só vincular/estilizar o botão.
4. **PRESERVAR 100%** texto, números, leis, citações, fontes — migram para dados, permanecem no DOM (SEO/A11y).
5. **PRESERVAR** rotas, metadata, OG, canonical (`layout.tsx`).
6. Build verde em todo commit. Evidência visual por fase. Sem erro de hidratação.

## 2. Achados da Auditoria Fase 1 (resumo)

- Conteúdo = **2.333 linhas de HTML A4** (`guia-content.ts`), gerado por `scripts/extract-guia-eleicoes.mjs`, renderizado por `dangerouslySetInnerHTML`.
- Layout de impressão: `.page { width:210mm; height:297mm; page-break-after }`, `GuiaScale` encolhe a folha inteira.
- Tokens em CSS vars sob `.guia-doc`; tamanhos em `pt`/`mm`.
- **Libs já instaladas:** `framer-motion@12` + `recharts@2.15` → zero lib nova.
- Gate, blur, PDF, fontes (Space Grotesk/Inter/JetBrains Mono) já presentes e funcionais.

---

## 3. ADR-001 — Modelo de conteúdo estruturado (@architect)

**Contexto:** D1 exige separar conteúdo (dado) de apresentação (componente).

**Decisão:** criar `src/app/guia-eleicoes-2026/_content/guia-data.ts` exportando o conteúdo como **dados tipados** (seções, stats, tabelas, timeline, funil, citações), consumidos por componentes React. O `guia-content.ts` + `guia.css` (A4) são **aposentados** após paridade de conteúdo verificada. O HTML diagramado original (`Eleições/...html`) permanece como fonte de verdade de conteúdo para conferência.

**Estrutura proposta (alto nível):**
```ts
export interface GuiaSection {
  id: string                 // âncora estável (SEO/nav)
  parte?: string             // "Parte 01"
  overline?: string          // mono, ex.: "COMO ESTÁ O JOGO"
  titulo: string
  blocks: GuiaBlock[]        // prosa | stat | table | timeline | funnel | quote | checklist
}
type GuiaBlock =
  | { kind: 'prose'; html: string }                  // texto preservado
  | { kind: 'stats'; items: StatItem[] }
  | { kind: 'compare'; rows: CompareRow[] }          // permitido/vedado/atenção
  | { kind: 'severity'; rows: SeverityRow[] }        // MULTA < CASSAÇÃO < CRIME
  | { kind: 'timeline'; nodes: TimelineNode[] }
  | { kind: 'funnel'; steps: FunnelStep[] }
  | { kind: 'quote'; texto: string; autor: string; veiculo?: string }
```

**Risco gerenciado:** paridade de conteúdo. **Mitigação (gate de QA):** checklist de paridade 1:1 contra o HTML original — nenhum número/lei/fonte pode sumir. Diff textual revisado antes de aposentar o `guia-content.ts`.

**Consequências:** SSR mantido (dados estáticos no servidor); bundle controlado (componentes leves + recharts já presente); responsividade real (sem `mm`/scale).

---

## 4. Design tokens dark (@ux-design-expert) — `--accent = #6DF9C6`

Definidos como CSS vars sob `.guia-doc` (substituindo o tema claro). Base do prompt, ajustada à marca:

```
--bg-base:#0A0C10  --bg-elevated:#12151B  --bg-card:#171B22  --bg-card-hover:#1D222B
--border-subtle:rgba(255,255,255,.06)  --border-strong:rgba(255,255,255,.12)
--text-primary:#F2F4F7  --text-secondary:#A8B0BC  --text-muted:#6B7280
--accent:#6DF9C6  --accent-soft:rgba(109,249,198,.12)   /* MARCA UNFOLD */
--success:#34D399  --danger:#EF4444  --warning:#FBBF24
--dur-fast:150ms --dur-base:250ms --dur-slow:550ms --ease-out:cubic-bezier(.16,1,.3,1)
```
Tipografia fluida (`clamp`), `tabular-nums` nos números, mono nos metadados. Elevação = borda sutil + glow do mint. `prefers-reduced-motion` desliga count-up/reveal.

---

## 5. Sprints

### S0 — Arquitetura de execução · **@architect** (valida @qa)
- **S0.1** Escrever ADR-001 final + modelo `guia-data.ts` (interfaces).
- **S0.2** Definir tokens dark (§4) e mapa tipográfico fluido.
- **S0.3** Protótipo de **1 seção** ponta-a-ponta (extração → dados → componente dark) como prova de conceito.
- **S0.4** Plano de paridade de conteúdo (checklist de migração).
- **Gate:** @qa valida POC + paridade da seção-piloto + você aprova. **DoD:** build verde, 1 seção dark renderizada, ADR aprovado.

### S1 — Design System dark + chassi · **@ux-design-expert + @dev** (valida @qa)
- **S1.1** Tokens dark no tema; aposentar tema claro (sem trocar conteúdo ainda).
- **S1.2** Layout base fluido (container, ritmo vertical 96–128px desktop), tipografia `clamp`.
- **S1.3** `SectionDivider` (overline mono + numeral translúcido) — **remove o cromo de PDF** (números de página, "PARTE/SEÇÃO" repetidos).
- **Gate:** @qa — sem cara de A4, AA de contraste, build verde.

### S2 — Componentes de dado · **@dev** (valida @qa)
Um a um, com variantes/estados/`reduced-motion`:
- **S2.1** `StatCounter` (count-up via framer-motion + IntersectionObserver; valor final no DOM)
- **S2.2** `DataChart` (recharts, SVG responsivo; dado tabular no DOM)
- **S2.3** `Timeline` (calendário 2026) · **S2.4** `Funnel` (6 etapas)
- **S2.5** `ComparisonTable`/`SeverityTable` (cor semântica ✓/✕/⚠; escala de severidade)
- **S2.6** `QuoteBlock` (editorial premium)
- **Gate:** @qa — cada componente acessível, dado preservado, responsivo base.

### S3 — Motion + Gate + PDF · **@dev** (valida @qa)
- **S3.1** Scroll reveal com stagger + count-up (guarda `prefers-reduced-motion`).
- **S3.2** `BlurredBackdrop` + `GateOverlay` restilizado (glass, scrim ao `--bg-base`) — **lógica do gate intacta**.
- **S3.3** `DownloadButton` restilizado ligado ao PDF existente; estados hover/foco/loading.
- **S3.4** Microcopy Fase 4 (gate headline opção A, "Liberar o guia", "Baixar guia em PDF", erros "o que houve + como resolver").
- **Gate:** @qa — gate/lead/download funcionando ponta-a-ponta; reveal suave.

### S4 — Responsividade mobile & tablet · **@dev** (valida @qa)
Prompt complementar integral:
- **S4.1** Fundamentos: `100dvh`, safe-area, inputs ≥16px, grids fluidos, espaçamento responsivo.
- **S4.2** Componentes mobile→tablet→desktop (tabelas viram **cards** no celular; timeline/funil empilham; chart SVG fluido).
- **S4.3** Gate no mobile (card rola interno, teclado não cobre input, **blur leve 6–8px**, safe-area, scroll pós-submit).
- **S4.4** Touch (alvos ≥44px, sem dependência de hover), motion reduzido no mobile, perf.
- **Gate:** @qa — matriz 375/390-430/768/1024/1280px, retrato+paisagem, **zero scroll horizontal**.

### S5 — Aceite final · **@qa** (regressão @architect)
- Checklist dos critérios de aceite dos 2 prompts (§7 de cada).
- AA de contraste, `prefers-reduced-motion`, foco visível.
- **Não-regressão:** gate, lead (MX+Evolution), PDF, conteúdo, metadata/SEO.
- Build de produção + sem erro de hidratação.

---

## 6. Parecer @architect

- **Aprovado** condicionado ao gate de paridade de conteúdo (S0.4) antes de aposentar `guia-content.ts`.
- **Risco alto:** perda silenciosa de conteúdo na migração → mitigado por checklist 1:1 + diff textual revisado.
- **Risco médio:** peso de motion no mobile → framer-motion com `LazyMotion`/reveal CSS onde possível; reduzir animação no mobile (S4.4).
- **Risco baixo:** recharts no bundle → já é dependência; usar import por componente.
- **Sem** nova lib. **Sem** mudança de stack. SSR preservado.

## 7. Parecer @qa (gates por sprint)

- Cada sprint só fecha com: build verde + evidência visual (3 larguras a partir de S4) + checklist de não-regressão do gate/lead/PDF.
- **Testes automatizados:** unit para `StatCounter` (parsing de sufixos %/M/h13, valor final no DOM) e helpers de dados; teste de fumaça de render das seções.
- **A11y:** axe/contraste manual AA; navegação por teclado no gate; `prefers-reduced-motion`.
- **Bloqueadores de merge:** qualquer número/lei/fonte ausente vs. original; scroll horizontal <1440px; input que dá zoom no iOS; gate que quebra captura de lead.

## 8. Rastreabilidade (critérios de aceite → sprint)

| Critério (prompt) | Sprint |
|---|---|
| Sumiu cara de PDF / cromo PARTE-SEÇÃO | S1 |
| Números viram StatCounter com count-up | S2.1 + S3.1 |
| Gráficos/timeline/funil animados | S2.2–2.4 + S3.1 |
| Tabelas com cor semântica e responsivas | S2.5 + S4.2 |
| Gate embaçado + form restilizado, lógica intacta | S3.2 + S4.3 |
| DownloadButton baixa PDF existente | S3.3 |
| Conteúdo/SEO preservados | S0.4 + S5 |
| reduced-motion / AA / foco | S3.1 + S5 |
| Sem scroll horizontal 320–1440 | S4 + S5 |

---

**Status:** aguardando aprovação do cliente para iniciar **S0 (Arquitetura de execução)**.
