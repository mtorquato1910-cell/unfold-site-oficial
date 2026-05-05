# Sprint 15 — Curadoria de Insights + Tool Usage Visibility

**Estimativa:** 2 dias
**Prioridade:** 🔥 ALTA
**Dependências:** S7.5 (RBAC), S12 (Lead score, opcional)

---

## Contexto

Necessidades do cliente (mensagem 2026-05-05):
- (5) Selecionar quais Insights aparecem no site público
- (7) Visualizar pessoas que usaram as **ferramentas** (Calculadora de Tráfego + Diagnóstico) — não só agregado, mas individual: quem é a pessoa, o que respondeu, o resultado

Hoje:
- `InsightsVariations` collection existe mas não tem flag de "publicado/featured"
- `DiagnosticoResults` existe mas falta tela de **drill-down individual**
- **Calculadora**: `/api/calculadora` existe mas **não há collection** que armazene quem submeteu

## Acceptance Criteria

### Parte 1 — Curadoria de Insights

- [ ] **AC1**: `InsightsVariations` ganha campos `featured` (boolean) e `publishOrder` (number)
- [ ] **AC2**: Tela `/admin/insights` mostra toggle "Publicar no site" por insight + reorder via drag (ou setas up/down)
- [ ] **AC3**: Site público (`/` ou `/insights` se houver) lê apenas `featured=true`, ordenado por `publishOrder`
- [ ] **AC4**: Editor pode marcar/desmarcar; Admin pode reordenar e definir até N=6 destaques
- [ ] **AC5**: Bulk action: "Despublicar todos" + "Publicar selecionados"

### Parte 2 — Tool Usage (Calculadora)

- [ ] **AC6**: Nova collection `CalculadoraResults` com fields: `nome`, `email`, `empresa`, `cargo`, `inputs` (JSON), `output` (JSON), `score`, `leadId` (relação opcional)
- [ ] **AC7**: API route `/api/calculadora` agora **persiste** o resultado em `CalculadoraResults` (mantém envio de email atual)
- [ ] **AC8**: Tela `/admin/calculadora` lista todas as submissões com filtros (período, score, empresa)
- [ ] **AC9**: Tela `/admin/calculadora/[id]` mostra detalhes: inputs digitados + output gerado + email enviado + lead vinculado
- [ ] **AC10**: Sidebar do painel ganha item "Ferramentas" com sub-items: "Diagnóstico" e "Calculadora"

### Parte 3 — Tool Usage (Diagnóstico) — drill-down

- [ ] **AC11**: Tela `/admin/diagnostico/[id]` mostra: quem é (lead+contato), respostas pergunta-a-pergunta, score por dimensão, insight gerado, data
- [ ] **AC12**: Filtros em `/admin/diagnostico`: por período, score range, fit (alto/médio/baixo), empresa
- [ ] **AC13**: Export CSV: lista filtrada com colunas selecionáveis
- [ ] **AC14**: Vínculo Lead ↔ DiagnósticoResult exibido (clicar no lead vai para o diag e vice-versa)

## Tasks Técnicas

### T1 — Insights curation (0.5 dia)
- [ ] Migrate `InsightsVariations`: adicionar `featured` + `publishOrder`
- [ ] UI `/admin/insights`: toggle por linha + reorder
- [ ] Server action `toggleInsightPublic(id, featured)` + `reorderInsights(ids[])`
- [ ] Site público: filtrar por `featured=true`

### T2 — CalculadoraResults collection (0.5 dia)
- [ ] `src/collections/CalculadoraResults.ts`
- [ ] Endpoint `/api/calculadora`: cria entrada na collection + dispara email (já existe)
- [ ] Hook afterChange grava AuditLog

### T3 — Tela /admin/calculadora (0.5 dia)
- [ ] Listagem com filtros + paginação
- [ ] Drill-down `/admin/calculadora/[id]`
- [ ] Sidebar: novo item "Ferramentas" expansível

### T4 — Drill-down Diagnóstico (0.5 dia)
- [ ] `/admin/diagnostico/[id]/page.tsx` com layout estruturado
- [ ] Vínculo bidirecional Lead ↔ DiagnósticoResult
- [ ] Export CSV via Server Action

## Ajustes da QA Review (LGPD + dedup Lead — BLOQUEANTES p/ Parte 2)

- **AC15 [LGPD]** Formulário da Calculadora exige checkbox de consentimento. `CalculadoraResults` armazena `consent.given`, `consent.timestamp`, `consent.ip`, `consent.policyVersion`
- **AC16 [LGPD]** Política de retenção (default 24 meses, configurável em SiteSettings). Cron mensal anonimiza registros expirados
- **AC17 [Dedup]** Submissão da Calculadora faz **upsert em Leads por email**: se existe, vincula `leadId` + atualiza `lastInteractionAt`; se não, cria Lead com `source='calculadora'`. Idempotência via hash `email+inputs`
- **AC18 [LGPD]** `/admin/calculadora/[id]` tem botão "Excluir (LGPD)" com `requireRole('admin')` + log em AuditLog com motivo
- **AC19 [Concurrency]** Reorder de insights usa optimistic locking (`version`); 409 em conflito
- **AC20 [Export]** Export CSV em streaming + sanitização anti-formula-injection (`=`, `+`, `-`, `@`); jobs >5k linhas via async com email
- **AC21 [Limit]** Toggle `featured` enforce server-side (limit em `SiteSettings.featuredInsightsLimit`, default 6); UI mostra contador `3/6`
- **AC22 [Rate-limit]** `/api/calculadora` tem rate limit (10 req/IP/hora) para evitar spam

## Definition of Done

- Editor consegue marcar 6 insights como "publicar" e reordenar
- Site público mostra exatamente esses 6 na ordem definida
- Toda submissão de Calculadora aparece em `/admin/calculadora` em <10s
- Detalhe de diagnóstico mostra respostas pergunta-a-pergunta
- Export CSV funciona com 1000+ linhas
- TypeScript + lint sem erros
