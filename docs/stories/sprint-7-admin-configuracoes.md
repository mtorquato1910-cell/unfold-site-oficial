# Sprint 7 — Admin & Configurações

**ID:** UNFOLD-S7  
**Tipo:** Feature  
**Prioridade:** P1 — Should Have  
**Estimativa:** 2 dias  
**Agentes:** @dev  
**Depende de:** Sprint 3 (auth com roles)  
**Status:** [ ] Pendente

---

## Objetivo

Implementar as páginas administrativas restritas: Usuários (gestão de equipe e roles), Log de Auditoria (histórico de ações) e Configurações do Site — todas acessíveis apenas para role `admin`.

---

## User Story

> **Como** administrador do sistema,  
> **Quero** gerenciar usuários do painel, ver o log de auditoria e configurar parâmetros gerais do site,  
> **Para que** tenha controle total sobre quem acessa o sistema e o histórico de mudanças.

---

## Acceptance Criteria

### Usuários (`/painel/users`) — admin only
- [ ] **AC1** — Listagem com: avatar inicial, nome, e-mail, role (badge), data de criação, último acesso
- [ ] **AC2** — Criar novo usuário: nome, e-mail, senha temporária, role (admin/editor)
- [ ] **AC3** — Alterar role de usuário via select inline
- [ ] **AC4** — Deletar usuário com confirmação (não pode deletar a si mesmo)
- [ ] **AC5** — Usuário não-admin recebe 403 / redirect para `/painel` se tentar acessar esta rota

### Log de Auditoria (`/painel/audit`) — admin only
- [ ] **AC6** — Listagem readonly: ação, usuário, collection afetada, ID do documento, timestamp
- [ ] **AC7** — Filtro por collection e por usuário
- [ ] **AC8** — Filtro por período (últimas 24h, 7 dias, 30 dias)
- [ ] **AC9** — Sem opção de edição/deleção (log imutável)
- [ ] **AC10** — Paginação: 20 itens por página

### Configurações do Site (`/painel/settings`) — admin only
- [ ] **AC11** — Seção "SEO": título do site, meta description, og:image padrão
- [ ] **AC12** — Seção "Contato": e-mail de contato, WhatsApp, endereço
- [ ] **AC13** — Seção "Redes Sociais": LinkedIn, Instagram, links
- [ ] **AC14** — Botão "Salvar" com feedback de sucesso (toast)
- [ ] **AC15** — Dados persistidos via collection `settings` do Payload (global ou singleton)

---

## Tarefas Técnicas

- [ ] **T1** — Criar `src/app/(painel)/painel/users/page.tsx` com listagem e CRUD de usuários
- [ ] **T2** — Server Actions: `createUser`, `updateUserRole`, `deleteUser` (via Payload Users collection)
- [ ] **T3** — Criar `src/app/(painel)/painel/audit/page.tsx` com listagem filtrada do AuditLog
- [ ] **T4** — Criar `src/app/(painel)/painel/settings/page.tsx` com formulário de configurações
- [ ] **T5** — Criar `src/middleware.ts` check de role admin para rotas `users`, `audit`, `settings`
- [ ] **T6** — Componente `RoleBadge.tsx`: badge de role (admin=mint, editor=azul)
- [ ] **T7** — Criar ou usar global `Settings` no Payload config para persistir configurações do site
- [ ] **T8** — Testar: editor tentando acessar `/painel/users` → redirect

---

## Arquivos Afetados

- `src/app/(painel)/painel/users/**` (novos)
- `src/app/(painel)/painel/audit/**` (novos)
- `src/app/(painel)/painel/settings/**` (novos)
- `src/components/painel/RoleBadge.tsx` (novo)
- `src/lib/actions/admin-actions.ts` (novo)
- `src/middleware.ts` (atualizar com role check)

---

## Payload Collections Referenciadas

### Users (existente)
```
email, password, role (enum: admin | editor), name, createdAt
```

### AuditLog (existente)
```
action, user (relation→Users), collection, documentId, changes (json), createdAt
```

### Globals: SiteSettings (criar se não existir)
```
siteTitle, metaDescription, ogImage, contactEmail, whatsapp, 
address, linkedin, instagram
```

---

## Proteção de Rotas (Middleware)

```typescript
// src/middleware.ts
const ADMIN_ONLY_PATHS = ['/painel/users', '/painel/audit', '/painel/settings']

// Se path é admin-only: verificar role do token JWT
// Se role !== 'admin': redirect para '/painel?error=forbidden'
```

---

## Nota sobre Settings Global

Se a collection `Settings` não existir no Payload, criar um Global:
```typescript
// src/globals/SiteSettings.ts
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    { name: 'siteTitle', type: 'text' },
    { name: 'metaDescription', type: 'textarea' },
    { name: 'contactEmail', type: 'email' },
    { name: 'whatsapp', type: 'text' },
    { name: 'linkedin', type: 'text' },
    { name: 'instagram', type: 'text' },
  ]
}
```

---

*— Morgan, Sprint 7 definido ✓*
