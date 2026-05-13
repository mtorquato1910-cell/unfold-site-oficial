# Sprint 5 — Mensuração + Painel v2

**Story ID:** DIAG-S5
**Spec fonte:** `docs/diagnostico-spec.md` §10.3
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 5)
**Status:** pending
**Estimativa:** 1 sessão
**Depende de:** DIAG-S3 (URL hash necessária para event tracking)

## Goal

Capturar os 9 eventos da spec e construir um dashboard de funil em `/painel/diagnostico/funil` para análise interna.

## User Stories

- Como time interno, preciso ver o funil completo do diagnóstico (iniciados → resultado → agendado) com conversão entre etapas.
- Como gestor, preciso filtrar leads por faixa de Fit, setor ou padrão acionado.
- Como time interno, preciso exportar a lista de leads em CSV para análise externa.

## Tasks

- [ ] **T5.1** Criar collection `DiagnosticoEvents` (event_name, result_hash, lead_email, metadata, created_at) — append-only
- [ ] **T5.2** Registrar `DiagnosticoEvents` no `payload.config.ts`
- [ ] **T5.3** Criar `src/lib/analytics/diagnostico-events.ts` — dispara para GA4 + endpoint interno
- [ ] **T5.4** Criar `api/analytics/event/route.ts` para persistir eventos
- [ ] **T5.5** Disparar 9 eventos da spec §10.3 nos pontos corretos
- [ ] **T5.6** Criar `/painel/diagnostico/funil/page.tsx` + `FunilClient.tsx` (cards + filtros + export CSV)
- [ ] **T5.7** Atualizar `/painel/diagnostico/[id]/page.tsx` para v2 (mostrar 5 scores + Fit + padrões + caminhos + ações)
- [ ] **T5.8** Botões "Reenviar email", "Sincronizar RD agora", "Forçar nutrição" no detalhe

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

_(preenchida durante execução)_
