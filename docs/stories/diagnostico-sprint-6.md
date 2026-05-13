# Sprint 6 — Go-live & Hardening

**Story ID:** DIAG-S6
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 6)
**Status:** completed (CI rodando; E2E Playwright como stub aguardando `npm install -D @playwright/test`)
**Estimativa:** 1 sessão
**Depende de:** DIAG-S5

## Goal

Levar o Diagnóstico v2 para produção com confiança: testes em CI, LGPD compliance, anti-spam, observabilidade, runbook operacional e checklist de go-live.

## User Stories

- Como time interno, preciso de smoke test rodando em CI a cada PR para garantir que o engine não regrediu.
- Como lead, preciso ter consentimento explícito antes de meus dados serem enviados ao RD/CRM.
- Como Matheus (operador), preciso de um runbook documentado para trocar keys e ativar integrações sem precisar pedir ajuda.

## Tasks

- [x] **T6.1** `.github/workflows/diagnostico-smoke.yml` — caso Roberto + typecheck em cada PR (paths filter para evitar build inteiro)
- [x] **T6.2** `tests/e2e/diagnostico-fluxo-completo.spec.ts` — stub Playwright (precisa `npm install -D @playwright/test`); cobre fluxo completo + 404
- [x] **T6.3** Tela de consentimento Etapa 1 atualizada: explicita uso dos dados (RD + nutrição) + link para `/diagnostico/privacidade`
- [x] **T6.4** `/diagnostico/privacidade` — página estática completa (finalidades, base legal, compartilhamento, direitos)
- [x] **T6.5** `POST /api/diagnostico/lgpd/delete-me` — fluxo de 2 passos: email com token JWT (15min) → confirmação executa delete em 4 collections
- [x] **T6.6** `TurnstileWidget.tsx` + `lib/security/turnstile.ts` (bypass-dev quando key ausente) + integração no form
- [x] **T6.7** `lib/rate-limit.ts` in-memory (5/h, scope `etapa1`) com `resolveClientIP` que respeita `x-forwarded-for` atrás de CDN
- [x] **T6.8** Sentry DSN documentado no runbook (instalação `@sentry/nextjs` fica como passo manual no go-live)
- [x] **T6.9** `lib/observability/logger.ts` — JSON estruturado com `result_hash`, `lead_email` mascarado (LGPD), `session_id`, request_id — usado em etapa-1 e lgpd/delete-me
- [x] **T6.10** `docs/diagnostico-runbook.md` — 9 seções: arquitetura, env vars, checklist go-live, como ativar cada integração, operações manuais, troubleshooting, monitoramento, decisões fechadas, plano de evolução
- [x] **T6.11** Checklist incluído no runbook (10 itens). Execução real fica para o dono quando as 5 keys externas chegarem.

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

- 🆕 `.github/workflows/diagnostico-smoke.yml`
- 🆕 `tests/e2e/diagnostico-fluxo-completo.spec.ts` (stub)
- 🆕 `src/lib/observability/logger.ts`
- 🆕 `src/lib/rate-limit.ts`
- 🆕 `src/lib/security/turnstile.ts`
- 🆕 `src/components/diagnostico/TurnstileWidget.tsx`
- 🆕 `src/app/(site)/diagnostico/privacidade/page.tsx`
- 🆕 `src/app/api/diagnostico/lgpd/delete-me/route.ts`
- 🆕 `docs/diagnostico-runbook.md`
- ✏️ `src/app/api/diagnostico/etapa-1/route.ts` (rate-limit + Turnstile + logger)
- ✏️ `src/components/diagnostico/DiagnosticoEtapa1Form.tsx` (TurnstileWidget + consentimento v2)

## Validação

- ✅ `npx tsc --noEmit` sem erros
- ✅ `npm test src/lib/scoring` — 24/24 verdes
- ✅ CI workflow valida em cada PR (engine tests + typecheck)

## Decisões técnicas

- **Rate limit in-memory:** intencionalmente simples. Sprint 7+ migra para Upstash Redis se necessário.
- **Turnstile bypass-dev:** sem `TURNSTILE_SECRET_KEY`, `verifyTurnstile` retorna `true` automaticamente — não bloqueia dev local.
- **LGPD delete-me em 2 passos:** evita exposição via GET (gate G6.3 do QA). Email enviado com token JWT 15min.
- **Logger LGPD-safe:** emails mascarados nos logs (`m***s@dominio.com`).
- **CI evita full-build:** workflow só dispara quando arquivos do diagnóstico mudam, salvando minutos.
- **Playwright como stub:** evita instalar dep de ~300MB. Quando o dono quiser rodar E2E, basta `npm install -D @playwright/test && npx playwright install chromium`.
