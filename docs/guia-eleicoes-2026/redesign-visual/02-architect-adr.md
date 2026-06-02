# ADR-001 — Modelo de conteúdo estruturado para o redesign do hotsite

> **Status:** Aceito (POC validada na S0) · **Autor:** @architect · **Data:** 2026-06-02
> **Sprint:** S0 — Arquitetura de execução

## Contexto

O conteúdo do hotsite `/featwork` é um documento A4 de impressão (`guia-content.ts`, 2.333 linhas de HTML, `width:210mm;height:297mm`, gerado por `scripts/extract-guia-eleicoes.mjs`), escalado inteiro pelo `GuiaScale`. Esse acoplamento impede scroll-storytelling, count-up, gráficos animados e responsividade fluida — os objetivos do redesign. A decisão D1 do cliente foi **reconstruir a apresentação** preservando 100% do conteúdo.

## Decisão

Introduzir uma camada de **dados tipados** (`_content/guia-data.ts`) que descreve o conteúdo como seções e blocos semânticos (`prose | stats | highlight | callout | …`), consumida por **componentes React** (`_components/redesign/*`) com tokens dark (`_styles/redesign-dark.css`, acento mint `#6DF9C6`). O HTML A4 (`guia-content.ts` + `guia.css`) é **aposentado por seção**, somente após o gate de paridade abaixo. O material diagramado original permanece como fonte de verdade para conferência.

## Consequências

- ✅ SSR mantido (dados estáticos no servidor) — conteúdo no DOM para SEO/A11y (validado: 89%, 144M, fontes e leis presentes no HTML da POC).
- ✅ Zero lib nova — `framer-motion` e `recharts` já instalados.
- ✅ Responsividade real (sem `mm`/scale transform).
- ⚠️ Risco de perda silenciosa de conteúdo na migração → mitigado pelo gate de paridade.
- ⚠️ `guia-content.ts` é gerado por script — ao aposentar, atualizar/retirar o gerador e o teste correspondente.

## POC da S0 (evidência)

- Migrada a **Parte 00 — O cenário** (páginas 5–7 do original) → `GUIA_SECTIONS_POC`.
- Rota isolada `/featwork/preview` (`noindex`) renderiza no tema dark **sem tocar a produção**.
- Validações automatizadas executadas:
  - `tsc --noEmit` e `eslint` limpos nos arquivos do redesign.
  - `GET /guia-eleicoes-2026/preview` → **200**; conteúdo-chave presente no DOM (89%, 60%, 9h13, 144M, "O digital no Brasil em números", "TIC Domicílios 2024", "Mundim, Vasconcellos").
  - `GET /guia-eleicoes-2026` (prod) → **200**, intacto (`guia-doc`, `PARTE 00`, footer); redesign **não vazou**.

## Gate de paridade de conteúdo (obrigatório — @qa)

Antes de aposentar qualquer página A4, a seção migrada deve passar por:

1. **Checklist 1:1** — todo número, percentual, lei/resolução, citação, nome de autor e fonte presente no original está no `guia-data.ts`. Nenhuma omissão.
2. **Diff textual** — comparar o texto migrado contra o bloco original (script ou revisão manual); divergência só permitida em formatação, nunca em conteúdo.
3. **DOM check** — o conteúdo aparece no HTML SSR (não só após JS), via `curl | grep` dos termos-chave.
4. **Sign-off** — @qa marca a seção como "paridade OK" antes de remover o equivalente A4.

## Inventário de blocos a modelar (próximas sprints)

`prose`, `stats` ✅, `highlight` ✅, `callout` ✅ (S0) · faltam: `compare` (permitido/vedado), `severity` (MULTA<CASSAÇÃO<CRIME), `timeline` (calendário 2026), `funnel` (6 etapas), `checklist`, `quote` (autor+veículo), `platforms`.

## Arquivos criados na S0

```
_content/guia-data.ts                      modelo + Parte 00 (POC)
_styles/redesign-dark.css                  tokens dark (escopo .guia-redesign)
_components/redesign/Reveal.tsx            scroll reveal (IntersectionObserver)
_components/redesign/StatCounter.tsx       count-up + valor real no DOM
_components/redesign/SectionRenderer.tsx   seção + divider + blocos
preview/page.tsx                           rota isolada /featwork/preview (noindex)
```
