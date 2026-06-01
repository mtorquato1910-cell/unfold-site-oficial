# Avaliação Arquitetural — Plano de Sprints "Guia Eleições 2026"

**Avaliador:** @architect (AIOS)
**Data:** 2026-06-01
**Documentos avaliados:** `docs/guia-eleicoes-2026/01-plano-sprints.md` + `Eleições/PRD_Hotsite_Guia_Eleicoes_2026.md`
**Codebase inspecionado:** Next.js 15.4.11 (App Router), Payload CMS 3, Vitest, deploy Vercel.

---

## VEREDITO: **Aprovado com ajustes**

O plano é tecnicamente sólido, reusa corretamente os padrões já em produção (RD legacy, rate-limit, fallback Payload, route group isolado) e tem rastreabilidade exemplar. Mas há **4 correções obrigatórias** antes de codar e **1 correção crítica na estratégia de subdomínio** que, se ignorada, ou quebra o site principal ou serve conteúdo duplicado. Nenhum bloqueador insuperável — todos viram tarefa.

---

## 1. Decisões arquiteturais recomendadas (com justificativa)

### DA-1 — Subdomínio: middleware **estendido** (não `next.config` rewrites por host). CRÍTICO.

**Contexto real do código:** já existe `src/middleware.ts` (rate-limit de share + auth do painel) com um `config.matcher` restrito a `/admin`, `/painel`, `/diagnostico/r/`, `/ferramentas/calculadora-trafego/r/`. O `next.config.ts` já usa `redirects()` com `has: [{ type: 'host', value: 'www...' }]` (padrão www→apex).

**Problema com a abordagem "rewrite por host no `next.config`":** o rewrite por `has: host` no `next.config` **funciona**, mas o plano também precisa de um **redirect da raiz** `/` do subdomínio → `/featwork` E de um **redirect canônico apex→subdomínio**. Misturar rewrite (next.config) + redirect (next.config) + a lógica de host fica espalhada e frágil. Pior: o redirect www→apex existente usa `source: '/:path*'` com `has host=www` — se você adicionar um redirect `source: '/'` com `has host=eleicoes`, a ordem de avaliação importa e o risco de colisão cresce.

**Decisão recomendada — fazer TUDO no middleware, com guarda de host explícita:**

1. **Estender o `config.matcher` existente** para incluir as rotas do subdomínio. **NÃO** trocar o matcher por um catch-all `/:path*` — isso faria o middleware rodar em TODAS as requisições do site principal (o risco "vaza para rotas do site principal" do plano). O matcher continua restrito; adicione apenas os paths necessários do guia (`/`, `/featwork/:path*`) **e** mantenha os 4 já existentes.

   ⚠️ **Cuidado:** o matcher do Next NÃO filtra por host, só por path. Como `/` e `/featwork` existem tanto no apex quanto no subdomínio, o middleware vai rodar para `unfoldgrowth.com.br/` também. Por isso a **guarda de host dentro da função** é obrigatória (item 2).

2. **No corpo do middleware, ramificar por `request.headers.get('host')`** logo no início:
   ```ts
   const host = request.headers.get('host') || ''
   const isGuiaSubdomain = host === 'eleicoes.unfoldgrowth.com.br'

   if (isGuiaSubdomain) {
     // raiz do subdomínio → /featwork (308)
     if (pathname === '/') {
       return NextResponse.redirect(new URL('/featwork', request.url), 308)
     }
     // /featwork[...] → rewrite para a rota interna (URL na barra permanece /featwork)
     if (pathname === '/featwork' || pathname.startsWith('/featwork/')) {
       const rest = pathname.replace(/^\/featwork/, '') || ''
       return NextResponse.rewrite(new URL(`/guia-eleicoes-2026${rest}`, request.url))
     }
     // qualquer outra rota sob o subdomínio que não seja a API → 404 ou redirect /featwork
   }
   // host = apex → cai no fluxo existente (share rate-limit, painel auth)
   ```

3. **API same-origin:** `POST /api/guia-eleicoes/lead` deve responder no subdomínio sem rewrite. Como o front no subdomínio renderiza com `pathname=/featwork`, o fetch precisa chamar `/api/guia-eleicoes/lead` (caminho absoluto same-origin). A API NÃO entra no matcher do middleware (deixe a API fora). Isso preserva same-origin para CSRF/Turnstile (RNF-11). **Não** adicione `/api/:path*` ao matcher.

