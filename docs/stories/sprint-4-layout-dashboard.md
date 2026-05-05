# Sprint 4 — Layout Base & Dashboard

**ID:** UNFOLD-S4  
**Tipo:** Feature  
**Prioridade:** P0 — Must Have  
**Estimativa:** 2 dias  
**Agentes:** @dev, @ux-design-expert  
**Depende de:** Sprint 3  
**Status:** [ ] Pendente

---

## Objetivo

Implementar o layout estrutural do painel (sidebar + header) e o Dashboard principal com KPIs reais do Payload CMS, leads recentes, diagnósticos recentes e atalhos de navegação — fiel ao design da Lovable.

---

## User Story

> **Como** administrador logado no painel,  
> **Quero** ver um dashboard com métricas reais do negócio (posts, leads, diagnósticos),  
> **Para que** tenha uma visão geral rápida e acesso rápido às seções mais usadas.

---

## Acceptance Criteria

- [ ] **AC1** — Layout `PainelLayout` renderiza: sidebar esquerda 260px (fixo em desktop), área de conteúdo flex-1
- [ ] **AC2** — Sidebar exibe logo Unfold no topo (imagem real), seções navegáveis com ícones Lucide, item ativo destacado com glow mint
- [ ] **AC3** — Header sticky com breadcrumb `Unfold > [Página Atual]`, search input e bell button
- [ ] **AC4** — User card no rodapé da sidebar: avatar inicial, e-mail truncado, role badge mint, botão logout
- [ ] **AC5** — Dashboard exibe 6 KPI StatCards com dados reais: Posts, Cases, Leads, Diagnósticos, Depoimentos, Prompts IA
- [ ] **AC6** — Seção "Leads recentes": últimos 5 leads do Payload com avatar inicial, nome, e-mail, status
- [ ] **AC7** — Seção "Diagnósticos recentes": últimos 4 resultados com empresa, score (destaque mint), nível de maturidade
- [ ] **AC8** — Seção "Atalhos": links para Posts, Cases, Depoimentos, Leads, Diagnósticos com hover lift
- [ ] **AC9** — Saudação dinâmica com bom dia/tarde/noite + nome do usuário em destaque mint
- [ ] **AC10** — Sidebar oculta em mobile (hamburger menu opcional para v2)
- [ ] **AC11** — Todas as seções navegáveis da sidebar respeitam o role: itens admin visíveis apenas para role=admin

---

## Tarefas Técnicas

- [ ] **T1** — Criar `src/components/painel/PainelLayout.tsx`: port do `AdminLayout.tsx` da Lovable para Next.js (sem React Router, usar `next/link` e `next/navigation`)
- [ ] **T2** — Criar `src/components/painel/PainelSidebar.tsx`: extrair sidebar para componente separado com `usePathname()` para active state
- [ ] **T3** — Criar `src/app/(painel)/painel/page.tsx`: Dashboard principal
- [ ] **T4** — Criar `src/lib/painel-api.ts`: funções server-side para buscar dados do Payload via local API
  - `getCollectionCount(collection)`: retorna count de cada collection
  - `getRecentLeads(limit)`: leads com id, name, email, status, createdAt
  - `getRecentDiagnosticos(limit)`: resultados com company, score, maturity_level, createdAt
- [ ] **T5** — Dashboard usa React Server Component para fetch inicial (SSR) + Suspense para KPIs
- [ ] **T6** — Navegação da sidebar: mesmo `sections` array da Lovable, adaptado para Next.js Link
- [ ] **T7** — Testar em desktop (1280px+) e tablet (768px)

---

## Arquivos Afetados

- `src/components/painel/PainelLayout.tsx` (novo)
- `src/components/painel/PainelSidebar.tsx` (novo)
- `src/app/(painel)/painel/page.tsx` (novo)
- `src/lib/painel-api.ts` (novo)

---

## Estrutura de Navegação da Sidebar

```typescript
const sections = [
  {
    label: "Geral",
    items: [{ href: "/painel", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Conteúdo",
    items: [
      { href: "/painel/posts", label: "Posts / Blog", icon: FileText },
      { href: "/painel/cases", label: "Cases", icon: Briefcase },
      { href: "/painel/testimonials", label: "Depoimentos", icon: MessageSquareQuote },
      { href: "/painel/categories", label: "Categorias", icon: FolderTree },
      { href: "/painel/media", label: "Mídia", icon: ImageIcon },
    ],
  },
  {
    label: "Leads & CRM",
    items: [
      { href: "/painel/leads", label: "Leads", icon: Users },
      { href: "/painel/diagnostico", label: "Diagnósticos", icon: ClipboardList },
      { href: "/painel/quiz", label: "Questões do Quiz", icon: HelpCircle },
      { href: "/painel/insights", label: "Variações de Insights", icon: Sparkles },
      { href: "/painel/prompts", label: "Prompts de IA", icon: Bot },
    ],
  },
  {
    label: "Configurações",
    items: [
      { href: "/painel/settings", label: "Configurações do Site", icon: Settings, adminOnly: true },
      { href: "/painel/users", label: "Usuários", icon: UserCog, adminOnly: true },
      { href: "/painel/audit", label: "Log de Auditoria", icon: Activity, adminOnly: true },
    ],
  },
]
```

## Payload Local API (server-side)

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Count
const { totalDocs } = await payload.find({ collection: 'posts', limit: 0 })

// Recent leads
const { docs } = await payload.find({ 
  collection: 'leads', 
  limit: 5,
  sort: '-createdAt' 
})
```

---

*— Morgan, Sprint 4 definido ✓*
