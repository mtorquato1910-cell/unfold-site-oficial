# Sprint 3 — Auth & Login Page

**ID:** UNFOLD-S3  
**Tipo:** Feature  
**Prioridade:** P0 — Must Have  
**Estimativa:** 1–2 dias  
**Agentes:** @dev  
**Depende de:** Sprint 2  
**Status:** [ ] Pendente

---

## Objetivo

Criar o sistema de autenticação do painel customizado, com página de login no design premium da Lovable (glass form, ambient glow, mint CTA), integrado ao Payload CMS via REST API, com session management seguro via cookies httpOnly e middleware de proteção de rotas.

---

## User Story

> **Como** administrador da Unfold Growth,  
> **Quero** fazer login em `/painel/login` com e-mail e senha via uma interface premium,  
> **Para que** possa acessar o painel de gestão de forma segura e com boa experiência visual.

---

## Acceptance Criteria

- [ ] **AC1** — Rota `/painel/login` renderiza o formulário com design Lovable: ambient glow, glass card, logo no topo, inputs mint, botão CTA mint com hover glow
- [ ] **AC2** — Login autentica via `POST /api/users/login` do Payload CMS e armazena o JWT em cookie httpOnly `payload-token`
- [ ] **AC3** — Após login bem-sucedido, usuário é redirecionado para `/painel`
- [ ] **AC4** — Credenciais inválidas exibem toast de erro (sem expor stack trace)
- [ ] **AC5** — Middleware Next.js protege todas as rotas `/painel/*` (exceto `/painel/login`): redireciona para login se sem cookie
- [ ] **AC6** — Função `signOut()` limpa o cookie e redireciona para `/painel/login`
- [ ] **AC7** — Loading state no botão de login (spinner) durante a requisição
- [ ] **AC8** — Link "Esqueci minha senha" presente (pode ser placeholder por ora)
- [ ] **AC9** — Página é responsiva (funciona em mobile)
- [ ] **AC10** — Logo Unfold aparece no topo do formulário de login

---

## Tarefas Técnicas

- [ ] **T1** — Criar route group `src/app/(painel)/` com `layout.tsx` que importa `painel-globals.css`
- [ ] **T2** — Criar `src/app/(painel)/painel/login/page.tsx`: página de login com design Lovable completo
- [ ] **T3** — Criar `src/lib/painel-auth.ts`: funções `login(email, password)`, `logout()`, `getSession()` usando Payload REST API
  - `login`: POST `/api/users/login` → armazena token em cookie `payload-token` (httpOnly, secure, sameSite=lax)
  - `logout`: DELETE `/api/users/logout` ou limpa cookie manualmente
  - `getSession`: valida cookie via `GET /api/users/me`
- [ ] **T4** — Criar `src/middleware.ts` (ou estender se existir): matcher `'/painel/:path*'`, exceto `/painel/login`; verifica cookie `payload-token`; redireciona se ausente/inválido
- [ ] **T5** — Criar `src/hooks/usePainelAuth.ts` (client hook): estado de user, role, signOut
- [ ] **T6** — Testar fluxo completo: login → painel → logout → redirect login

---

## Arquivos Afetados

- `src/app/(painel)/layout.tsx` (novo)
- `src/app/(painel)/painel/login/page.tsx` (novo)
- `src/lib/painel-auth.ts` (novo)
- `src/middleware.ts` (novo ou atualizar)
- `src/hooks/usePainelAuth.ts` (novo)

---

## Referência Visual (da Lovable `Login.tsx`)

```tsx
// Estrutura base da página
<div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
  {/* Ambient glow */}
  <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] 
      -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
  
  {/* Form card */}
  <div className="glass rounded-2xl p-8">
    {/* Logo + título + formulário */}
  </div>
</div>
```

## Payload Auth API

```
POST /api/users/login
Body: { email, password }
Response: { token, user: { id, email, role } }

GET /api/users/me  (Authorization: JWT {token})
Response: { id, email, role, ... }

POST /api/users/logout
Limpa sessão server-side
```

---

## Notas de Segurança

- Cookie deve ser `httpOnly: true`, `secure: true` (prod), `sameSite: 'lax'`
- Nunca expor o JWT no localStorage
- Validar token no middleware a cada request protegida
- Rate limiting: Payload CMS já possui por padrão

---

*— Morgan, Sprint 3 definido ✓*
