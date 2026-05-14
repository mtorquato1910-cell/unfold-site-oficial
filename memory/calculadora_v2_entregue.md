---
name: Calculadora v2 entregue
description: Calculadora de Performance v2 entregue completa (5 sprints, ~60 arquivos, 74 testes verdes) em 2026-05-14
type: project
---

Calculadora de Performance v2 entregue completa em 2026-05-14, totalizando 5 sprints (Foundation → UI → Resultado → Persistência → Painel/PDF/polish).

**Why:** A v1 usava IA não-determinística e formulário linear. A spec literal (`docs/calculadora-v2/SPEC.md` + `_spec_raw.txt`) exigia fórmulas determinísticas, recálculo em tempo real, 5 insights condicionais, persistência por campos nominados, dashboard de funil no painel, PDF e share.

**How to apply:** A calculadora vive em `/ferramentas/calculadora-trafego` e `/ferramentas/calculadora-trafego/r/[token]`. Painel admin em `/painel/calculadora` com dashboard de funil + listagem + detalhe v2 (com fallback legacy v1 para registros antigos). Toda submissão dispara recálculo server-side (ADR-7) — confiar nos campos `calc_*` da collection `calculadora-results` (não no JSON legacy `inputs`/`output`).

**Setup externo pendente para go-live em produção** (`docs/calculadora-v2/setup-pendente-calculadora.md`):
1. 10 custom fields no RD Station (`cf_calc_*`)
2. Env vars Vercel: `CRM_MODE=rd-station`, `RD_STATION_API_KEY`, `RD_CALC_CUSTOM_FIELDS_READY=true`, `EMAIL_MODE=resend`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `SLACK_WEBHOOK_URL`
3. Change request no produto Diagnóstico para aceitar prefill da Calculadora (`docs/calculadora-v2/change-request-diagnostico.md`)

**Débitos técnicos aceitos** (Fast-Follow pós go-live):
- Rate limit in-memory (ADR-8) — migrar para Vercel KV se tráfego justificar
- Anexos PDF no share por e-mail — v1 envia só link
- Retry cron para `rd_sync_status='failed'`

**Arquivos canônicos:**
- `src/lib/calculadora/*` — módulo puro (ADR-1 enforced por ESLint)
- `src/lib/calculadora-server/dashboard-queries.ts` — agregações painel
- `src/lib/calculadora-pdf/template.tsx` — PDF render
- `src/lib/contracts/calc-to-diag.ts` — contrato cross-product
- `src/lib/jobs/calc-nutricao.ts` — cron de nutrição
- `src/app/api/calculadora/{events,pdf,share,unsubscribe}/route.ts` — endpoints
- `src/app/(site)/ferramentas/calculadora-trafego/{page.tsx,_components,r/[token]}` — UI pública
- `src/app/(painel)/painel/calculadora/*` — UI admin
- `docs/calculadora-v2/release-notes.md` — release notes detalhadas

74 testes verdes (formulas, insights, benchmarks, schema, anti-tamper, score). Typecheck e ESLint verdes.
