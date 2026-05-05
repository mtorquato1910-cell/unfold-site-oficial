# Sprint 13 — Notifications & Email System

**Estimativa:** 2 dias
**Prioridade:** MÉDIA
**Dependências:** S8, S12

---

## Contexto

O painel precisa de um sistema centralizado de notificações:
- Email via Resend (transacional)
- In-app notifications (sino do header)
- Templates editáveis
- Triggers configuráveis

## Acceptance Criteria

- [ ] **AC1**: Collection `EmailTemplates` (name, slug, subject, htmlBody, variables[], enabled)
- [ ] **AC2**: Templates seed: lead-novo, post-em-revisao, post-aprovado, lead-atribuido, diagnostico-concluido
- [ ] **AC3**: Tela `/admin/email/templates` — CRUD com editor HTML/Markdown + preview
- [ ] **AC4**: Tela `/admin/email/logs` — histórico de envios (sent/failed/bounced)
- [ ] **AC5**: Collection `Notifications` (userId, type, title, message, link, read, createdAt)
- [ ] **AC6**: Sino do header → dropdown com últimas 10 notificações + "Ver todas"
- [ ] **AC7**: Tela `/admin/notifications` — lista + filtros + marcar como lido
- [ ] **AC8**: Settings `/admin/settings/notifications` — usuário escolhe quais quer receber por email vs in-app
- [ ] **AC9**: Resend SDK configurado via `RESEND_API_KEY`
- [ ] **AC10**: Função `sendEmail(template, to, vars)` reusável

## Tasks Técnicas

### T1 — Resend setup (0.25 dia)
- [ ] Instalar `resend`
- [ ] `src/lib/email/client.ts` — wrapper
- [ ] Env var `RESEND_API_KEY`

### T2 — Collections (0.5 dia)
- [ ] `src/collections/EmailTemplates.ts`
- [ ] `src/collections/Notifications.ts`
- [ ] `src/collections/EmailLogs.ts`

### T3 — Renderer & sender (0.5 dia)
- [ ] `src/lib/email/renderer.ts` — Handlebars-like {{var}} replacement
- [ ] `src/lib/email/sender.ts` — sendEmail(slug, to, vars) → resolve template + envia + grava log

### T4 — UI (0.75 dia)
- [ ] Bell dropdown no PainelLayout
- [ ] `/admin/notifications` lista
- [ ] `/admin/email/templates` editor
- [ ] `/admin/email/logs` viewer

## Definition of Done

- Novo lead → email chega em ecnologia@unfoldgrowth.com.br em <30s
- Sino do header mostra badge vermelho quando há notificação não lida
- Editor de template tem preview ao vivo

---

## Ajustes da QA + Architect Review

- **PRIORIDADE ELEVADA**: S13 vira **dependência de S8/S12**. Implementar PRIMEIRO
- **AC11** Templates HTML sanitizados via **DOMPurify** no preview e renderer. Variáveis SEMPRE escapadas
- **AC12** Endpoint `/api/webhooks/resend` recebe eventos bounce/complaint e atualiza EmailLogs (marca emails inválidos)
- **AC13** Emails marketing incluem `List-Unsubscribe` header + link de unsubscribe (CAN-SPAM/LGPD)
- **AC14** Variáveis de template usam **allowlist por template** (não free-form): previne SSRF/leak de campos sensíveis
- **AC15** `webhookDispatcher` introduzido AQUI como helper compartilhado (retry+backoff+log) — reusado por S12
- **AC16** Settings `/admin/settings/notifications`: usuário escolhe in-app vs email vs ambos por tipo
