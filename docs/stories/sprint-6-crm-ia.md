# Sprint 6 — CRM & IA

**ID:** UNFOLD-S6  
**Tipo:** Feature  
**Prioridade:** P1 — Should Have  
**Estimativa:** 3 dias  
**Agentes:** @dev  
**Depende de:** Sprint 4  
**Status:** [ ] Pendente

---

## Objetivo

Implementar as páginas de CRM (Leads, Diagnósticos) e Inteligência Artificial (Quiz, Insights, Prompts) do painel — com filtros, visualizações ricas de dados e CRUD onde aplicável, conectadas ao Payload CMS.

---

## User Story

> **Como** analista/admin da Unfold Growth,  
> **Quero** visualizar e gerenciar leads, diagnósticos, questões do quiz, variações de insights e prompts de IA,  
> **Para que** possa acompanhar o funil de clientes e gerenciar o conteúdo inteligente da plataforma.

---

## Acceptance Criteria

### Leads (`/painel/leads`)
- [ ] **AC1** — Listagem em tabela com: avatar inicial, nome, e-mail, empresa, telefone, status, data de entrada
- [ ] **AC2** — Filtro por status: `novo`, `em contato`, `qualificado`, `fechado`, `descartado`
- [ ] **AC3** — Busca por nome ou e-mail (client-side filter ou server-side query)
- [ ] **AC4** — Ao clicar em um lead, abre drawer/modal com detalhes completos
- [ ] **AC5** — Alterar status do lead via dropdown inline (PATCH via Server Action)
- [ ] **AC6** — Exportar CSV da listagem (botão, geração client-side)

### Diagnósticos (`/painel/diagnostico`)
- [ ] **AC7** — Listagem: empresa, responsável, e-mail, score (badge mint destacado), nível de maturidade, data
- [ ] **AC8** — Nível de maturidade com badge colorido: Básico (cinza), Intermediário (azul), Avançado (mint), Expert (dourado)
- [ ] **AC9** — Ao clicar, abre detalhe completo: score por dimensão, respostas do quiz, resultado final
- [ ] **AC10** — Filtro por nível de maturidade
- [ ] **AC11** — Read-only (diagnósticos são gerados automaticamente pelo site)

### Questões do Quiz (`/painel/quiz`)
- [ ] **AC12** — Listagem: texto da questão, tipo, dimensão, ordem, status
- [ ] **AC13** — CRUD completo: criar, editar, deletar questão
- [ ] **AC14** — Formulário: texto, tipo (múltipla escolha/escala), dimensão (select), peso, opções de resposta (dinâmico), ordem

### Variações de Insights (`/painel/insights`)
- [ ] **AC15** — Listagem: título, nível de maturidade alvo, dimensão, preview do texto
- [ ] **AC16** — CRUD completo
- [ ] **AC17** — Formulário: nível de maturidade (select), dimensão (select), título, texto completo do insight

### Prompts de IA (`/painel/prompts`)
- [ ] **AC18** — Listagem: nome, tipo (diagnóstico/insight/recomendação), status (ativo/inativo), última modificação
- [ ] **AC19** — CRUD completo
- [ ] **AC20** — Formulário: nome, tipo, template do prompt (textarea grande, monospace), variáveis disponíveis (sidebar info)
- [ ] **AC21** — Toggle ativo/inativo inline

---

## Tarefas Técnicas

- [ ] **T1** — Criar `src/app/(painel)/painel/leads/page.tsx` com tabela, filtros e busca
- [ ] **T2** — Criar `src/components/painel/LeadDrawer.tsx`: drawer deslizante com detalhes do lead
- [ ] **T3** — Criar Server Action `updateLeadStatus(id, status)` com revalidation
- [ ] **T4** — Criar `src/app/(painel)/painel/diagnostico/page.tsx` com listagem rica
- [ ] **T5** — Criar `src/app/(painel)/painel/diagnostico/[id]/page.tsx` com detalhe completo
- [ ] **T6** — Criar `src/app/(painel)/painel/quiz/page.tsx` + forms CRUD
- [ ] **T7** — Criar `src/app/(painel)/painel/insights/page.tsx` + forms CRUD
- [ ] **T8** — Criar `src/app/(painel)/painel/prompts/page.tsx` + forms CRUD
- [ ] **T9** — Criar `src/components/painel/StatusBadge.tsx`: badge reutilizável com mapeamento de cor por status/nível
- [ ] **T10** — Utilitário `exportToCSV(data, filename)` em `src/lib/painel-utils.ts`

---

## Arquivos Afetados

- `src/app/(painel)/painel/leads/**` (novos)
- `src/app/(painel)/painel/diagnostico/**` (novos)
- `src/app/(painel)/painel/quiz/**` (novos)
- `src/app/(painel)/painel/insights/**` (novos)
- `src/app/(painel)/painel/prompts/**` (novos)
- `src/components/painel/LeadDrawer.tsx` (novo)
- `src/components/painel/StatusBadge.tsx` (novo)
- `src/lib/actions/crm-actions.ts` (novo)

---

## Schema das Collections (Payload)

### Leads
```
name, email, phone, company, message, status, source, createdAt
```

### DiagnosticoResults
```
company, responsible, email, score (number), maturity_level (string),
dimensions_scores (json), answers (json), recommendations (json), createdAt
```

### QuizQuestions
```
text, type (multiple/scale), dimension, weight, options (array), order, active
```

### InsightsVariations
```
title, maturity_level, dimension, content, active
```

### AIPrompts
```
name, type, template (text), variables (array), active, lastModified
```

---

## Badges de Maturidade

| Nível | Cor |
|-------|-----|
| Básico | `bg-white/10 text-dim` |
| Intermediário | `bg-accent-blue/15 text-accent-blue` |
| Avançado | `bg-primary/15 text-primary` |
| Expert | `bg-yellow-500/15 text-yellow-400` |

---

*— Morgan, Sprint 6 definido ✓*
