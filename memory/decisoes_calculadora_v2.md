---
name: Decisões Calculadora v2
description: 9 ADRs e bloqueadores pré-Sprint 1 fechados em 2026-05-13 pela validação QA+Architect das sprints da Calculadora de Performance v2
type: project
---

Plano de execução da Calculadora de Performance v2 fechado em 5 sprints (~12 dias úteis), validado por @qa e @architect em 2026-05-13.

**Why:** A versão atual usa IA não-determinística, formulário linear e collection com JSON opaco. A spec fechada da Unfold (docs `calculadora_de_performance_especificacao_implementacao.md` v1.0 + `base_benchmarks_calculadora_performance.md` v1.0) exige fórmulas determinísticas, recálculo em tempo real, 5 insights condicionais (I-A a I-E), persistência por campos nominados, dashboard de funil no painel, PDF e share por email.

**How to apply:** Trabalho começa pela Sprint 1 (foundation: benchmarks, fórmulas, schema, eventos, contrato cross-product, ESLint enforced). Toda decisão técnica obedece os 9 ADRs do documento `docs/calculadora-v2/VALIDACAO-QA-ARCHITECT.md` — em especial:

- ADR-1: módulo `src/lib/calculadora/*` puro, sem imports de payload/next/react/fetch.
- ADR-2: PDF = `@react-pdf/renderer` (decisão tomada antecipadamente).
- ADR-4: contrato Calc→Diagnóstico em `src/lib/contracts/calc-to-diag.ts` versionado.
- ADR-5: collection `calculadora-events` na Sprint 1 (não na 4).
- ADR-7: server sempre vence em divergência client↔server.
- ADR-9: unsubscribe link obrigatório em todos emails de nutrição.

Bloqueadores externos pré-S1: S3.0 (change request Diagnóstico) e S4.0 (custom fields RD Station). Sem eles, S3.4 e S4.3 não fecham.

Documentos canônicos:
- `docs/calculadora-v2/SPEC.md` — spec condensada.
- `docs/calculadora-v2/_spec_raw.txt` + `_benchmarks_raw.txt` — fontes originais.
- `docs/calculadora-v2/sprints/README.md` — visão sequencial das 5 sprints.
- `docs/calculadora-v2/VALIDACAO-QA-ARCHITECT.md` — ADRs + ajustes aplicados.
