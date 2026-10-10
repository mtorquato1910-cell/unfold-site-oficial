# S04 — Indexação: robots.txt único, noindex nas páginas legais, og:url/og:image, HSTS e 404 em PT-BR

**Origem:** Plano de Ação (importantes: robots, noindex legais, og, HSTS, 404) · Checklist M02, M03, M05, M07
**Prioridade:** 🔥 P1 (robots, 404) / 🟡 P2 (og, HSTS, noindex) · **Risco:** Baixo · **Executor:** @dev · **Revisão:** @qa
**Dependências:** nenhuma.
**Status:** 🟢 Código implementado (2026-10-10). AC4.6c (busca) aguarda P2; AC4.7 após deploy

---

## Story

**Como** Google e rastreadores de IA,
**quero** regras de indexação coerentes (robots, meta robots, sitemap, canonical e og sem contradição) e uma 404 útil,
**para que** só as páginas certas sejam indexadas e nenhum visitante caia num beco sem saída.

---

## Acceptance Criteria

### 4.1 robots.txt (Plano + Checklist M02/M07)
- [x] **AC4.1a** Existe **um único** robots: manter `src/app/robots.ts` e **apagar `public/robots.txt`** (hoje os dois coexistem; confirmar com `curl` qual era servido e registrar).
- [x] **AC4.1b** Remover a linha `Host:` (propriedade `host` em `robots.ts`).
- [x] **AC4.1c** Disallow: `/admin/`, `/painel/`, `/api/`, `/diagnostico/etapa-2/`, `/diagnostico/resultado/` e `/*?q=` (busca interna, mesmo antes de existir — Plano).
- [x] **AC4.1d** `Sitemap: https://unfoldgrowth.com.br/sitemap.xml` (URL absoluta).
- [x] **AC4.1e** Rastreadores de IA liberados via `User-agent: *` + `Allow: /` (Checklist M07). **Default de P3 = liberar** inclusive bots de treinamento (GPTBot, ClaudeBot, Google-Extended); se o cliente decidir bloquear, adicionar blocos específicos só para eles.
- [x] **AC4.1f** Nenhuma URL com `noindex` também bloqueada no robots (Checklist M02: o Google não leria o noindex). Conferir as páginas da 4.3.
- [x] **AC4.1g** Subdomínio `eleicoes.` continua com o próprio robots (`src/app/guia-seo/robots/route.ts`) — não regredir.

### 4.2 og:url e og:image (Plano)
- [x] **AC4.2a** Toda página indexável emite `og:url` igual ao canonical. Implementar com um helper (`buildMetadata({ path, title, description, image })` em `src/lib/seo.ts` ou equivalente) para não repetir `alternates.canonical` + `openGraph.url` em cada página.
- [x] **AC4.2b** Home com `og:image` 1200×630 (criar `src/app/(site)/opengraph-image.png` ou `.tsx` com `ImageResponse`, identidade visual do site). Serve de fallback para páginas sem imagem própria.
- [x] **AC4.2c** Posts e cases continuam usando a capa própria quando existir.

### 4.3 noindex nas páginas legais (Plano)
- [x] **AC4.3a** `/termos`, `/lgpd`, `/politica-de-privacidade` com `robots: { index: false, follow: true }`.
- [x] **AC4.3b** `/diagnostico/privacidade`: **pendente P4** — default = aplicar noindex também (mesmo tipo de página). Confirmar com o cliente antes do merge.
- [x] **AC4.3c** Essas páginas continuam linkadas no rodapé (Checklist M04 "Autoridade") e fora do sitemap.

### 4.4 HSTS (Plano + Checklist M05)
- [x] **AC4.4a** `Strict-Transport-Security: max-age=31536000` agora; `includeSubDomains` após conferir a zona DNS (ver QA) (`next.config.ts:8`, `HSTS_MAX_AGE`).
- [x] **AC4.4b** Antes do merge, confirmar que **todos** os subdomínios ativos respondem em HTTPS (`eleicoes.unfoldgrowth.com.br` e qualquer outro do DNS). Registrar a lista.
- [x] **AC4.4c** `preload`: **não** ativar nesta story (é difícil de desfazer). Registrar como avaliação futura.
- [x] **AC4.4d** Conferir os demais cabeçalhos do Checklist M05: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, proteção contra clickjacking (`frame-ancestors` ou `X-Frame-Options`). Adicionar o que faltar, sem quebrar o embed do painel/preview.

