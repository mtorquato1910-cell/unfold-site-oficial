# Sprint 1 — Foundation (Schemas v2 + Engine v2)

**Story ID:** DIAG-S1
**Spec fonte:** `docs/diagnostico-spec.md` §3, §5, §6, §7, §8
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 1)
**Status:** in_progress (engine + schemas done — migration prod e property-based pendentes)
**Estimativa:** 2 sessões
**Depende de:** —

## Goal

Reescrever o sistema de scoring para a spec v1.0 (5 eixos + Fit + padrões + caminhos) e expandir os schemas de `Leads` e `DiagnosticoResults` no Payload. Sem mudanças de UI nesta sprint.

## User Stories

- Como sistema, preciso calcular scores das 3 camadas (eixos, Fit, padrões) com fidelidade total à spec, para que a UI possa simplesmente renderizar os resultados.
- Como time interno, preciso de um golden test do caso Roberto rodando em CI, para garantir que qualquer alteração futura no engine não quebre o cálculo.

## Ajustes pós-revisão aplicados

- Migration faturamento em **2 releases**: `faturamento_faixa` nullable, `receita_anual` mantido (drop só em Sprint 6+).
- Usar `select` Payload (não enum Postgres nativo) — evita `ALTER TYPE` fora de transação.
- Persistir `q4_raw='E'` em `respostas_etapa1_raw` JSON além do valor convertido (preserva semântica).
- Engine **determinística pura**: sem `Math.random`, sem dependência de ordem de `Object.entries`.
- Score Gestão com clamp `[0,100]` e arredondamento (99.99 → 100).
- Adicionar `fast-check` para property-based testing.

## Tasks

- [ ] **T1.1** Migration Postgres prod via `npx payload migrate:create` (deferred — Payload+drizzle auto-aplica em SQLite dev; gerar SQL antes do deploy)
- [x] **T1.2** Atualizar `src/collections/Leads.ts` com `setor`, `faturamento_faixa`, `urgencia` (select Payload, mantendo legados)
- [x] **T1.3** Atualizar `src/collections/DiagnosticoResults.ts` com campos das Camadas 2 e 3 + `url_resultado_hash` indexed unique
- [x] **T1.4** Reescrever `src/lib/scoring/engine.ts` v2 — 5 eixos, Q4 com 5 opções, Q8 invertida em Operar, clamp [0,100], API legada deprecated mantida
- [x] **T1.5** Criar `src/lib/scoring/fit.ts` — Camada 2 (4 dimensões pesadas + curva U invertido no Fit Dor)
- [x] **T1.6** Criar `src/lib/scoring/padroes.ts` — 8 padrões P1–P8 + seleção dos 3 + fallback determinístico + neutro positivo
- [x] **T1.7** Criar `src/lib/scoring/caminhos.ts` — mapping P→C com deduplicação por eixo fraco
- [x] **T1.8** Criar `src/lib/scoring/textos.ts` — textos completos da spec (8 padrões + 5 caminhos + frases por eixo×faixa + CTA por faixa Fit)
- [x] **T1.9** Criar `src/lib/scoring/__tests__/caso-roberto.test.ts` — golden test (14 asserts cobrem todos os números da spec §11)
- [ ] **T1.10** Adicionar `fast-check` + property-based test (additive — pode rodar em Sprint 2)
- [ ] **T1.11** Snapshot test com 50 casos sintéticos (additive — pode rodar em Sprint 2)
- [ ] **T1.12** Rodar migration em staging Postgres com dry-run e backup snapshot (pré-deploy)

## Definition of Done

- [ ] Migration aplica sem perda de dados
- [ ] `npm test src/lib/scoring` passa (golden test)
- [ ] `npm run lint` + `npm run typecheck` verdes
- [ ] Admin panel mostra campos novos em `/admin/collections/diagnostico-results`

## QA Gates

| ID | Critério |
|---|---|
| G1.1 | Caso Roberto: score 22, score_fit 58.84 (±0.5), padrões [P4,P8,P2], caminhos [C3,C4,C2] |
| G1.2 | Q4=E retorna 0 pontos sem erro |
| G1.3 | Q8=D dá 0 em Operar e 100 em Fit Estrutural (isolamento) |
| G1.4 | Eixo Gestão respeita as 3 tabelas da spec §5.4 |
| G1.5 | Padrão neutro positivo aciona quando nenhum P1–P8 dispara |
| G1.6 | Fit de Dor com soma=8 e =9 retorna 70 (curva U invertido, branch testado) |
| G1.7 | Empate em prioridade base com >2 padrões → desempate determinístico pela hierarquia P4>P3>P8>P2>P7>P1>P6>P5 |
| G1.8 | Fallback §7.2 com 2 eixos baixos mapeando para mesmo padrão → sem duplicação na lista final |
| G1.9 | Engine determinística: 1000× mesmo input retorna scores idênticos |
| G1.10 | Score Gestão com 3 sinais máximos = 100 (arredondado), clamp em [0,100] |

## File List

- 🆕 `src/lib/scoring/types.ts`
- ✏️ `src/lib/scoring/engine.ts` (rewrite + API legada deprecated)
- 🆕 `src/lib/scoring/fit.ts`
- 🆕 `src/lib/scoring/padroes.ts`
- 🆕 `src/lib/scoring/caminhos.ts`
- 🆕 `src/lib/scoring/textos.ts`
- 🆕 `src/lib/scoring/index.ts`
- 🆕 `src/lib/scoring/__tests__/caso-roberto.test.ts` (24 testes, todos passam)
- ✏️ `src/collections/Leads.ts` (+3 campos: setor, faturamento_faixa, urgencia)
- ✏️ `src/collections/DiagnosticoResults.ts` (+15 campos das Camadas 2 e 3)

## Resultado dos testes

```
Test Files  1 passed (1)
     Tests  24 passed (24)
  Duration  642ms
```

- ✅ Caso Roberto (spec §11): 14 asserts conferem
- ✅ Determinismo: 1000× idêntico
- ✅ Q4=E não quebra
- ✅ Operação imatura (tudo A) e perfeita (tudo D)
- ✅ Padrão neutro positivo quando 0 acionados

## TypeScript

`npx tsc --noEmit` → sem erros.
