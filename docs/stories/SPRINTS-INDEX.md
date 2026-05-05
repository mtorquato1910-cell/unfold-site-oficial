# Unfold Growth — Admin Panel Migration
## Índice de Sprints

**Projeto:** Migração do Painel Admin (Lovable → Next.js + Payload CMS)  
**Início:** 2026-05-05  
**Stack:** Next.js 15 · Payload CMS 3 · TypeScript · Tailwind CSS  
**Rota do painel:** `/painel/*`

---

## Roadmap

| Sprint | Nome | Estimativa | Status | Agentes |
|--------|------|-----------|--------|---------|
| [S1](sprint-1-logo-identidade-visual.md) | Logo & Identidade Visual | 1–2 dias | ⬜ Pendente | @dev |
| [S2](sprint-2-design-system.md) | Design System & Tokens | 1 dia | ⬜ Pendente | @dev |
| [S3](sprint-3-auth-login.md) | Auth & Login Page | 1–2 dias | ⬜ Pendente | @dev |
| [S4](sprint-4-layout-dashboard.md) | Layout Base & Dashboard | 2 dias | ⬜ Pendente | @dev, @ux |
| [S5](sprint-5-gestao-conteudo.md) | Gestão de Conteúdo | 3 dias | ⬜ Pendente | @dev |
| [S6](sprint-6-crm-ia.md) | CRM & IA | 3 dias | ⬜ Pendente | @dev |
| [S7](sprint-7-admin-configuracoes.md) | Admin & Configurações | 2 dias | ⬜ Pendente | @dev |

**Total estimado:** ~13–15 dias de desenvolvimento

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