### 4.5 max-image-preview (Checklist M02, P3)
- [x] **AC4.5** Meta robots das páginas de conteúdo (posts, cases) com `max-image-preview:large`.

### 4.6 Página 404 (Plano + Checklist M03 + reunião)
- [x] **AC4.6a** `src/app/(site)/not-found.tsx` em PT-BR, renderizada **dentro do layout do site** (menu e rodapé) e respondendo **status 404** (não soft-404).
- [x] **AC4.6b** Conteúdo: título claro ("Esta página não existe ou mudou de endereço"), links para Início, Blog, Cases, Diagnóstico e Contato, os **3–6 posts mais recentes** e CTA de contato (texto sugerido na reunião: "Essa página não existe, mas você pode conferir nosso blog").
- [ ] **AC4.6c** Campo de busca de posts: **pendente P2**. Se o cliente escolher criar a busca, a 404 ganha um form `GET /blog?q=`; se não, fica sem busca. Implementar o resto sem esperar.
- [x] **AC4.6d** `blog/[slug]` e `cases/[slug]` inexistentes chamam `notFound()` e caem nesta página.
- [x] **AC4.6e** `<meta name="robots" content="noindex">` na 404.

### Validação
- [ ] **AC4.7** Após deploy: `curl https://unfoldgrowth.com.br/robots.txt` (sem `Host`, com sitemap, com `?q=`); `curl -sI` de uma URL inexistente → `404` com HTML em PT-BR; `curl -sI /` mostra o HSTS novo; view-source da home com `og:url` e `og:image`; `/termos` com `noindex`.
- [ ] **AC4.8** Lint, typecheck, testes e build verdes.

## Definition of Done
- Tudo acima em produção e verificado com curl; Ferraz avisado para reenviar o robots no GSC (Configurações → robots.txt).

## Registro de implementação (2026-10-10)

