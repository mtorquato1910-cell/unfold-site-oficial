# Sprint 8 — Workflow Editorial (Posts do Blog)

**Estimativa:** 3 dias
**Prioridade:** ALTA
**Dependências:** S5 (Posts CRUD)
**Stack:** Next.js 15 · Payload CMS 3 · Server Actions

---

## Contexto

Conforme BRIEF.md §5.7 e §8.4, o blog publica autoridade técnica do UGS e da liderança da Unfold. Workflow editorial é mantido para uso **interno** (autores Unfold com revisão de liderança), não para autores externos / guest posts.

Hoje a tela de Posts permite criar/editar/deletar, mas **não há fluxo de aprovação**. Um editor pode publicar diretamente. Precisamos:
1. Estados explícitos: `draft` → `in_review` → `approved` → `published` → `archived`
2. Apenas usuários com role `admin` podem aprovar e publicar
3. Editor cria → marca como "Em revisão" → admin aprova → admin publica (ou agenda)
4. Histórico de mudanças de status no AuditLog

## Acceptance Criteria

- [ ] **AC1**: Posts collection ganha campos: `status` (enum: draft/in_review/approved/published/archived), `submittedForReviewAt`, `approvedAt`, `approvedBy`, `publishedAt`, `scheduledFor`
- [ ] **AC2**: Editor (role=editor) pode: criar/editar/excluir seus próprios posts em status `draft` ou `in_review`. NÃO pode mudar status para `approved` ou `published`
- [ ] **AC3**: Admin (role=admin) pode: aprovar (`in_review` → `approved`), publicar (`approved` → `published`), agendar publicação, arquivar (`published` → `archived`)
- [ ] **AC4**: Tela `/admin/posts` mostra filtro por status + badge colorido por estado + tabs (Todos / Em revisão / Publicados / Arquivados)
- [ ] **AC5**: Tela `/admin/posts/[id]` mostra: timeline de mudanças de status + botões de ação contextual (Submeter / Aprovar / Publicar / Agendar / Arquivar)
- [ ] **AC6**: Notificação dentro do app (sino) quando admin recebe post em revisão ou editor recebe post aprovado/rejeitado
- [ ] **AC7**: Agendamento: campo `scheduledFor` (datetime). Cron job ou hook `beforeRead` que muda status para `published` quando `scheduledFor <= now`
- [ ] **AC8**: Site público (`/blog`) mostra apenas posts com `status=published` E `publishedAt <= now`
- [ ] **AC9**: AuditLog grava: criação, submissão, aprovação, publicação, arquivamento, edição
- [ ] **AC10**: Email para admin quando há novo post em revisão (Resend / Payload Email)

## Tasks Técnicas

### T1 — Migrar Posts collection (1 dia)
- [ ] Atualizar `src/collections/Posts.ts`: novos campos enum + datetimes + relação `approvedBy → users`
- [ ] Hook `beforeChange`: validar transições válidas de status (não permite skip de etapas)
- [ ] Hook `afterChange`: gravar AuditLog
- [ ] Migration script (se existirem posts antigos)

### T2 — Página de revisão (`/admin/posts/[id]/review`) (0.5 dia)
- [ ] Visualização "preview" do post como ficaria publicado
- [ ] Painel lateral com timeline de status + comentários internos
- [ ] Botões: Aprovar / Rejeitar / Comentar

### T3 — Filtros e tabs em `/admin/posts` (0.5 dia)
- [ ] Tabs: Todos / Rascunhos / Em revisão / Publicados / Arquivados
- [ ] Filtro por autor + por categoria + por data
- [ ] Badge de status colorido (já existe StatusBadge, expandir)

### T4 — Server Actions (0.5 dia)
- [ ] `submitForReview(postId)` — editor → admin
- [ ] `approvePost(postId)`
- [ ] `rejectPost(postId, reason)`
- [ ] `publishPost(postId)` — imediato
- [ ] `schedulePost(postId, scheduledFor)` — agendado
- [ ] `archivePost(postId)`

### T5 — Cron de publicação agendada (0.25 dia)
- [ ] Vercel Cron `/api/cron/publish-scheduled` (5 min)
- [ ] Query: status=approved AND scheduledFor <= now
- [ ] Update: status=published, publishedAt=now

### T6 — Notificações (0.25 dia)
- [ ] Bell no header puxa contagem de posts em revisão (admin) ou rejeitados (editor)
- [ ] Email via Resend para admin@unfoldgrowth.com.br quando novo post em revisão

### T7 — Site público (0.5 dia)
- [ ] Filtrar `/blog` para `status=published AND publishedAt <= now`
- [ ] Página individual de post: 404 se não publicado
- [ ] OG/SEO meta tags do post publicado

## Definition of Done

- TypeScript compila sem erros
- Editor não consegue publicar diretamente (testado manualmente)
- Admin recebe notificação ao chegar post em revisão
- Post agendado para amanhã não aparece no /blog hoje
- AuditLog mostra todas as transições
