# Sprint 7.5 — RBAC Real (Supabase Roles + Role Guard)

**Estimativa:** 1 dia
**Prioridade:** 🔥 BLOQUEADOR
**Razão:** `painel-auth.ts` hoje hardcoda `role: 'admin'` para todo usuário. Sem RBAC real, S8/S9/S12 não podem distinguir editor vs admin. Architect Review (Aria) sinalizou como blocker.

---

## Decisão técnica

**Source of truth do role: Supabase `auth.users.raw_app_meta_data.role`** (não tabela espelhada). Motivo: zero migração de dados, controlado server-side por service_role key, lido em todo `getSession()`.

Valores aceitos: `admin` | `editor`.

## Acceptance Criteria

- [ ] **AC1**: `painel-auth.ts → getSession()` lê `user.app_metadata.role` (fallback para `editor` se ausente)
- [ ] **AC2**: Helper `requireRole(role: 'admin' | 'editor')` server-side: lança 403 se não autorizado
- [ ] **AC3**: Server Actions sensíveis (delete, publish, settings) chamam `requireRole('admin')`
- [ ] **AC4**: Tela `/admin/users` permite admin definir role de outros users
- [ ] **AC5**: Update de role usa Supabase Admin SDK (`auth.admin.updateUserById`) com `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **AC6**: User editando o próprio role é bloqueado (não pode rebaixar/promover si mesmo)
- [ ] **AC7**: PainelLayout esconde itens `adminOnly` quando role !== admin
- [ ] **AC8**: Middleware redireciona /admin/users (e outras admin-only) → /admin se role !== admin

## Tasks

### T1 — Auth helpers (0.25 dia)
- [ ] `src/lib/painel-auth.ts`: `getSession()` retorna `role` real
- [ ] `src/lib/painel-auth.ts`: `requireRole(role)` server-side
- [ ] `src/lib/painel-auth.ts`: cliente admin Supabase com service_role

### T2 — Users admin UI (0.5 dia)
- [ ] `src/app/(painel)/painel/users/UsersClient.tsx`: dropdown de role
- [ ] Server Action `updateUserRole(userId, role)` com `requireRole('admin')`
- [ ] Bloqueio self-edit + audit log

### T3 — Middleware + Guards (0.25 dia)
- [ ] `middleware.ts`: protege `/admin/users`, `/admin/settings`, `/admin/audit`
- [ ] PainelLayout: filtra `adminOnly` itens dinâmicos

## Definition of Done

- Login com user editor → não vê Users/Settings/Audit no menu
- Editor tenta acessar /admin/users → redirect para /admin
- Admin promove editor → reflete em <5s no próximo request
- TS + lint sem erros
