# Sprint 2 — Etapa 1 v2 + Quiz v2

**Story ID:** DIAG-S2
**Spec fonte:** `docs/diagnostico-spec.md` §3, §4
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 2)
**Status:** pending
**Estimativa:** 1 sessão
**Depende de:** DIAG-S1

## Goal

Atualizar a UX da Etapa 1 (7 campos exatos da spec) e do Quiz (microcopy de transição entre pilares, barra de progresso, tratamento Q4/Q8 no payload). Habilitar reengajamento de drop-off da Etapa 2.

## User Stories

- Como lead, preciso preencher 7 campos com opções relevantes ao meu contexto, para que o diagnóstico seja preciso.
- Como lead, preciso ver microcopy de transição entre pilares, para entender o avanço e não desistir.
- Como sistema, preciso disparar um e-mail de retomada se o lead concluiu a Etapa 1 mas não a Etapa 2 em 1h.

## Tasks

- [ ] **T2.1** Refatorar `DiagnosticoEtapa1Form.tsx` — 7 campos (setor, faturamento_faixa, urgencia) + microcopy de abertura
- [ ] **T2.2** Atualizar Zod schema em `api/diagnostico/etapa-1/route.ts` + persistir `data_inicio`
- [ ] **T2.3** Atualizar `QuizClient.tsx` — microcopy de transição (4 textos), barra X/12, Q4 com 5 opções
- [ ] **T2.4** Atualizar seed `api/seed/diagnostico/route.ts` com textos exatos da spec §4.3
- [ ] **T2.5** Persistir `data_conclusao` + `tempo_total_segundos` no submit final
- [ ] **T2.6** Criar `api/cron/reengajamento-drop-off/route.ts` (modo mock se Resend vazio)
- [ ] **T2.7** Atualizar `vercel.json` com schedule do cron

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

_(preenchida durante execução)_
