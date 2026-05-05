# Sprint 5 — Gestão de Conteúdo

**ID:** UNFOLD-S5  
**Tipo:** Feature  
**Prioridade:** P1 — Should Have  
**Estimativa:** 3 dias  
**Agentes:** @dev  
**Depende de:** Sprint 4  
**Status:** [ ] Pendente

---

## Objetivo

Implementar as páginas CRUD de gestão de conteúdo editorial: Posts, Cases, Depoimentos, Categorias e Mídia — todas com o design premium da Lovable e integradas às collections do Payload CMS via local API.

---

## User Story

> **Como** editor/admin do painel Unfold Growth,  
> **Quero** criar, listar, editar e deletar Posts, Cases, Depoimentos, Categorias e Mídia,  
> **Para que** possa gerenciar todo o conteúdo do site sem precisar usar o Payload CMS diretamente.

---

## Acceptance Criteria

### Posts (`/painel/posts`)
- [ ] **AC1** — Listagem em tabela glass com colunas: título, categoria, status (publicado/rascunho), data, ações
- [ ] **AC2** — Botão "Novo Post" abre modal ou vai para `/painel/posts/novo`
- [ ] **AC3** — Formulário: título, slug (auto-gerado), conteúdo rico (textarea por ora), categoria (select), status (publicado/rascunho), imagem destacada
- [ ] **AC4** — Editar post existente em `/painel/posts/[id]/editar`
- [ ] **AC5** — Deletar com modal de confirmação
- [ ] **AC6** — Paginação: 10 itens por página

### Cases (`/painel/cases`)
- [ ] **AC7** — Listagem com: título, empresa, resultado, status, data
- [ ] **AC8** — CRUD completo (criar, editar, deletar)
- [ ] **AC9** — Formulário: título, empresa, setor, desafio, solução, resultado, métricas, imagem, status

### Depoimentos (`/painel/testimonials`)
- [ ] **AC10** — Listagem com: nome, cargo, empresa, rating, data
- [ ] **AC11** — CRUD completo
- [ ] **AC12** — Formulário: nome, cargo, empresa, depoimento (textarea), rating (1-5), avatar

### Categorias (`/painel/categories`)
- [ ] **AC13** — Listagem simples: nome, slug, count de posts vinculados
- [ ] **AC14** — CRUD inline (criação rápida + edição inline)

### Mídia (`/painel/media`)
- [ ] **AC15** — Grid de thumbnails dos arquivos de mídia do Payload
- [ ] **AC16** — Upload de arquivo (arrastar ou click)
- [ ] **AC17** — Deletar arquivo com confirmação
- [ ] **AC18** — Cópia de URL do arquivo com um click

---

## Tarefas Técnicas

- [ ] **T1** — Criar `src/components/painel/DataTable.tsx`: componente reutilizável de tabela com glass design, paginação, sort
- [ ] **T2** — Criar `src/components/painel/ConfirmDialog.tsx`: modal de confirmação reutilizável (glass, botão destructive vermelho)
- [ ] **T3** — Criar `src/app/(painel)/painel/posts/page.tsx` + `/novo/page.tsx` + `/[id]/editar/page.tsx`
- [ ] **T4** — Criar `src/app/(painel)/painel/cases/page.tsx` + `/novo/page.tsx` + `/[id]/editar/page.tsx`
- [ ] **T5** — Criar `src/app/(painel)/painel/testimonials/page.tsx` + forms
- [ ] **T6** — Criar `src/app/(painel)/painel/categories/page.tsx` com CRUD inline
- [ ] **T7** — Criar `src/app/(painel)/painel/media/page.tsx` com grid + upload
- [ ] **T8** — Criar Server Actions para cada collection: `createPost`, `updatePost`, `deletePost`, etc.
- [ ] **T9** — Toast de sucesso/erro em todas as operações CRUD
- [ ] **T10** — Loading states em botões de submit e delete

---

## Arquivos Afetados

- `src/components/painel/DataTable.tsx` (novo)
- `src/components/painel/ConfirmDialog.tsx` (novo)
- `src/app/(painel)/painel/posts/**` (novos)
- `src/app/(painel)/painel/cases/**` (novos)
- `src/app/(painel)/painel/testimonials/**` (novos)
- `src/app/(painel)/painel/categories/**` (novos)
- `src/app/(painel)/painel/media/**` (novos)
- `src/lib/actions/content-actions.ts` (novo — Server Actions)

---

## Padrão de Server Action

```typescript
// src/lib/actions/content-actions.ts
'use server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function createPost(data: PostFormData) {
  const payload = await getPayload({ config })
  await payload.create({ collection: 'posts', data })
  revalidatePath('/painel/posts')
}

export async function deletePost(id: string) {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'posts', id })
  revalidatePath('/painel/posts')
}
```

---

## Padrão Visual das Tabelas

```tsx
<div className="glass rounded-2xl overflow-hidden">
  <table className="w-full text-[13px]">
    <thead>
      <tr className="border-b border-mint-soft">
        <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Título</th>
        ...
      </tr>
    </thead>
    <tbody className="divide-y divide-white/[0.04]">
      {items.map(item => (
        <tr key={item.id} className="hover:bg-white/[0.02] transition">
          ...
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

*— Morgan, Sprint 5 definido ✓*
