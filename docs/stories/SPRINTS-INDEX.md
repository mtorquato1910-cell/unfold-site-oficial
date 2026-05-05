# Unfold Growth — Admin Panel Migration
## Índice de Sprints

**Projeto:** Migração do Painel Admin (Lovable → Next.js + Payload CMS)  
**Início:** 2026-05-05  
**Stack:** Next.js 15 · Payload CMS 3 · TypeScript · Tailwind CSS  
**Rota do painel:** `/painel/*`

---

## Roadmap

### Fase 1 — MIGRAÇÃO (Lovable → Next.js + Payload) ✅

| Sprint | Nome | Estimativa | Status |
|--------|------|-----------|--------|
| [S1](sprint-1-logo-identidade-visual.md) | Logo & Identidade Visual | 1–2 dias | ✅ Done |
| [S2](sprint-2-design-system.md) | Design System & Tokens | 1 dia | ✅ Done |
| [S3](sprint-3-auth-login.md) | Auth & Login (Supabase) | 1–2 dias | ✅ Done |
| [S4](sprint-4-layout-dashboard.md) | Layout Base & Dashboard | 2 dias | ✅ Done |
| [S5](sprint-5-gestao-conteudo.md) | Gestão de Conteúdo (CRUD) | 3 dias | ✅ Done |
| [S6](sprint-6-crm-ia.md) | CRM & IA | 3 dias | ✅ Done |
| [S7](sprint-7-admin-configuracoes.md) | Admin & Configurações | 2 dias | ✅ Done |

### Fase 2 — FUNCIONALIDADES OPERACIONAIS (pós QA+Architect review)

**Ordem reordenada após review (dependências reais):**

| # | Sprint | Estimativa | Prioridade | Status |
|---|--------|-----------|-----------|--------|
| 1 | [S7.5 RBAC Real](sprint-7-5-rbac.md) | 1 dia | 🔥 BLOQUEADOR | ⬜ |
| 2 | [S13 Notifications & Email](sprint-13-notifications-email.md) | 2 dias | 🔥 ALTA | ⬜ |
| 3 | [S9 Site Editor](sprint-9-site-editor.md) | 4 dias | 🔥 ALTA | ⬜ |
| 4 | [S10 SEO Manager](sprint-10-seo-manager.md) | 2 dias | 🟡 MÉDIA | ⬜ |
| 5 | [S8 Workflow Editorial](sprint-8-workflow-editorial.md) | 3 dias | 🔥 ALTA | ⬜ |
| 6 | [S12 Leads CRM Integration](sprint-12-leads-crm-integration.md) | 2 dias | 🔥 ALTA | ⬜ |
| 7 | [S11 Analytics Dashboard](sprint-11-analytics-dashboard.md) | 2-3 dias | 🟡 MÉDIA | ⬜ |
| 8 | [S14 Versioning & Backup](sprint-14-versioning-backup.md) | 2 dias | 🟢 BAIXA | ⬜ |

**Total Fase 2:** ~18–19 dias

### Decisões técnicas (consolidadas após review)

- **Analytics:** PostHog (free 1M events/mês, unifica pageviews+eventos)
- **Email:** Resend
- **RBAC:** Supabase `app_metadata.role` (admin | editor)
- **Jobs:** `/api/cron/tick` multiplexador (1 cron Vercel)
- **Backup:** Supabase PITR nativo + GitHub Action `pg_dump`
- **Queue:** coluna `sync_status` em collections + cron retry (sem Inngest p/ MVP)
- **Cookie p/ funil:** `unfold_anon_id` (UUID) compartilhado site↔painel

### Padrões transversais (introduzir 1x, reusar)

- `requireRole(role)` — guard server-side (S7.5)
- `auditLog({ action, before, after, userId })` — logger central (S7.5)
- `sendEmail(slug, to, vars)` — sanitizado, renderer + send (S13)
- `webhookDispatcher({ event, payload, retries })` — retry+backoff+DLQ (S13)
- `seoFields()` factory — spread em collections (S10)
- `scheduledJobsRegistry` — `/api/cron/tick` itera jobs (S8/S12/S14)

---

## Arquitetura da Solução

```
Next.js 15 App Router
├── src/app/(site)/          → Site público (existente)
├── src/app/(payload)/       → Payload CMS admin em /admin (existente)
└── src/app/(painel)/        → NOVO painel customizado em /painel
    ├── layout.tsx           → Importa painel-globals.css
    └── painel/
        ├── login/           → Login com design Lovable
        ├── page.tsx         → Dashboard
        ├── posts/**         → CRUD Posts
        ├── cases/**         → CRUD Cases
        ├── testimonials/**  → CRUD Depoimentos
        ├── categories/**    → CRUD Categorias
        ├── media/**         → Upload/Gestão Mídia
        ├── leads/**         → CRM Leads
        ├── diagnostico/**   → Diagnósticos
        ├── quiz/**          → Questões Quiz
        ├── insights/**      → Variações Insights
        ├── prompts/**       → Prompts IA
        ├── users/**         → Usuários (admin)
        ├── audit/**         → Log Auditoria (admin)
        └── settings/**      → Configurações (admin)

src/components/painel/      → Componentes compartilhados
src/lib/painel-api.ts       → Payload local API helpers
src/lib/painel-auth.ts      → Auth helpers
src/lib/actions/            → Server Actions
src/middleware.ts           → Proteção de rotas
```

## Dados: Payload CMS Collections

| Collection | Rotas no Painel | Operações |
|-----------|----------------|-----------|
| Posts | /painel/posts | CRUD |
| Cases | /painel/cases | CRUD |
| Testimonials | /painel/testimonials | CRUD |
| Categories | /painel/categories | CRUD |
| Media | /painel/media | Upload/Delete |
| Leads | /painel/leads | Read + Status |
| DiagnosticoResults | /painel/diagnostico | Read |
| QuizQuestions | /painel/quiz | CRUD |
| InsightsVariations | /painel/insights | CRUD |
| AIPrompts | /painel/prompts | CRUD |
| Users | /painel/users | CRUD (admin) |
| AuditLog | /painel/audit | Read (admin) |

---

## Design System

- **Cores:** mint `#6DF9C6`, background `#001E29`, accent-blue `#93BAFB`
- **Glass:** backdrop-blur-xl com border mint/10
- **Fonte:** Inter (body) + IBM Plex Mono (mono/labels)
- **Animações:** fade-in (entrada de páginas), glow-pulse (KPIs)

---

*— Morgan (Strategist) · 2026-05-05 · Planejando o futuro 📊*
