# Sprint 10 — SEO Manager (Meta Tags, Sitemap, Redirects)

**Estimativa:** 2 dias
**Prioridade:** MÉDIA
**Dependências:** S9 (SiteSettings)

---

## Contexto

O painel precisa permitir que o cliente edite metadados SEO sem tocar em código:
- Meta title/description por página
- Open Graph image upload
- Robots (noindex/nofollow opcional)
- Sitemap regenerado automaticamente
- Redirects 301 (essencial após migração Lighthouse → Unfold)

## Acceptance Criteria

- [ ] **AC1**: Cada Post, Case, Page tem fields `seoTitle`, `seoDescription`, `seoOgImage`, `seoNoindex`
- [ ] **AC2**: Tela `/admin/seo` mostra dashboard global: páginas com SEO incompleto, OG faltante, etc
- [ ] **AC3**: Collection `Redirects` (from, to, type=301|302, enabled, expiresAt)
- [ ] **AC4**: Tela `/admin/seo/redirects` — CRUD de redirects
- [ ] **AC5**: `next.config.ts` consume Redirects da Payload via `redirects()` ASYNC
- [ ] **AC6**: `/sitemap.xml` gerado dinamicamente lendo Pages + Posts publicados + Cases publicados
- [ ] **AC7**: `/robots.txt` editável pelo painel
- [ ] **AC8**: Schema.org (JSON-LD) injetado automaticamente: Organization, BlogPosting, Case
- [ ] **AC9**: Preview Google: tela mostra como aparece no resultado de busca
- [ ] **AC10**: Preview Facebook/LinkedIn: como aparece quando compartilhado

## Tasks Técnicas

### T1 — SEO fields nas collections (0.5 dia)
- [ ] Group `seo` em Posts, Cases, Pages
- [ ] Fields: title, description, ogImage (relação Media), noindex (boolean), canonicalUrl

### T2 — Redirects (0.5 dia)
- [ ] Collection `Redirects.ts`
- [ ] `next.config.ts` async `redirects()` lê do Payload

### T3 — Sitemap dinâmico (0.5 dia)
- [ ] `src/app/sitemap.ts` lista Pages + Posts + Cases
- [ ] Inclui `lastModified`, `changeFrequency`, `priority`

### T4 — UI Manager (0.5 dia)
- [ ] `/admin/seo` — dashboard com checklist
- [ ] `/admin/seo/redirects` — CRUD
- [ ] `/admin/seo/preview/[type]/[id]` — Google + Social preview

## Definition of Done

- Adicionar redirect /old-url → /new-url no painel funciona em 301 sem redeploy
- Sitemap.xml inclui post recém-publicado em <1min
- Editar OG image no painel reflete no compartilhamento Facebook
