# Épico — Melhorias do Site (Auditoria SEO + UX)

**Origem:** Auditoria técnica de SEO e arquitetura de conteúdo (Screaming Frog, 137 URLs + PageSpeed home 07/08/2026)
**Autores da auditoria:** Torquato (código) · Ferraz (redação)
**Planejamento:** SM · 2026-08-07
**Base de código:** Next.js 15 (App Router) · Payload CMS 3 · Supabase · Vercel
**Deploy:** produção sai de `main` (feature branch só gera preview). Toda story é levada a `main` após validação.

---

## Como ler este épico

Cada sprint mapeia direto para um item numerado do documento do Ferraz, para o cliente rastrear item a item. O item 1.3 (editor) é o maior e foi dividido nas **4 etapas** que o próprio documento definiu.

---

## Roadmap

### Tópico 1 — SEO e Estrutura de Conteúdo

| Sprint | Item(ns) do doc | Nome | Prioridade | Risco | Status |
|--------|-----------------|------|-----------|-------|--------|
| [S01](sprint-01-quickwins-codigo.md) | 1.1, 1.2, 1.5a, 1.6a, 1.8 | Quick-wins de código | 🔥 P1 | Baixo | ✅ **QA PASS** (branch `feat/seo-quickwins-s01`) — falta varredura 1.2b (com S05) |
| [S02](sprint-02-editor-hierarquia.md) | 1.3 etapa 1, 1.5b | Editor: hierarquia H2–H6 + cabeçalho de publicação | 🔥 P1 | Médio | ✅ **QA PASS** — pendente: rodar migration em prod + validar browser |
| [S03](sprint-03-editor-texto-corrido.md) | 1.3 etapa 2, 1.6b | Editor: texto corrido | 🔥 P1 | Médio | ✅ **QA PASS** (dimensão de imagem corrigida pós-QA) — validar browser |
| [S04](sprint-04-editor-faq-schema-validacao.md) | 1.3 etapa 3, 1.4 | Editor: FAQ + dados estruturados + validações | 🟡 P2 | Médio | ✅ **QA PASS** (id de FAQ desambiguado pós-QA) — rodar migration + validar browser |
| [S05](sprint-05-editor-migracao-artigos.md) | 1.3 etapa 4 | Migração dos 31 artigos | 🔥 P1 | Médio-alto | ✅ **APLICADA** (29/34 normalizados no Supabase, backup salvo, verificado idempotente) 2026-08-07 |

### Tópico 2 — Experiência do Usuário

| Sprint | Item(ns) do doc | Nome | Prioridade | Risco | Status |
|--------|-----------------|------|-----------|-------|--------|
| [S06](sprint-06-ux-performance.md) | 2.1, 2.2, 2.3, 2.4 | UX e performance | 🔥 P1→P3 | Médio | 🟡 Código feito + ✅ QA PASS (PostHog/cache/contraste); vídeo+GTM = dono |

### Redação (Ferraz) — não depende de código para ser produzido, só de os campos existirem

| Sprint | Item(ns) do doc | Nome | Depende de | Status |
|--------|-----------------|------|-----------|--------|
| [S07](sprint-07-redacao-ferraz.md) | 1.4, 1.5, 1.6, 1.7 | Redação e preenchimento | S02 (resumo de busca), S03 (alt), S04 (FAQ) | ⬜ |

---

## Sequenciamento recomendado

```
Paralelo desde o dia 1:
  ├── S01 (quick-wins)  ─────────────────► main  (fecha rápido, alto impacto)
  └── S02 → S03 → S04 → S05  (editor, sequencial — cada etapa é testável)

S06 (UX) entra em paralelo, é independente do editor.
S07 (Ferraz) começa assim que os campos de S02/S03/S04 existirem.
```

**Por quê começar o editor (S02) em paralelo e não depois:** cada artigo publicado antes da correção nasce com o problema de hierarquia e entra na fila de retrabalho. Adiar o editor aumenta o passivo.

**Ponto de re-medição:** depois de S06.2.1 (vídeo), rodar PageSpeed de novo na home antes de investir em S06.2.3 (código não usado). Parte do LCP de 4,5 s pode já cair com o vídeo.

---

## Estado real do código × documento (validado nesta sessão)

Divergências que já foram confirmadas contra o código e que ajustam o escopo:

| Item | O que o doc supõe | O que o código mostra | Efeito no escopo |
|------|-------------------|-----------------------|------------------|
| 1.3 | "conteúdo salvo em blocos" | HTML único em `conteudo_html`; blocos só na UI | Migração (S05) é **normalização de heading**, não conversão de formato |
| 1.3 | travamento com blocos não diagnosticado | Causa conhecida (N editores TipTap); fix `LazyText` | Texto corrido **elimina** a causa (1 editor só) |
| 1.4 | faltam Article, Organization e Breadcrumb | Organization e WebSite **já existem** (`SchemaOrg.tsx`); Article existe como função | Só falta **plugar Article no post + criar Breadcrumb + FAQPage** |
| 1.5 | duplicação da marca | Confirmado: template `%s \| Unfold Growth` + título do post repassa a marca | Fix central em `layout.tsx:38` |
| 2.2 | FB Pixel e Clarity no código | **Não estão no código** — injetados via GTM | Correções são no **painel do GTM**, não em código |
| 2.2 | GA4/Ads possivelmente duplicados no código | Código só tem `gtag('event')`/`gtag('consent')`; sem tag fixa GA4/Ads | Verificar duplicidade **dentro do GTM**, não código |
| 2.3 | cache mal configurado | `/_next/static` já é imutável na Vercel | Ganho fica em `/public` (vídeo/imagens) |
| 5 (v1) | headers de segurança ausentes | **Já em produção** (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) | Concluído — fora do escopo |

---

## Decisões do dono (fechadas em 2026-08-07)

1. **Editor:** seguir texto corrido, entrega em 4 etapas. ✅
2. **GTM:** dono e time têm acesso (GTM vinculado ao projeto). Correções de 2.2 executadas no painel do GTM.
3. **Gravação de sessão:** manter **PostHog**, desligar **Clarity** (redundante; só PostHog faz funil). Condição a confirmar antes de executar: alguém realmente usa análise de funil no PostHog? Se ninguém montou funil, inverte para Clarity. Enxugar PostHog (surveys off, autocapture→eventos, lazyOnload; amostragem 100% por ora).
4. **Ordem de ataque:** livre — S01 e S02 em paralelo.

---

## Pendências externas (não bloqueiam o código, mas o dono precisa prover)

- [ ] Confirmar com quem opera: análise de funil é usada no PostHog? (decide Clarity vs PostHog)
- [ ] Acesso ao painel do GTM validado para conferir tags GA4/Ads/Clarity/Pixel
- [ ] Ferraz: 42 títulos, 36 resumos de busca, 69 alts, FAQ por artigo, 4 páginas ampliadas (S07)

---

*— SM · 2026-08-07 · Sequenciando a entrega 📋*
