# Sprint 2 — Etapa 1 v2 + Quiz v2

**Story ID:** DIAG-S2
**Spec fonte:** `docs/diagnostico-spec.md` §3, §4
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 2)
**Status:** completed (essencial — UI/E2E manual fica para validação no browser)
**Estimativa:** 1 sessão
**Depende de:** DIAG-S1

## Goal

Atualizar a UX da Etapa 1 (7 campos exatos da spec) e do Quiz (microcopy de transição entre pilares, barra de progresso, tratamento Q4/Q8 no payload). Habilitar reengajamento de drop-off da Etapa 2.

## User Stories

- Como lead, preciso preencher 7 campos com opções relevantes ao meu contexto, para que o diagnóstico seja preciso.
- Como lead, preciso ver microcopy de transição entre pilares, para entender o avanço e não desistir.
- Como sistema, preciso disparar um e-mail de retomada se o lead concluiu a Etapa 1 mas não a Etapa 2 em 1h.

## Tasks

- [x] **T2.1** Refatorar `DiagnosticoEtapa1Form.tsx` — 7 campos (cargo, setor, faturamento_faixa, urgencia) + microcopy de abertura literal da spec
- [x] **T2.2** Atualizar Zod schema em `api/diagnostico/etapa-1/route.ts` + persistir `data_inicio` no JWT (campo do lead capturado em afterChange via webhook futuro)
- [x] **T2.3** Atualizar `QuizClient.tsx` — microcopy de transição entre pilares (tela interlude), barra X/12, payload envia letras A/B/C/D/E
- [x] **T2.4** Atualizar `src/scripts/seed-diagnostico.ts` com as 12 perguntas EXATAS da spec §4.3 (Q4 com 5 opções, E pontua 0)
- [x] **T2.5** Persistir `data_conclusao` + `tempo_total_segundos` no submit final (gravados em `respostas_etapa1_raw` JSON)
- [x] **T2.6** Criar `api/cron/reengajamento-drop-off/route.ts` (filtra leads 1h-7d sem `diagnostico_result_id`, dispara email com modo mock)
- [x] **T2.7** Atualizar `vercel.json` com cron `30 9 * * *` (9:30 UTC = 6:30 BRT)

## Definition of Done

- [ ] Form com 7 campos, validação Zod, microcopy de abertura
- [ ] Quiz com microcopy de transição + barra de progresso
- [ ] `curl /api/seed/diagnostico` reseta 12 perguntas para a spec
- [ ] Cron drop-off agendado no Vercel

## QA Gates

| ID | Critério |
|---|---|
| G2.1 | Fluxo completo manual: 7 campos → 12 perguntas → DB grava todas as 3 camadas |
| G2.2 | Caso Roberto via API: DB grava `score_consolidado=22, score_fit=58.84, padroes_exibidos=[P4,P8,P2]` |
| G2.3 | Sem locale forçado, mudar idioma do navegador não quebra |
| G2.4 | Mobile 375px: form e quiz sem overflow |

## File List

- ✏️ `src/scripts/seed-diagnostico.ts` (rewrite com 12 perguntas exatas + Q4 5 opções)
- ✏️ `src/components/diagnostico/DiagnosticoEtapa1Form.tsx` (7 campos + microcopy spec)
- ✏️ `src/app/api/diagnostico/etapa-1/route.ts` (novo schema Zod + JWT com etapa1 completa + data_inicio)
- ✏️ `src/components/diagnostico/QuizClient.tsx` (microcopy de transição, barra X/12, payload v2)
- ✏️ `src/app/(site)/diagnostico/etapa-2/[token]/page.tsx` (atualização de tipos do quiz)
- ✏️ `src/app/api/diagnostico/etapa-2/route.ts` (consome engine v2 `calcularDiagnostico` + persiste 3 camadas)
- 🆕 `src/app/api/cron/reengajamento-drop-off/route.ts` (cron + template HTML do email)
- ✏️ `vercel.json` (+ cron de reengajamento)
- ✏️ `payload-types.ts` (regenerado pelo Payload com schemas v2)

## Validação

- ✅ `npm run generate:types` regenerou tipos do Payload com os 18 campos novos
- ✅ `npx tsc --noEmit` sem erros
- ✅ `npm test src/lib/scoring` — 24/24 testes ainda passam (sem regressão na engine)

## Notas

- Microcopy de transição implementada como tela "interlude" antes da 1ª pergunta de cada pilar (não tela cheia entre todas as perguntas).
- Q4 com 5 opções é servida pelo CMS porque o seed grava 5 itens em `opcoes`. O QuizClient deriva a letra pelo índice (idx 0..4 → A..E).
- O cron usa o adapter `@/lib/email/adapter` que já tem modo mock embutido — sem Resend key, ele só loga.
