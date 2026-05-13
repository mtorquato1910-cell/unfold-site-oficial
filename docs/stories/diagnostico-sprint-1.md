# Sprint 1 — Foundation (Schemas v2 + Engine v2)

**Story ID:** DIAG-S1
**Spec fonte:** `docs/diagnostico-spec.md` §3, §5, §6, §7, §8
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 1)
**Status:** pending
**Estimativa:** 2 sessões
**Depende de:** —

## Goal

Reescrever o sistema de scoring para a spec v1.0 (5 eixos + Fit + padrões + caminhos) e expandir os schemas de `Leads` e `DiagnosticoResults` no Payload. Sem mudanças de UI nesta sprint.

## User Stories

- Como sistema, preciso calcular scores das 3 camadas (eixos, Fit, padrões) com fidelidade total à spec, para que a UI possa simplesmente renderizar os resultados.
- Como time interno, preciso de um golden test do caso Roberto rodando em CI, para garantir que qualquer alteração futura no engine não quebre o cálculo.

## Tasks

- [ ] **T1.1** Criar migration `migrations/2026-05-XX_diagnostico_v2.ts` (expandir `Leads` +3 campos, `DiagnosticoResults` +15 campos)
- [ ] **T1.2** Atualizar `src/collections/Leads.ts` com `setor`, `faturamento_faixa`, `urgencia`
- [ ] **T1.3** Atualizar `src/collections/DiagnosticoResults.ts` com campos das Camadas 2 e 3
- [ ] **T1.4** Reescrever `src/lib/scoring/engine.ts` v2 — 5 eixos, Q4 com 5 opções, Q8 invertida em Operar
- [ ] **T1.5** Criar `src/lib/scoring/fit.ts` — Camada 2 (4 dimensões pesadas + faixas Alto/Médio/Baixo/Desfit)
- [ ] **T1.6** Criar `src/lib/scoring/padroes.ts` — 8 padrões P1–P8 + seleção dos 3 + fallback
- [ ] **T1.7** Criar `src/lib/scoring/caminhos.ts` — mapping P→C com deduplicação
- [ ] **T1.8** Criar `src/lib/scoring/textos.ts` — textos completos da spec (8 padrões + 5 caminhos)
- [ ] **T1.9** Criar `src/lib/scoring/__tests__/caso-roberto.test.ts` — golden test
- [ ] **T1.10** Rodar migration em dev (SQLite) + smoke em staging (Postgres)

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

## File List

_(preenchida durante execução)_
