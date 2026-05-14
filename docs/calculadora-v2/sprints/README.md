# Sprints — Calculadora de Performance v2

> PM owner: @pm · Pre-sprint reviewers: @qa + @architect · Product owner: Matheus (Unfold)

## Visão sequencial

| # | Sprint | Foco | Duração | Bloqueada por | Executores principais |
| --- | --- | --- | --- | --- | --- |
| 1 | [Foundation](./sprint-1-foundation.md) | Benchmarks, fórmulas, schema, testes | 2d | — | @dev, @data-engineer, @qa |
| 2 | [UI Etapa 1+2](./sprint-2-ui-inputs.md) | Layout, 4 campos qualif, 6 inputs, 4 premissas | 3d | Sprint 1 | @dev, @ux-design-expert |
| 3 | [Resultado + Insights](./sprint-3-resultado-insights.md) | Cards ROI, funil, insight, CTA Diagnóstico | 2d | Sprints 1, 2 | @dev, @ux-design-expert, @data-engineer |
| 4 | [Persistência + Integrações](./sprint-4-persistencia-integracao.md) | API rewrite, RD/CRM, eventos, /r/[token] | 2d | Sprints 1-3 | @dev, @data-engineer, @qa |
| 5 | [Painel + PDF + Polish](./sprint-5-painel-pdf-polish.md) | Dashboard funil, PDF, share, nutrição, polish | 3d | Sprints 1-4 | @dev, @ux-design-expert, @qa, @devops |

**Esforço total estimado:** ~12 dias úteis (2,5 sprints semanais a 1 dev FTE, ou ~1,5 semana com paralelismo).

## Regra de paralelismo

- Dentro de uma sprint, stories sem dependência podem rodar em paralelo (ex.: S1.1 + S1.2 + S1.5 simultâneos).
- Entre sprints: hard gate. Não começar Sprint N+1 sem PR da N mergeada em `main`.
- Exceções: setup externo (custom fields RD na Sprint 4) pode iniciar paralelo desde a Sprint 1.

## Convenções

- Branch: `feat/calc-v2-sprint-{N}`.
- PR único por sprint, mergeado em `main` após validação.
- Commits seguem convencional (`feat(calc-v2):`).
- Stories referenciam ID `S{sprint}.{n}` em commits.
- Cada PR encerra a sprint com release note em `docs/calculadora-v2/release-notes.md` (criado na Sprint 1).

## Reviews obrigatórias

| Sprint | @qa | @architect | @ux-design-expert | @data-engineer | @devops |
| --- | :---: | :---: | :---: | :---: | :---: |
| 1 | ✓ | ✓ | — | ✓ | — |
| 2 | ✓ | — | ✓ | — | — |
| 3 | ✓ | ✓ | ✓ | ✓ | — |
| 4 | ✓ | ✓ | — | ✓ | ✓ |
| 5 | ✓ | ✓ | ✓ | ✓ | ✓ |

## Critério de saída do projeto

- [ ] 5 sprints mergeadas.
- [ ] Smoke E2E em produção (Marina §11.5 reproduzida ao vivo).
- [ ] Dashboard com pelo menos 20 submissões reais.
- [ ] Setup externo RD concluído (custom fields aplicados).
- [ ] Release notes publicadas.
- [ ] Memória do projeto atualizada com "calculadora_v2_entregue.md".

## Histórico

- 2026-05-13 — Sprints criadas pelo PM (@pm via Orion).
- 2026-05-13 — Validação @qa (Quinn) + @architect (Winston) concluída: **GO COM AJUSTES**. 9 ADRs fechados e bloqueadores documentados em [VALIDACAO-QA-ARCHITECT.md](../VALIDACAO-QA-ARCHITECT.md).

## Bloqueadores pré-Sprint 1 (resumo)

1. **S3.0** — Change request no produto Diagnóstico para aceitar prefill da Calculadora. Owner: time Diagnóstico.
2. **S4.0** — Setup dos 7 custom fields no RD Station em prod. Owner: @devops + Matheus.
3. **ADRs registrados** (ESLint rule, schema Zod compartilhado, contrato cross-product, PDF stack, token policy, política client↔server, etc.) — ver documento de validação.

## Stories adicionadas na validação

- **S1.7** — Collection `calculadora-events` (movida da S4.5).
- **S1.8** — Contrato cross-product `calc-to-diag.ts`.
- **S1.9** — Schema Zod compartilhado + ESLint `no-restricted-imports`.
- **S3.0** — Change request Diagnóstico (bloqueia S3.4).
- **S4.0** — Setup custom fields RD (bloqueia S4.3).
- **S4.7** — Retry job RD (pode virar Fast-Follow).
