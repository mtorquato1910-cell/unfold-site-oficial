# Sprint 11 — Analytics Dashboard (KPIs Reais)

**Estimativa:** 2-3 dias
**Prioridade:** MÉDIA
**Dependências:** S4 (Dashboard)

---

## Contexto

Hoje o Dashboard mostra apenas contagens estáticas (Posts: 0, Cases: 0). Precisamos:
- Gráficos de tráfego (GA4 API ou Plausible)
- Funil de conversão (visitante → diagnóstico → lead → cliente)
- Top posts mais lidos
- Cases mais visualizados
- Origem de leads (UTM, referer)
- Performance dos diagnósticos (taxa de conclusão por questão)

## Acceptance Criteria

- [ ] **AC1**: Dashboard mostra cards: visitantes (7d/30d), leads (7d/30d), diagnósticos (7d/30d), taxa de conversão
- [ ] **AC2**: Gráfico linha: visitantes/dia últimos 30 dias
- [ ] **AC3**: Gráfico pizza: origem dos leads (UTM source) últimos 30 dias
- [ ] **AC4**: Tabela: top 5 posts mais lidos no período
- [ ] **AC5**: Funil: Visitantes → Iniciaram Diagnóstico → Concluíram → Viraram Lead → Convertidos
- [ ] **AC6**: Filtros: período (7d/30d/90d/todo), comparação com período anterior
- [ ] **AC7**: Integração com GA4 Data API ou Plausible API (via env vars)
- [ ] **AC8**: Cache de queries pesadas (5-15min) para não estourar quota da API

## Tasks Técnicas

### T1 — Integração GA4 ou Plausible (1 dia)
- [ ] `src/lib/analytics/ga4.ts` — wrapper da Google Analytics Data API
- [ ] OU `src/lib/analytics/plausible.ts` — Plausible API
- [ ] Cache via `unstable_cache` do Next.js

### T2 — Gráficos (Recharts) (1 dia)
- [ ] Instalar `recharts`
- [ ] Componente `<LineChart />` (visitantes/dia)
- [ ] Componente `<PieChart />` (UTM source)
- [ ] Componente `<FunnelChart />` (conversão)

### T3 — UI Dashboard renovada (0.5 dia)
- [ ] Nova tela `/admin` com seções: Overview / Tráfego / Leads / Conteúdo
- [ ] Filtro de período (DateRangePicker)
- [ ] Comparação % vs período anterior em cada KPI

### T4 — Internal events tracking (0.5 dia)
- [ ] Collection `Events` no Payload (eventName, userId, sessionId, payload, createdAt)
- [ ] API route `/api/events` recebe events do site
- [ ] Tracking interno: post_view, case_view, diagnostico_started, diagnostico_completed

## Definition of Done

- Admin abre /admin e vê tráfego real dos últimos 7 dias
- Filtro 30d → 7d atualiza todos os cards e gráficos
- Cards mostram trend (+12% vs período anterior) com seta verde/vermelha

---

## Ajustes da QA + Architect Review

- **DECISÃO**: Provider = **PostHog** (free tier 1M events/mês, unifica pageviews+eventos custom)
- **AC9** Endpoint `/api/events` tem rate limit (60 req/min/IP) + origin allowlist + payload schema validation (zod)
- **AC10** Falha do PostHog API: dashboard usa **último cache válido** + banner "dados desatualizados desde X"
- **AC11** Collection `Events` no Payload **NÃO armazena pageviews** (só eventos de negócio: diagnostico_iniciado/concluido)
- **AC12** Cookie `unfold_anon_id` (UUID) compartilhado site↔painel. Funil cruza GA/PostHog ↔ Payload via esse ID
- **AC13** "Visitante" = sessão única por dia (não pageview). Métrica canônica documentada
