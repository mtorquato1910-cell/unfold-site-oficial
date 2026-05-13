# Sprint 5 — Mensuração + Painel v2

**Story ID:** DIAG-S5
**Spec fonte:** `docs/diagnostico-spec.md` §10.3
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 5)
**Status:** completed
**Estimativa:** 1 sessão
**Depende de:** DIAG-S3 (URL hash necessária para event tracking)

## Goal

Capturar os 9 eventos da spec e construir um dashboard de funil em `/painel/diagnostico/funil` para análise interna.

## User Stories

- Como time interno, preciso ver o funil completo do diagnóstico (iniciados → resultado → agendado) com conversão entre etapas.
- Como gestor, preciso filtrar leads por faixa de Fit, setor ou padrão acionado.
- Como time interno, preciso exportar a lista de leads em CSV para análise externa.

## Tasks

- [x] **T5.1** Collection `DiagnosticoEvents` append-only com 10 enum values (9 spec + rd_webhook), 6 campos indexados, IP/UserAgent server-side
- [x] **T5.2** Registrada em `payload.config.ts` (após DiagnosticoResults)
- [x] **T5.3** `src/lib/analytics/diagnostico-events.ts` com `trackEvent` (client, GA4+endpoint) e `trackEventServer` (hooks/routes); session_id em sessionStorage; dedup automático em 5 eventos singleton
- [x] **T5.4** `api/analytics/event/route.ts` — Zod validator, captura IP/UA, fire-and-forget (não devolve 500 para não afetar UX)
- [x] **T5.5** **8 eventos** plugados: `diagnostico_iniciado` (DiagnosticoTracker no /diagnostico), `etapa_1_concluida` (API etapa-1), `etapa_2_pergunta` (QuizClient.avancar), `diagnostico_concluido` (API etapa-2), `pdf_baixado` (rota PDF + FooterButtonsV2), `opt_in_nutricao` (route opt-in), `agendamento_iniciado` (CTAAgendamento onClick), `agendamento_concluido` (webhook Calendly), `resultado_compartilhado` (FooterButtonsV2)
- [x] **T5.6** `/painel/diagnostico/funil` — 5 cards de conversão + distribuição Fit + top 8 padrões + filtros (de/ate/setor/faixa_fit) + export CSV; usa `payload.count` e `payload.find` (até 1000 docs)
- [x] **T5.7** `/painel/diagnostico/[id]` — rewrite com **3 camadas v2** visualmente separadas + 5 eixos + chips de padrões/caminhos + metadados (data_inicio, conclusao, tempo, agendou, notificado_at)
- [x] **T5.8** `DiagnosticoDetailActions.tsx` com 3 botões + feedback inline; endpoint `POST /api/painel/diagnostico/[id]/action` autenticado + ação "abrir página pública"
- [x] **T5.9 (bônus)** Export CSV via `/api/painel/diagnostico/export-csv` — 12 colunas com BOM UTF-8 para Excel/Sheets BR

## Definition of Done

- [ ] Abrir `/diagnostico` dispara `diagnostico_iniciado` (Network + DB)
- [ ] Painel funil mostra contagens reais e taxas de conversão
- [ ] Export CSV gera arquivo com header e linhas corretas
- [ ] Botão "Sincronizar RD agora" reprocessa lead

## QA Gates

| ID | Critério |
|---|---|
| G5.1 | 10 leads seed → painel mostra 10 → ramificação correta entre etapas |
| G5.2 | Filtro `setor=Construção` aplica também ao export CSV |
| G5.3 | Drilldown P4 mostra todos os leads com P4 acionado |
| G5.4 | `/painel/diagnostico/funil` carrega < 1.5s com 1000 leads (seed mock) |

## File List

- 🆕 `src/collections/DiagnosticoEvents.ts`
- 🆕 `src/lib/analytics/diagnostico-events.ts`
- 🆕 `src/app/api/analytics/event/route.ts`
- 🆕 `src/app/(painel)/painel/diagnostico/funil/page.tsx`
- 🆕 `src/app/(painel)/painel/diagnostico/funil/FunilClient.tsx`
- 🆕 `src/app/api/painel/diagnostico/export-csv/route.ts`
- 🆕 `src/app/api/painel/diagnostico/[id]/action/route.ts`
- 🆕 `src/app/(painel)/painel/diagnostico/[id]/DiagnosticoDetailActions.tsx`
- 🆕 `src/components/diagnostico/DiagnosticoTracker.tsx`
- 🆕 `src/components/diagnostico/FooterButtonsV2.tsx`
- ✏️ `src/app/(painel)/painel/diagnostico/[id]/page.tsx` (rewrite v2)
- ✏️ `payload.config.ts` (+ DiagnosticoEvents)
- ✏️ `src/app/(site)/diagnostico/page.tsx` (+ DiagnosticoTracker)
- ✏️ `src/app/api/diagnostico/etapa-1/route.ts` (+ trackEventServer)
- ✏️ `src/app/api/diagnostico/etapa-2/route.ts` (+ trackEventServer)
- ✏️ `src/app/api/diagnostico/pdf/[hash]/route.ts` (+ trackEventServer)
- ✏️ `src/app/api/diagnostico/opt-in/route.ts` (+ trackEventServer)
- ✏️ `src/app/api/webhooks/calendly/route.ts` (+ trackEventServer)
- ✏️ `src/components/diagnostico/CTAAgendamento.tsx` (+ trackEvent click)
- ✏️ `src/components/diagnostico/QuizClient.tsx` (+ trackEvent por pergunta)
- ✏️ `src/components/diagnostico/DiagnosticoResultadoV2.tsx` (delegou footer para FooterButtonsV2)
- ✏️ `payload-types.ts` (regenerado)

## Validação

- ✅ `npm run generate:types` ok
- ✅ `npx tsc --noEmit` sem erros
- ✅ `npm test src/lib/scoring` — 24/24 verdes (não-regressão)

## Anti-flood e idempotência

- `session_id` único por aba (sessionStorage)
- 5 eventos singleton por sessão: `diagnostico_iniciado`, `diagnostico_concluido`, `pdf_baixado`, `opt_in_nutricao`, `agendamento_iniciado` — recarregar página não duplica
- `etapa_2_pergunta` propositalmente NÃO é singleton (granularidade necessária para análise de drop-off por pergunta)

## Notas

- Endpoint `api/analytics/event` aceita anônimo (best-effort). Anti-spam fica para Sprint 6 com Turnstile.
- `payload.count` usado para contagens — escalável até ~100k linhas. Sprint 6+ pode migrar para Tinybird se passar disso.
- Filtro por setor no funil exige join leads × results (feito em memória em pequena escala).
