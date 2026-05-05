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

### Fase 2 — FUNCIONALIDADES OPERACIONAIS

| Sprint | Nome | Estimativa | Status | Prioridade |
|--------|------|-----------|--------|-----------|
| [S8](sprint-8-workflow-editorial.md) | Workflow Editorial (aprovação posts) | 3 dias | ⬜ | 🔥 ALTA |
| [S9](sprint-9-site-editor.md) | Site Editor (conteúdo das páginas) | 4 dias | ⬜ | 🔥 ALTA |
| [S10](sprint-10-seo-manager.md) | SEO Manager (meta, sitemap, redirects) | 2 dias | ⬜ | 🟡 MÉDIA |
| [S11](sprint-11-analytics-dashboard.md) | Analytics Dashboard (KPIs reais) | 2-3 dias | ⬜ | 🟡 MÉDIA |
| [S12](sprint-12-leads-crm-integration.md) | Leads CRM Integration (RD/HubSpot) | 2 dias | ⬜ | 🔥 ALTA |
| [S13](sprint-13-notifications-email.md) | Notifications & Email (Resend) | 2 dias | ⬜ | 🟡 MÉDIA |
| [S14](sprint-14-versioning-backup.md) | Versioning, Backup & Activity Log | 2 dias | ⬜ | 🟢 BAIXA |

**Total Fase 1:** ~13–15 dias (concluída)
**Total Fase 2:** ~17–18 dias

### Sequência recomendada Fase 2

1. **S12 (Leads CRM)** — bloqueio comercial
2. **S8 (Workflow Editorial)** — controle editorial do blog
3. **S9 (Site Editor)** — autonomia para editar site
4. **S13 (Notifications)** — base para muitos features
5. **S10 (SEO)** — pré-go-live
6. **S11 (Analytics)** — pós-tráfego real
7. **S14 (Versioning/Backup)** — operacional contínuo

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
