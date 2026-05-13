# Sprint 4 — Integrações + Automações + PDF

**Story ID:** DIAG-S4
**Spec fonte:** `docs/diagnostico-spec.md` §10
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 4)
**Status:** pending
**Estimativa:** 2 sessões
**Depende de:** DIAG-S3

## Goal

Codificar os 6 fluxos automatizados, geração de PDF e adapters de RD Station, Calendly e OpenRouter. **Todas as integrações em modo mock até as keys/URLs chegarem** — env vars vazias, fallback funcional.

## User Stories

- Como sistema, preciso sincronizar leads no RD Station com 10 custom fields populados pelo diagnóstico (quando a key chegar — modo mock por padrão).
- Como lead, preciso baixar um PDF do meu resultado para arquivo/compartilhamento.
- Como Gabriel, preciso receber notificação automática quando um lead Fit Alto/Médio conclui o diagnóstico.

## Tasks

- [ ] **T4.1** Adapter `src/lib/crm/rd-station.ts` — 10 custom fields, tags, funil, webhook HMAC, retry, modo mock
- [ ] **T4.2** Adapter `src/lib/calendar/calendly.ts` — embed por faixa, webhook signing, modo placeholder
- [ ] **T4.3** Adapter `src/lib/ai/openrouter.ts` — cliente Claude Sonnet 4.5, lê prompt de `AIPrompts` collection, fallback estático
- [ ] **T4.4** `src/lib/pdf/diagnostico.ts` com `@react-pdf/renderer` + rota `api/diagnostico/pdf/[hash]`
- [ ] **T4.5** `src/lib/notifications/gabriel.ts` (email/Slack webhook)
- [ ] **T4.6** Webhook `api/webhooks/rd-station/route.ts` com HMAC SHA256
- [ ] **T4.7** Webhook `api/webhooks/calendly/route.ts` com signing key
- [ ] **T4.8** Cron `api/cron/nutricao-fit-baixo/route.ts` (24h pós-conclusão sem agendamento)
- [ ] **T4.9** Hook `DiagnosticoResults.afterChange` — aplicar tag faixa_fit + notificar Gabriel se fit alto/médio
- [ ] **T4.10** Atualizar template email resultado com link `/r/{hash}` + PDF anexo
- [ ] **T4.11** Expandir `SiteSettings` global com 3 URLs Calendly por faixa
- [ ] **T4.12** Atualizar `.env.example` com todas as keys novas (vazias + comentadas)

## Definition of Done

- [ ] Todas as integrações funcionam em modo mock (logs estruturados claros)
- [ ] Lead novo → email mock loga payload completo no console
- [ ] PDF do caso Roberto contém 7 blocos e abre no Chrome/Adobe/Preview
- [ ] `SiteSettings` no admin tem 3 campos de URL Calendly (vazios)
- [ ] Webhooks validam HMAC quando recebem requisição (401 se inválido)

## QA Gates

| ID | Critério |
|---|---|
| G4.1 | `RD_STATION_API_KEY` fake → adapter retorna erro estruturado, `rd_sync_status=error`, retry pega |
| G4.2 | PDF caso Roberto abre em 3 readers diferentes sem erro |
| G4.3 | Webhook Calendly assinado errado → 401 |
| G4.4 | Cron drop-off não dispara para lead que completou Etapa 2 |
| G4.5 | OpenRouter timeout → fallback para textos estáticos sem quebrar fluxo |

## File List

_(preenchida durante execução)_
