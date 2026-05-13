# Sprint 6 — Go-live & Hardening

**Story ID:** DIAG-S6
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 6)
**Status:** pending
**Estimativa:** 1 sessão
**Depende de:** DIAG-S5

## Goal

Levar o Diagnóstico v2 para produção com confiança: testes em CI, LGPD compliance, anti-spam, observabilidade, runbook operacional e checklist de go-live.

## User Stories

- Como time interno, preciso de smoke test rodando em CI a cada PR para garantir que o engine não regrediu.
- Como lead, preciso ter consentimento explícito antes de meus dados serem enviados ao RD/CRM.
- Como Matheus (operador), preciso de um runbook documentado para trocar keys e ativar integrações sem precisar pedir ajuda.

## Tasks

- [ ] **T6.1** GitHub Action `.github/workflows/diagnostico-smoke.yml` — roda `caso-roberto.test.ts` em cada PR
- [ ] **T6.2** E2E Playwright em `tests/e2e/diagnostico-fluxo-completo.spec.ts`
- [ ] **T6.3** Atualizar tela de consentimento Etapa 1 (texto LGPD explícito sobre RD + nutrição)
- [ ] **T6.4** Página `/diagnostico/privacidade`
- [ ] **T6.5** Endpoint `api/diagnostico/lgpd/delete-me?email=` (soft delete)
- [ ] **T6.6** Integrar Cloudflare Turnstile no submit da Etapa 1
- [ ] **T6.7** Rate limit (5/h por IP) em `/api/diagnostico/etapa-1`
- [ ] **T6.8** Sentry no front e API routes (DSN no `.env`)
- [ ] **T6.9** Logs estruturados (JSON) com `result_hash` em todos os pontos
- [ ] **T6.10** Criar `docs/diagnostico-runbook.md` (operacional + troubleshooting)
- [ ] **T6.11** Executar checklist de go-live: env vars produção, funil/custom fields RD, smoke test prod

## Definition of Done

- [ ] CI green em `main`
- [ ] Sentry captura erros (testar com erro forçado)
- [ ] Runbook revisado
- [ ] Checklist 100% antes do switch produtivo

## QA Gates

| ID | Critério |
|---|---|
| G6.1 | Submit Etapa 1 sem Turnstile → 401 |
| G6.2 | 6 submits do mesmo IP em 1h → 429 no 6º |
| G6.3 | DELETE `/api/diagnostico/lgpd/delete-me?email=x` remove lead e resultado |
| G6.4 | Erro forçado na API → aparece no Sentry com `result_hash` |

## Checklist de Go-live (operacional)

- [ ] `.env` produção com `RD_STATION_API_KEY`, `RD_STATION_WEBHOOK_SECRET`, `CRM_MODE=rd-station`
- [ ] `.env` produção com `OPENROUTER_API_KEY`
- [ ] `SiteSettings` no admin com 3 URLs Calendly + `CALENDLY_WEBHOOK_SIGNING_KEY`
- [ ] Funil "Diagnóstico Concluído" criado no RD (4 estágios)
- [ ] 10 custom fields criados no RD
- [ ] Migration aplicada em produção
- [ ] Smoke test caso Roberto passa em prod

## File List

_(preenchida durante execução)_
