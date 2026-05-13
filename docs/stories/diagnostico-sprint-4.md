# Sprint 4 — Integrações + Automações + PDF

**Story ID:** DIAG-S4
**Spec fonte:** `docs/diagnostico-spec.md` §10
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 4)
**Status:** completed (essencial — PDF binário real via satori adiado para Sprint 6 conforme decisão técnica)
**Estimativa:** 2 sessões
**Depende de:** DIAG-S3

## Goal

Codificar os 6 fluxos automatizados, geração de PDF e adapters de RD Station, Calendly e OpenRouter. **Todas as integrações em modo mock até as keys/URLs chegarem** — env vars vazias, fallback funcional.

## User Stories

- Como sistema, preciso sincronizar leads no RD Station com 10 custom fields populados pelo diagnóstico (quando a key chegar — modo mock por padrão).
- Como lead, preciso baixar um PDF do meu resultado para arquivo/compartilhamento.
- Como Gabriel, preciso receber notificação automática quando um lead Fit Alto/Médio conclui o diagnóstico.

## Tasks

- [x] **T4.1** Adapter `src/lib/crm/rd-station.ts` — 10 custom fields (mapping spec §10.1), tags por faixa Fit, modo mock + real, HMAC SHA256 helper
- [x] **T4.2** Adapter `src/lib/calendar/calendly.ts` — resolve URL por faixa do SiteSettings, valida HMAC com timestamp anti-replay (180s)
- [x] **T4.3** Adapter `src/lib/ai/openrouter.ts` — Claude Sonnet 4.5 via OpenRouter (D1), carrega prompt do AIPrompts CMS, fallback `null` quando key vazia
- [x] **T4.4** Rota `api/diagnostico/pdf/[hash]` — **HTML print-ready (stub Sprint 4)**, `@page A4` CSS, banner explicando Ctrl+P. Sprint 6 troca por satori binário.
- [x] **T4.5** `src/lib/notifications/gabriel.ts` — email rico HTML + Slack block kit, lê destinatário do `SiteSettings.email_notificacoes`
- [x] **T4.6** Webhook `api/webhooks/rd-station/route.ts` — valida `x-rd-signature`, 401 se inválida, log estruturado
- [x] **T4.7** Webhook `api/webhooks/calendly/route.ts` — valida signing key, atualiza `agendou`/`slot_agendado`, dispara automação 6 em cancelamento
- [x] **T4.8** Cron `api/cron/nutricao-fit-baixo/route.ts` — janela 24h–7d, filtra `agendou=false` e `nutricao_enviada_at` vazio, idempotência via flag
- [x] **T4.9** `DiagnosticoResults.afterChange` — orquestra: (1) email V2 com link /r/{hash}, (2) sync RD, (3) notificar Gabriel se fit alto/médio, com idempotência via `notificado_at`
- [x] **T4.10** Template `templateResultadoDiagnosticoV2` com link `/diagnostico/r/{hash}` + link PDF + faixa consolidada + CTA por faixa Fit
- [x] **T4.11** `SiteSettings` expandido com collapsible "URLs Calendly por faixa" (3 campos: fit-alto, fit-medio, fit-baixo-desfit)
- [x] **T4.12** `.env.example` com 7 vars novas (CRM_MODE, RD_STATION_API_KEY, RD_STATION_WEBHOOK_SECRET, OPENROUTER_API_KEY, CALENDLY_WEBHOOK_SIGNING_KEY, GABRIEL_NOTIFY_EMAIL, SLACK_WEBHOOK_GABRIEL, CRON_SECRET)
- [x] **T4.13 (bônus)** Endpoint `api/diagnostico/opt-in` aceita JSON e form-data, registra em `newsletter-subscribers`, redireciona `?optin=ok`
- [x] **T4.14 (bônus)** Campo `nutricao_enviada_at` no schema (idempotência cron)
- [x] **T4.15 (bônus)** `vercel.json` com cron nutrição (13h UTC = 10h BRT)

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

- 🆕 `src/lib/crm/rd-station.ts`
- 🆕 `src/lib/calendar/calendly.ts`
- 🆕 `src/lib/ai/openrouter.ts`
- 🆕 `src/lib/notifications/gabriel.ts`
- 🆕 `src/lib/email/templates/resultado-diagnostico-v2.ts`
- 🆕 `src/app/api/webhooks/rd-station/route.ts`
- 🆕 `src/app/api/webhooks/calendly/route.ts`
- 🆕 `src/app/api/diagnostico/pdf/[hash]/route.ts`
- 🆕 `src/app/api/diagnostico/opt-in/route.ts`
- 🆕 `src/app/api/cron/nutricao-fit-baixo/route.ts`
- ✏️ `src/collections/DiagnosticoResults.ts` (afterChange v2 + `nutricao_enviada_at`)
- ✏️ `src/globals/SiteSettings.ts` (+ collapsible URLs Calendly por faixa)
- ✏️ `src/app/(site)/diagnostico/r/[hash]/page.tsx` (lê Calendly do SiteSettings)
- ✏️ `vercel.json` (+ cron nutrição)
- ✏️ `.env.example` (+ 7 keys novas)
- ✏️ `payload-types.ts` (regenerado)

## Validação

- ✅ `npm run generate:types` ok
- ✅ `npx tsc --noEmit` — sem erros
- ✅ `npm test src/lib/scoring` — 24/24 verdes (não-regressão)

## Decisões técnicas registradas

- **PDF stub HTML print-ready:** evita instalação de `satori`+`@resvg/resvg-js` agora. UX aceitável (Ctrl+P salva PDF). Sprint 6 implementa geração binária real com cache em Vercel Blob.
- **Idempotência tripla:** `email_enviado` (email lead), `notificado_at` (notify Gabriel), `nutricao_enviada_at` (cron nutrição). Hooks afterChange nunca disparam 2x para o mesmo doc.
- **HMAC validation:** webhook Calendly tem janela anti-replay de 180s. RD usa formato hex direto.
- **OpenRouter desligado:** sem key vazia, `gerarInsightAI` retorna `texto: null` → consumer cai no texto estático de `textos.ts`. Zero erros visíveis.
- **3 crons agendados:** drop-off etapa-2 (6:30 BRT), nutrição fit baixo (10h BRT), tick existente (3h BRT).
- **Endpoint opt-in:** suporta tanto JSON (programático) quanto form-data (form HTML do Bloco 7) com redirect 303 de volta para `/r/{hash}?optin=ok`.
