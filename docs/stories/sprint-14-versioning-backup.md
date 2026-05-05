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

---

## Ajustes da QA + Architect Review

- **DECISÃO**: Backup = **Supabase PITR (Point-in-Time Recovery) nativo** + **GitHub Action agendada** (`pg_dump`). NÃO Vercel Function (timeout 60-300s, sem `pg_dump` binary)
- **AC10** Restore mensal automatizado: GitHub Action restaura snapshot em DB efêmero e valida integridade. Alerta se falhar
- **AC11** Lixeira purga itens com `deletedAt > 30 dias`. Endpoint `/admin/lgpd/erase` para apagamento real sob demanda (LGPD direito ao esquecimento)
- **AC12** Migration script (T0) ANTES de habilitar `versions: true` em coleções com dados existentes
- **AC13** Soft delete e Versioning têm contratos distintos: soft delete = "estado removido reversível"; versioning = "histórico de edits"
- **AC14** Drafts já habilitados em S9 (Pages). S14 só estende UI de versões para outras collections
