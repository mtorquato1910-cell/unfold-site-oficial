# Sprint 14 — Versioning, Backup & Activity Log

**Estimativa:** 2 dias
**Prioridade:** BAIXA-MÉDIA
**Dependências:** S7

---

## Contexto

Para uma operação séria, precisamos:
- Versioning automático de Posts/Cases/Pages (quem editou o quê, quando, e poder reverter)
- Backup periódico do Postgres (banco do Payload)
- AuditLog mais rico, com diff visual
- Soft delete em vez de delete real (lixeira)

## Acceptance Criteria

- [ ] **AC1**: Payload Versions habilitado em Posts, Cases, Pages, HomeSettings, SiteSettings
- [ ] **AC2**: Tela `/admin/posts/[id]/versions` — lista versões com timestamp, autor, ações (restaurar / comparar)
- [ ] **AC3**: Comparador visual side-by-side de duas versões (diff de campo a campo)
- [ ] **AC4**: Soft delete: collections ganham `deletedAt`. Delete UI marca, não apaga
- [ ] **AC5**: Tela `/admin/lixeira` — restaurar ou apagar definitivamente
- [ ] **AC6**: Backup Postgres diário via Vercel Cron + upload pra S3 (ou similar)
- [ ] **AC7**: Audit log rico: filtro por usuário, collection, ação, período
- [ ] **AC8**: Diff visual de updates no AuditLog (campo X mudou de "valor antigo" → "valor novo")
- [ ] **AC9**: Export AuditLog em CSV

## Tasks Técnicas

### T1 — Versions (0.5 dia)
- [ ] Habilitar `versions: true, drafts: true` nas collections relevantes
- [ ] UI lista de versões + restaurar
- [ ] Diff component reutilizável

### T2 — Soft Delete (0.5 dia)
- [ ] Hook `beforeDelete` em todas as collections que precisam: setar `deletedAt = now()` + `return false`
- [ ] Filtros padrão: ocultar `deletedAt != null`
- [ ] Tela `/admin/lixeira` lista todos os soft-deleted

### T3 — Backup automático (0.5 dia)
- [ ] Vercel Cron `/api/cron/backup-db` (1x/dia)
- [ ] `pg_dump` (ou via Supabase CLI / Neon API)
- [ ] Upload para S3 / Backblaze / R2
- [ ] Email de confirmação

### T4 — AuditLog enriquecido (0.5 dia)
- [ ] Adicionar `before`, `after` (JSON) no AuditLog
- [ ] Hook afterChange grava diff
- [ ] UI: expandir linha mostra diff colorido (add em verde, remove em vermelho)
- [ ] Botão Export CSV

## Definition of Done

- Editar título de post → audit log mostra "title: 'A' → 'B'"
- Deletar post → vai pra lixeira, posso restaurar
- Reverter para versão anterior funciona em 1 clique