**Por que middleware > next.config rewrites aqui:** o redirect raiz, o rewrite de path e a guarda de host ficam num único arquivo, com lógica imperativa testável, sem depender da ordem de regras declarativas que já convivem com o redirect www→apex. O `next.config` continua responsável só pelo www→apex e pelos redirects legados.

**Canonical / conteúdo duplicado (SEO):** o apex `unfoldgrowth.com.br/guia-eleicoes-2026` HOJE é a rota real e está **no `sitemap.ts`? Não** — verifiquei `src/app/sitemap.ts`: a rota do guia **não está listada** (bom). Para evitar duplicação:
   - Adicionar no middleware um **redirect 301 `unfoldgrowth.com.br/guia-eleicoes-2026` → `https://eleicoes.unfoldgrowth.com.br/featwork`** (canonical único). Isso exige adicionar `/guia-eleicoes-2026` ao matcher e tratá-lo no branch `host === apex`.
   - Definir `metadataBase` + `alternates.canonical` no `layout.tsx`/`page.tsx` do guia apontando para `https://eleicoes.unfoldgrowth.com.br/featwork` (hoje `metadataBase` aponta para `NEXT_PUBLIC_SITE_URL` = apex — **bug de OG/canonical que o plano já sinalizou em S5.6; confirmar a env `NEXT_PUBLIC_GUIA_URL`**).
   - Incluir `/featwork` no `sitemap.ts` **com a URL do subdomínio** (não a rota interna). Como o `sitemap.ts` usa `BASE_URL = NEXT_PUBLIC_SITE_URL`, a entrada do guia precisa ser hardcoded para o subdomínio ou usar `NEXT_PUBLIC_GUIA_URL`.

**Confirmação do isolamento de layout:** ✅ Validado. `src/app/guia-eleicoes-2026/` está **FORA** do route group `(site)`. Existem 4 layouts independentes: `(site)/layout.tsx`, `(painel)/layout.tsx`, `(payload)/layout.tsx` e `guia-eleicoes-2026/layout.tsx` — este último com `<html>/<body>` próprio e **sem** Navbar/Footer. O guia NÃO herda o layout do site principal. O plano está correto neste ponto.

---

### DA-2 — Hook duplo de sync RD: **guarda explícita por origem no hook** (não confiar no `caminhoMap`). CRÍTICO.

**Confirmado no código — o risco é REAL.** Em `src/collections/Leads.ts`, o `afterChange` chama `syncContact()` para **toda** criação de lead, independentemente da origem:

```ts
afterChange: [ async ({ doc, operation }) => {
  if (operation !== 'create') return doc
  const caminhoMap = { diagnostico: 'Diagnóstico', calculadora: 'Calculadora', ... }
  const result = await syncContact({ ...doc, caminho_do_lead: caminhoMap[doc.origem] })
```

O plano propõe mapear `'guia-eleicoes' → undefined` no `caminhoMap` "para evitar dupla sync". **Isso NÃO evita a dupla sync.** Olhando `src/lib/crm/adapter.ts`:
- `inferIdentificador()` cai em `'lead_capturado'` quando `caminho_do_lead` é `undefined`;
- `syncToRDStation()` monta a tag `origem_guia-eleicoes` a partir de `contact.origem` e **dispara a conversão legacy mesmo assim**.

Resultado: se o endpoint `/api/guia-eleicoes/lead` chama `payload.create({ origem: 'guia-eleicoes' })` E também chama o adapter dedicado `rd-guia-eleicoes.ts`, o RD recebe **duas conversões** (uma `lead_capturado` genérica pelo hook + uma `guia-eleicoes-2026` pelo adapter). Isso polui a base, dispara a automação errada e pode duplicar o contato.

**Decisão recomendada — guarda no início do hook:**
```ts
afterChange: [ async ({ doc, operation }) => {
  if (operation !== 'create') return doc
  // Origens com adapter dedicado fazem a própria sync no endpoint.
  // O hook NÃO deve sincronizar para evitar dupla conversão no RD.
  const ORIGENS_COM_SYNC_PROPRIA = ['calculadora', 'guia-eleicoes']
  if (ORIGENS_COM_SYNC_PROPRIA.includes(doc.origem)) return doc
  ...
```