- **4.1:** produção servia o `robots.ts` (a rota do app tem prioridade); `public/robots.txt` era código morto e foi removido. Saíram o `Host:`; entraram `Disallow: /painel/` e `/*?q=`. O `User-agent: *` + `Allow: /` libera os rastreadores de IA (P3 = liberar, o padrão). As páginas noindex **não** estão no Disallow.
- **4.2:** `withSeo(path, meta, opts)` em `src/lib/seo/canonical.ts` emite canonical, `og:url` (= canonical), `og:title`, `og:description`, `og:image` (própria ou padrão) e locale/siteName. O openGraph da página substitui o do layout, então o helper repete esses campos.
  - Aplicado em 17 rotas: 15 páginas estáticas, mais post e case.
  - `/ferramentas/mapa-icp` mantém `/og/mapa-icp.png`. Posts e cases usam a capa; sem capa, a imagem padrão.
  - **og:image padrão:** `public/og/default.png` (1200×630, 155 KB), gerada por `scripts/gen-og-default.py` com o texto da "Versão para o site" ("Growth para vendas complexas B2B"), na identidade do site (fundo #001E29, menta #6DF9C6, Space Grotesk).
- **4.3:** `noindex, follow` em `/termos`, `/lgpd`, `/politica-de-privacidade` e `/diagnostico/privacidade` (**P4 = default sim**; reverter é trocar `{ noindex: true }`). Elas continuam no rodapé e fora do sitemap.
- **4.4:** HSTS `max-age=31536000; includeSubDomains`, sem `preload`.
  - Subdomínios conferidos via DNS em 10/10: só `www` e `eleicoes` respondem, os dois na Vercel com HTTPS.
  - Também testados sem resposta: lp, rd, materiais, conteudo, app, blog, go, links, email, mail, click, news, m, cdn, api, status, crm.
  - ⚠️ Qualquer subdomínio novo precisa nascer com HTTPS (comentário no `next.config.ts`).
  - **4.4d:** `nosniff`, `Referrer-Policy`, `X-Frame-Options` (DENY/SAMEORIGIN) e CSP `upgrade-insecure-requests` já existiam.
- **4.5:** `max-image-preview: large` no robots do layout, valendo para todo o site.
- **4.6:** `app/(site)/not-found.tsx`: PT-BR, dentro do layout (menu e rodapé), 6 posts recentes, seções principais e CTA (contato/diagnóstico).
  - Como o app tem vários layouts-raiz e nenhum `app/layout.tsx`, URL sem rota caía na 404 padrão do Next. A rota `app/(site)/[...rest]/page.tsx` captura e chama `notFound()`. Rotas específicas (painel, api, estáticos, sitemap, robots) têm prioridade.
  - O Next injeta `noindex` nas respostas 404.
  - **4.6c (busca): aguarda P2.**
- **De brinde:** os 2 `<a>` internos em `/diagnostico/privacidade` viraram `<Link>` (eram erro de lint antigo).

## QA Results — 2026-10-10 (Quinn)

**Veredito: CONCERNS → resolvido.** tsc ✅ · vitest ✅ · lint ✅ (23 arquivos).

**Risco principal descartado:** o catch-all `(site)/[...rest]` **não** captura `/admin`, `/api`, `/painel`, os arquivos estáticos, o sitemap nem o robots. Evidência em `next/dist/server/lib/router-utils/resolve-routes.js`: as rotas dinâmicas só são avaliadas **depois** dos rewrites `afterFiles`. A prova em produção é a rota `(payload)/admin/[[...segments]]`, que já existe e não intercepta o rewrite `/admin → /painel`.

| Sev. | Achado | Tratamento |
|---|---|---|
| Média | og:image do mapa-icp apontava para `/og/mapa-icp.png`, que **não existia** (404, erro antigo do layout) | ✅ imagem gerada (`public/og/mapa-icp.png`, 156 KB); gerador parametrizado |
| Baixa | og:title perdia o "\| Unfold Growth" (o `withSeo` fixava o título cru) | ✅ `withSeo` não fixa mais og:title/og:description, o Next herda com o template |
| Baixa | Toda URL inexistente fazia SSR + consulta ao banco | ✅ posts recentes da 404 com `unstable_cache` (1h, tag `posts`) |
| Baixa | Possível `<title>` duplicado na 404 | ✅ título via `metadata` no catch-all (com `noindex`); `<title>` inline removido |
| Baixa (operacional) | `includeSubDomains` com lista de subdomínios obtida por tentativa no DNS | ✅ **Escalonado:** agora só `max-age=31536000` no apex (sempre HTTPS, sem risco). `includeSubDomains` entra no OPS depois de exportar a zona DNS completa e conferir HTTPS em todo registro (CNAMEs de clique de e-mail do RD/Google, landing pages) |
| Info | `/*?q=` só pega o `q` como primeiro parâmetro | ✅ adicionado `/*&q=` |
| Info | `/diagnostico/etapa-2` e `resultado` com noindex + Disallow (antigo, URLs privadas com token) | Aceito, registrado |

Validar no preview: view-source de `/sobre` (og:title com sufixo), de uma URL inexistente (status 404, título, noindex) e de `/ferramentas/mapa-icp` (og:image).

## File List
- `src/app/robots.ts` (reescrito) · `public/robots.txt` (removido)
- `src/lib/seo/canonical.ts`: `withSeo`, `DEFAULT_OG_IMAGE` e constantes
- `public/og/default.png` (novo) + `scripts/gen-og-default.py` (novo)
- `src/app/(site)/layout.tsx`: og:image padrão e `max-image-preview`
- `src/app/(site)/page.tsx`, `atuacao`, `blog`, `cases`, `contato`, `diagnostico`, `diagnostico/privacidade`, `ferramentas`, `ferramentas/calculadora-trafego`, `ferramentas/mapa-icp`, `lgpd`, `metodo`, `politica-de-privacidade`, `sobre`, `termos` (`page.tsx`): `withSeo`
- `src/app/(site)/blog/[slug]/page.tsx`, `src/app/(site)/cases/[slug]/page.tsx`: `withSeo` em `generateMetadata`
- `next.config.ts`: HSTS (1 ano, apex)
- `public/og/mapa-icp.png` (novo; corrige 404 antigo)
- `src/app/(site)/not-found.tsx` (novo), `src/app/(site)/[...rest]/page.tsx` (novo)
