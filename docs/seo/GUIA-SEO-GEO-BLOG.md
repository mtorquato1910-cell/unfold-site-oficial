# Guia de SEO, GEO e Blog — unfoldgrowth.com.br

> **O que é este documento:** a referência única de tudo o que foi feito no site da Unfold Growth para ranquear no Google e ser citado por IAs (ChatGPT, Claude, Perplexity, Copilot, Gemini/AI Mode). Explica **o que existe**, **por que existe**, **como o blog funciona por dentro** e **o que fazer daqui para frente** para ranquear melhor.
>
> **Para quem:** dono do projeto, time de conteúdo (Ferraz), desenvolvedores (Torquato e quem vier depois) e qualquer agência ou consultor que assumir o SEO.
>
> **Atualizado em:** 22/10/2026 · **Base:** código da `main` (commit `ebbe556`) + épicos `melhorias-site-2026-08` e `seo-tecnico-2026-10` + Plano de Ação e Checklist de SEO Técnico do Ferraz (07–08/10/2026).

---

## Sumário

1. [Resumo executivo](#1-resumo-executivo)
2. [Contexto: stack, domínios e origem das decisões](#2-contexto-stack-domínios-e-origem-das-decisões)
3. [Linha do tempo do SEO no site](#3-linha-do-tempo-do-seo-no-site)
4. [Indexação: robots, meta robots, sitemap e canonical](#4-indexação-robots-meta-robots-sitemap-e-canonical)
5. [Rastreamento: redirects, domínio, 404 e links quebrados](#5-rastreamento-redirects-domínio-404-e-links-quebrados)
6. [SEO on-page: títulos, descrições, headings, imagens e URLs](#6-seo-on-page-títulos-descrições-headings-imagens-e-urls)
7. [Dados estruturados (schema.org)](#7-dados-estruturados-schemaorg)
8. [Dados da empresa (identidade para o Google)](#8-dados-da-empresa-identidade-para-o-google)
9. [Autoria e E-E-A-T](#9-autoria-e-e-e-a-t)
10. [Performance e segurança](#10-performance-e-segurança)
11. [GEO — otimização para IAs](#11-geo--otimização-para-ias)
12. [A lógica do blog, por dentro](#12-a-lógica-do-blog-por-dentro)
13. [Manual de redação: como escrever um post que ranqueia](#13-manual-de-redação-como-escrever-um-post-que-ranqueia)
14. [Estratégia de ranqueamento (o que faz o site subir)](#14-estratégia-de-ranqueamento-o-que-faz-o-site-subir)
15. [Rotina operacional](#15-rotina-operacional)
16. [Como validar (ferramentas e comandos)](#16-como-validar-ferramentas-e-comandos)
17. [Pendências em aberto](#17-pendências-em-aberto)
18. [Regras de ouro para desenvolvedores](#18-regras-de-ouro-para-desenvolvedores)
19. [Mapa de arquivos](#19-mapa-de-arquivos)
20. [Glossário](#20-glossário)

---

## 1. Resumo executivo

O site saiu de um estado com problemas sérios de base (sitemap que só mudava em deploy, datas de atualização falsas, links quebrados, autor "Equipe Unfold Growth", schema com logo 404, vídeo de 80 MB na home, 404 em inglês) para uma **fundação técnica completa**, alinhada ao Checklist de SEO Técnico do Ferraz (9 módulos).

**O que já está em produção:**

| Área | Estado |
|---|---|
| Indexação | robots.txt único, sitemap dinâmico (ISR 1h + revalidação a cada publicação), canonical em todas as páginas, `noindex` nas páginas legais e operacionais |
| Datas | `content_updated_at`: data editorial real (só muda quando título ou corpo mudam) no sitemap, no schema e visível no post |
| Rastreamento | 10 redirects 301/308 de URLs antigas, redirect automático quando o slug de um post publicado muda, 404 em PT-BR com status 404 real, **0 links internos quebrados** |
| On-page | Título de busca (≤60) e resumo de busca (≤155) por post, com contador e prévia do Google; hierarquia H1→H6 correta; alt obrigatório; imagens com width/height e lazy |
| Schema | Organization (`@id` fixo), WebSite, BlogPosting, Person, ProfilePage, BreadcrumbList, FAQPage, Service, CollectionPage — tudo igual ao conteúdo visível |
| Autoria | Autores reais (Gabriel Calheiros 36 posts, Davi Brito 6), página `/autor/[slug]`, byline, box de autor, "Revisado por" |
| GEO | Bots de IA liberados, conteúdo no HTML do servidor (SSR), `/llms.txt` gerado pelo CMS, IndexNow (Bing/Copilot) a cada publicação, FAQ citável |
| Performance | Vídeo do hero de 80 MB → 1,3 MB, celular não baixa vídeo, contadores com valor final no HTML |
| Blog | Editor de texto corrido (TipTap) com validações de SEO antes de publicar, FAQ por artigo, índice (TOC), banners internos, cases no mesmo padrão dos posts |

**O que falta (resumo — detalhes na seção 17):** dados da empresa (endereço, fundadores, ano, redes), redirect www→apex na Vercel, `INDEXNOW_KEY` em produção, alt das 73 imagens, decisão sobre busca no blog, Bing Webmaster Tools, grupo "IA" no GA4, e a rotina de conteúdo (FAQ em todos os posts, títulos/resumos do Ferraz, consolidação de posts não indexados).

**A tese central:** a parte técnica deixou de ser o gargalo. Daqui para frente, **o ranqueamento depende de conteúdo** (profundidade, dados próprios, atualização, linkagem interna) e de **marca** (menções fora do site). A seção 14 é o plano para isso.

---

## 2. Contexto: stack, domínios e origem das decisões

### Stack

| Camada | Tecnologia | Implicação de SEO |
|---|---|---|
| Front | Next.js 15 (App Router), React Server Components | HTML completo vem do servidor (SSR/ISR) — essencial para Google e IAs, que em geral não executam JS |
| CMS | Payload CMS 3 (schema `site` no Postgres/Supabase) | **SEO no Payload não é automático**: cada campo precisa de um consumidor no front, hooks precisam revalidar, metadados precisam ser renderizados |
| Painel | `/painel` (custom, Supabase Auth). `/admin` é só rewrite | É onde o time publica posts, cases, autores, banners |
| Hospedagem | Vercel (CDN, HTTP/2+, Brotli, HTTPS automático) | **Produção sai da branch `main`.** Feature branch só gera preview |
| Banco | Supabase Postgres, `push: false` | Toda coluna nova exige migration; o build trava se faltar coluna crítica (`scripts/verify-schema.mjs`) |

### Domínios

| Host | Papel | robots / sitemap |
|---|---|---|
| `https://unfoldgrowth.com.br` | **Versão oficial** (apex, https, sem www, sem barra final) | `src/app/robots.ts` · `src/app/sitemap.ts` |
| `www.unfoldgrowth.com.br` | Redireciona para o apex | — |
| `eleicoes.unfoldgrowth.com.br` | Hotsite do Guia Eleições 2026 (Unfold × Feat.Work) | **Próprios**: `src/app/guia-seo/robots` e `src/app/guia-seo/sitemap` (via middleware). Regra do protocolo: um sitemap só lista URLs do próprio host |

### De onde vieram as decisões

| Fonte | Data | Conteúdo |
|---|---|---|
| Sprint 7 (base) | 2026-05 | SEO inicial: sitemap, robots, schema.org, redirects, headers de segurança |
| Auditoria SEO + UX (Torquato/Ferraz) | 07/08/2026 | Screaming Frog (137 URLs) + PageSpeed → épico `docs/stories/melhorias-site-2026-08/` |
| Correção do sitemap | 21/09/2026 | Sitemap era estático de build → ISR + `revalidatePath` |
| Plano de Ação SEO Técnico (Ferraz) | 07/10/2026 | 23 tarefas (12 críticas, 11 importantes) + Anexos A–D |
| Checklist SEO Técnico Novo Site (Ferraz) | 08/10/2026 | 9 módulos (régua de qualidade) — inclui GEO, autoria e dados da empresa |
| Reunião "SEO Sementes" | 07/10/2026 | Prioridade: **lastmod** e **links quebrados** |
| Épico `seo-tecnico-2026-10` | 10/10/2026 | S01–S10 + OPS → em produção (main `d572b03`) |
| Decisões do cliente | 13–14/10/2026 | Autores só com mini bio; cases 100% texto corrido; "Versão para o site" só em schema/llms/rodapé |

---

## 3. Linha do tempo do SEO no site

```
2026-05  Sprint 7 ─ SEO base (sitemap, robots, schema, headers)
2026-08  Épico Melhorias ─ canonical central, nofollow interno corrigido, marca duplicada no
         título, editor H2–H6, texto corrido, alt obrigatório, FAQ + FAQPage, Article,
         Breadcrumb, título/resumo de busca, migração de 29 artigos
2026-09  Fix sitemap ─ deixou de ser estático (artigos novos entravam só no próximo deploy)
2026-09  Fix "conteúdo sumia ao reabrir" no editor de posts
2026-10  Épico SEO Técnico ─ content_updated_at, 10 redirects, robots único, 404 PT-BR,
         og:image/og:url, HSTS 1 ano, hero 1,3 MB, Organization @id, autores reais,
         breadcrumb visível, Service/CollectionPage, llms.txt, IndexNow, cases = posts
2026-10-14  34 links quebrados removidos em 19 posts (0 restantes); autores com mini bio
2026-10-22  Este guia
```

---

## 4. Indexação: robots, meta robots, sitemap e canonical

Os quatro controles **não podem se contradizer** (Checklist M02). Regra-mãe: uma página que deve ranquear é rastreável, indexável, está no sitemap e aponta para si mesma no canonical.

### 4.1 robots.txt — `src/app/robots.ts`

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /painel/
Disallow: /api/
Disallow: /diagnostico/etapa-2/
Disallow: /diagnostico/resultado/
Disallow: /*?q=
Disallow: /*&q=
Sitemap: https://unfoldgrowth.com.br/sitemap.xml
```

- **Fonte única.** O antigo `public/robots.txt` foi apagado (era código morto e confundia).
- **Sem `Host:`** (diretiva do Yandex, ignorada pelo Google).
- `/*?q=` e `/*&q=` bloqueiam páginas de busca interna (sem valor de busca), mesmo antes de a busca existir.
- **Bots de IA liberados** pelo `User-agent: *` + `Allow: /` — inclusive os de treinamento (GPTBot, ClaudeBot, Google-Extended). Para bloquear treinamento no futuro, adicionar blocos específicos **só** para esses user-agents.
- ⚠️ **Nunca** colocar no `Disallow` uma URL que tenha `noindex`: se o rastreio é bloqueado, o Google não lê o `noindex` e a página pode continuar no índice.

### 4.2 Meta robots — o que é e o que não é indexado

| Página | Indexável? | Por quê |
|---|---|---|
| Home, `/sobre`, `/metodo`, `/atuacao`, `/cases`, `/blog`, `/diagnostico`, `/contato`, `/ferramentas`, `/ferramentas/calculadora-trafego`, `/ferramentas/mapa-icp` | ✅ | Páginas de negócio |
| `/blog/[slug]` (posts publicados) | ✅ | Conteúdo |
| `/cases/[slug]` (cases publicados) | ✅ | Prova social |
| `/autor/[slug]` | ✅ se o autor tem mini bio ou bio completa | Sem bio é página rala → `noindex` e fora do sitemap |
| `/termos`, `/lgpd`, `/politica-de-privacidade`, `/diagnostico/privacidade` | ❌ `noindex, follow` | Páginas legais: continuam no rodapé (sinal de confiança), mas não disputam busca |
| `/blog/contribuir` | ❌ `noindex` | Página operacional (envio de artigo de convidado) |
| Telas de resultado (`/diagnostico/r/*`, `/calculadora-trafego/r/*`, `mapa-icp/montar`) | ❌ `noindex` | URLs privadas com token |
| 404 | ❌ (o Next injeta `noindex`) | — |

Também no layout: `max-image-preview: large` para todo o site (permite miniaturas grandes no Google/Discover).

### 4.3 Sitemap — `src/app/sitemap.ts`

**Como funciona:**

- **ISR de 1 hora** (`export const revalidate = 3600`) **+ `revalidatePath('/sitemap.xml')`** em toda criação, edição, exclusão e aprovação de post e case. Resultado: post publicado no painel entra no sitemap na hora, sem deploy.
  > ⚠️ **Histórico (gotcha de 21/09/2026):** sem o `revalidate`, o Next pré-renderizava o sitemap no build e ele só mudava em deploy. Artigos novos ficavam dias fora do sitemap — por isso era preciso "Solicitar indexação" manual em todo artigo.
- **Conteúdo:** 11 rotas institucionais + cases publicados + posts publicados + páginas de autor indexáveis.
- **Só URLs canônicas, indexáveis e com status 200.** Nada de redirect, `noindex`, rascunho ou parâmetro.

**A regra do `lastmod` (o item mais prioritário da reunião de 07/10):**

| Tipo | `lastmod` | Por quê |
|---|---|---|
| Post | `content_updated_at` (fallback `publicado_em`) | Data **editorial**: só muda quando título ou corpo mudam de verdade |
| Case | `content_updated_at` (fallback `published_at`) | Mesma regra dos posts |
| `/blog` | Maior `content_updated_at` entre os posts | O índice "acompanha" o post mais recente, e o Google volta à listagem e descobre os novos |
| `/cases` | Maior data editorial entre os cases | Idem |
| Página de autor | Data do artigo mais recente do autor | — |
| Institucionais | **Sem `lastmod`** | Decisão do cliente: data fixa e falsa é pior que nenhuma |

- **Formato:** ISO 8601 com fuso de Brasília: `2026-10-01T00:00:00-03:00` (helper `toBrtIso` em `src/lib/content-date.ts`).
- O Google **ignora** `priority` e `changefreq`, mas **lê o `lastmod` quando ele é confiável**. Por isso o problema de 07/08 (um script "atualizou" 25 posts de uma vez e o sitemap passou a mentir) era grave: o Google deixa de confiar no `lastmod` do site inteiro.

### 4.4 Canonical e Open Graph — `src/lib/seo/canonical.ts`

- Helper **`withSeo(path, meta, opts)`** usado em 17 rotas: emite **canonical autorreferente sem query string** (neutraliza `?gclid`, `?fbclid`, `?utm_*`), `og:url` igual ao canonical, `og:image` (própria ou padrão), `locale pt_BR` e `siteName`.
- `metadataBase` no layout resolve tudo para URL absoluta.
- **og:image padrão:** `public/og/default.png` (1200×630, gerada por `scripts/gen-og-default.py` na identidade do site). Posts e cases usam a própria capa; `/ferramentas/mapa-icp` tem `public/og/mapa-icp.png`.
- `withSeo` **não** fixa `og:title`/`og:description`: o Next herda o título com o template `| Unfold Growth`.

---

## 5. Rastreamento: redirects, domínio, 404 e links quebrados

### 5.1 Redirects permanentes — `src/lib/legacy-redirects.ts`

Importados no `next.config.ts`. `permanent: true` gera **308**, que o Google trata como 301.

| Origem (antiga) | Destino |
|---|---|
| `/blog/as-metricas-de-growth-que-importam` | `/blog/quais-metricas-e-como-medir-em-growth-marketing` |
| `/blog/previsibilidade-comercial-na-incorporadora` | `/blog/previsibilidade-comercial-como-sair-do-mes-a-mes-na-incorporadora` |
| `/blog/geracao-de-demanda-x-geracao-de-leads` | `/blog/geracao-de-demanda-x-geracao-de-leads-por-que-mais-leads-podem-estar-piorando-suas-vendas-b2b` |
| `/blog/marketing-para-incorporadoras-e-construtoras` | `/blog/marketing-e-growth-para-incorporadoras-e-construtoras` |
| `/blog/por-que-incorporadora-gera-leads-e-nao-vende` | `/blog/por-que-sua-incorporadora-gera-leads-e-nao-fecha-vendas-e-como-resolver` |
| `/blog/crm-para-incorporadora` | `/blog/crm-para-incorporadora-como-organizar-o-funil-de-lancamento` |
| `/blog/sales-enablement-incorporadora` | `/blog/sales-enablement-para-corretores-e-comite-de-compra` |
| `/calculadora` | `/ferramentas/calculadora-trafego` |
| `/processo-comercial` | `/blog/processo-comercial` |
| `/blog/quanto-investir-para-vender-um-lancamento-imobiliario` | `/blog/quanto-investir-em-trafego-pago-para-lancamento-imobiliario` |

Mais 4 legados (`/agencia`, `/servicos`, `/portfolio`, `/blog/trafego-pago`) e o www→apex.

- **`/blog/receita-previsivel` não tem redirect de propósito** (decisão D1: a URL nunca existiu; os links para ela foram removidos).
- Teste automático (`src/lib/__tests__/legacy-redirects.test.ts`) garante: sem duplicata, **sem cadeia** (destino que também é origem), sem loop.
- ⚠️ Se o slug de um **destino** mudar, atualizar a lista — senão vira cadeia de 2 saltos.

### 5.2 Redirect automático por troca de slug

- Quando o slug de um **post publicado** muda no painel, `updatePost` grava um registro na collection `redirects` (via Local API com `overrideAccess`, porque os usuários do painel são `editor`).
- `blog/[slug]/page.tsx`: se não acha o post, consulta `redirects` e faz `permanentRedirect` (308); se não há registro, `notFound()`.
- **Limite conhecido:** só cobre `/blog/*`. Trocar slug de **case** ou de **autor** não cria redirect (registrado como story futura).

### 5.3 Domínio e barra final

| Variação | Saltos hoje |
|---|---|
| `http://unfoldgrowth.com.br/` | 1 (Vercel) |
| `https://www.unfoldgrowth.com.br/` | 1 (app) |
| `http://www.unfoldgrowth.com.br/` | 2 |
| `https://unfoldgrowth.com.br/blog/sdr/` | 1 (barra final) |
| `http://www.unfoldgrowth.com.br/blog/sdr/` | 3 |

- **Pendente (OPS):** configurar `www → apex` (308) no **Vercel → Settings → Domains**, o que tira o www antes do app. Só depois remover o redirect de www do `next.config.ts`.
- Impacto residual: nenhum link interno, canonical ou sitemap usa www, http ou barra final.

### 5.4 Página 404 — `src/app/(site)/not-found.tsx`

- Em PT-BR, **dentro do layout** (menu e rodapé), com **status 404 real** (não soft-404) e `noindex`.
- Conteúdo: "Esta página não existe ou mudou de endereço", links para Início/Blog/Cases/Diagnóstico/Contato, **6 posts mais recentes** (cache de 1h) e CTA.
- Como o app tem vários layouts-raiz, a rota `src/app/(site)/[...rest]/page.tsx` captura URLs sem rota e chama `notFound()`. Rotas específicas (painel, api, admin, estáticos, sitemap, robots) têm prioridade.
- ⚠️ **Gotcha de deploy:** com esse catch-all, o lint da Vercel exige `<Link>` em todo link interno (`<a href="/...">` quebra o build **só na Vercel**).

### 5.5 Links quebrados

- **14/10/2026:** 34 links quebrados removidos em 19 posts (`scripts/remove-broken-links.ts --apply`). Regra D2: tirar só o `<a>` e manter o texto; se era item de "Leia também" ou frase que só existia para o link, remover o item/frase.
- Rastreio posterior (`scripts/check-internal-links.ts`): **42 documentos, 44 caminhos internos, 0 com 4xx, 0 redirecionando.**
- Backup e rollback: `backups/posts-html-before-brokenlinks-2026-10-14T12-22-39.json`.
- A remoção **não alterou** a data de atualização (edição técnica — ver 12.4).

---

## 6. SEO on-page: títulos, descrições, headings, imagens e URLs

### 6.1 Title

- Template do layout: **`%s | Unfold Growth`** — a marca vem **só** daqui (a duplicação "| Unfold Growth | Unfold Growth" foi corrigida em agosto).
- Páginas estáticas informam só o próprio nome (`title: 'Blog'` → "Blog | Unfold Growth").
- **Post:**
  - Se o **Título de busca** (`meta_title`) estiver preenchido → vira o título **absoluto** (≤60 caracteres, sem sufixo de marca, palavra-chave no início).
  - Se estiver vazio → `"{título do post} | Blog"` + template = "Título | Blog | Unfold Growth".
- **Case:** `meta_title` (absoluto) ou título.

### 6.2 Meta description

- **Post:** `meta_description` (Resumo de busca, ≤155) → fallback `resumo` (o do card).
- **Case:** `meta_description` → `excerpt` → `tagline`.
- O `resumo` do card e o **resumo de busca** são campos **separados** de propósito: o card fala com quem já está no site; o resumo de busca fala com quem está no Google.

### 6.3 Headings

- **Exatamente um H1 por página.** No post e no case, o H1 é o **título**; o editor **não oferece H1** no corpo.
- Corpo: **H2 → H6** com nomes técnicos no editor ("Título 2 (H2)"…), sem saltos (H2→H4 gera aviso).
- **Moldura fora da hierarquia:** CTA final "Aplique esse conhecimento", banners laterais, newsletter do rodapé, cards — viraram `<p>`/`<div>` estilizados (visual idêntico). Só o conteúdo do artigo tem headings.
- `/contato` ganhou `<h1>` real.

### 6.4 Imagens

| Regra | Onde é garantida |
|---|---|
| Alt obrigatório no upload de mídia | `Media.alt` obrigatório no create |
| Alt obrigatório ao inserir imagem no editor | Prompt do editor: sem descrição, não insere |
| `width`/`height` em toda imagem do corpo (evita CLS) | Editor lê `naturalWidth/Height` no upload e grava no `<img>` |
| `loading="lazy"` + `decoding="async"` nas imagens do corpo | No **render** (`lazyContentImages()` em `RichContent`), porque o sanitizer remove `loading` do HTML salvo |
| Imagem LCP sem lazy e com `fetchpriority="high"` | Hero da home (`next/image` com `priority`) |
| Tabela é `<table>` HTML, nunca imagem | Botão de tabela no editor |
| Vídeo do YouTube com fachada leve | Placeholder `<div data-youtube="ID">` |

- **Pendente:** 73 imagens de conteúdo (diagramas) sem alt — lista em `backups/imagens-conteudo-2026-10-10.md`. Preencher o alt **não** muda a data de atualização do post.
- **Como escrever alt:** uma frase curta do que a imagem mostra, sem repetir o título do artigo. ✅ "Diagrama comparando funil, pipeline e jornada de compra" · ❌ "Funil de vendas Unfold Growth". Máx. ~100 caracteres. Imagem puramente decorativa → `alt=""`.

### 6.5 URLs e slugs

- Minúsculas, hífens, sem acento, cedilha ou caractere especial. Slug gerado automaticamente do título e editável.
- **Slug curto e igual à palavra-chave principal**, não a frase inteira. Ex.: ✅ `/blog/sdr`, `/blog/funil-de-vendas` · ⚠️ os slugs longos atuais (ex.: `/blog/geracao-de-demanda-x-geracao-de-leads-por-que-mais-leads-podem-estar-piorando-suas-vendas-b2b`) funcionam, mas **não vale trocar** os já indexados — trocar slug custa um redirect e um período de reavaliação. Aplicar a regra só nos **novos**.
- Profundidade máxima: `/blog/slug`, `/cases/slug`, `/autor/slug`, `/ferramentas/x` (2 níveis).

### 6.6 Links internos e externos

- Sanitização (`src/lib/html-sanitize.ts`): links do **próprio domínio** (absolutos ou relativos) **não** recebem `nofollow` nem `target=_blank` — antes recebiam, o que "cortava" a autoridade interna. Links externos recebem `nofollow`/`target=_blank`.
- Links internos devem ser `<a href>` rastreáveis (nunca `onclick`).
- A listagem `/blog` mostra até **100** posts numa página (antes eram 30 e os mais antigos ficavam órfãos para o Googlebot).

---

## 7. Dados estruturados (schema.org)

Tudo em **JSON-LD gerado no servidor**, escapado contra `</script>`. Regra inegociável: **o que está marcado no schema está visível na página** (marcação de conteúdo oculto é punida).

### 7.1 O grafo de entidades

```
                    ┌──────────────────────────────────────┐
                    │ Organization                          │
                    │ @id https://unfoldgrowth.com.br/#organization │
                    └──────────────────────────────────────┘
                        ▲ publisher        ▲ worksFor       ▲ provider
                        │                  │                │
 WebSite (#website) ────┘     Person (/autor/x#person)     Service (/atuacao, /metodo)
                        ▲                  ▲
                        │ publisher        │ author / reviewedBy
                 BlogPosting (/blog/x#article) ◄── WebPage (reviewedBy, mainEntity)
                        + BreadcrumbList + FAQPage
```

Reutilizar o `@id` fixo da Organization como `publisher` dos artigos e `worksFor` dos autores é o que faz o Google entender que **é a mesma empresa** em todas as páginas.

### 7.2 Schema por página

| Página | Tipos | Detalhes |
|---|---|---|
| Todas (layout) | `Organization`, `WebSite` | Organization: nome, url, logo (`ImageObject` `/unfold-wordmark.png`, 2064×453), descrição, e-mail, telefone `+55-82-99647-1621`, `PostalAddress` (Maceió/AL/BR), `areaServed` Brasil, `contactPoint` (sales, seg–sex 9h–19h), `memberOf` (Assespro, Abradi Alagoas), `sameAs` (= redes do rodapé), `taxID` se houver CNPJ. **Sem SearchAction** (apontava para `/blog?q=`, que não existe) |
| `/blog/[slug]` | `BlogPosting`, `WebPage`, `BreadcrumbList`, `FAQPage` | BlogPosting: `@id …#article`, headline, `image` (capa com width/height; fallback og padrão), `datePublished` (publicação), `dateModified` (**data editorial**), `author` = lista de `Person` (nome + url da página de autor), `publisher` → `@id` da Organization, `mainEntityOfPage`. `reviewedBy` vai no nó `WebPage` (não é válido em BlogPosting). FAQPage **só** se houver perguntas válidas |
| `/cases/[slug]` | `BreadcrumbList`, `FAQPage` | + metadata `article` com `modifiedTime` editorial |
| `/autor/[slug]` | `ProfilePage` + `Person` | `name`, `jobTitle`, `description`, `image`, `sameAs`, `knowsAbout`, `worksFor` → `@id` da Organization |
| `/atuacao` | `Service` × 3 | Os 3 modelos **visíveis** na página: Estrutura de Crescimento, Assessoria Contínua, Projetos Personalizados (constante `ENGAGEMENT_MODELS` alimenta seção e schema) |
| `/metodo` | `Service` | "Método UGS — Unfold Growth System" com `hasOfferCatalog` dos 4 pilares (Diagnosticar, Estruturar, Operar, Evoluir). Escolhido Service e não HowTo: a página descreve uma oferta, não um passo a passo |
| `/blog` | `CollectionPage` + `ItemList` | Lista dos artigos exibidos (url, nome, posição), `isPartOf` → WebSite |

### 7.3 Breadcrumb visível = JSON-LD

`src/components/site/Breadcrumbs.tsx` gera **a trilha visível e o `BreadcrumbList` a partir do mesmo array** (identidade garantida). Acima do H1, cada nível é `<a href>`, o último item sem link com `aria-current="page"`.

- Post: Início › Blog › Título
- Case: Início › Cases › Título
- Autor: Início › Blog › Nome

---

## 8. Dados da empresa (identidade para o Google)

O Google reconhece a empresa quando **nome, endereço e telefone (NAP) são idênticos** no site, no schema, no Perfil da Empresa e nos diretórios.

**Fonte única:** o global **`site-settings`** (editável em `/painel/site-config`) alimenta **rodapé, `/contato` e schema** ao mesmo tempo. O que não tem campo no painel fica em `src/lib/company.ts` (descrição, cidade/UF, área atendida, horário, `memberOf`, parceiros, logo, fundadores/fundação).

| Campo | Valor atual | Estado |
|---|---|---|
| Nome | Unfold Growth | ✅ |
| Tipo | `Organization` (atendimento remoto/nacional, não LocalBusiness) | ✅ decisão D5 |
| Descrição | Assessoria de growth de Maceió (AL) para empresas B2B de ciclo de venda longo e decisão complexa. Integramos marketing, vendas, CRM e automação em um só sistema. | ✅ |
| Cidade/UF · Área | Maceió (AL) · Brasil | ✅ |
| E-mail · Telefone/WhatsApp | gabriel@unfoldgrowth.com.br · (82) 99647-1621 | ✅ |
| Horário | Seg–sex, 9h–19h | ✅ |
| Associações | Assespro; Abradi Alagoas | ✅ |
| Parcerias (só texto) | RD Station, Meta Business, Kommo | ✅ |
| Endereço completo, CEP | — | ⏳ P5 |
| Fundadores, ano de fundação | — | ⏳ P5 |
| Redes (`sameAs`) | Só LinkedIn | ⏳ P5 (Instagram, YouTube etc.) |
| Logo quadrado ≥112 px | Hoje é wordmark largo (4,5:1) | ⏳ P5 |

**Regras:** nada inventado (campo vazio não entra no schema); depois que o global é salvo pela primeira vez, apagar um campo no painel o **oculta** (não volta o padrão).

**Fora do site (pendente):** Perfil da Empresa no Google (área de atendimento, endereço oculto se não atende no local), Bing Places, Apple Business Connect, diretórios de Assespro/Abradi/RD/Kommo com os **mesmos** dados.

---

## 9. Autoria e E-E-A-T

O Google recomenda "fortemente" autoria precisa e trata **confiança** como o pilar mais importante do E-E-A-T (experiência, especialidade, autoridade, confiança). Perfis de autor inventados são tratados como engano.

### O que existe

- **Collection `authors`** (`src/collections/Authors.ts`): nome, slug, cargo, mini bio, bio completa, foto, LinkedIn, perfis, formação, experiência, temas, registro profissional, ativo.
- **Post:** `autores` (vários) + `revisor` (opcional). **Post não publica sem autor** (exceto artigo de convidado e scripts técnicos).
- **Painel `/painel/autores`:** cada um edita a própria ficha (nome, slug, cargo, foto, mini bio; o resto em "Mais informações"). Excluir autor que assina artigos é bloqueado — o caminho é desativar.
- **No post:** byline "Por [Nome]" com link, "Revisado por", datas "Publicado em / Atualizado em", e **box de autor** no fim (foto, nome, cargo, mini bio, link).
- **`/autor/[slug]`:** foto, cargo, bio, formação, experiência, temas, perfis (`rel="me"`) e lista de artigos. Indexável com mini bio, no sitemap.
- **Mapa atual:** Gabriel Calheiros (Sócio) — 36 artigos de estratégia, CRM, vendas, métricas, growth, imobiliário · Davi Brito (Sócio) — 6 artigos de mídia paga.

### Para fortalecer (pendente)

- [ ] LinkedIn de Gabriel e Davi citando o cargo na Unfold **e linkando o site** — fontes externas confirmam o que a página de autor diz.
- [ ] Completar bio, formação e experiência (aumenta o peso da página de autor).
- [ ] Distribuir pautas por especialidade real de cada autor; usar **"Revisado por"** quando um especialista revisar.
- [ ] Nunca voltar a "Equipe Unfold Growth" em artigo.

---

## 10. Performance e segurança

### Core Web Vitals (metas no 75º percentil de usuários reais)

| Métrica | Meta |
|---|---|
| LCP | ≤ 2,5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0,1 |
| TTFB (apoio) | ≤ 0,8 s |

### Linha de base (Lighthouse 12 local, produção, 10/10/2026, **antes** do deploy da S05)

| Página | Perfil | Nota | LCP | TBT | CLS | Peso |
|---|---|---|---|---|---|---|
| Home | mobile | 44 | 15,1 s | 930 ms | 0 | 47,1 MB |
| Home | desktop | 96 | 1,2 s | 80 ms | 0 | 47,1 MB |
| /blog/funil-de-vendas | mobile | 64 | 5,7 s | 540 ms | 0 | 2,4 MB |
| /contato | mobile | 44 | 20,6 s | 900 ms | 0,022 | 2,8 MB |

> Comparar sempre **a mesma ferramenta** antes × depois (PSI com PSI, Lighthouse local com Lighthouse local). **Re-medição pós-deploy ainda pendente.**

### O que foi feito

- **Hero da home:** vídeo 4K da Pexels (80 MB) → `public/videos/hero/hero-720.mp4` (1280×720, 12 s, sem áudio, **1,28 MB**) + poster WebP local (36 KB). No celular o vídeo **não existe no HTML** (só monta no cliente com `min-width: 768px` e sem `prefers-reduced-motion`). Imagem é o elemento LCP (`priority`, `fetchpriority="high"`). Vídeo com `aria-hidden`.
- **Contadores no HTML:** o servidor entrega "+R$ 75MM / +R$ 850k / +25k" (antes "+R$ 0MM" — era isso que Google e IAs liam).
- **Cache:** `/public` com `Cache-Control: public, max-age=31536000, immutable`; `/_next/static` já é imutável na Vercel.
- **Scripts de terceiros:** PostHog só após consentimento, `lazyOnload`, autocapture off, surveys off. RD Station Loader só após consentimento LGPD.
- **Contraste** de nomes de clientes e parceiros elevado.

### Oportunidades (próximas stories)

- `/contato`: LCP é um parágrafo que nasce com `opacity: 0` (animação reveal) e a página carrega ~1,4 MB de terceiros (Turnstile ~1,18 MB, GTM, 2× gtag, Pixel). Renderizar o texto sem depender da animação e carregar o Turnstile só na interação com o formulário.
- Posts (LCP 5,7 s mobile): investigar a capa (tamanho/formato) e o JS de terceiros.
- No GTM: desligar Clarity (redundante com PostHog), Pixel com Consent Mode, conferir GA4/Ads duplicados.

### Segurança

- HTTPS em tudo; CSP `upgrade-insecure-requests`.
- **HSTS:** `max-age=31536000` (1 ano) no apex. `includeSubDomains` entra **depois** de exportar a zona DNS e conferir HTTPS em todo subdomínio (inclusive CNAMEs de clique de e-mail do RD). `preload` fora (difícil de desfazer).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options`.
- Formulários com **Cloudflare Turnstile + bot-guard** e REST do Payload fechada (desde o incidente de leads falsos de 03/10/2026).
- ⚠️ Qualquer subdomínio novo precisa nascer com HTTPS.

---

## 11. GEO — otimização para IAs

> **Princípio:** para aparecer no **AI Overviews e AI Mode do Google** não existe otimização separada — o Google usa os mesmos sistemas da busca, então tudo das seções 4 a 10 já é a base. **ChatGPT, Claude, Perplexity e Copilot** dependem dos próprios rastreadores e índices; é aí que entram os itens abaixo. O resto é conteúdo e marca.

### 11.1 Acesso dos rastreadores

| Rastreador | Para que serve | Estado |
|---|---|---|
| Googlebot | Busca, AI Overviews, AI Mode | ✅ liberado |
| Google-Extended | Gemini e treinamento (não afeta a busca) | ✅ liberado (decisão padrão) |
| OAI-SearchBot | Aparecer na busca do ChatGPT | ✅ liberado (**obrigatório**) |
| ChatGPT-User | Abre páginas a pedido do usuário | ✅ |
| GPTBot | Treinamento OpenAI | ✅ liberado (decisão padrão) |
| Claude-SearchBot / Claude-User | Busca do Claude / páginas a pedido | ✅ |
| ClaudeBot | Treinamento Anthropic | ✅ liberado (decisão padrão) |
| PerplexityBot / Perplexity-User | Resultados do Perplexity | ✅ |
| Bingbot | Índice do Bing = base do **Copilot** e parte do ChatGPT | ✅ |

**Por que liberar treinamento:** em site institucional e de conteúdo, interessa que a marca esteja no conhecimento dos modelos.

⚠️ **Pendente (OPS):** conferir no **Firewall da Vercel** que não há regra, "Bot Protection" ou Attack Mode desafiando esses bots — desafio de JS/captcha barra o rastreador mesmo com o robots liberado. A OpenAI pede liberar os IPs de `openai.com/searchbot.json`.

### 11.2 Conteúdo no HTML do servidor

Rastreadores de IA em geral **não executam JavaScript**. Por isso:

- Todo o conteúdo do site é renderizado no servidor (Server Components + ISR).
- Contadores da home com valor final no HTML (antes chegavam "0").
- FAQ, tabelas, listas e links no HTML inicial — nada em aba carregada por script.

### 11.3 `/llms.txt` — `src/app/llms.txt/route.ts` + `src/lib/llms-txt.ts`

Arquivo em texto puro (padrão llmstxt.org) que resume o site para agentes de IA. O Google não usa, mas o Lighthouse 13.3 audita e outros agentes leem. Custo baixo.

- **Gerado do CMS**, ISR de 1h + `revalidatePath('/llms.txt')` a cada publicação.
- Cabeçalho com a descrição da empresa (`COMPANY`), Maceió/AL, atendimento nacional, método UGS, parceiros e associações.
- Seções: **Sobre a empresa** · **Ferramentas gratuitas** · **Cases** (quando houver) · **Guias e artigos principais** · **Optional**.
- **Regra dos "principais":** posts marcados com `destaque_home` (os mesmos dos Insights da home). Os demais publicados vão para `Optional`.
  > 💡 **Consequência prática:** marcar um post como destaque na home também o promove a "artigo pilar" para as IAs. Escolha os destaques pensando nisso.
- Ficam de fora: páginas legais, rascunhos, URLs de resultado, origens de redirect, autores sem bio.
- Se o CMS falhar, o ISR mantém a última versão boa (não publica arquivo vazio).

### 11.4 IndexNow (Bing / Copilot) — `src/lib/indexnow.ts`

- A cada post/case **publicado, despublicado, excluído, com slug trocado** (envia a URL nova e a antiga) ou com **data editorial alterada**, o site avisa o Bing (`api.indexnow.org`) — junto com `/blog`.
- Roda depois da resposta (`after()` do Next): não atrasa o salvamento; erro só vai para log.
- Só em produção (`VERCEL_ENV=production`) e com chave válida. Chave em env `INDEXNOW_KEY`, servida em `/indexnow-key.txt`.
- ⚠️ **Pendente:** cadastrar `INDEXNOW_KEY` nas variáveis de produção da Vercel. Sem ela, nada é enviado.

### 11.5 Conteúdo que vira citação (o que mais pesa)

- **Resposta direta nas primeiras 40–60 palavras** de cada seção (H2). É a passagem que a IA extrai.
- **Números, estatísticas e falas de especialistas com link para a fonte.** No estudo GEO (Princeton/IIT Delhi, KDD 2024), citações, fontes e estatísticas aumentaram a visibilidade em respostas geradas em **mais de 40%**; repetir palavra-chave **piorou**.
- **Conteúdo que só a Unfold tem:** dados próprios, cases com números, experiência prática, ponto de vista. O Google pede conteúdo "não commodity".
- **Comparações e tabelas** (métodos, prós e contras, X vs Y). Num relatório de IA do Bing, uma página de comparação concentrou 69% das citações do Copilot.
- **FAQ visível + FAQPage** em todo artigo (seção 12.7).
- **Data de atualização visível** e coerente com o `dateModified`; revisar páginas pilares a cada trimestre.
- **Não** fragmentar o texto artificialmente nem reescrever "para IA" — a escrita continua voltada ao leitor.

### 11.6 Menções da marca fora do site

No estudo da Ahrefs com 75 mil marcas, **menções da marca** na web tiveram correlação de **0,664** com presença em AI Overviews, contra **0,218** do número de backlinks. Onde investir:

- Perfis em diretórios de parceiros (RD Station, Kommo, Meta), associações (Assespro, Abradi AL).
- Artigos convidados, podcasts, eventos, imprensa regional e setorial (incorporação, construção civil, B2B).
- LinkedIn recorrente da empresa e dos sócios.
- **Evitar** menções compradas ou artificiais.

### 11.7 Medição de GEO

- [ ] **Lista de 20–30 perguntas** que o público faria (ex.: "assessoria de growth B2B", "como estruturar funil de vendas para incorporadora", "quanto investir em tráfego para lançamento imobiliário", "agência de tráfego ou assessoria de growth") testada **todo mês** no ChatGPT, Gemini/AI Mode, Perplexity, Copilot e Claude. Registrar: a Unfold é citada? Quem aparece no lugar?
- [ ] **GA4 — grupo de canais "IA"** com origem `chatgpt.com|chat.openai.com|perplexity.ai|claude.ai|copilot.microsoft.com|gemini.google.com`. Parte do tráfego de IA chega sem referência e cai em "Direto".
- [ ] **Bing Webmaster Tools → AI Performance**: citações por página e *grounding queries* — usar essas queries como **pauta**.
- [ ] Search Console: relatório de desempenho de IA generativa.

---

## 12. A lógica do blog, por dentro

### 12.1 Modelo de dados do post (`src/collections/Posts.ts`)

| Campo | Para que serve | Afeta SEO? |
|---|---|---|
| `titulo` | **H1** da página e base do slug | ✅ muda a data editorial |
| `slug` | URL (`/blog/slug`) | ✅ troca em post publicado gera redirect 308 |
| `resumo` | Texto do card no /blog e na home; fallback da meta description | Indireto |
| `meta_title` | **Título de busca** (≤60, absoluto, sem marca) | ✅ |
| `meta_description` | **Resumo de busca** (≤155) | ✅ |
| `conteudo_html` | Corpo do artigo (HTML único do editor) | ✅ muda a data editorial |
| `conteudo` | Versão Lexical (legado; não entra na comparação de data) | — |
| `imagem_destaque` | Capa: card, og:image e `image` do schema (1200×630 recomendado) | ✅ |
| `categoria` | Relação com `categories` | Organização |
| `pilar` | Diagnosticar / Estruturar / Operar / Evoluir / Geral (pilares do método UGS) — selo colorido no card | Organização temática |
| `tags` | Lista livre | — |
| `faq` | Pares pergunta/resposta (JSON) → seção visível + FAQPage | ✅ GEO |
| `autores` / `revisor` | Relação com `authors` → byline, box, Person | ✅ E-E-A-T |
| `autor` | Texto antigo (oculto, deprecado; só fallback) | — |
| `publicado_em` | `datePublished`, "Publicado em", ordenação | ✅ |
| `content_updated_at` | **Data editorial** (calculada, read-only) | ✅ lastmod, dateModified, "Atualizado em" |
| `destaque_home` / `ordem_home` | Insights da home **e** "artigos principais" do llms.txt | ✅ GEO |
| `tempo_leitura` | Exibido no post | — |
| `status` | `draft` / `review` / `published` | Só `published` aparece |
| `isExternalSubmission`, `submittedBy*`, `rejectionReason`, `reviewedBy`, `reviewedAt` | Fluxo de artigo de convidado (`/blog/contribuir`) | — |

### 12.2 Fluxo de publicação (do painel ao Google)

```
 Editor no /painel/posts
   │  escreve no editor único (TipTap) → HTML sanitizado (sanitizeRichHtml)
   │  validateArticle avisa: sem H2 em >800 palavras, H1 no corpo, salto de nível,
   │  imagem sem alt, título sem texto abaixo, FAQ <3 ou >8, sem autor
   ▼
 Server action (posts-actions.ts) → payload.create / update
   │  hook beforeChange (Posts):
   │    • calcula content_updated_at (só muda com título/corpo; ver 12.4)
   │    • bloqueia publicar sem autor
   │  slug de post publicado mudou? → grava redirect antigo → novo
   ▼
 revalidatePath: /blog · /blog/[slug] · /sitemap.xml · /llms.txt · / (Insights) · /autor/[slug]
   ▼
 after(): IndexNow avisa o Bing (URL do post + /blog)        [só produção, com chave]
   ▼
 Google: sitemap já atualizado com o lastmod novo → recrawl
   (para posts importantes, "Solicitar indexação" no GSC acelera)
```

Redes de segurança: páginas de post e `/blog` com `revalidate = 60` (se o purge falhar, em 1 min o site reflete); sitemap e llms.txt com ISR de 1h; `generateStaticParams` pré-gera os posts publicados no build.

### 12.3 Estrutura da página do post (`src/app/(site)/blog/[slug]/page.tsx`)

De cima para baixo:

1. **JSON-LD:** BlogPosting + WebPage + BreadcrumbList + FAQPage (se houver).
2. **Breadcrumb visível** (Início › Blog › Título).
3. **H1** (título), **byline** (Por [Autor] · Revisado por) e **datas** (`<time datetime>`): "Publicado em DD de mês de AAAA" e, se o dia for diferente, "Atualizado em…".
4. **Capa.**
5. **Corpo** (`RichContent`): headings com `id` (âncoras), imagens lazy, tipografia de leitura (`@tailwindcss/typography`).
6. **Perguntas frequentes** (seção visível, H2 + H3 com âncora por pergunta).
7. **Box(es) de autor.**
8. **CTA** "Aplique esse conhecimento" (não é heading).
9. **Lateral (desktop):** índice (TOC) quando há ≥2 seções + 1 banner. **Mobile:** até 2 banners depois do conteúdo.

### 12.4 Data editorial: `content_updated_at` e a flag `technicalEdit`

É a peça mais importante para o Google confiar no site. Implementação em `src/lib/content-date.ts`.

**Regra:**

- **Criação:** `publicado_em` (ou agora).
- **Edição:** compara a **assinatura de conteúdo** do título e do corpo antes × depois. Mudou → agora. Não mudou → mantém.
- A assinatura (`contentSignature`) considera **texto + sequência de tags + `src` das imagens** e ignora espaços, atributos e `<br>`. Assim, **abrir e salvar sem mudar nada não altera a data** (o TipTap reserializa o HTML a cada save), e **preencher alt de imagem também não altera**.
- **Não mudam a data:** resumo, título/resumo de busca, categoria, pilar, tags, capa, status, FAQ, destaque, autor.
- **Pisos e tetos:** nunca antes de `publicado_em`; nunca no futuro.
- Valor enviado pelo cliente é descartado: o campo é sempre calculado.

**Escape técnico — obrigatório em scripts:**

```ts
await payload.update({
  collection: 'posts',
  id,
  data: { conteudo_html: novoHtml },
  context: { technicalEdit: true }, // NÃO altera content_updated_at
})
```

> Todo script que reescrever HTML de posts ou cases (migração, limpeza de links, normalização de imagens) **tem** de usar `technicalEdit`. Foi a falta disso que fez 25 posts aparecerem "atualizados" em 07/08/2026 às 21h23.

**Backfill feito:** sdr, funil-de-vendas, processo-comercial, growth-marketing e vendas-b2b → `2026-10-01T00:00:00-03:00` (otimizações reais de 30/09–01/10); demais → data de publicação.

### 12.5 O editor (texto corrido)

- **Um único editor TipTap** para o artigo inteiro (`RichTextEditor` variant `article`) — substituiu o modelo de blocos, que travava com 10–18 editores montados ao mesmo tempo.
- **Barra:** Parágrafo, Título 2–6 (H2–H6), negrito, itálico, sublinhado, listas, citação, link, imagem (com alt obrigatório e legenda), tabela HTML, vídeo do YouTube, linha divisória. **Sem H1.**
- **Colar do Word/Google Docs preserva os níveis de título.**
- **Painel ao lado do corpo:** Título, Slug, Resumo, **Cabeçalho de busca** (Título de busca 60 / Resumo de busca 155 com contador e **prévia do Google**), FAQ, autores, revisor, capa, categoria, pilar, destaque na home.
- Componentes compartilhados entre posts e cases em `src/components/painel/article-fields.tsx` (`CharCount`, `SerpPreview`, `FaqEditor`, `validateArticle`).
- Imagens: editar o alt de uma imagem já inserida sem excluir e subir de novo (commit `ebbe556`).

### 12.6 Validações antes de publicar (`validateArticle`)

Avisos (não bloqueiam, exceto autor):

| Aviso | Por quê |
|---|---|
| Artigo com mais de 800 palavras sem nenhum H2 | Sem estrutura, o Google e as IAs não identificam as seções |
| H1 no corpo | Só pode haver um H1 (o título) |
| Salto de nível (H2 → H4) | Hierarquia quebrada |
| Imagem sem alt | Acessibilidade e busca de imagens |
| Título de seção sem texto abaixo | Seção vazia (ex.: roteiro não preenchido) |
| FAQ com menos de 3 ou mais de 8 perguntas | <3 não justifica, >8 dilui |
| **Sem autor** (bloqueia) | Regra de E-E-A-T |

### 12.7 FAQ por artigo

- Mesma fonte gera **duas saídas**: HTML visível (`<section class="faq">` → `<h2>Perguntas frequentes</h2>` → `<h3 id="faq-...">pergunta</h3><p>resposta</p>`) e o JSON-LD **FAQPage**.
- Cada pergunta tem âncora própria (citável por link direto).
- Sem itens válidos, não sai nem a seção nem o schema (nada oculto).
- O rich result de FAQ do Google foi restrito em 2023 — **o alvo aqui é citação por IA** (ChatGPT, Perplexity, Copilot, AI Mode) e o Bing.
- Não confundir com a collection global `FAQs` (FAQ institucional do `/sobre`).

### 12.8 Índice (TOC) e âncoras — `src/lib/article-toc.ts`

- No servidor, cada H2–H6 recebe um `id` estável (slug sem acento, cortado em ~60 caracteres **sem partir palavra**, desambiguado com `-2`, `-3`).
- O índice lista **H2 e H3**; aparece na lateral quando há pelo menos 2 seções.
- As âncoras permitem links profundos (`/blog/sdr#o-que-faz-um-sdr`) — úteis para IAs citarem um trecho e para "Leia também" apontar para a seção exata.

### 12.9 Banners internos (collection `banners`)

- Gerenciados em `/painel` (título, tag, descrição, CTA, link, imagem, ativo, ordem).
- Até 4 ativos por ordem; desktop mostra o 1º na lateral, mobile os 2 primeiros depois do conteúdo.
- Função: **linkagem interna** do blog para ferramentas (Diagnóstico, Calculadora, Radar de Comitê) e cases — leva autoridade e leitor para as páginas de conversão.
- Não são headings (fora da hierarquia).

### 12.10 Listagem `/blog`

- Ordem por `publicado_em` decrescente, até 100 posts numa página, cards com título, resumo, selo do **pilar** UGS e nomes reais dos autores.
- `CollectionPage` + `ItemList` no schema; canonical `/blog`.
- ⚠️ Quando passar de 100 posts, implementar **paginação com links `<a href>`** (`/blog?page=2` ou `/blog/pagina/2`, cada página com canonical para si mesma).

### 12.11 Artigos de convidado (`/blog/contribuir`)

- Formulário público → post entra como submissão externa (`isExternalSubmission`) → revisão no painel → aprovar/rejeitar com motivo.
- O autor é o convidado (`Person {name}` no schema); a regra "publicar exige autor" não se aplica.
- A página `/blog/contribuir` é `noindex`.

### 12.12 Cases no padrão dos posts

Desde 10/10 (ajustado em 14/10), o case funciona como o post: editor único de texto corrido, Resumo, Título/Resumo de busca com prévia, FAQ, mesma validação, mesma data editorial, breadcrumb, sitemap com `content_updated_at`, IndexNow. Tudo em texto corrido (sem cartões de números). Campos antigos (`challenge`, `solution`, `results`, `pillars`) ficam no banco como fallback.

> ⚠️ Em 10/10 havia **0 cases publicados**, e `/cases` exibia 4 cases de exemplo (`MOCK_CASES`, selo "Em breve"). **Publicar cases reais é uma das maiores alavancas de SEO e GEO disponíveis hoje** (conteúdo não commodity, com números).

---

## 13. Manual de redação: como escrever um post que ranqueia

### 13.1 Antes de escrever

1. **Uma intenção de busca por artigo.** Uma pergunta principal, uma palavra-chave principal. Se dois artigos respondem a mesma coisa, eles brigam entre si (canibalização) — melhor um só, mais completo.
2. **Verifique se já existe** artigo sobre o tema. Se existir, **atualize** em vez de criar outro.
3. **Defina o pilar** (Diagnosticar, Estruturar, Operar, Evoluir) e **quais posts e ferramentas** o novo artigo vai linkar — e quais vão linkar para ele.
4. **Escolha o autor** pela experiência real no tema.

### 13.2 Cabeçalho de busca

| Campo | Limite | Regra |
|---|---|---|
| Título (H1) | ≤ 70 caracteres | Claro, com o assunto principal. Pode ser mais "editorial" que o título de busca |
| Título de busca | ≤ 60 caracteres | **Palavra-chave no início**. Sem "| Unfold Growth" (não é somado quando preenchido). Único no site |
| Resumo de busca | ≤ 155 caracteres (ideal 140–155) | Responde "o que vou aprender aqui?" com a palavra-chave e um benefício. Único |
| Slug | curto | A palavra-chave, não a frase: `/blog/cac-incorporadora` |
| Resumo (card) | livre | Texto convidativo para quem já está no site |

### 13.3 Corpo do texto

- **Abertura:** responda a pergunta principal nas primeiras 2–3 frases. Depois desenvolva.
- **Cada H2 é uma pergunta ou um conceito** ("O que faz um SDR?", "Como calcular o CAC"). **Abra cada H2 com a resposta direta em 1–2 frases (40–60 palavras)**, depois aprofunde.
- **Sem referências ao que veio antes** ("como vimos acima") — cada seção precisa se sustentar sozinha, porque a IA extrai trechos isolados.
- **Hierarquia sem saltos:** H2 → H3 → H4. Nunca H1 no corpo.
- **Dados com fonte e período:** "Segundo a pesquisa X (2026), 62% …" com link. Números próprios da Unfold (cases, clientes, benchmarks) valem ouro.
- **Tabelas e listas em HTML real** (botão de tabela), nunca imagem de tabela. Use comparações: "X vs Y", prós e contras, passo a passo.
- **Frases curtas.** Sem linguagem de venda no meio do conteúdo.
- **"Unfold Growth"** citada 1 vez, de forma natural.
- **Imagens:** alt descritivo; diagramas próprios ajudam a diferenciar.
- **Links internos:** 3–6 por artigo, com **texto-âncora descritivo** ("como estruturar o funil de vendas"), nunca "clique aqui". Apontar para posts do mesmo pilar e para uma ferramenta (Diagnóstico, Calculadora, Radar).
- **Links externos:** fontes de referência (estudos, dados oficiais).
- **Tamanho:** o necessário para responder melhor que os concorrentes da 1ª página. Acima de 800 palavras, H2 obrigatório.

### 13.4 FAQ (3–8 perguntas)

- Pergunta escrita **como a pessoa perguntaria** ("Quanto custa um SDR?").
- **Resposta completa nas 40 primeiras palavras.**
- Uma resposta por pergunta; sem "como vimos acima"; sem linguagem de venda.
- Perguntas **diferentes** em cada artigo (não repetir FAQ entre posts).
- Números com fonte e período.
- Boa fonte de perguntas: "As pessoas também perguntam" do Google, grounding queries do Bing, perguntas reais de clientes no comercial.

### 13.5 Checklist final antes de publicar

- [ ] Título de busca ≤60 com a palavra-chave no início; resumo de busca ≤155
- [ ] Slug curto
- [ ] Autor (e revisor, se houver)
- [ ] Capa 1200×630 com alt
- [ ] Pilar e categoria
- [ ] H2 a cada seção, sem saltos, resposta direta no início de cada H2
- [ ] 3–6 links internos com âncora descritiva + 1 ferramenta
- [ ] Pelo menos 1 dado com fonte
- [ ] Tabela ou lista onde fizer sentido
- [ ] FAQ com 3–8 perguntas
- [ ] Todas as imagens com alt
- [ ] Nenhum aviso pendente no `validateArticle`
- [ ] Depois de publicar: abrir o post, conferir a prévia; se for post importante, "Solicitar indexação" no GSC

---

## 14. Estratégia de ranqueamento (o que faz o site subir)

A base técnica está pronta. O que move o ranqueamento a partir de agora:

### 14.1 Arquitetura de tópicos (clusters por pilar)

O site já tem uma taxonomia natural: os **4 pilares do método UGS** (campo `pilar`) e as **verticais** (incorporação/construção civil, B2B em geral). Usar isso como **clusters**:

```
                       /metodo  (página pilar do método)
                          │
   ┌──────────────┬───────┴───────┬──────────────┐
 Diagnosticar   Estruturar      Operar         Evoluir
 (métricas,     (funil, CRM,    (SDR, playbook, (growth,
  CAC, LTV,      processo        mídia paga,     otimização,
  dashboard)     comercial)      automação)      escala)
     │               │               │              │
  posts do       posts do        posts do       posts do
  cluster ◄────► cluster ◄─────► cluster ◄────► cluster
     │               │               │              │
     └──────── ferramentas: Diagnóstico · Calculadora · Radar de Comitê ──┘
```

**Regras de linkagem:**

1. Cada cluster tem **1 artigo pilar** (guia completo, ex.: `/blog/funil-de-vendas`, `/blog/processo-comercial`, `/blog/growth-marketing`) que linka **todos** os posts do cluster.
2. Cada post do cluster linka **de volta** para o pilar e para 2–3 irmãos.
3. Os pilares ficam marcados com **`destaque_home`** → aparecem nos Insights da home (a 1 clique) **e** como "artigos principais" no `llms.txt`.
4. Vertical **incorporação** já é um cluster forte (CRM para incorporadora, previsibilidade comercial, sales enablement, quanto investir em lançamento, CAC da incorporadora, glossário): criar/eleger o **guia pilar "Growth para incorporadoras"** e amarrar tudo nele.
5. **Zero órfãos:** todo post do sitemap recebe ao menos um link interno de outro post (além da listagem).

### 14.2 Atualizar > publicar mais

- **Revisão trimestral dos pilares:** dados novos, exemplos novos, FAQ melhorada. Atualização real muda o `content_updated_at` → `lastmod` novo → recrawl → sinal de frescor.
- Os posts atualizados em 30/09–01/10 (sdr, funil-de-vendas, processo-comercial, growth-marketing, vendas-b2b) são o modelo.
- Depois de atualizar um post importante: **"Solicitar indexação" no GSC** (o IndexNow cobre o Bing sozinho).

### 14.3 Consolidar o que não indexa (Anexo D do Plano)

Se em **28/10/2026** algum continuar "Rastreada, mas não indexada":

| Post não indexado | Sobrepõe com (indexado) | Ação sugerida |
|---|---|---|
| `/blog/growth-para-vendas-complexas` | `/blog/growth-marketing` | Consolidar |
| `/blog/agencia-de-trafego-ou-assessoria-de-growth` | `/blog/growth-marketing` | Consolidar |
| `/blog/conversao-de-leads-em-2026-…` | `/blog/por-que-sua-incorporadora-gera-leads-e-nao-fecha-vendas-e-como-resolver` | Consolidar |
| `/blog/automacao-de-marketing-e-vendas-para-incorporadora` | `/blog/crm-para-incorporadora-como-organizar-o-funil-de-lancamento` | Consolidar |
| `/blog/marketing-de-lancamento-imobiliario-antes-durante-e-depois` | `/blog/marketing-e-growth-para-incorporadoras-e-construtoras` | Consolidar |
| `/blog/glossario-de-growth-para-incorporadora` | — | Virar seção de outro post ou enriquecer |
| `/blog/como-calcular-o-cac-da-incorporadora` | — | Enriquecer (exemplos, calculadora) |

**Como consolidar:** levar o melhor conteúdo do post fraco para o forte (atualização real → data nova), despublicar o fraco e cadastrar redirect 301 do slug antigo para o forte. Nunca redirecionar para a home.

### 14.4 Conteúdo que só a Unfold tem

- **Cases reais publicados** (hoje 0) com números, contexto e o que foi feito.
- **Dados das ferramentas** (Diagnóstico, Calculadora, Radar de Comitê) agregados e anonimizados → "Benchmark de growth B2B 2026", "Quanto as incorporadoras investem por lançamento" etc. Esse tipo de conteúdo atrai links e citações de IA.
- **Opinião e método próprio** (UGS) aplicados a problemas concretos.

### 14.5 Ferramentas como ímã

As ferramentas gratuitas são páginas de alta intenção. Fortalecer:

- 200–400 palavras de texto em `/diagnostico`, `/ferramentas`, `/ferramentas/calculadora-trafego`, `/contato` (o que faz, para quem, o que a pessoa recebe, quanto tempo leva) — pendente do Ferraz.
- Linkar as ferramentas de dentro dos posts (texto e banners).

### 14.6 Autoridade de marca

Ver 11.6 (menções) e seção 9 (autores). LinkedIn dos sócios publicando com link para os artigos é a ação de maior retorno por esforço.

### 14.7 Oportunidades técnicas ainda não feitas

| Oportunidade | Valor | Esforço |
|---|---|---|
| Bloco automático de **posts relacionados** (mesmo pilar/categoria) no fim do artigo | Alto — distribui autoridade e reduz órfãos (Checklist M06 P2) | Baixo |
| **Busca no blog** (`/blog?q=`) + SearchAction de volta + busca na 404 | Médio | Médio (decisão P2) |
| **Sitemaps separados** por tipo (páginas, blog, cases, autores) via sitemap index | Diagnóstico mais fácil no GSC | Baixo |
| **Paginação** do /blog quando passar de 100 posts | Necessário no futuro | Baixo |
| Redirect automático também para **cases e autores** (collection `redirects` hoje só atende `/blog/*`) | Evita 404 em troca de slug | Médio |
| **Imagens dos posts otimizadas** (hoje `<img>` do Supabase sem WebP/srcset) | LCP dos posts | Médio |
| Página de **categoria/pilar** indexável (ex.: `/blog/pilar/estruturar`) com texto introdutório | Clusters explícitos | Médio |

---

## 15. Rotina operacional

### A cada publicação

- [ ] Checklist da seção 13.5.
- [ ] Post importante ou atualização relevante → "Solicitar indexação" no GSC.

### Semanal (primeiras semanas após mudanças grandes)

- [ ] GSC: Páginas (indexadas × não indexadas), Sitemaps, Estatísticas de rastreamento, Core Web Vitals.
- [ ] Corrigir 404 que aparecerem (links externos, URLs antigas esquecidas) com redirect para o equivalente mais próximo.

### Mensal

- [ ] Teste das 20–30 perguntas nas IAs (seção 11.7) e registro.
- [ ] Bing Webmaster Tools: AI Performance e grounding queries → pauta.
- [ ] GA4: tráfego do canal "IA".
- [ ] Logs da Vercel: visitas de OAI-SearchBot, ClaudeBot, PerplexityBot, Bingbot.
- [ ] `npx tsx scripts/check-internal-links.ts` → zero links internos quebrados.

### Trimestral

- [ ] Revisão dos artigos pilares (dados, exemplos, FAQ).
- [ ] PageSpeed Insights mobile de um modelo de cada página (home, post, case, contato, ferramenta).
- [ ] Rastreio completo (Screaming Frog) e comparação com a auditoria de 07/08/2026.

### Regras permanentes

- Todo script que reescreve HTML de posts/cases usa `context: { technicalEdit: true }`.
- Trocar o slug de um **destino** de redirect → atualizar `legacy-redirects.ts`.
- Subdomínio novo nasce com HTTPS.

---

## 16. Como validar (ferramentas e comandos)

| Ferramenta | Para quê |
|---|---|
| Google Search Console | Indexação, sitemap, inspeção de URL, Core Web Vitals reais |
| Bing Webmaster Tools | Índice do Bing (Copilot), IndexNow, AI Performance |
| PageSpeed Insights / Lighthouse | Performance (laboratório e campo) |
| Teste de Resultados Avançados (search.google.com/test/rich-results) | Elegibilidade de schema |
| Schema Markup Validator (validator.schema.org) | Sintaxe de schema.org |
| securityheaders.com / ssllabs.com | Cabeçalhos e certificado |

**Comandos úteis:**

```bash
# robots e sitemap
curl -s https://unfoldgrowth.com.br/robots.txt
curl -s https://unfoldgrowth.com.br/sitemap.xml | grep -A1 "/blog/sdr<"

# llms.txt
curl -s https://unfoldgrowth.com.br/llms.txt | head -40

# Redirect em um salto (esperado: 308 → 200)
curl -sIL https://unfoldgrowth.com.br/calculadora | grep -E "HTTP|location"

# Variações de domínio
for u in http://unfoldgrowth.com.br http://www.unfoldgrowth.com.br https://www.unfoldgrowth.com.br; do
  echo "== $u"; curl -sIL "$u" | grep -E "HTTP|location"; done

# 404 real
curl -sI https://unfoldgrowth.com.br/nao-existe | head -1

# Cabeçalhos de segurança
curl -sI https://unfoldgrowth.com.br | grep -iE "strict-transport|x-frame|x-content|referrer"

# O que o Google e as IAs leem (HTML do servidor)
curl -s https://unfoldgrowth.com.br | grep -oE 'R\$ [0-9]+(MM|k)'
curl -s https://unfoldgrowth.com.br/blog/sdr | grep -o '<link rel="canonical"[^>]*>'
curl -s https://unfoldgrowth.com.br/blog/sdr | grep -o '"dateModified":"[^"]*"'
```

**Scripts do projeto:**

| Script | Função |
|---|---|
| `scripts/check-internal-links.ts` | Rastreia os links internos de todos os posts e aponta 4xx/redirects |
| `scripts/remove-broken-links.ts` | Remove links quebrados (`--dry-run` padrão, `--apply`, `--rollback`) |
| `scripts/report-content-images.ts` | Relatório de imagens sem alt/dimensões por post |
| `scripts/gen-og-default.py` | Gera as og:image padrão |
| `scripts/verify-schema.mjs` | Trava do build: falha se faltar coluna crítica no banco |

---

## 17. Pendências em aberto

### Do cliente / dono

| # | Pendência | Bloqueia |
|---|---|---|
| P2 | Busca no blog: criar `/blog?q=` ou seguir sem busca? | SearchAction, busca na 404 |
| P5 | Endereço/CEP, fundadores, ano de fundação, redes (Instagram, YouTube…), logo quadrado ≥112 px | Organization completo, `/sobre` declarativo |
| P9 | Quem tem acesso à Vercel de produção | www→apex, Firewall, `INDEXNOW_KEY` |
| — | Publicar cases reais e decidir sobre os 4 `MOCK_CASES` | Prova social, conteúdo não commodity |

### Operacionais (OPS)

- [ ] Vercel → Domains: `www → apex` (308); depois remover o redirect de www do `next.config.ts`.
- [ ] Vercel → Firewall: nada bloqueando/desafiando bots de IA e Bingbot.
- [ ] Vercel → Env: `INDEXNOW_KEY` em produção.
- [ ] HSTS `includeSubDomains` após exportar e conferir a zona DNS.
- [ ] GSC: reenviar sitemap; atualizar robots; solicitar indexação dos 5 posts de 01/10 e dos 19 posts editados em 14/10.
- [ ] Bing Webmaster Tools: importar do GSC, enviar sitemap.
- [ ] GA4: grupo de canais "IA".
- [ ] Monitoramento de uptime (UptimeRobot ou Better Stack).
- [ ] Re-medir PageSpeed da home, post e contato (mesma ferramenta da linha de base).
- [ ] Validar no Teste de Resultados Avançados: home, post, case, autor, `/atuacao`, `/blog`.
- [ ] **28/10/2026:** decidir consolidação dos posts do Anexo D que seguirem "Rastreada, mas não indexada".
- [ ] **Início de nov/2026:** conferir se os 12 posts sem rastreamento desde jun/jul voltaram a ser visitados (dashboard-comercial, pipeline-de-vendas, funil-de-marketing-x-funil-de-vendas, quais-metricas, funil-de-vendas-para-construcao-civil, como-calcular-o-cac, agencia-de-trafego, sales-enablement, marketing-de-lancamento, glossario, quanto-investir-em-trafego-pago, conversao-de-leads).

### Conteúdo (Ferraz)

- [ ] Alt das 73 imagens (`backups/imagens-conteudo-2026-10-10.md`).
- [ ] 42 títulos de busca (≤60) e 36 resumos de busca (≤155); encurtar 14 H1 >70 e 2 H2 longos.
- [ ] FAQ (3–8 perguntas) em todo artigo publicado.
- [ ] 200–400 palavras em `/diagnostico`, `/ferramentas`, `/ferramentas/calculadora-trafego`, `/contato`.
- [ ] LinkedIn dos autores com cargo e link para o site; bios completas.

---

## 18. Regras de ouro para desenvolvedores

1. **Produção = `main`.** Feature branch só gera preview.
2. **Todo campo de SEO precisa de consumidor** no front (metadata, schema, sitemap, llms.txt). Campo sem consumidor é campo morto.
3. **Toda action que publica/edita conteúdo revalida:** a página, `/blog` (ou `/cases`), `/sitemap.xml`, `/llms.txt`, a home e chama IndexNow.
4. **Scripts que reescrevem HTML usam `context: { technicalEdit: true }`.**
5. **Schema = conteúdo visível.** Nunca marcar o que não aparece; nunca inventar dados (campo vazio não entra).
6. **Um `@id` por entidade** (`/#organization`, `/#website`, `/autor/x#person`, `/blog/x#article`) e reuso por referência.
7. **Nunca `Disallow` em URL com `noindex`.**
8. **Link interno é `<Link>`** (o lint da Vercel quebra o build com `<a href="/...">` por causa do catch-all de 404).
9. **Headings só no conteúdo.** Componente reutilizável (card, banner, CTA, newsletter) não usa H2/H3 fixo.
10. **Conteúdo no HTML do servidor.** Nada essencial dependendo de JS (contador, aba, texto animado com `opacity: 0` no LCP).
11. **Coluna nova = migration idempotente** (`IF NOT EXISTS`) + registro em `src/migrations/index.ts` + item no `verify-schema.mjs` se for crítica. Toda collection nova precisa da coluna em `payload_locked_documents_rels`.
12. **Redirect em um salto.** Destino de redirect nunca é origem de outro.
13. **Sitemap só com URL 200, canônica e indexável.** Um sitemap por host.

---

## 19. Mapa de arquivos

| Tema | Arquivo |
|---|---|
| robots | `src/app/robots.ts` |
| sitemap | `src/app/sitemap.ts` |
| robots/sitemap do subdomínio eleicoes | `src/app/guia-seo/robots/route.ts`, `src/app/guia-seo/sitemap/route.ts` |
| llms.txt | `src/app/llms.txt/route.ts`, `src/lib/llms-txt.ts` |
| IndexNow | `src/lib/indexnow.ts`, `src/app/indexnow-key.txt/route.ts` |
| Canonical / og / noindex | `src/lib/seo/canonical.ts` (`withSeo`, `DEFAULT_OG_IMAGE`) |
| og:image padrão | `public/og/default.png`, `public/og/mapa-icp.png`, `scripts/gen-og-default.py` |
| Layout (template de título, max-image-preview) | `src/app/(site)/layout.tsx` |
| Schemas | `src/components/SchemaOrg.tsx` |
| Dados da empresa | `src/lib/company.ts`, `src/lib/site-settings.ts`, `/painel/site-config` |
| Breadcrumb | `src/components/site/Breadcrumbs.tsx` |
| Redirects legados | `src/lib/legacy-redirects.ts`, `next.config.ts` |
| Redirects por slug | `src/collections/Redirects.ts`, `src/app/(site)/blog/[slug]/page.tsx` |
| 404 | `src/app/(site)/not-found.tsx`, `src/app/(site)/[...rest]/page.tsx` |
| Headers (HSTS, cache, segurança) | `next.config.ts` |
| Data editorial | `src/lib/content-date.ts`, hooks em `src/collections/Posts.ts` e `Cases.ts` |
| Post (modelo) | `src/collections/Posts.ts` |
| Post (página) | `src/app/(site)/blog/[slug]/page.tsx` |
| Listagem do blog | `src/app/(site)/blog/page.tsx` |
| Índice/âncoras | `src/lib/article-toc.ts`, `src/components/site/TableOfContents.tsx` |
| Sanitização | `src/lib/html-sanitize.ts` |
| Imagens lazy no corpo | `src/lib/content-images.ts`, `src/components/RichContent.tsx` |
| Editor | `src/components/painel/RichTextEditor.tsx`, `src/components/painel/article-fields.tsx` |
| Actions de publicação | `src/lib/actions/posts-actions.ts`, `cases-actions.ts`, `blog-submit-actions.ts`, `authors-actions.ts` |
| Autores | `src/collections/Authors.ts`, `src/lib/authors.ts`, `src/components/site/AuthorBox.tsx`, `src/app/(site)/autor/[slug]/page.tsx` |
| Banners | `src/collections/Banners.ts`, `src/components/site/ToolBanner.tsx` |
| Hero da home | `src/components/home/HeroClient.tsx`, `public/videos/hero/` |
| Trava de schema no build | `scripts/verify-schema.mjs`, `scripts/vercel-build.sh` |
| Histórico das decisões | `docs/stories/melhorias-site-2026-08/`, `docs/stories/seo-tecnico-2026-10/` |
| Documentos do consultor | `Plano_Acao_SEO_Tecnico_unfoldgrowth (1).docx`, `Checklist_SEO_Tecnico_Novo_Site (1).docx`, `out. 7, 2026.txt` (raiz do repo) |

---

## 20. Glossário

| Termo | Significado |
|---|---|
| **SEO** | Otimização para mecanismos de busca (Google, Bing) |
| **GEO** | *Generative Engine Optimization*: otimização para ser citado por IAs generativas (ChatGPT, Claude, Perplexity, Copilot, AI Overviews/AI Mode) |
| **E-E-A-T** | Experiência, Especialidade, Autoridade e Confiança — critérios de qualidade do Google |
| **Canonical** | Tag que diz ao Google qual é a URL oficial de um conteúdo |
| **lastmod** | Data de última modificação no sitemap |
| **Data editorial** | `content_updated_at`: só muda quando título ou corpo mudam de verdade |
| **noindex** | Instrução para a página não aparecer no Google |
| **ISR** | *Incremental Static Regeneration*: página estática que se regenera sozinha a cada N segundos ou sob demanda |
| **JSON-LD / schema** | Dados estruturados que descrevem a página para buscadores e IAs |
| **`@id`** | Identificador fixo de uma entidade no schema, reutilizado entre páginas |
| **IndexNow** | Protocolo para avisar o Bing (e outros) que uma URL mudou |
| **llms.txt** | Arquivo de texto que resume o site para agentes de IA |
| **Soft-404** | Página de erro que responde 200 em vez de 404 (ruim para SEO) |
| **Cadeia de redirect** | URL que redireciona para outra que redireciona de novo |
| **Órfã** | Página sem nenhum link interno apontando para ela |
| **Canibalização** | Dois artigos do mesmo site disputando a mesma busca |
| **Cluster / pilar** | Grupo de artigos sobre um tema, ligados a um artigo central completo |
| **LCP / INP / CLS** | Métricas de Core Web Vitals: carregamento, resposta e estabilidade visual |
| **NAP** | *Name, Address, Phone* — dados da empresa que devem ser idênticos em todo lugar |
| **UGS** | Unfold Growth System — o método da Unfold (Diagnosticar, Estruturar, Operar, Evoluir) |
| **technicalEdit** | Flag de scripts que impede a alteração da data editorial |

---

*Documento mantido junto do código. Ao mudar qualquer regra de SEO, atualize a seção correspondente e registre no histórico abaixo.*

| Data | Autor | Mudança |
|---|---|---|
| 2026-10-22 | Orion (aios-master) | Criação: consolida os épicos de agosto e outubro, o Plano de Ação e o Checklist do Ferraz, e o estado do código na `main` |