**Observação adicional:** a Calculadora **já tem o mesmo problema latente** — `api/calculadora/route.ts` cria o lead com `origem: 'calculadora'` (disparando o hook → `syncContact` genérico) E depois chama `syncCalculadoraToRD()` (fire-and-forget). Ou seja, **a Calculadora hoje provavelmente já dispara dupla conversão** (`lead_capturado` pelo hook + `calculadora_concluida` pelo adapter). O plano deve incluir `'calculadora'` na guarda também — isso conserta um bug pré-existente de produção, não só o novo. **Validar com @dev se essa dupla sync da Calculadora já é observável no painel RD.**

Alternativa mais limpa (refactor maior, fora do escopo desta entrega): centralizar TODA a sync no hook e remover as chamadas diretas dos endpoints. Não recomendo agora — muda o padrão da Calculadora em produção e aumenta o risco. A guarda por allowlist é a correção cirúrgica correta.

---

### DA-3 — RD legacy: reuso correto, mas **labels exatos são o risco #1 de "funciona mas perde dado".**

✅ O endpoint proposto reusa `postRDLegacyConversion()` corretamente — o adapter `rd-guia-eleicoes.ts` espelhando `rd-calculadora.ts` é o padrão certo. `normalizeTelefone()` (só dígitos, 10–13) já existe e é o esperado pela API legacy.

⚠️ **Atenção real (confirmado em `rd-mappings.ts` linha 4-7):** a API legacy **descarta silenciosamente** o valor de campos "Escolha única" se o label não bater 100% (acento/hífen/caixa). O `cf_perfil_eleitoral_2026` tem 4 opções que precisam existir no painel RD com o texto EXATO. O plano já mapeia `mapPerfilEleitoral()` — **exigir que os 4 labels sejam confirmados no painel antes do go-live** (já está como pendência crítica no §6 do plano; concordo, é bloqueador de T-16 real).

**Nota sobre o `identificador`:** o plano usa `'guia-eleicoes-2026'`. O PRD original (RF-21) usava `'hotsite-guia-eleicoes-2026'`. Como o identificador é o gatilho da automação do RD, **fixar UM valor e documentá-lo** — a automação no painel precisa escutar exatamente esse identificador. Recomendo `'guia-eleicoes-2026'` (consistente com a tag e o `cf_origem_hotsite`). Não reabrir, só garantir consistência ponta-a-ponta (código + automação RD).

---

### DA-4 — Fallback de leads: Payload/Postgres é adequado. **Não criar collection nova.**

✅ Trocar Supabase (PRD) por Payload/Postgres é a decisão certa — Supabase não existe no projeto e adicionar seria dívida. A collection `leads` já tem `rd_sync_status` (`pending|synced|error|mock`) e `ip_address`. O padrão de fallback da Calculadora (persistir primeiro, sync fire-and-forget, atualizar status) é exatamente o que o plano descreve.

⚠️ **Ajuste:** o plano fala em `rd_sync_status: 'failed'`, mas o enum real em `Leads.ts` é `'error'` (não `'failed'`). A Calculadora usa `'failed'` na `calculadora-results` (collection diferente, outro enum). **Para `leads`, usar `'error'`** ou adicionar `'failed'` ao enum. Inconsistência pequena mas quebra o update se passar string fora do enum.

⚠️ **Adicionar `'guia-eleicoes'` ao enum `origem`** em `Leads.ts` (hoje só `diagnostico|calculadora|contato|outro`). O plano prevê isso. Sem isso, o `payload.create({ origem: 'guia-eleicoes' })` falha validação.

---

### DA-5 — PDF: **NÃO usar Playwright/Puppeteer.** Reusar `@react-pdf/renderer` OU asset estático commitado.

**Confirmado:** Playwright/Puppeteer **não estão nas deps**. `@react-pdf/renderer@4.5.1` **está** e já é usado em `api/calculadora/pdf/route.ts` (dynamic import, fora do client bundle).

O plano sugere "Playwright print-to-PDF" — **isso adiciona uma dependência pesada e um navegador headless ao build/runtime Vercel (problemático em serverless).** Para um guia de 37 páginas A4 com layout fiel (115KB de HTML diagramado), `@react-pdf/renderer` exigiria reescrever todo o layout em primitivas react-pdf (inviável para fidelidade).

