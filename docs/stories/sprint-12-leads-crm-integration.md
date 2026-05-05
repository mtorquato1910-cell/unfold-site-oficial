# Sprint 12 — Leads CRM Integration (RD Station / HubSpot / Pipedrive)

**Estimativa:** 2 dias
**Prioridade:** ALTA
**Dependências:** S6

---

## Contexto

Hoje os leads ficam apenas dentro do Payload. Para uma operação comercial, precisam:
- Sincronizar com RD Station (CRM ativo da Unfold)
- Webhooks para Pipedrive / HubSpot opcionais
- Notificação Slack/Discord/Email para novos leads
- Lead scoring: pontuação baseada em origem + qualidade do diagnóstico
- Status workflow: new → contacted → qualified → won/lost

## Acceptance Criteria

- [ ] **AC1**: Lead criado no site → automaticamente sincroniza com RD Station via API
- [ ] **AC2**: Campo `crmId` armazena ID do lead no CRM externo
- [ ] **AC3**: Status atualizado no painel → atualiza no CRM
- [ ] **AC4**: Webhook URL configurável em `/admin/settings/integrations` (Slack/Discord/Email/HTTP)
- [ ] **AC5**: Lead score automático: +10 pts diagnóstico completo, +5 pts cargo C-level, +5 pts empresa >50 funcionários
- [ ] **AC6**: Filtros em `/admin/leads`: por status, por origem (UTM), por score (alto/médio/baixo)
- [ ] **AC7**: Bulk actions: selecionar múltiplos leads → exportar CSV / mudar status / atribuir owner
- [ ] **AC8**: Cada lead tem timeline: criado → diagnóstico → contatado → reuniões → fechado
- [ ] **AC9**: Atribuição: lead pode ter `assignedTo` (User do painel)
- [ ] **AC10**: Email automático para owner quando lead é atribuído

## Tasks Técnicas

### T1 — RD Station integration (0.75 dia)
- [ ] `src/lib/integrations/rd-station.ts` — OAuth2 + sync
- [ ] Hook `afterChange` em Leads: cria/atualiza no RD
- [ ] Settings page para configurar token

### T2 — Webhooks genéricos (0.5 dia)
- [ ] Collection `Webhooks` (name, url, events[], enabled, headers)
- [ ] Trigger em afterChange de Leads/Diagnostico/Posts
- [ ] Retry com backoff em caso de 5xx

### T3 — Lead scoring (0.25 dia)
- [ ] Função `calculateScore(lead)` em `src/lib/leads/score.ts`
- [ ] Hook beforeChange grava `score` e `scoreReason`

### T4 — UI Leads avançada (0.5 dia)
- [ ] Bulk select + dropdown de ações
- [ ] Filtros adicionais (score, owner, período)
- [ ] Coluna timeline expansível

## Definition of Done

- Lead novo aparece no RD Station em <30s
- Slack recebe ping com nome+empresa+score em canal #leads
- Score >70 fica destacado em verde no painel

---

## Ajustes da QA + Architect Review

- **AC11** LGPD: Lead armazena `consentGiven`, `consentSource`, `consentTimestamp`, `consentText`. Sync CRM só ocorre se `consentGiven=true`
- **AC12** Idempotência: sync usa hash(email+createdAt) como idempotency key. Verifica `crmId` antes de POST
- **AC13** Sync **assíncrono**: `afterChange` enfileira em coluna `sync_status='pending'`. Cron processa via dispatcher
- **AC14** Após N=5 retries com backoff, lead vai para `sync_status='failed'` + alerta Slack/email
- **DEP** Depende de **S13** (sender de email) e **S7.5** (RBAC). Reusa `webhookDispatcher` introduzido em S13
