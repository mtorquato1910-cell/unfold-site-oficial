# Sprint 9 — Site Editor (Conteúdo do Site Público)

**Estimativa:** 4 dias
**Prioridade:** ALTA
**Dependências:** S5
**Stack:** Next.js 15 · Payload CMS 3 · ISR / on-demand revalidation

---

## Contexto

Hoje o site público (`/`, `/sobre`, `/atuacao`, `/metodo`, etc.) é majoritariamente HARDCODED em componentes React. Para o cliente conseguir editar conteúdo SEM tocar em código, precisamos transformar essas páginas em **collections + globals do Payload**.

A regra: tudo que é texto editável vira config no painel.

## Acceptance Criteria

- [ ] **AC1**: Global `HomeSettings` no Payload — controla Hero, Stats, Logos de clientes, CTA
- [ ] **AC2**: Global `SiteSettings` — meta tags globais, redes sociais, telefone, email, endereço, GA ID, Meta Pixel ID
- [ ] **AC3**: Collection `Pages` com slug + blocks (Hero, RichText, Stats, CTA, FAQ, Cases, Testimonials) — para páginas dinâmicas como /sobre, /atuacao, /metodo
- [ ] **AC4**: Tela `/admin/pages` lista todas as páginas com status + ações (editar, preview, publicar)
- [ ] **AC5**: Tela `/admin/pages/[slug]` editor de blocos drag-and-drop simplificado (lista vertical com mover up/down)
- [ ] **AC6**: Botão "Publicar" no editor → executa `revalidatePath('/sobre')` (ou path relevante) após salvar
- [ ] **AC7**: Botão "Preview" abre rota `/preview/[slug]?token=...` que renderiza versão draft (não-publicada)
- [ ] **AC8**: Tela `/admin/settings/home` edita Hero (título, subtítulo, CTA), Stats (label/value), Logos
- [ ] **AC9**: Tela `/admin/settings/site` edita meta tags globais, redes sociais, contatos, IDs de tracking
- [ ] **AC10**: Site público (`/`, `/sobre`, `/atuacao`, `/metodo`, `/contato`) lê dados do Payload em vez de hardcoded
- [ ] **AC11**: Imagens do Hero/Stats/Logos são uploadable via Media collection (já existe)

## Tasks Técnicas

### T1 — Globals & Collections (1 dia)
- [ ] `src/globals/HomeSettings.ts` — fields: heroTitle, heroSubtitle, heroCta, heroVideo, stats[], clientLogos[]
- [ ] `src/globals/SiteSettings.ts` — fields: siteTitle, defaultMetaDescription, ogImage, social{linkedin, instagram, youtube}, contact{email, phone, address}, tracking{gaId, metaPixelId, gtmId}
- [ ] `src/collections/Pages.ts` — slug, title, description, blocks[]
- [ ] Block types: `HeroBlock`, `RichTextBlock`, `StatsBlock`, `CTABlock`, `FAQBlock`, `CasesBlock`, `TestimonialsBlock`

### T2 — UI no painel (1.5 dias)
- [ ] `/admin/pages` — listagem
- [ ] `/admin/pages/new` — criar página
- [ ] `/admin/pages/[slug]/edit` — editor de blocos com move up/down, delete, edit
- [ ] `/admin/settings/home` — formulário visual do Hero/Stats/Logos
- [ ] `/admin/settings/site` — formulário de meta tags + tracking + contatos

### T3 — Renderer no site público (1 dia)
- [ ] `src/components/blocks/` — um componente por tipo de block
- [ ] Páginas dinâmicas: `src/app/(site)/[slug]/page.tsx` resolve slug do Pages collection
- [ ] Home: `src/app/(site)/page.tsx` lê HomeSettings global
- [ ] Layout do (site): lê SiteSettings para meta tags + GA + Pixel

### T4 — Preview & Revalidation (0.5 dia)
- [ ] Rota `/preview/[slug]?token=X` com Draft Mode do Next.js
- [ ] Action `revalidatePath` ao salvar publicado
- [ ] Botão "Visualizar página" e "Publicar agora" na UI

## Definition of Done

- Cliente edita o título do Hero pelo painel e ele atualiza no site em <30s
- Adicionar logo de cliente novo no painel reflete em /sobre sem redeploy
- Mudar email de contato em SiteSettings altera footer em todas as páginas

---

## Ajustes da QA + Architect Review

- **AC12** Preview tokens: JWT HMAC, TTL=10min, escopados por slug. Vazamento não expõe drafts indefinidamente
- **AC13** Optimistic locking em Pages/Globals via `version` ou `updatedAt`. Se mudou desde load, retorna 409
- **AC14** `revalidatePath()` chamado em **Server Action** (não em hook Payload background) após save com sucesso
- **AC15** Blocks "CasesBlock"/"TestimonialsBlock" usam **relationship array** (não duplicam dados das collections)
- **AC16** Pages collection já com `versions: { drafts: true }` (S14 só estende UI)

## Ajustes pós feedback de cliente (2026-05-05)

Tornar EXPLÍCITOS estes campos editáveis no painel (necessidades 1-4 do cliente):

### SiteSettings global expandido — campos obrigatórios:

```
contact:
  - email (text)
  - phone (text)
  - whatsapp (text, opcional)
  - address (group: street, number, complement, district, city, state, cep)
social:
  - linkedin (url)
  - instagram (url)
  - youtube (url)
  - facebook (url, opcional)
  - twitter (url, opcional)
tracking:
  - gaId, metaPixelId, gtmId, hotjarId
seo:
  - defaultTitle, defaultDescription, ogImage
```

### Global FAQs (NOVO):

Collection `FAQs` (slug, question, answer, order, published, category).
Tela `/admin/faqs` com CRUD + reorder + toggle published.
Site público lê `/api/faqs?published=true&category=X` ordenado por `order`.

### Global Logos & Mídia do Site:

`HomeSettings` (já planejado) ganha:
- `clientLogos` (array de relations para Media com nome do cliente + ordem)
- `heroVideo` / `heroImage` (relação Media)
- `partnerLogos` (array de relations Media com link)

**Página `/admin/media`** ganha **categorização**: tag "uso" (logo-cliente, parceiro, hero, blog-cover, case-cover, post-thumb) — facilita encontrar/trocar.

## Ajustes finais QA Review

- **AC17** Toggle `published` em FAQs dispara `revalidatePath` nas rotas que consomem (`/contato`, `/`)
- **AC18** Validação CEP regex `\d{5}-?\d{3}` + UF enum (27 estados) no address group; ViaCEP autopreenche opcional
- **AC19** Validação regex em `gaId` (`G-[A-Z0-9]+`), `gtmId` (`GTM-[A-Z0-9]+`), `metaPixelId` (numérico), `hotjarId` (numérico) + botão "Testar pixel"
- **AC20** Categorização da Media (`usage` enum) obrigatória em uploads novos; migration marca existentes como `legacy`