**Decisão recomendada (alinhada à decisão fechada "PDF do HTML, substituído depois"):** gerar o PDF **uma vez, manualmente/offline** (print-to-PDF do Chrome a partir da rota desbloqueada, ou um script `tsx` local com Playwright instalado só em devDependencies/local — **não no build da Vercel**) e **commitar o arquivo estático** em `public/static/guia-eleicoes-2026.pdf`. Servido como `/static/guia-eleicoes-2026.pdf` com atributo `download`. Isso é exatamente o que RF-28 pede ("PDF estático em rota previsível") e o que o PRD §3.2 lista como FORA de escopo ("geração dinâmica de PDF"). **Zero risco de runtime, troca sem deploy de código.**

→ Corrigir o plano em S4.1: remover "Playwright print-to-PDF no build". Substituir por "asset estático pré-gerado e commitado".

---

## 2. Correções ao plano, por sprint

### Sprint 2 (Gate visual)
- **OK.** `@radix-ui/react-dialog` (shadcn Dialog), `@radix-ui/react-radio-group`, `react-hook-form` + `@hookform/resolvers` e `zod` **já estão nas deps** → S2.2/S2.3 reusam sem instalar nada. `sonner` já está (toast S4.3).
- **CLS do scaling (ver §3):** o `BlurOverlay` e o modal precisam reservar dimensões. O blur via `filter: blur()` é paint-only (não causa CLS). OK.

### Sprint 3 (Integração)
- **DA-2 (guarda de hook)** é pré-requisito de S3.2 — sem ela, dupla conversão.
- **DA-4:** usar `rd_sync_status: 'error'` (não `'failed'`) e adicionar `origem: 'guia-eleicoes'`.
- **Rate-limit:** preferir reusar `src/lib/rate-limit.ts` (função `rateLimit(req, {scope,max,windowMs})` + `resolveClientIP`) — é mais robusta que o Map inline da `api/calculadora/route.ts`. O plano cita "padrão in-memory da Calculadora"; recomendo o `src/lib/rate-limit.ts` com `scope: 'guia-lead'`, `max: 3`, `windowMs: 60_000` (RNF-12 pede 3/60s, diferente dos 5/hora da Calculadora).
- **Email de alerta:** reusar `sendEmail()` de `src/lib/email/adapter.ts` (modo `mock-console`|`resend`, `resend` já nas deps). Controlado por `EMAIL_MODE` + `RESEND_API_KEY`. **Não criar `src/lib/email/alert-guia.ts` do zero** — montar o HTML inline e chamar `sendEmail({ to: ALERT_EMAIL_TO, ... })`. Variável `ALERT_EMAIL_TO` é nova.
- **Turnstile server verify:** `@react-pdf` etc. não cobrem isso; o verify é um `fetch` simples para `siteverify`. OK, mas garantir bypass quando `TURNSTILE_SECRET_KEY` ausente (dev) — o plano já prevê.

### Sprint 4 (CTAs)
- **DA-5:** PDF estático commitado, não gerado no build.
- `NEXT_PUBLIC_GUIA_URL` para base de share/UTM — OK, mas garantir que o **mesmo** valor alimente `metadataBase`/canonical (S5.6) e o sitemap.

### Sprint 5 (Polimento)
- **`sitemap.ts` e `robots.ts` existem** e usam `NEXT_PUBLIC_SITE_URL`. Para o guia: adicionar entrada com a **URL do subdomínio** (não a rota interna `/guia-eleicoes-2026`). O `robots.ts` hoje faz `disallow: ['/api/', ...]` — confirmar que `/api/guia-eleicoes/` cai sob `/api/` (cai, OK).
- **Canonical:** `layout.tsx` do guia hoje tem `metadataBase = NEXT_PUBLIC_SITE_URL` (apex) — **corrigir para `NEXT_PUBLIC_GUIA_URL`** e adicionar `alternates.canonical`.
- **OG image:** `public/og-guia-eleicoes.png` (asset). OK.

### Sprint 6 (Deploy/Subdomínio)
- **DA-1:** implementar no `src/middleware.ts` existente (estender matcher + guarda de host), **não** em `next.config`.
- O passo a passo Cloudflare/Vercel está **correto** (ver §3). Único reforço: a Vercel hoje recomenda `CNAME → <project>.vercel-dns.com` ou A `76.76.21.21`; o valor exato é o que o painel exibir no momento.

---

## 3. Configuração Cloudflare + Vercel (validada)

**Cenário confirmado:** apex `unfoldgrowth.com.br` já está na Vercel (há regra www→apex no `next.config`). O subdomínio `eleicoes` é um **novo Domain no MESMO projeto Vercel**.

### Vercel
1. Projeto → Settings → Domains → Add `eleicoes.unfoldgrowth.com.br`.
2. A Vercel exibe o target DNS (CNAME `cname.vercel-dns.com`, ou A `76.76.21.21` se CNAME impossível). Anotar o valor **exibido** (pode variar).

### Cloudflare (zona `unfoldgrowth.com.br`)
3. DNS → Add record → **CNAME**, Name `eleicoes`, Target = o que a Vercel indicou.
4. **Proxy status: DNS only (nuvem CINZA / proxy OFF).** ✅ **Decisão correta e crítica.** Justificativa técnica validada:
   - Com proxy laranja ON, o Cloudflare termina o TLS na borda dele e re-origina para a Vercel. A emissão automática do cert Let's Encrypt da Vercel (via HTTP-01/TLS-ALPN) **falha ou entra em loop** porque o Cloudflare intercepta o challenge.
   - Pior: o `host` header que chega ao middleware pode ser reescrito/normalizado pelo proxy, quebrando a **guarda de host da DA-1** (o middleware compara `host === 'eleicoes.unfoldgrowth.com.br'`).
   - Headers HSTS/CSP do `next.config` e o roteamento por host só são confiáveis com a Vercel recebendo a requisição direta.
   - **Se o time EXIGIR proxy Cloudflare** (DDoS/WAF): usar SSL mode **Full (strict)**, garantir que o cert da Vercel já emitiu ANTES de ligar o proxy, e **validar que `host`/`x-forwarded-host` chegam corretos ao middleware** (pode ser preciso ler `x-forwarded-host` em vez de `host`). Tratar como exceção fora do default, validada por @devops.
5. Salvar → aguardar **Valid Configuration** na Vercel (minutos a ~1h) → SSL automático (RNF-09). ✅

### Pós-deploy
- Deploy da branch com o middleware estendido.
- Verificar: `eleicoes.../featwork` mostra o guia (URL permanece `/featwork`); `eleicoes.../` → 308 `/featwork`; `unfoldgrowth.com.br/guia-eleicoes-2026` → 301 subdomínio; cadeado SSL válido; **site principal intacto** (testar `/`, `/diagnostico`, `/painel`, `/diagnostico/r/...` — as rotas que já passam pelo middleware).
- Flip `CRM_MODE=rd-station` + cadastro de teste → conversão no painel RD em ≤60s (T-01).

⚠️ **Risco de regressão a testar explicitamente:** como o matcher do middleware vai ganhar `/` (para o redirect raiz do subdomínio), ele passará a rodar em `unfoldgrowth.com.br/` (apex home). A guarda de host DEVE retornar `NextResponse.next()` imediatamente para o apex em `/`. **Adicionar teste manual: apex home carrega normal e NÃO redireciona.** Este é o ponto onde "o rewrite por host quebra o site principal" se materializaria.

---

## 4. Gaps arquiteturais não previstos no plano (vão doer depois)

1. **Matcher do middleware vai rodar no apex `/`.** O plano diz "matcher restrito ao host do subdomínio" — **tecnicamente impossível**: o matcher do Next filtra por path, não por host. Adicionar `/` ou `/featwork` ao matcher faz o middleware executar nessas rotas do apex também. A mitigação real é a **guarda de host no corpo** (DA-1). O plano subestima isso. **Vira tarefa: teste de não-regressão do apex.**

2. **Dupla sync da Calculadora já em produção (DA-2).** Descoberto durante a inspeção — não é do guia, mas o mesmo hook afeta. Corrigir junto (incluir `'calculadora'` na allowlist) ou pelo menos sinalizar ao dono. **Vira tarefa de investigação no painel RD.**

3. **`metadataBase` do guia aponta para o apex hoje** (`layout.tsx` linha 42). Sem corrigir para `NEXT_PUBLIC_GUIA_URL`, todo OG/canonical/Twitter Card vai gerar URLs `unfoldgrowth.com.br/...` mesmo servindo no subdomínio → preview de WhatsApp/LinkedIn com URL errada e canonical apontando para a rota que vai virar 301. **Vira tarefa em S5.6/S6.**

4. **CLS do scaling mobile (ver §3 abaixo).** `--guia-scale` default `1`, recalculado em JS pós-hydration. Em mobile, primeiro paint renderiza a 793px (scale=1) com `margin-bottom` calculado para scale=1, depois "snapa" para o scale real → **layout shift vertical** entre páginas no primeiro frame. `transform: scale()` é compositor-only (não conta no CLS de layout), mas a mudança de `margin-bottom` (que depende de `--guia-scale`) **conta**. Mitigação: setar `--guia-scale` inline no SSR via um valor estimado por `User-Agent`/viewport, ou aceitar como débito conhecido (o conteúdo é below-the-fold após o modal). **Medir em S5.2 com Lighthouse mobile real; se CLS > 0,1, setar scale inicial no servidor.**

5. **Idempotência por e-mail (T-07):** o plano cita "upsert por e-mail". O padrão da Calculadora faz `payload.find({where:{email}})` + create/update — **race condition** sob duplo-clique muito rápido (duas requests passam o `find` antes de qualquer `create`). O guard de "submitting" no client (RF-18) mitiga 99%, mas para robustez real adicionar **unique index em `leads.email`** (Payload não garante por padrão) ou aceitar o débito. **Vira tarefa/decisão:** unique constraint em `email` da collection `leads`.

6. **`content-visibility: auto` + blur:** aplicar `filter: blur()` em containers com `content-visibility: auto` força o browser a renderizar para compor o filtro, **anulando parte do ganho de lazy-render** nas páginas blurradas visíveis. Como o blur só vale pré-cadastro e o overlay escurece, considerar aplicar o blur só nas ~6 primeiras páginas visíveis e manter `content-visibility` cru nas distantes. **Medir em S5.2.**

7. **Edge runtime do middleware:** o middleware roda no Edge. A guarda de host e os redirects são triviais e compatíveis. Sem gap, mas **não** importar nada de Node-only no middleware (já é o caso).

---

## 5. Resumo das tarefas técnicas que nascem desta avaliação

| # | Tarefa | Sprint | Severidade |
|---|--------|--------|-----------|
| T-A1 | Subdomínio via `middleware.ts` estendido: matcher + guarda de host + rewrite `/featwork`→`/guia-eleicoes-2026` + redirect raiz + canonical apex→subdomínio | S6 | **Crítica** |
| T-A2 | Teste de não-regressão: apex `/`, `/diagnostico`, `/painel`, `/diagnostico/r/` intactos após estender o matcher | S6 | **Crítica** |
| T-A3 | Guarda no `afterChange` de `Leads.ts`: allowlist `['calculadora','guia-eleicoes']` que pula a sync genérica (corrige dupla conversão) | S3 | **Crítica** |
| T-A4 | Investigar/confirmar se a Calculadora já dispara dupla conversão no painel RD hoje | S3 | Alta |
| T-A5 | Adicionar `origem: 'guia-eleicoes'` ao enum + usar `rd_sync_status: 'error'` (não `'failed'`) | S3 | Alta |
| T-A6 | PDF: asset estático pré-gerado commitado em `public/static/` — remover Playwright do build | S4 | Alta |
| T-A7 | Confirmar 4 labels exatos de `cf_perfil_eleitoral_2026` no painel RD + identificador único | go-live | Alta |
| T-A8 | Corrigir `metadataBase`→`NEXT_PUBLIC_GUIA_URL` + `alternates.canonical` + entrada de sitemap com URL do subdomínio | S5/S6 | Média |
| T-A9 | Reusar `src/lib/rate-limit.ts` (scope `guia-lead`, 3/60s) e `sendEmail()` do adapter existente | S3 | Média |
| T-A10 | Medir CLS mobile do scaling; se > 0,1 setar `--guia-scale` inicial no SSR | S5 | Média |
| T-A11 | Decidir unique index em `leads.email` para idempotência hard (T-07) | S3 | Baixa |
| T-A12 | Cloudflare: CNAME `eleicoes` **DNS only** (proxy OFF) | S6 | **Crítica** (operação) |

---

## 6. O que o plano acertou (não mexer)

- Route group isolado do guia (sem Navbar/Footer) — ✅ validado no código.
- Reuso de `postRDLegacyConversion` + `normalizeTelefone` + `CRM_MODE` — ✅ padrão correto.
- Fallback em Payload/Postgres em vez de Supabase — ✅ decisão sólida.
- Fire-and-forget da sync RD + persistir-primeiro — ✅ espelha a Calculadora.
- Deps já presentes (Dialog, radio-group, react-hook-form, zod, sonner, @react-pdf, resend) — ✅ zero instalação nova de UI/form.
- Cloudflare DNS-only — ✅ tecnicamente correto e bem justificado.
- Rastreabilidade RF/RNF/T/D + N/A justificados — ✅ exemplar.
