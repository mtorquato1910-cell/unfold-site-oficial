# Plano de Sprints — Hotsite "Guia de Anúncios Digitais para as Eleições de 2026"

> ## ⚑ v2 — revisado pós-auditoria QA + Architect, 2026-06-01
> Esta é a versão **FINAL pronta para execução**. Incorpora as 4 críticas QA (GAP-A1..A4), as 5 decisões arquiteturais (DA-1..DA-5) e os 12 gaps Médios/Baixos. Veja o **Changelog v1→v2** no fim do documento (§9) e a matriz de rastreabilidade ampliada (§2.4 — itens de auditoria).

**Parceria:** Unfold × Feat.Work
**Documento:** Plano de execução rastreável (auditável por @qa e @architect)
**Autor:** @pm
**Data:** 2026-06-01 · **Versão:** v2 (pós-auditoria)
**PRD base:** `Eleições/PRD_Hotsite_Guia_Eleicoes_2026.md` (744 linhas, RF-01..RF-42, RNF-01..RNF-20, T-01..T-27, D-01..D-10)
**Auditorias incorporadas:** `02-avaliacao-qa.md` (@qa) + `03-avaliacao-architect.md` (@architect)
**Subdomínio fechado:** `eleicoes.unfoldgrowth.com.br/featwork`

> **Decisões de arquitetura JÁ FECHADAS pelo dono (NÃO reabrir):**
> 1. URL = subdomínio real `eleicoes.unfoldgrowth.com.br/featwork` (DNS Cloudflare + Vercel Domains + rewrite). Path `/featwork` proposital (multi-parceiro futuro).
> 2. RD Station = reusar integração **legacy** existente (`src/lib/crm/rd-legacy-client.ts` → `postRDLegacyConversion()`; mappings em `src/lib/crm/rd-mappings.ts`). API `/api/1.3/conversions`, Public Token, plano Basic. **Sem criação de deal** (a automação do RD cria a negociação). `CRM_MODE` = `mock` | `rd-station`.
> 3. PDF = **asset estático pré-gerado offline e commitado** (NÃO Playwright/Puppeteer no build — não estão nas deps; ver DA-5). Design substitui pela versão InDesign depois.
> 4. Conteúdo do guia é FINAL — preservar 100% (RF-02). Contracapa tem `[PLACEHOLDER]` de contatos institucionais (pendência de conteúdo, não de código).

> **🔓 DECISÕES PENDENTES DO DONO antes de iniciar a Sprint 3 (bloqueiam execução):**
> - **DEC-1 (`empresa` obrigatório):** o plano adota a abordagem **(b) default derivado** — preenche `empresa: '(não informado)'` no create do guia, **sem** tornar o campo opcional na collection (preserva as 4 origens existentes). Se o dono preferir tornar `empresa` opcional, é mudança em collection compartilhada e exige revalidação das outras origens. **Confirmar abordagem.** (GAP-A1 / §3 S3.2)
> - **DEC-2 (identificador canônico RD):** adotado `guia-eleicoes-2026` como **fonte única** (código ↔ painel RD ↔ automação), divergindo do PRD que pedia `hotsite-guia-eleicoes-2026`. O `identificador` é o gatilho da automação do RD — precisa bater 100%. **Confirmar com quem configura o painel RD.** (GAP-M1 / DA-3 / Nota A)
> - **DEC-3 (classificação LGPD do dado de perfil):** "intenção de candidatura" pode configurar **dado sensível** (opinião política, art. 5º II LGPD). Default do plano: legítimo interesse + cautela. **Validar com jurídico/DPO** se exige consentimento explícito (não só aviso). Condição de go-live. (RNF-14 / Riscos)

---

## 1. Sumário executivo

A Sprint 1 já entregou e validou a **fundação de conteúdo**: rota `/guia-eleicoes-2026` com layout isolado, 37 páginas A4 portadas via SSR (`dangerouslySetInnerHTML`), CSS escopado sob `.guia-doc`, responsividade por scaling A4 em JS, lazy render por `content-visibility`, GTM/GA4 carregados e fontes Space Grotesk / Inter / JetBrains Mono. O item "Guia Eleições" já está no NAV da Navbar (apontando hoje para `/guia-eleicoes-2026`).

**O que falta entregar (Sprints 2 → 6):**

| Sprint | Foco | Entregável |
|--------|------|-----------|
| **Sprint 2** | Gate visual | Blur progressivo (+ `reduced-motion`) + overlay + aviso a11y do conteúdo bloqueado + modal de cadastro + formulário 4 campos + máscaras + validações + Turnstile (widget reusado) |
| **Sprint 3** | Integração & captura | API `/api/guia-eleicoes/lead` → RD legacy + **guarda no hook de Leads (anti-dupla-conversão)** + `empresa` default + enum `origem`/`rd_sync_status` corrigidos + `anonymizeIp` /24 + CSRF/Origin real + fallback Payload + alerta e-mail (`sendEmail` reusado) + captura UTM/origem + sessão localStorage |
| **Sprint 4** | CTAs & funcionalidades | Download PDF **estático commitado** (3 pontos) + share WhatsApp/e-mail + toast pós-cadastro + header fixo + GA4 events (client GTM) + pulsação CTA (+ `reduced-motion`) + limpar cadastro |
| **Sprint 5** | Polimento & testes | Acessibilidade WCAG AA + performance (LCP/**CLS do scaling**/Lighthouse) + SEO/OG/`metadataBase` subdomínio/sitemap/schema + suíte Vitest (incl. cenários novos QA) + T-01..T-27 |
| **Sprint 6** | Deploy & subdomínio | `middleware.ts` **estendido** (guarda de host) + matcher ampliado + **teste de não-regressão do apex** + Cloudflare DNS-only + Vercel Domains + SSL + envs produção + Navbar → subdomínio + passo a passo operacional |

A integração RD reusa `postRDLegacyConversion()` + `normalizeTelefone()` + `CRM_MODE` (padrão em produção). **Correção pós-auditoria:** a afirmação v1 de "padrão idêntico da Calculadora para atualizar `leads.rd_sync_status`" era **falsa** — a Calculadora atualiza `calculadora-results`, não `leads`. A atualização de status em `leads` é **lógica nova** (S3.3). O grande trabalho novo é o **gate visual** (Sprint 2), a **integração resiliente sem dupla conversão** (Sprint 3) e o **deploy de subdomínio via middleware estendido** (Sprint 6).

---

## 2. Matriz de rastreabilidade COMPLETA

Legenda Status: ✅ Sprint 1 (feito) · 🟡 planejado · ⛔ N/A (com motivo).

### 2.1. Requisitos Funcionais (RF-01..RF-42)

| RF | Resumo | Sprint / Story | Status |
|----|--------|----------------|--------|
| RF-01 | Single-page renderiza 37 páginas A4 | S1 (`page.tsx` + `guia-content.ts`) | ✅ |
| RF-02 | Conteúdo preservado 100% | S1 (SSR `dangerouslySetInnerHTML`) | ✅ |
| RF-03 | Responsivo desktop/tablet/mobile | S1 (`GuiaScale.tsx` + `guia-responsive.css`) | ✅ |
| RF-04 | Fundo cinza escuro `#2a2a2a` | S1 (`guia.css`) | ✅ |
| RF-05 | Header fixo (logos, título, Baixar/Compartilhar), hamburger mobile, só pós-desbloqueio | S4.4 | 🟡 |
| RF-06 | Blur `filter: blur(8px)` enquanto não autenticado | S2.1 | 🟡 |
| RF-07 | Blur gradual nas primeiras páginas (capa→p4) | S2.1 | 🟡 |
| RF-08 | Overlay degradê escurecido sobre blur | S2.1 | 🟡 |
| RF-09 | Blur removido com transição ~600ms pós-cadastro | S2.1 / S3.4 | 🟡 |
| RF-10 | Modal: auto após 3s + via CTA + ao tocar área restrita | S2.2 | 🟡 |
| RF-11 | Estilo do modal (navy `#001E29`, cream, mint `#6DF9C6`, radius, fontes) | S2.2 | 🟡 |
| RF-12 | Estrutura de conteúdo do modal (tag/título/subtítulo/form/rodapé/marcas) | S2.2 | 🟡 |
| RF-13 | Fechar via X / ESC; CTA fixo canto inferior; reabertura após 30s (1×/sessão) | S2.2 | 🟡 |
| RF-14 | Form 4 campos (nome/email/telefone/perfil) com validações | S2.3 | 🟡 |
| RF-15 | 4 opções de perfil (radio) | S2.3 | 🟡 |
| RF-16 | Validação em tempo real + bloqueio submit + erro vermelho `#E24B4A` | S2.3 | 🟡 |
| RF-17 | Máscara telefone `(00) 00000-0000`; armazena só dígitos | S2.3 | 🟡 |
| RF-18 | Loading "Desbloqueando..." + botão desabilitado (anti-duplo-clique) | S2.3 / S3.4 | 🟡 |
| RF-19 | Mensagem de erro amigável no modal + log | S3.4 | 🟡 |
| RF-20 | Pós-submit: Marketing + (CRM) + GA4 + localStorage + liberação | S3.2 / S3.4 / S4.x | 🟡 |
| RF-21 | Payload RD Marketing (conversão + cf_* + tags) | S3.2 (via legacy, ver nota) | 🟡 |
| RF-22 | Tag derivada do perfil (`perfil-candidato`...) | S3.2 | 🟡 |
| RF-23 | Endpoints RD (Marketing/CRM) | S3.2 — **legacy `/api/1.3/conversions`** (ver nota A) | 🟡 |
| RF-24 | Criação de oportunidade no CRM | ⛔ **N/A — plano Basic não libera deal. A automação do RD cria a negociação a partir da conversão `guia-eleicoes-2026`.** | ⛔ |
| RF-25 | Fallback + alerta e-mail em falha RD | S3.3 | 🟡 |
| RF-26 | Botão "Baixar PDF" em ≥3 locais (header / pós-p7 / p36) | S4.1 | 🟡 |
| RF-27 | Download autenticado direto; senão abre modal contextual | S4.1 | 🟡 |
| RF-28 | PDF estático em rota previsível, nome amigável | S4.1 | 🟡 |
| RF-29 | Evento GA4 `pdf_baixado` (lead_email, origem_botao) | S4.1 | 🟡 |
| RF-30 | Botões share WhatsApp + e-mail | S4.2 | 🟡 |
| RF-31 | Share WhatsApp `wa.me` + mensagem + UTMs | S4.2 | 🟡 |
| RF-32 | Share e-mail `mailto:` + assunto/corpo + `utm_medium=email` | S4.2 | 🟡 |
| RF-33 | `utm_content` = hash SHA-256 truncado (8 chars) do e-mail | S4.2 | 🟡 |
| RF-34 | Evento GA4 `link_compartilhado` (canal, lead_email_hash) | S4.2 | 🟡 |
| RF-35 | localStorage pós-cadastro (unlocked, lead_id, hash, perfil, ts) | S3.5 | 🟡 |
| RF-36 | Ao carregar, checar `hotsite_unlocked === true` | S3.5 | 🟡 |
| RF-37 | Sem cookies de terceiros; só localStorage + 1ª parte | S3.5 / S5.3 | 🟡 |
| RF-38 | Botão "Limpar meu cadastro deste dispositivo" no rodapé | S4.3 | 🟡 |
| RF-39 | Captura UTM/referrer/landing/device/UA em `sessionStorage` | S3.1 | 🟡 |
| RF-40 | Envio dos `cf_*` de origem ao RD no cadastro | S3.1 / S3.2 | 🟡 |
| RF-41 | Toast pós-cadastro (✓ mint, auto-dismiss 6s, X) | S4.3 | 🟡 |
| RF-42 | Destaque pulsante dos botões download/share pós-cadastro | S4.3 | 🟡 |

> **Nota A (RF-21/RF-23) — atualizada v2:** O PRD especifica RD Marketing v2 (`/platform/conversions`, OAuth) e CRM v1 (`/deals`). Decisão fechada do dono **sobrescreve**: usamos a API **legacy** `POST https://www.rdstation.com.br/api/1.3/conversions` com Public Token (plano Basic). O payload do RF-21 é mapeado para o formato legacy: `name→nome`, `email`, `mobile_phone/personal_phone→celular` (só dígitos via `normalizeTelefone`), `conversion_identifier→identificador`, todos os `cf_*` enviados como campos top-level, `tags` preservadas. Endpoints OAuth/CRM do RF-23 são descartados em favor do legacy.
>
> **Desvios do PRD declarados explicitamente (v2):**
> - **DESVIO-1 (identificador) — DEC-2:** o PRD pede `conversion_identifier = "hotsite-guia-eleicoes-2026"`. O plano adota `"guia-eleicoes-2026"` (sem prefixo `hotsite-`), **consistente** com a tag e `cf_origem_hotsite`. Este é o valor **canônico**: precisa ser idêntico em código + painel RD + automação. **Pende confirmação do dono.**
> - **DESVIO-2 (`+55` do telefone) — GAP-M2:** o PRD pede `mobile_phone = "+55[telefone]"`. A API legacy + `normalizeTelefone()` descartam o `+55` (só dígitos, 10–13). Mantido **dígitos puros** por consistência com a Calculadora em produção. Aceito como desvio.

### 2.2. Requisitos Não-Funcionais (RNF-01..RNF-20)

| RNF | Resumo | Sprint / Story | Status |
|-----|--------|----------------|--------|
| RNF-01 | LCP ≤ 2,5s (4G) | S5.2 (medição/ajuste) · base S1 | 🟡 |
| RNF-02 | FCP ≤ 1,5s | S5.2 | 🟡 |
| RNF-03 | CLS ≤ 0,1 | S5.2 (reservar dimensões A4/modal) | 🟡 |
| RNF-04 | TTI ≤ 3,5s | S5.2 | 🟡 |
| RNF-05 | Lazy loading páginas 20+ | S1 (`content-visibility`) — revalidar | ✅/🟡 |
| RNF-06 | `font-display: swap` + fallbacks | S1 (`next/font` display swap) | ✅ |
| RNF-07 | WCAG 2.1 AA (contraste, teclado, labels, ARIA, foco, alt) | S5.1 | 🟡 |
| RNF-08 | Leitor de tela: conteúdo bloqueado `aria-hidden` **+ região de aviso semântico fora do bloco oculto** (resolve conflito acessível-vs-oculto) | S2.1 / S5.1 | 🟡 |
| RNF-09 | HTTPS / SSL | S6.3 (Vercel auto-SSL) | 🟡 |
| RNF-10 | Sanitização front + re-validação back | S2.3 (front) / S3.2 (Zod back) | 🟡 |
| RNF-11 | Proteção CSRF nas chamadas de API | S3.2 — **implementação NOVA** de verificação de `Origin`/`Host` (não existe no projeto; allowlist subdomínio + apex) | 🟡 |
| RNF-12 | Rate limiting 3 req/IP/60s | S3.2 — **reusa `src/lib/rate-limit.ts`** (`rateLimit(req,{scope:'guia-lead',max:3,windowMs:60_000})`) | 🟡 |
| RNF-13 | CAPTCHA invisível (Turnstile) | S2.4 (widget **reusado**) + S3.2 (**`verifyTurnstile()` reusado** de `src/lib/security/turnstile.ts`) | 🟡 |
| RNF-14 | LGPD (aviso, política, exclusão DPO, base legal dado político) | S2.3 (aviso) / S4.3 (limpar) / S5.4 (política+DPO) | 🟡 |
| RNF-15 | Credenciais nunca no front (envs no server) | S3.2 | 🟡 |
| RNF-16 | Compatibilidade Chrome/Edge/Safari/Firefox/Samsung | S5.5 | 🟡 |
| RNF-17 | Funcional em 320px | S5.5 · base S1 | 🟡 |
| RNF-18 | Meta tags + OG completo + Twitter Card + OG image 1200×630 | S5.6 (parcial em S1: title/description) | 🟡 |
| RNF-19 | sitemap.xml + robots.txt | S5.6 | 🟡 |
| RNF-20 | Schema.org (Article) | S5.6 | 🟡 |

### 2.3. Logging (LOG-01..LOG-03 — extra do PRD §9)

| LOG | Resumo | Sprint |
|-----|--------|--------|
| LOG-01 | Log estruturado JSON por submissão (ts, IP /24, UA, resultado, duração, erro sem PII) — **novo utilitário `anonymizeIp(ip)` em `_lib/anonymize-ip.ts`** (não existe no projeto) | S3.2 |
| LOG-02 | Logs centralizados (Vercel Logs / Sentry / stdout 30d) | S3.2 / S6 (Vercel Logs) |
| LOG-03 | Alertas (erro >5%/10min, RD 5xx >5min, >100 sub/min) — **alertas automáticos = fase 2 (fora do MVP, declarado).** No MVP: **procedimento manual com dono e critério** (ver S3.3 e Riscos) | S3.3 (manual definido) |

### 2.4. Itens de auditoria QA + Architect (rastreabilidade das correções v2)

Os 16 pontos consolidados das duas auditorias, com destino na sprint/story. Códigos: `A*` = QA Alta, `M*` = QA Média, `B*` = QA Baixa, `DA*` = Architect.

| # | Item de auditoria | Origem | Story onde foi tratado | Status |
|---|-------------------|--------|------------------------|--------|
| 1 | `empresa` required quebra `payload.create` do guia → default `'(não informado)'` (DEC-1) | GAP-A1 | **S3.2** | ✅ |
| 2 | Dupla conversão RD: guarda no `afterChange` (allowlist `['calculadora','guia-eleicoes']`) + regressão 4 origens + investigar RD da Calculadora | GAP-A3 / DA-2 | **S3.2** (guarda) + **S3.6** (regressão+investigação) | ✅ |
| 3 | `rd_sync_status: 'failed'` não existe → usar `'error'`; add `'guia-eleicoes'` ao enum `origem` | GAP-A2 / DA-4 | **S3.0** (migração de schema) | ✅ |
| 4 | CSRF/Origin (RNF-11) **não é reuso** — implementação nova, host do subdomínio muda o Origin esperado | GAP-A4 | **S3.2** | ✅ |
| 5 | Subdomínio via `middleware.ts` **estendido** + guarda de host no corpo + matcher ampliado sem quebrar apex + Cloudflare DNS-only | DA-1 | **S6.1** + **S6.5** (não-regressão) | ✅ |
| 6 | PDF estático pré-gerado offline e commitado (sem Playwright no build) | DA-5 | **S4.1** | ✅ |
| 7 | Reusar `turnstile.ts`, `rate-limit.ts`, `email/adapter.ts` (não recriar) | GAP-B1 / DA-9 | **S2.4 / S3.2 / S3.3** | ✅ |
| 8 | `conversion_identifier` fonte única (DEC-2) + `+55` declarado (GAP-M2) | GAP-M1 / M2 / DA-3 | **Nota A (DESVIO-1/2)** + **S3.2** | ✅ |
| 9 | Labels exatos RD `cf_perfil_eleitoral_2026` (4) — tarefa operacional que bloqueia T-16 | GAP-DA3 / §6 | **§6 pendência crítica** + **S3.7** (tarefa op) | ✅ |
| 10 | `prefers-reduced-motion` no blur (RF-09), pulsação CTA (RF-42) e modal | GAP-M(testes) | **S2.1 / S4.3 / S2.2** | ✅ |
| 11 | DoD de TODA sprint exige `lint` + `tsc --noEmit` + `npm test` verdes | §6 QA | **§DoD global** (todas as sprints) | ✅ |
| 12 | LOG-01 `anonymizeIp` /24 (novo) + LOG-03 dono/critério do alerta manual | LOG-01/03 | **S3.2** (util) + **S3.3** (procedimento) | ✅ |
| 13 | `metadataBase`/OG → subdomínio (`NEXT_PUBLIC_GUIA_URL`); guia no sitemap com URL do subdomínio | DA-3(gap) | **S5.6** + **S6.1** | ✅ |
| 14 | CLS do `--guia-scale` pós-hydration → medir Lighthouse; se >0,1 setar scale no SSR | DA-4(gap) | **S5.2** | ✅ |
| 15 | Idempotência T-07: race no `find`+`create` → avaliar unique index em `leads.email` (DEC pendente) | GAP-M4 / DA-5(gap) | **S3.0** (decisão) + **S3.4** | ✅ |
| 16 | Testes faltantes: modal não-reabre 2×, reduced-motion, localStorage corrompido, falha de rede POST, telefone fixo 10 díg., persistência do lead do guia, 400/403 do endpoint | §4 QA | **S5.7** (mapeados em §5) | ✅ |

**Cobertura:** 62 IDs de requisito (42 RF + 20 RNF) + 3 LOG + **16 itens de auditoria**. **61 RF/RNF mapeados a sprint, 1 explicitamente N/A** (RF-24, deal no CRM). Todos os 16 itens de auditoria endereçados e rastreáveis. Nenhum requisito sem destino.

---

## 3. Sprints detalhadas

> Convenção de arquivos: tudo do hotsite vive sob `src/app/guia-eleicoes-2026/`. Componentes client em `_components/`, lógica em `_lib/`, conteúdo em `_content/` (já existe). API em `src/app/api/guia-eleicoes/`. Reuso de CRM em `src/lib/crm/`.

> **🟢 DoD GLOBAL (aplica-se a TODAS as sprints — item 11 da auditoria QA §6):** além do DoD específico de cada story, nenhuma sprint é considerada pronta sem:
> 1. `npm run lint` verde (sem novos warnings/errors).
> 2. `tsc --noEmit` (typecheck) verde.
> 3. `npm test` verde — **sem regressão** dos testes Vitest existentes (Diagnóstico, Calculadora) + verdes os testes novos da própria sprint.
>
> S2–S4 mexem em TS/TSX e podem quebrar o build; este gate é obrigatório por sprint, não só na S5.

---

### SPRINT 2 — Gate visual: blur, modal, formulário, captcha

**Objetivo:** Transformar a página estática num gate. Ao final, o conteúdo aparece desfocado, o modal sobe após 3s, o formulário valida os 4 campos com máscara e Turnstile, mas **ainda não envia** (submit mockado libera localmente). Sem backend nesta sprint.

**Entregável:** Gate funcional end-to-end no client, com submit simulado que remove o blur.

**Dependências:** Sprint 1 (entregue). Turnstile site key (D — ver §6). Cores/identidade do PRD (RF-04/RF-11) — já no `guia.css`.

#### S2.1 — Sistema de blur + overlay
- **Como** visitante não cadastrado, **quero** ver o guia desfocado com teaser nas primeiras páginas, **para** perceber que há conteúdo real e querer desbloquear.
- **Critérios de aceitação:**
  - Blur pleno `blur(8px)` em todas as páginas a partir da pág. 4 (RF-06).
  - Blur gradual: pág. 1 (capa) e 2 (folha) sem blur; pág. 3 `blur(2px)`; pág. 4+ `blur(8px)` (RF-07).
  - Overlay com degradê escurecido sobre o conteúdo bloqueado (RF-08), sem ocultar o layout.
  - Conteúdo bloqueado recebe `aria-hidden="true"` (RNF-08); regiões não-bloqueadas permanecem acessíveis.
  - **RNF-08 resolvido (GAP-M3):** o bloco com `aria-hidden` NÃO deixa o leitor de tela sem nada. Adicionar, **fora** do bloco oculto, uma região `role="status"` com texto visível a leitores: **"Conteúdo bloqueado. Cadastre-se para liberar o estudo completo."** Garante a parte "com aviso" do RNF-08 e não derruba o score de a11y (T-22).
  - Estado controlado por uma flag `unlocked` (React state/context) — quando `true`, blur e overlay somem com `transition` ~600ms (RF-09).
  - **`prefers-reduced-motion` (item 10):** quando o usuário pede movimento reduzido, a transição de 600ms do blur é instantânea (sem animação) — via `@media (prefers-reduced-motion: reduce)` no `guia-blur.css`. A mudança de estado (blur→sem blur) continua, só a animação é suprimida.
- **Tarefas técnicas:**
  - `_components/GateProvider.tsx` (Context com `unlocked`, `setUnlocked`, `openModal`).
  - `_components/BlurOverlay.tsx` (aplica classes de blur por índice de página + gradient overlay + região `role="status"` de aviso).
  - Classes CSS de blur/overlay/transição em `_content/guia-blur.css` (novo, escopado sob `.guia-doc`), com bloco `@media (prefers-reduced-motion: reduce)`.
  - Marcar páginas no DOM com `data-page-index` (ajustar `scripts/extract-guia-eleicoes.mjs` ou pós-processar no `guia-content.ts`).
  - **Nota perf (DA-6, medir em S5.2):** `filter: blur()` em containers com `content-visibility: auto` força render para compor o filtro. Aplicar blur só nas ~6 primeiras páginas visíveis; manter `content-visibility` cru nas distantes.
- **DoD:** blur visível por padrão; alternar `unlocked` no devtools remove blur com transição; `aria-hidden` correto + região `role="status"` lida pelo leitor; `reduced-motion` suprime a animação; sem CLS ao alternar.
- **Cobre:** RF-06, RF-07, RF-08, RF-09 (visual), RNF-08 (completo), item 10 (reduced-motion).

#### S2.2 — Modal de cadastro (estrutura, estilo, comportamento de abertura/fechamento)
- **Como** visitante, **quero** um modal claro que me explique o porquê do cadastro, **para** decidir desbloquear.
- **Critérios de aceitação:**
  - Modal centralizado sobre o conteúdo desfocado, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` (RNF-07).
  - Abre automaticamente após **3s** no 1º load (RF-10); abre via qualquer CTA da página; abre ao tentar área restrita (download) (RF-10).
  - Estilo: fundo navy `#001E29`, texto cream `#E7E7E7`, botão mint `#6DF9C6` com texto navy, `border-radius: 8mm`, ~440px desktop / 92% mobile, padding ~30mm, fontes Space Grotesk/Inter/JetBrains Mono (RF-11).
  - Conteúdo: tag mono "ACESSO COMPLETO", título "Continue a leitura", subtítulo, slot do formulário, botão "Desbloquear estudo", rodapé LGPD mono, marcas Unfold × Feat.Work (RF-12).
  - Fecha por X superior direito e por ESC (RF-13). Ao fechar sem cadastrar: conteúdo segue desfocado; CTA fixo "Desbloquear estudo" aparece no canto inferior direito; após 30s reabre automaticamente **uma única vez por sessão** (RF-13).
  - **Definição de "sessão" (GAP-M3/testes):** "sessão" = enquanto a aba viver (flag `modal_reaberto_30s` em `sessionStorage`). A reabertura automática dos 30s ocorre **no máximo 1×**; recarregar a aba (que limpa `sessionStorage`) pode reabrir de novo. O modal **não** reabre uma 2ª vez na mesma aba mesmo que o usuário feche de novo. Cenário testável em S5.7 ("modal NÃO reabre 2ª vez").
  - Focus trap dentro do modal; foco retorna ao gatilho ao fechar (RNF-07).
  - **`prefers-reduced-motion` (item 10):** animações de entrada/saída do modal (fade/scale do Radix Dialog) suprimidas sob movimento reduzido.
- **Tarefas técnicas:**
  - `_components/LeadModal.tsx` (shadcn/ui `Dialog` como base, estilizado para a identidade do guia; `@radix-ui/react-dialog` já nas deps).
  - `_components/StickyUnlockButton.tsx` (CTA fixo).
  - `_components/GateProvider.tsx`: timers de 3s e 30s (one-shot via flag `modal_reaberto_30s` em `sessionStorage`).
  - Mensagem contextual parametrizável (default + "Cadastre-se para baixar o estudo completo em PDF" para o caminho download).
- **DoD:** todos os gatilhos de abertura/fechamento testados manualmente; focus trap OK; reabertura 30s só 1× por sessão (e **comprovadamente não reabre 2×**); animações respeitam reduced-motion.
- **Cobre:** RF-10, RF-11, RF-12, RF-13, item 10 (reduced-motion modal).

#### S2.3 — Formulário, validações, máscara, aviso LGPD
- **Como** visitante, **quero** preencher 4 campos com feedback claro, **para** desbloquear sem fricção.
- **Critérios de aceitação:**
  - Campos na ordem exata (RF-14): (1) Nome completo `text` — mín. 2 palavras, máx. 80 chars, placeholder "Seu nome completo"; (2) E-mail `email` — RFC 5322, validado no submit, placeholder "voce@exemplo.com"; (3) Telefone `tel` — DDD 10/11 dígitos, máscara `(00) 00000-0000`, placeholder "(00) 00000-0000"; (4) Perfil `radio` obrigatório.
  - Opções do radio (RF-15): "Sim, sou candidato ou pré-candidato" / "Sou parte de equipe de campanha" / "Não, mas atuo no setor" / "Outro".
  - Validação em tempo real com feedback sutil; botão de envio bloqueado até tudo válido; mensagens de erro abaixo do campo em vermelho `#E24B4A` (RF-16).
  - Máscara JS no telefone aceitando só dígitos; valor armazenado = só dígitos (RF-17).
  - **Telefone fixo 10 dígitos (item 16 / GAP-S2.3):** a validação aceita **10 (fixo: DDD+8) e 11 (celular: DDD+9)** dígitos. A máscara `(00) 00000-0000` é de 11; para 10 dígitos exibe `(00) 0000-0000` (máscara adaptativa por comprimento). `<10` dígitos bloqueia o submit (T-05). Cenário 10-dígitos coberto em S5.7.
  - **Edge cases do nome (item 16):** `trim()` + colapsar espaços múltiplos antes de validar; exige **≥2 palavras com ≥2 letras cada** (rejeita "a b"); máx. 80 chars.
  - Labels semânticos `<label htmlFor>` em todos os campos; erros via `aria-describedby` + `aria-invalid` (RNF-07/RNF-10 front).
  - Aviso de tratamento de dados antes do submit + link para Política de Privacidade (placeholder de URL até D-02) (RNF-14).
- **Tarefas técnicas:**
  - `_components/LeadForm.tsx` (react-hook-form se já no projeto; senão controlado).
  - `_lib/validation.ts` (zod schema do form: `guiaLeadSchema` — nome/email/telefone/perfil) — **reusável no backend** (S3.2).
  - `_lib/phone-mask.ts` (ou reusar máscara existente do projeto, se houver).
  - Tipos: `PerfilEleitoral = 'candidato' | 'equipe-campanha' | 'setor' | 'outro'`.
- **DoD:** T-04, T-05, T-06 passam manualmente; submit só habilita com tudo válido; máscara correta.
- **Cobre:** RF-14, RF-15, RF-16, RF-17, RNF-10 (front), RNF-14 (aviso).

#### S2.4 — Cloudflare Turnstile (widget client)
- **Como** operação, **quero** captcha invisível, **para** barrar bots no formulário.
- **Critérios de aceitação:**
  - Widget Turnstile invisível renderizado no modal, gerando token no submit (RNF-13).
  - Site key via `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; se ausente em dev, modo bypass logado (não bloqueia desenvolvimento).
  - Token incluído no payload de submit (verificado no server em S3.2).
- **Tarefas técnicas (item 7 — REUSAR, não recriar):**
  - **Reusar** o widget existente `src/components/TurnstileWidget.tsx` (ou `src/components/diagnostico/TurnstileWidget.tsx`) — avaliar reuso direto antes de criar qualquer wrapper. Só criar wrapper local se o estilo do modal exigir.
  - Carregar script só quando o modal abre (não no load — performance).
- **DoD:** token presente no payload; ausência de site key não quebra dev; widget reusado (não duplicado).
- **Cobre:** RNF-13 (front), item 7 (reuso).

---

### SPRINT 3 — Integração RD legacy, fallback, captura de origem, sessão

**Objetivo:** Conectar o submit a um endpoint real que persiste o lead, dispara a conversão RD legacy, faz fallback em falha e grava a sessão local. Ao final, um cadastro real cria conversão no RD (modo `rd-station`) ou loga (modo `mock`).

**Entregável:** Fluxo de cadastro real e resiliente (RF-19, RF-20, RF-25, RF-35..RF-40, LOG-01..03).

**Dependências:** S2.3 (schema do form), S2.4 (token Turnstile). Envs RD já no `.env.local`. Decisão D-07 já resolvida (sem deal — N/A). **Bloqueadores de execução:** DEC-1 (empresa), DEC-2 (identificador), DEC-3 (LGPD) confirmados pelo dono; e S3.0 (migração de schema) feita ANTES de S3.2.

> **⚠️ Ordem obrigatória dentro da Sprint 3:** S3.0 (schema) → S3.2 (endpoint) → S3.3 (fallback) → S3.6 (regressão). S3.0 é pré-requisito de qualquer `payload.create({ origem: 'guia-eleicoes' })`.

#### S3.0 — Migração de schema da collection `leads` (NOVO — GAP-A1/A2/DA-4)
- **Como** sistema, **quero** a collection `leads` aceitar leads do guia, **para** que `payload.create` não falhe.
- **Critérios de aceitação:**
  - **Enum `origem` (item 3):** adicionar `{ label: 'Guia Eleições 2026', value: 'guia-eleicoes' }` ao select `origem` em `src/collections/Leads.ts` (hoje só `diagnostico|calculadora|contato|outro`). Sem isso, o create falha validação.
  - **`empresa` required (item 1 / DEC-1):** **abordagem (b)** — manter `empresa: required: true` na collection (preserva as 4 origens), e o endpoint do guia preenche `empresa: '(não informado)'` no create (tratado em S3.2). NÃO tornar opcional sem confirmação do dono (mudança em collection compartilhada).
  - **`rd_sync_status` (item 3 / GAP-A2):** o enum real é `pending|synced|error|mock`. O guia usa **`'error'`** em falha (NÃO `'failed'`, que não existe). Nenhuma alteração de enum necessária — apenas usar o valor certo no código.
  - **Idempotência (item 15 / DEC pendente):** **decisão a registrar** — avaliar `unique: true` ou índice único em `email` na collection `leads` para tornar a idempotência de T-07 "hard". Risco: pode quebrar origens que reusam e-mail (ex.: mesmo lead via diagnóstico e guia). **Default do plano:** NÃO adicionar unique constraint agora (manter upsert por e-mail + guard de client); registrar como débito conhecido igual à Calculadora. **Confirmar com @architect/dono.**
- **Tarefas técnicas:**
  - Editar `src/collections/Leads.ts` (add valor ao enum `origem`).
  - Verificar se o ambiente exige migração de DB (Payload/Postgres) — rodar o que for necessário antes do deploy.
- **DoD:** `payload.create({ collection:'leads', origem:'guia-eleicoes', empresa:'(não informado)' })` persiste sem erro em ambiente local; lint/typecheck verdes.
- **Cobre:** itens 1, 3, 15.

#### S3.1 — Captura de UTM e origem
- **Como** growth, **quero** capturar origem do tráfego, **para** atribuir conversões por canal e medir viralização.
- **Critérios de aceitação:**
  - No load, capturar e gravar em `sessionStorage` (RF-39): `utm_source/medium/campaign/content/term`, `document.referrer`, `landing_page` (URL sem params), `device_type` (mobile/tablet/desktop), `user_agent` resumido.
  - **Interação com o rewrite de subdomínio (GAP-M5):** `landing_page`/`utm` vêm de `window.location` no **client** (vê o host público `/featwork`, não a rota interna `/guia-eleicoes-2026`). Fixar isso no CA. Teste manual pós-deploy (S6) confirma que o `landing_page` capturado é `/featwork`.
  - Persistir mesmo se o usuário navegar/rolar; sobreviver à abertura do modal.
  - Disponibilizados ao submit como `cf_*` (RF-40).
- **Tarefas técnicas:**
  - `_lib/utm.ts` (`captureOrigin()` + `getStoredOrigin()`) — usar `window.location` (client).
  - `_lib/device.ts` (`detectDeviceType()` por viewport/UA).
  - Chamada no `GateProvider` (efeito no mount).
- **DoD:** T-15/T-16 verificáveis; sessionStorage populado no 1º acesso; `landing_page` = `/featwork` pós-deploy.
- **Cobre:** RF-39, RF-40 (captura).

#### S3.2 — Endpoint `/api/guia-eleicoes/lead` + RD legacy + adapter
- **Como** sistema, **quero** um endpoint server que processe o cadastro com segredos protegidos, **para** criar a conversão no RD sem expor tokens.
- **Critérios de aceitação:**
  - `POST /api/guia-eleicoes/lead` recebe `{ nome, email, telefone, perfil, origin{...}, turnstileToken }`.
  - Re-valida com `guiaLeadSchema` (zod) no server (RNF-10); **400** em payload inválido.
  - Verifica Turnstile (RNF-13 server) **reusando `verifyTurnstile()` de `src/lib/security/turnstile.ts`** (item 7) — já faz o `fetch` para `siteverify` e o bypass-dev quando `TURNSTILE_SECRET_KEY` ausente; **403** se inválido.
  - Rate limit 3 req/IP/60s (RNF-12) — **reusa `src/lib/rate-limit.ts`** (item 7): `rateLimit(req, { scope: 'guia-lead', max: 3, windowMs: 60_000 })` + `resolveClientIP(req)`. Mais robusto que o Map inline da Calculadora; **429** quando estoura.
  - **CSRF/Origin — IMPLEMENTAÇÃO NOVA (item 4 / GAP-A4):** NÃO existe verificação de Origin no projeto (não é "reuso"). Implementar checagem de `Origin`/`Host` com **allowlist** contemplando: `https://eleicoes.unfoldgrowth.com.br` (subdomínio público — o request chega por ele sob o rewrite), o apex `https://unfoldgrowth.com.br`, e os domínios de preview da Vercel. Como o subdomínio muda o `Origin` esperado, a allowlist é parametrizada por env (ex.: `GUIA_ALLOWED_ORIGINS`) com defaults seguros. **403** em cross-origin. Nota: Turnstile é defesa primária; `wa.me`/`mailto:` não fazem POST — mas RNF-11 exige a verificação explícita.
  - Credenciais só no server (RNF-15): nada de token no front.
  - **Persiste o lead em Payload** (collection `leads`, `origem: 'guia-eleicoes'`, **`empresa: '(não informado)'`** — DEC-1/GAP-A1) ANTES da sync (persistir-primeiro); dispara conversão RD via novo adapter (fire-and-forget).
  - Log estruturado JSON por submissão: ts ISO, **IP `/24` via novo `anonymizeIp()`** (item 12 / LOG-01 — não existe no projeto), UA, resultado, duração da chamada RD, erro sem PII; via `console` → Vercel Logs (LOG-02).
  - **`ip_address` em `leads` (GAP-B3):** dado o cuidado LGPD do dado político (DEC-3), gravar o IP **anonimizado /24** também no campo persistido `ip_address` (não o IP completo), divergindo do padrão da Calculadora por precaução. Registrar como decisão.
  - Retorna `{ ok, lead_id, mode }` em sucesso.
- **Tarefas técnicas:**
  - `src/app/api/guia-eleicoes/lead/route.ts` (estrutura inspirada em `api/calculadora/route.ts`, **com as correções acima**).
  - `_lib/anonymize-ip.ts` — **novo** `anonymizeIp(ip)` que zera o último octeto (IPv4 `/24`) e trata IPv6 (zera os últimos blocos). Usado no log e no `ip_address`.
  - `src/lib/crm/rd-guia-eleicoes.ts` — novo adapter espelhando `rd-calculadora.ts`:
    - `identificador: 'guia-eleicoes-2026'` (RF-21 / DEC-2 / DESVIO-1 — **valor canônico único**).
    - `nome`, `email`, `celular: normalizeTelefone(telefone)` (dígitos puros, sem `+55` — DESVIO-2).
    - `customFields`: `cf_caminho_do_lead: 'Guia Eleições 2026'`, `cf_perfil_eleitoral_2026` (label exato via mapping), `cf_origem_hotsite: 'guia-eleicoes-2026'`, `cf_utm_source/medium/campaign/content/term`, `cf_lead_referrer`, `cf_lead_data_cadastro` (ISO) (RF-21).
    - `tags`: `['guia-eleicoes-2026', <tag-perfil>]` (RF-22) — `candidato→perfil-candidato`, `equipe-campanha→perfil-equipe-campanha`, `setor→perfil-setor`, `outro→perfil-outro`.
    - Respeita `CRM_MODE` (mock|rd-station).
  - Adicionar `mapPerfilEleitoral()` e os 4 labels exatos em `src/lib/crm/rd-mappings.ts` (labels devem bater 100% com o painel RD — ver §6 pendência crítica e S3.7).
  - **Guarda no hook de `Leads.ts` (item 2 / GAP-A3 / DA-2) — OBRIGATÓRIA, não "a confirmar":** adicionar no TOPO do `afterChange`, logo após o check de `operation`, uma allowlist de origens com sync própria:
    ```ts
    const ORIGENS_COM_SYNC_PROPRIA = ['calculadora', 'guia-eleicoes']
    if (ORIGENS_COM_SYNC_PROPRIA.includes(doc.origem)) return doc
    ```
    Isso impede a dupla conversão (hook `lead_capturado` genérico + adapter dedicado). **Mapear `guia-eleicoes → undefined` no `caminhoMap` NÃO resolve** (o `inferIdentificador` cai em `lead_capturado` e o adapter dispara mesmo assim — confirmado no código). Inclui `'calculadora'` porque ela tem o **mesmo bug latente** (dupla conversão provável hoje). Regressão das 4 origens em S3.6.
- **DoD:** cadastro em `mock` loga payload correto (com IP /24); em `rd-station` cria **uma única** conversão; T-16 verificável; rate limit (429), Turnstile (403) e Origin (403) testados; lint/typecheck verdes.
- **Cobre:** RF-20 (envio), RF-21, RF-22, RF-23 (legacy, Nota A), RF-40 (envio), RNF-10/11/12/13/15, LOG-01, LOG-02, itens 1, 2, 4, 7, 8, 12.

#### S3.3 — Fallback + alerta em falha do RD
- **Como** growth, **quero** não perder leads se o RD cair, **para** reprocessar manualmente depois.
- **Critérios de aceitação:**
  - Em falha do RD (timeout/5xx/credencial inválida), o cadastro **ainda é sucesso para o usuário** (RF-25) — o blur libera normalmente.
  - O lead já fica persistido em Payload com **`rd_sync_status: 'error'`** (item 3 / GAP-A2 — `'failed'` NÃO existe no enum; o enum real é `pending|synced|error|mock`). Fallback de storage = Payload/Postgres (substitui Supabase do PRD).
  - **Lógica de atualização de `leads.rd_sync_status` é NOVA (GAP-A2):** a v1 afirmava "padrão idêntico da Calculadora" — **falso**: a Calculadora atualiza `calculadora-results`, nunca `leads`. Implementar no `.then()` do fire-and-forget: em sucesso `synced`/`mock`, em falha `error` (via `payload.update` no doc do lead).
  - Dispara e-mail de alerta para `ALERT_EMAIL_TO` (D-03) com dados mínimos para reprocesso (RF-25). **Reusa `sendEmail()` de `src/lib/email/adapter.ts`** (item 7 — modos `mock-console`|`resend`, controlado por `EMAIL_MODE` + `RESEND_API_KEY`, ambos já existentes). HTML montado inline; **NÃO criar `alert-guia.ts` do zero**.
- **LOG-03 — procedimento manual definido (item 12 / GAP-M6):** alertas automáticos (erro >5%/10min, RD 5xx >5min, >100 sub/min) = **fase 2 / fora do MVP** (declarado, como o dashboard §10). No MVP:
    - **Dono:** time dev (responsável: o desenvolvedor de plantão da Sprint 6 nas primeiras 48h).
    - **Ferramenta:** Vercel Logs (query por `[guia-lead]` + `result:"error"`).
    - **Janela/frequência:** verificação 2×/dia nas 48h pós-go-live; depois ad-hoc por reclamação.
    - **Gatilho de ação:** qualquer `error` de RD → conferir e-mail de alerta + reprocessar o lead manualmente no painel RD.
- **Tarefas técnicas:**
  - Tratamento `try/catch` no adapter + atualização **nova** de `leads.rd_sync_status` (`'error'` em falha) via `payload.update`.
  - Reuso de `sendEmail()` (adapter existente) com HTML inline para o e-mail de alerta.
  - Fire-and-forget (`void ...then`) para não bloquear a resposta.
- **DoD:** T-19 (falha simulada ainda desbloqueia), T-20 (lead aparece no Payload com `rd_sync_status: 'error'`), T-21 (e-mail de alerta via `sendEmail`) verificáveis; lint/typecheck verdes.
- **Cobre:** RF-25, LOG-03 (procedimento MVP definido), T-19, T-20, T-21, itens 3, 7, 12.

#### S3.4 — Liberação pós-cadastro (wiring do submit ao gate)
- **Como** visitante, **quero** ver o conteúdo desbloquear ao cadastrar, **para** ler imediatamente.
- **Critérios de aceitação:**
  - Submit → loading "Desbloqueando..." + botão desabilitado (anti-duplo-clique, RF-18); duplo clique não cria 2 leads (T-07) — **defesa primária:** guard de "submitting" + botão `disabled` no client; **defesa secundária:** idempotência por e-mail no server (`find`+`create/update`). **Limite conhecido (item 15 / GAP-M4):** dois POSTs verdadeiramente concorrentes podem ambos passar o `find` antes do `create` (race). Sem `unique index` em `leads.email` (decisão S3.0), aceita-se como débito (igual Calculadora). Teste de concorrência em S5.7.
  - Em sucesso: `setUnlocked(true)`, modal fecha, blur sai (RF-9), grava localStorage (S3.5), dispara `lead_capturado` no GA4 (RF-20).
  - Em erro de rede/server: mensagem amigável no modal "Tivemos um problema ao processar seu cadastro. Tente novamente em alguns instantes ou recarregue a página." + log (RF-19).
- **Tarefas técnicas:**
  - Wiring em `LeadForm.tsx`/`GateProvider.tsx`; estado de erro no modal.
- **DoD:** T-07 passa; erro de server mostra mensagem; sucesso libera tudo.
- **Cobre:** RF-18, RF-19, RF-20 (liberação).

#### S3.5 — Sessão e persistência local
- **Como** visitante recorrente, **quero** não refazer o cadastro, **para** voltar direto ao conteúdo.
- **Critérios de aceitação:**
  - Pós-sucesso grava em `localStorage` (RF-35): `hotsite_unlocked: true`, `lead_id` (UUID), `lead_email_hash` (SHA-256 truncado), `lead_perfil`, `cadastro_timestamp` (ISO).
  - No load, se `hotsite_unlocked === true`: pula modal automático, conteúdo desbloqueado, CTAs ativos; dispara `visita_retorno` no GA4 (RF-36, fluxo 8.3).
  - Sem cookies de terceiros — só localStorage + 1ª parte (RF-37).
- **Tarefas técnicas:**
  - `_lib/session.ts` (`saveUnlockSession()`, `getUnlockSession()`, `clearUnlockSession()`).
  - `_lib/hash.ts` (`sha256Truncate8(email)` via Web Crypto `crypto.subtle`).
  - Integração no `GateProvider` (checagem no mount).
- **DoD:** T-10 (recarregar mantém desbloqueado), T-11 (limpar localStorage volta o modal) verificáveis.
- **Cobre:** RF-35, RF-36, RF-37.

#### S3.6 — Regressão das origens existentes + investigação RD da Calculadora (NOVO — item 2 / GAP-A3 / DA-2/T-A4)
- **Como** QA, **quero** garantir que a guarda no hook não quebrou as origens existentes, **para** evitar regressão de produção.
- **Critérios de aceitação:**
  - Com a allowlist `['calculadora','guia-eleicoes']` no `afterChange`, validar que **diagnóstico** e **newsletter-site/diagnostico-optin** continuam sincronizando pelo hook (não estão na allowlist → sync genérica preservada).
  - Validar que **calculadora** e **guia-eleicoes** NÃO disparam o hook genérico (têm sync própria no endpoint) → **uma única** conversão por cadastro.
  - **Investigação (T-A4):** confirmar no painel RD se a Calculadora **já dispara dupla conversão hoje** (`lead_capturado` genérico + `calculadora_concluida`). Documentar o achado; a allowlist conserta isso ao incluir `'calculadora'`. **Reportar ao dono.**
- **Tarefas técnicas:**
  - Teste de unidade/integração do hook com mocks de `syncContact` por origem (4 origens + guia).
  - Checagem manual no painel RD (Calculadora).
- **DoD:** testes das 4 origens verdes; relatório de investigação da Calculadora anexado; sem regressão de sync.
- **Cobre:** item 2 (regressão + investigação).

#### S3.7 — Confirmação operacional dos labels e identificador no painel RD (NOVO — item 9 / DA-3)
- **Como** operação/growth, **quero** os campos personalizados e o identificador existindo no painel RD com texto exato, **para** que a API legacy não descarte valores silenciosamente.
- **Critérios de aceitação (tarefa OPERACIONAL, não de código — bloqueia T-16 real em S6):**
  - Os 4 labels de `cf_perfil_eleitoral_2026` existem no painel RD batendo 100% (acento/hífen/caixa) com `mapPerfilEleitoral()`.
  - `cf_origem_hotsite`, `cf_caminho_do_lead` ("Guia Eleições 2026"), `cf_utm_*`, `cf_lead_referrer`, `cf_lead_data_cadastro` existem.
  - O identificador canônico `guia-eleicoes-2026` (DEC-2) está configurado como gatilho da automação no painel RD.
- **DoD:** checklist de labels assinado pelo responsável do RD antes do go-live (S6).
- **Cobre:** item 9, pendência crítica §6, T-16 (validação real).

---

### SPRINT 4 — CTAs: download, compartilhamento, toast, header, limpar cadastro

**Objetivo:** Ativar todas as funcionalidades pós-desbloqueio: baixar PDF, compartilhar, toast de sucesso, header fixo e reset de cadastro. Com eventos GA4 completos.

**Entregável:** Hotsite com todos os CTAs e tracking funcionando.

**Dependências:** S3 (sessão/gate). PDF gerado do HTML (decisão fechada). OG e textos de share podem usar placeholders até D-05/D-09.

#### S4.1 — Download do PDF (3 pontos + gate + GA4)
- **Critérios de aceitação:**
  - Botão "Baixar PDF" em ≥3 locais (RF-26): header fixo (pós-desbloqueio), CTA após pág. 7 (fim da Parte 00), CTA na pág. 36 (convite final).
  - Autenticado → download direto; não autenticado → abre modal com mensagem "Cadastre-se para baixar o estudo completo em PDF" (RF-27).
  - **PDF estático commitado (item 6 / DA-5):** arquivo `public/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf` (RF-28) — **pré-gerado OFFLINE e commitado**; servido como `/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf` com atributo `download`. **NÃO** gerar no build/runtime — Playwright/Puppeteer **não estão nas deps** e o headless browser é problemático em serverless Vercel. Troca futura = só substituir o asset (sem deploy de código).
  - Evento GA4 `pdf_baixado` com `lead_email` (se em localStorage) e `origem_botao` ("header"|"meio_pagina"|"convite_final") (RF-29).
- **Tarefas técnicas:**
  - `_components/DownloadButton.tsx` (prop `origem`).
  - **Gerar o PDF uma vez, offline/local** (print-to-PDF do Chrome a partir da rota desbloqueada, ou script `tsx` local com Playwright em devDependencies/local — **nunca no build da Vercel**) → commitar em `public/static/`.
  - `_lib/analytics.ts` (wrapper GA4 `track(event, props)` **client-side via `gtag`/GTM** — ver nota de sink GA4 abaixo).
- **DoD:** T-12 (download desktop+mobile) passa; gate redireciona não-autenticado; evento dispara; sem dependência de browser headless no build.
- **Cobre:** RF-26, RF-27, RF-28, RF-29, item 6.

> **Sink dos eventos GA4 (item B2/GAP-B2 — esclarecimento Sprint 4):** os eventos do guia (`pagina_carregada`, `lead_capturado`, `pdf_baixado`, `link_compartilhado`, `visita_retorno`) vão para **GA4 via `gtag`/GTM client-side** (GTM-M43H2LKF já carregado no `layout.tsx`). **NÃO** se cria collection Payload de eventos para o guia (diferente do padrão `calculadora-events`). Simplicidade e zero schema novo.

#### S4.2 — Compartilhamento WhatsApp + e-mail (+ hash + GA4)
- **Critérios de aceitação:**
  - Botões "Compartilhar via WhatsApp" e "Compartilhar por e-mail" junto ao download (RF-30).
  - WhatsApp: `https://wa.me/?text=<msg url-encoded>`, mensagem padrão do RF-31, URL do hotsite com `?utm_source=share&utm_medium=whatsapp&utm_campaign=guia-eleicoes-2026&utm_content=<email-hash>` (RF-31).
  - E-mail: `mailto:?subject=<assunto>&body=<corpo>` com assunto do RF-32 e `utm_medium=email` (RF-32).
  - `utm_content` = SHA-256 truncado (8 chars) do e-mail do compartilhador (RF-33) — reusa `_lib/hash.ts`.
  - Evento GA4 `link_compartilhado` com `canal` ("whatsapp"|"email") e `lead_email_hash` (RF-34).
  - URL base do hotsite = `https://eleicoes.unfoldgrowth.com.br/featwork` (subdomínio fechado) via env `NEXT_PUBLIC_GUIA_URL`.
- **Tarefas técnicas:**
  - `_components/ShareButtons.tsx`.
  - `_lib/share.ts` (`buildWhatsappUrl()`, `buildMailtoUrl()` com UTMs).
- **DoD:** T-13 (WhatsApp app/web), T-14 (e-mail cliente), T-15 (UTMs corretos no link) passam.
- **Cobre:** RF-30, RF-31, RF-32, RF-33, RF-34.

#### S4.3 — Toast pós-cadastro + destaque CTAs + limpar cadastro
- **Critérios de aceitação:**
  - Toast no canto superior (RF-41): ícone ✓ mint, "Pronto! Boa leitura." + subtexto, X, auto-dismiss 6s; estilo coerente com o modal.
  - Em paralelo, destaque/pulsação dos botões download/share por alguns segundos (RF-42). **`prefers-reduced-motion` (item 10):** a pulsação é suprimida sob movimento reduzido (substituir por destaque estático de cor/borda).
  - Botão discreto no rodapé "Limpar meu cadastro deste dispositivo" → `clearUnlockSession()` + recarrega gate (RF-38, boa prática LGPD RNF-14).
- **Tarefas técnicas:**
  - `_components/Toast.tsx` (**reusar `sonner`** já nas deps).
  - `_components/ClearSessionButton.tsx` (rodapé do hotsite).
  - Classe CSS `.guia-cta-highlight` (pulsação) em `guia-blur.css`, com `@media (prefers-reduced-motion: reduce)` que troca a animação por destaque estático.
- **DoD:** T-27 (limpar cadastro) passa; toast aparece/some; pulsação visível.
- **Cobre:** RF-38, RF-41, RF-42, RNF-14 (exclusão local).

#### S4.4 — Header fixo
- **Critérios de aceitação:**
  - Header fixo no topo, visível **só após desbloqueio** (RF-05): logos Unfold + Feat.Work à esquerda, título compacto do guia ao centro, "Baixar PDF" + "Compartilhar" à direita.
  - Em mobile vira hamburger menu (RF-05).
  - Não causa CLS ao aparecer (reservar espaço / `position: fixed`).
- **Tarefas técnicas:**
  - `_components/GuiaHeader.tsx` (consome `unlocked` do GateProvider; embute Download/Share).
- **DoD:** header só aparece pós-desbloqueio; hamburger funcional em 320px.
- **Cobre:** RF-05.

---

### SPRINT 5 — Polimento: acessibilidade, performance, SEO, LGPD-conteúdo, testes

**Objetivo:** Levar o hotsite a padrão de produção: WCAG AA, metas de performance, SEO/OG/sitemap/schema, política/DPO, compatibilidade cross-browser e a suíte de testes T-01..T-27.

**Entregável:** Hotsite aprovado nos testes de aceitação, pronto para deploy.

**Dependências:** S2–S4 completas. D-02 (política), D-04 (DPO), D-05 (OG image) — se pendentes, usar placeholders sinalizados.

#### S5.1 — Acessibilidade WCAG 2.1 AA
- **CA:** contraste mint/navy testado; navegação por teclado completa e tab order coerente; labels semânticos; ARIA no modal (`role/aria-modal/labelledby/describedby`); foco visível; alt em imagens/SVGs; conteúdo bloqueado `aria-hidden="true"` com aviso semântico (RNF-07, RNF-08).
- **Tarefas:** auditoria axe/Lighthouse a11y; ajustes finos; foco visível global no escopo `.guia-doc`.
- **DoD:** T-22 (Accessibility ≥ 90) atingido; navegação 100% por teclado.
- **Cobre:** RNF-07, RNF-08.

#### S5.2 — Performance (Core Web Vitals)
- **CA:** LCP ≤ 2,5s, FCP ≤ 1,5s, CLS ≤ 0,1, TTI ≤ 3,5s em 4G (RNF-01..04); lazy das páginas 20+ validado (RNF-05); fonts swap + fallbacks (RNF-06).
- **CLS do `--guia-scale` (item 14 / DA-4-gap) — OBRIGATÓRIO MEDIR:** `--guia-scale` é default `1` e recalculado em JS pós-hydration. Em mobile, o primeiro paint usa scale=1 e depois "snapa" para o real — `transform: scale()` é compositor-only (não conta), **mas a mudança de `margin-bottom` (que depende de `--guia-scale`) conta no CLS**. **Medir no Lighthouse Mobile real**; se CLS > 0,1, **setar `--guia-scale` inicial no SSR** (estimativa por viewport/User-Agent) ou aceitar como débito declarado se ficar abaixo de 0,1 (conteúdo é below-the-fold após o modal).
- **Tarefas:** medir Lighthouse Mobile; otimizar carga do Turnstile (lazy), do PDF (não pré-carregar), reservar dimensões A4/modal contra CLS; revisar `content-visibility` + interação com blur (DA-6: blur só nas ~6 primeiras páginas); medir e, se preciso, setar `--guia-scale` no SSR.
- **DoD:** T-22 (Performance ≥ 85) atingido; CLS ≤ 0,1 medido no Lighthouse Mobile (ou débito declarado se já <0,1 sem ação).
- **Cobre:** RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, item 14.

#### S5.3 — Privacidade técnica
- **CA:** sem cookies de terceiros; só localStorage/sessionStorage e 1ª parte (RF-37); GA4 configurado sem cross-site.
- **DoD:** auditoria de cookies sem 3rd-party (exceto GA4/GTM conforme política).
- **Cobre:** RF-37 (validação), RNF-09 (preparação para SSL — efetiva em S6).

#### S5.4 — LGPD de conteúdo (política, DPO, base legal do dado político)
- **CA:** link visível para Política de Privacidade (URL de D-02); aviso de tratamento antes do submit (já em S2.3) revisado; e-mail do DPO no rodapé (D-04); texto declarando base legal (legítimo interesse) para o dado "candidato sim/não" (RNF-14) — **tratado como dado sensível por precaução** (ver Riscos).
- **Tarefas:** bloco de rodapé com política + DPO; revisar copy do aviso.
- **DoD:** T-26 (política acessível) passa.
- **Cobre:** RNF-14 (conteúdo).

#### S5.5 — Compatibilidade cross-browser/dispositivo
- **CA:** Chrome/Edge, Safari (+iOS), Firefox, Samsung Internet — últimas 2 majors (RNF-16); funcional em 320px (RNF-17).
- **Tarefas:** teste manual matriz de navegadores; testes 320/768/1280.
- **DoD:** T-02, T-03, T-24 passam.
- **Cobre:** RNF-16, RNF-17.

#### S5.6 — SEO, Open Graph, sitemap, schema
- **CA:** `<title>` e `<meta description>` 150–160 chars (RNF-18, title já em S1); OG completo (og:title/description/image/url/type) + Twitter Card `summary_large_image`; OG image 1200×630 (D-05) (RNF-18); sitemap.xml + robots.txt (RNF-19); Schema.org Article (RNF-20).
- **`metadataBase`/OG → subdomínio (item 13 / DA-3-gap) — BUG A CORRIGIR:** hoje `src/app/guia-eleicoes-2026/layout.tsx` (linha 42) tem `metadataBase = NEXT_PUBLIC_SITE_URL` (**apex**) — gera OG/canonical com URL errada (`unfoldgrowth.com.br/...`) servindo no subdomínio. **Corrigir para `new URL(NEXT_PUBLIC_GUIA_URL)`** (= `https://eleicoes.unfoldgrowth.com.br/featwork`) e adicionar `alternates.canonical` apontando para o subdomínio.
- **Sitemap (item 13):** `src/app/sitemap.ts` usa `BASE_URL = NEXT_PUBLIC_SITE_URL`. Adicionar entrada do guia **com a URL do subdomínio** (`NEXT_PUBLIC_GUIA_URL`), **não** a rota interna `/guia-eleicoes-2026`. `robots.ts` já faz `disallow: ['/api/', ...]` → `/api/guia-eleicoes/` já coberto (OK).
- **Tarefas:** corrigir `metadataBase` + `alternates.canonical` no `layout.tsx`/`page.tsx`; `public/og-guia-eleicoes.png`; entrada de sitemap com `NEXT_PUBLIC_GUIA_URL`; JSON-LD Article no `page.tsx`.
- **DoD:** OG validado no debugger do WhatsApp/LinkedIn (URL do subdomínio correta); sitemap inclui o guia com a URL do subdomínio.
- **Cobre:** RNF-18, RNF-19, RNF-20, item 13.

#### S5.7 — Suíte de testes automatizados (Vitest)
- **CA:** testes unitários cobrem a lógica pura testável (ver mapeamento §5): validação do form, máscara de telefone, mapping de perfil→tag/label, builders de UTM/share, hash truncado, montagem do payload RD, normalização de telefone, **`anonymizeIp` /24**; teste do endpoint `/api/guia-eleicoes/lead` (mock RD/Turnstile/Payload) cobrindo sucesso, payload inválido, falha RD→fallback, rate limit.
- **Cenários NOVOS obrigatórios (item 16 / §4 QA):**
  1. **Modal NÃO reabre 2ª vez** na mesma sessão (RF-13 "uma única vez") — testar a flag `modal_reaberto_30s`.
  2. **`prefers-reduced-motion`** — blur (RF-09) e pulsação (RF-42) sem animação sob `reduce` (teste de classe CSS aplicada / matchMedia mock).
  3. **localStorage corrompido/parcial** — `getUnlockSession()` robusto a `hotsite_unlocked` presente sem `lead_id`, ou JSON inválido (não quebra; trata como não-desbloqueado).
  4. **Falha de rede do POST** (fetch do client falha, distinto de T-19) — RF-19 mostra mensagem amigável; sem desbloqueio.
  5. **Submissão concorrente real** (não só rage-click sequencial) — reforça T-07/GAP-M4 (documenta o débito de race se sem unique index).
  6. **Telefone fixo 10 dígitos** (DDD+8) — valida/exibe `(00) 0000-0000`; `<10` bloqueia (complementa T-05).
  7. **Persistência do lead do guia** (item 1/GAP-A1) — teste de integração do endpoint confirmando que o lead persiste com `empresa: '(não informado)'` SEM erro de validação do Payload.
  8. **Respostas 400 (Zod) e 403 (Turnstile rejeitado + Origin inválido)** do endpoint — unit tests do path de rejeição (mockar `verifyTurnstile` retornando `ok:false` e Origin fora da allowlist).
- **Tarefas:** `_lib/__tests__/*.test.ts` e `src/lib/crm/rd-guia-eleicoes.test.ts` + teste de integração do route handler + teste do hook de `Leads` (S3.6).
- **DoD:** `npm test` verde (sem regressão); os 8 cenários novos cobertos; cobertura das funções puras críticas.
- **Cobre:** infra de validação de T-04..T-07, T-15..T-21, T-23 (path server), item 16.

---

### SPRINT 6 — Deploy + Subdomínio `eleicoes.unfoldgrowth.com.br/featwork`

(Seção completa em §4.)

---

## 4. Sprint 6 — Deploy + Subdomínio (detalhada + passo a passo operacional)

**Objetivo:** Publicar o hotsite no subdomínio real `eleicoes.unfoldgrowth.com.br/featwork`, com DNS no Cloudflare, domínio na Vercel, rewrite do subdomínio para a rota interna, SSL ativo, envs de produção e Navbar apontando para o subdomínio.

**Decisão arquitetural-chave (DA-1 — CRÍTICA):** implementar TUDO no **`src/middleware.ts` EXISTENTE** (estendido), **não** via `next.config` rewrites por host. O `next.config` já tem o redirect www→apex; misturar rewrite+redirect+host por lá fica frágil e colide com a ordem de regras. No middleware, com **guarda de host no corpo**, tudo fica num arquivo testável.

> **⚠️ Por que guarda de host NO CORPO e não no matcher (item 5 / Gap arq. #1):** o `config.matcher` do Next filtra por **path, não por host**. Como `/` e `/featwork` existem tanto no apex quanto no subdomínio, ampliar o matcher faz o middleware rodar **também** no apex (`unfoldgrowth.com.br/`). É **tecnicamente impossível** restringir o matcher por host. A única defesa real é ramificar por `request.headers.get('host')` dentro da função e retornar `NextResponse.next()` imediatamente para o apex.

#### S6.1 — Rewrite por hostname via middleware estendido (item 5 / DA-1)
- **CA:**
  - Requisições a `eleicoes.unfoldgrowth.com.br/featwork[/...]` renderizam a rota interna `/guia-eleicoes-2026` (rewrite, URL na barra permanece `/featwork`).
  - `eleicoes.unfoldgrowth.com.br/` (raiz do subdomínio) → **redirect 308** para `/featwork`.
  - `unfoldgrowth.com.br/guia-eleicoes-2026` (apex) → **redirect 301** para `https://eleicoes.unfoldgrowth.com.br/featwork` (canonical único, evita conteúdo duplicado).
  - **Apex intacto:** para `host !== 'eleicoes.unfoldgrowth.com.br'`, o middleware cai imediatamente no fluxo existente (share rate-limit + auth do painel). `unfoldgrowth.com.br/` carrega normal e **NÃO** redireciona.
  - API `/api/guia-eleicoes/*` acessível sob o subdomínio **sem rewrite e fora do matcher** — preserva same-origin para CSRF/Turnstile (RNF-11). **NÃO** adicionar `/api/:path*` ao matcher.
- **Tarefas técnicas (EDIÇÃO de `src/middleware.ts`, não criação):**
  - **Estender `config.matcher`** (hoje `['/admin/:path*','/painel/:path*','/diagnostico/r/:path*','/ferramentas/calculadora-trafego/r/:path*']`) adicionando **`'/'`, `'/featwork/:path*'`, `'/featwork'` e `'/guia-eleicoes-2026'`** (este último para o canonical apex→subdomínio). **Manter os 4 existentes intactos.** NÃO usar catch-all `/:path*`.
  - **Guarda de host no início da função:**
    ```ts
    const host = request.headers.get('host') || ''
    const isGuiaSubdomain = host === 'eleicoes.unfoldgrowth.com.br'
    if (isGuiaSubdomain) {
      if (pathname === '/') return NextResponse.redirect(new URL('/featwork', request.url), 308)
      if (pathname === '/featwork' || pathname.startsWith('/featwork/')) {
        const rest = pathname.replace(/^\/featwork/, '') || ''
        return NextResponse.rewrite(new URL(`/guia-eleicoes-2026${rest}`, request.url))
      }
    }
    // canonical apex→subdomínio
    if (!isGuiaSubdomain && pathname === '/guia-eleicoes-2026') {
      return NextResponse.redirect('https://eleicoes.unfoldgrowth.com.br/featwork', 301)
    }
    // ... resto do middleware existente (share rate-limit, painel auth) ...
    ```
  - Edge runtime: a guarda/redirects são triviais e compatíveis; **não importar nada Node-only** (já é o caso).
- **DoD:** em preview/produção, os 4 comportamentos (rewrite `/featwork`, redirect raiz subdomínio, canonical apex, apex intacto) verificados; regressão do apex em S6.5.
- **Cobre:** item 5, decisão de subdomínio (fechada), parte de RNF-09 (HTTPS após domínio).

#### S6.5 — Teste de não-regressão do apex (NOVO — item 5 / DA-2/T-A2)
- **Como** QA, **quero** garantir que ampliar o matcher não quebrou o site principal, **para** evitar incidente em produção.
- **CA:** após estender o matcher (que agora roda em `/` do apex também), validar em preview/prod que **carregam normalmente e NÃO redirecionam/reescrevem**: `unfoldgrowth.com.br/` (home), `/diagnostico`, `/painel` (auth segue), `/diagnostico/r/...`, `/ferramentas/calculadora-trafego/r/...`. Este é o ponto onde "o rewrite por host quebra o site principal" se materializaria.
- **DoD:** checklist das rotas do apex verde; `npm test` (se houver teste de middleware) verde.
- **Cobre:** item 5 (não-regressão do apex).

#### S6.2 — Navbar → subdomínio
- **CA:** o item NAV "Guia Eleições" em `src/components/layout/Navbar.tsx` (linha 49) passa a apontar para `https://eleicoes.unfoldgrowth.com.br/featwork` (link externo, `target` conforme padrão do projeto), substituindo `/guia-eleicoes-2026`.
- **DoD:** clique na Navbar leva ao subdomínio.
- **Cobre:** atualização de navegação (decisão fechada).

#### S6.3 — Variáveis de ambiente de produção (Vercel)
- **CA:** configurar no projeto Vercel (Production):
  - `CRM_MODE=rd-station`, `RD_STATION_PUBLIC_TOKEN` (já existe), demais `RD_STATION_*`.
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
  - `NEXT_PUBLIC_GA4_MEASUREMENT_ID` / GTM (já existe `GTM-M43H2LKF`).
  - `NEXT_PUBLIC_GUIA_URL=https://eleicoes.unfoldgrowth.com.br/featwork` (alimenta share/UTM **e** `metadataBase`/canonical/sitemap — item 13, valor único).
  - `ALERT_EMAIL_TO` (D-03) + **`EMAIL_MODE=resend` + `RESEND_API_KEY`** (reuso do `email/adapter.ts` — item 7).
  - **`GUIA_ALLOWED_ORIGINS`** (item 4 / CSRF) — allowlist de Origins aceitos pelo endpoint: subdomínio + apex + previews Vercel.
- **DoD:** `vercel env` lista todas; build de produção não falha por env ausente.
- **Cobre:** RNF-15 (envs no server), RF-25 (alerta), RNF-11 (allowlist), itens 4, 7, 13.

#### S6.4 — Passo a passo operacional para o dono (Cloudflare + Vercel)

**A. Vercel — adicionar o domínio**
1. Painel Vercel → projeto `unfold-site-oficial` → **Settings → Domains**.
2. **Add Domain** → digitar `eleicoes.unfoldgrowth.com.br` → Add.
3. A Vercel exibirá a instrução DNS. Para subdomínio, a Vercel pede um **CNAME** apontando para `cname.vercel-dns.com` (ou um registro A para `76.76.21.21` se CNAME não for possível). Anotar o valor exibido.

**B. Cloudflare — criar o registro DNS**
4. Cloudflare → zona `unfoldgrowth.com.br` → **DNS → Records → Add record**.
5. Tipo **CNAME**, Name `eleicoes`, Target `cname.vercel-dns.com` (o que a Vercel indicou).
6. **Proxy status: DNS only (nuvem CINZA, proxy OFF).** Importante: com o proxy laranja da Cloudflare ligado, a emissão do SSL da Vercel e o roteamento podem conflitar. Manter **DNS only** para o subdomínio gerenciado pela Vercel. (Se o time exigir o proxy Cloudflare, usar modo "Full (strict)" e validar com @devops — fora do default.)
7. Salvar.

**C. Verificação na Vercel**
8. Voltar em Vercel → Domains: aguardar status **Valid Configuration** (propagação DNS de minutos a ~1h).
9. A Vercel emite o **certificado SSL automaticamente** (Let's Encrypt) assim que o DNS valida — HTTPS ativo sem ação manual (RNF-09).

**D. Rewrite/redirect (já em código — S6.1, middleware estendido)**
10. Deploy da branch com o middleware estendido. Confirmar:
    - `https://eleicoes.unfoldgrowth.com.br/featwork` mostra o guia (URL permanece `/featwork`).
    - `https://eleicoes.unfoldgrowth.com.br/` → 308 `/featwork`.
    - `https://unfoldgrowth.com.br/guia-eleicoes-2026` → 301 subdomínio (canonical).
    - **Não-regressão do apex (S6.5):** `unfoldgrowth.com.br/`, `/diagnostico`, `/painel`, `/diagnostico/r/...` carregam normal e **não** redirecionam.
    - PDF estático em `/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf` baixa corretamente.
    - SSL cadeado válido no navegador.

**E. Variáveis de ambiente**
11. Vercel → Settings → Environment Variables → adicionar as de S6.3 em **Production** → redeploy.

**F. Pós-deploy**
12. Trocar `CRM_MODE=rd-station` (se ainda em mock) e fazer um cadastro de teste real → confirmar a conversão `guia-eleicoes-2026` no painel RD em até 60s (T-01).
13. Validar OG com o debugger do WhatsApp/LinkedIn na URL do subdomínio.
14. Atualizar a Navbar (S6.2) e fazer deploy final.

- **DoD:** subdomínio no ar com SSL, rewrite e redirect corretos; cadastro real chega ao RD; Navbar atualizada.
- **Cobre:** RNF-09, decisão de subdomínio (fechada), D-01 (resolvido).

---

## 5. Mapeamento dos Testes de Aceitação T-01..T-27

| Teste | Descrição (resumo) | Sprint que valida | Tipo |
|-------|--------------------|-------------------|------|
| T-01 | Cadastro desktop Chrome → RD em ≤60s | S6 (prod, modo rd-station) | Manual |
| T-02 | Cadastro iPhone Safari → RD | S5.5 / S6 | Manual |
| T-03 | Cadastro Android Chrome → RD | S5.5 / S6 | Manual |
| T-04 | E-mail inválido bloqueia submit | S2.3 | Auto (Vitest) + Manual |
| T-05 | Telefone <10 dígitos bloqueia submit | S2.3 | Auto + Manual |
| T-06 | Perfil obrigatório bloqueia submit | S2.3 | Auto + Manual |
| T-07 | Submit duplo não cria 2 leads | S3.4 | Auto (idempotência) + Manual |
| T-08 | Fechar e reabrir modal via CTA fixo | S2.2 | Manual |
| T-09 | ESC fecha o modal | S2.2 | Manual |
| T-10 | Recarregar mantém desbloqueado | S3.5 | Manual |
| T-11 | Limpar localStorage faz modal voltar | S3.5 | Manual |
| T-12 | Download PDF desktop+mobile | S4.1 | Manual |
| T-13 | Share WhatsApp abre app/web | S4.2 | Manual |
| T-14 | Share e-mail abre cliente | S4.2 | Manual |
| T-15 | Link compartilhado com UTMs corretos | S4.2 | Auto (builder) + Manual |
| T-16 | UTMs de entrada chegam ao RD | S3.1/S3.2 | Auto (payload) + Manual |
| T-17 | Lead "candidato" cria oportunidade no CRM | ⛔ N/A — **reinterpretado:** valida que a conversão com tag `perfil-candidato` chega ao RD e dispara a automação (deal criado pela automação, não pela app). | Manual (no painel RD) |
| T-18 | Lead "outro" NÃO cria oportunidade | ⛔ N/A — **reinterpretado:** valida que a automação do RD não cria deal para `perfil-outro` (regra configurada no painel RD, fora do código). | Manual (painel RD) |
| T-19 | Falha RD simulada ainda desbloqueia | S3.3 | Auto (endpoint) + Manual |
| T-20 | Lead em fallback aparece (Payload, não Supabase) | S3.3 | Auto + Manual |
| T-21 | E-mail de alerta em fallback | S3.3 | Manual |
| T-22 | Lighthouse Mobile Perf ≥85, A11y ≥90 | S5.1/S5.2 | Manual (Lighthouse) |
| T-23 | Captcha bloqueia bot | S2.4/S3.2 | Manual |
| T-24 | Responsivo/legível 320/768/1280 | S5.5 | Manual |
| T-25 | 37 páginas carregam | S1 (✅) — revalidar S5 | Manual |
| T-26 | Política de Privacidade acessível | S5.4 | Manual |
| T-27 | "Limpar cadastro" funciona | S4.3 | Auto (session) + Manual |
| **T-28** | Modal NÃO reabre 2ª vez na mesma sessão (RF-13) | S5.7 / S2.2 | Auto (flag) + Manual |
| **T-29** | `prefers-reduced-motion` suprime blur (RF-09) e pulsação (RF-42) | S5.7 / S2.1 / S4.3 | Auto (CSS/matchMedia) + Manual |
| **T-30** | localStorage corrompido/parcial não quebra `getUnlockSession` | S5.7 / S3.5 | Auto |
| **T-31** | Falha de rede do POST (fetch client falha) → mensagem amigável (RF-19) | S5.7 / S3.4 | Auto + Manual |
| **T-32** | Submissão concorrente real (race) — reforço de T-07 | S5.7 | Auto |
| **T-33** | Telefone fixo 10 dígitos valida/exibe; <10 bloqueia | S5.7 / S2.3 | Auto |
| **T-34** | Lead do guia persiste com `empresa: '(não informado)'` sem erro (GAP-A1) | S5.7 / S3.0/S3.2 | Auto (integração) |
| **T-35** | Endpoint responde 400 (Zod) / 403 (Turnstile + Origin) | S5.7 / S3.2 | Auto |
| **T-36** | Não-regressão do apex após estender o matcher do middleware | S6.5 | Manual |
| **T-37** | `anonymizeIp` zera octeto /24 (IPv4) e blocos IPv6 (LOG-01) | S5.7 / S3.2 | Auto |

**Estratégia:** lógica pura e endpoint → **Vitest** (já no projeto). Interações de DOM/modal/blur, downloads, share, cross-browser, Lighthouse e confirmação no painel RD → **manual** (T-22/T-23 dependem de ferramentas externas; T-17/T-18 dependem da configuração de automação no RD, fora do código). **T-23 ganha path automatizado** (unit test de `verifyTurnstile` retornando `ok:false`), complementando o manual.

---

## 6. Pendências externas D-01..D-10

| ID | Pendência | Status | Bloqueia | Fallback |
|----|-----------|--------|----------|----------|
| D-01 | Domínio do hotsite | ✅ **Resolvido** — `eleicoes.unfoldgrowth.com.br/featwork` (fechado) | S6 | — |
| D-02 | Texto da Política de Privacidade | 🔴 Pendente (Gabriel) | S5.4 (link/URL) | Usar política geral Unfold + placeholder de URL; trocar antes do go-live |
| D-03 | E-mail para alertas de fallback | 🔴 Pendente | S3.3 (`ALERT_EMAIL_TO`) | Apontar provisoriamente para e-mail do time dev; trocar em S6.3 |
| D-04 | E-mail do DPO (LGPD) | 🔴 Pendente | S5.4 (rodapé) | Placeholder até definição |
| D-05 | Imagem Open Graph 1200×630 | 🔴 Pendente (design) | S5.6 (OG real) | Gerar OG provisório a partir da capa do guia |
| D-06 | IDs de estágio/responsável no RD CRM | ⛔ **N/A** — sem criação de deal (automação do RD cuida) | — | — |
| D-07 | Criação de oportunidade no CRM | ✅ **Resolvido** — N/A (decisão fechada: automação do RD) | — | — |
| D-08 | PDF InDesign vs HTML | ✅ **Resolvido** — gerar do HTML agora; design substitui depois | S4.1 | É o próprio fallback |
| D-09 | Texto exato dos botões de share | 🟡 Pendente (validar com Gabriel/Bruno) | S4.2 (copy final) | Usar a redação proposta no RF-31/RF-32; ajustar texto sem mexer na lógica |
| D-10 | Cor exata feat.work `#00E649` | 🟡 Pendente (Feat.Work) | Visual (S2/S5) | Usar valor atual do mockup; é variável CSS — troca trivial |

**Pendência adicional crítica (não no PRD, mas decorrente da decisão RD legacy):** os **labels exatos** dos campos personalizados no painel RD precisam existir e bater 100% (acento/hífen/caixa) — `cf_perfil_eleitoral_2026` (4 opções), `cf_origem_hotsite`, `cf_utm_*`, `cf_lead_referrer`, `cf_lead_data_cadastro`, e o valor de `cf_caminho_do_lead` ("Guia Eleições 2026"). Sem isso, o RD **descarta silenciosamente** o valor (ver comentário em `rd-mappings.ts`). **Bloqueia a validação real de T-16 em S6.** Criar/confirmar no painel RD antes do go-live (tarefa de operação, não de código).

---

## 7. Riscos e mitigações (específicos desta entrega)

| Risco | Impacto | Prob. | Mitigação |
|-------|---------|-------|-----------|
| **Subdomínio/DNS:** proxy Cloudflare (laranja) conflita com SSL/roteamento Vercel | Alto (site fora/SSL inválido) | Média | Manter **DNS only** no CNAME `eleicoes`; se exigirem proxy, Full (strict) + validação @devops. Passo a passo em §6.4. |
| **Matcher do middleware roda no apex `/`** (impossível filtrar por host no matcher) → risco de quebrar o site principal | Alto | Média | Guarda de host **no corpo** do middleware (DA-1); retorno imediato `next()` para o apex; **teste de não-regressão do apex (S6.5/T-36)** antes de prod. |
| **Plano Basic do RD** não cria deal | Médio | Certo | Decisão fechada: automação do RD cria a negociação a partir da conversão `guia-eleicoes-2026`. T-17/T-18 reinterpretados como validação de tag + automação (manual no painel). |
| **Labels RD divergentes** → valores descartados silenciosamente | Médio | Alta | Confirmar labels exatos no painel antes do go-live; mapping centralizado em `rd-mappings.ts`; teste de payload em Vitest. |
| **Captcha (Turnstile)** site/secret key não prontas | Médio | Média | Modo bypass em dev se key ausente; obter keys antes de S3.2/S6. |
| **PDF fallback** com tipografia inferior (fontes substitutas) | Baixo | Alta | Aceito (decisão fechada); design substitui depois. **Asset estático commitado** (item 6/DA-5 — NÃO Playwright no build); nome/rota estáveis para troca sem deploy de código (só asset). |
| **LGPD do dado de perfil (DEC-3)** pode ser dado sensível (opinião política, art. 5º II) | Alto (jurídico) | Média | Default: legítimo interesse + cautela (S5.4). IP gravado /24 (GAP-B3). **Validar com jurídico/DPO**: se "intenção de candidatura" for sensível, exigir consentimento explícito (não só aviso). **Condição de go-live — decisão do dono.** |
| **Performance** das 37 páginas + blur + modal | Médio | Média | Lazy `content-visibility` (S1), Turnstile/PDF lazy, medir Lighthouse em S5.2. |
| **Submit duplicado / spam** | Médio | Alta | Rate limit 3/IP/60s (`rate-limit.ts`) + Turnstile + idempotência por e-mail (upsert) + procedimento manual LOG-03 definido (S3.3). |
| **Rate limit in-memory** não compartilha entre instâncias serverless da Vercel | Baixo | Média | Aceito como débito (igual Calculadora); Turnstile é a defesa primária. Migrar para Vercel KV pós go-live se necessário. |
| **Hook de `Leads` dispara dupla sync ao RD** (genérica `lead_capturado` + adapter dedicado) | Alto | **Certo** | **Decisão FECHADA (não "a confirmar"):** guarda no topo do `afterChange` com allowlist `['calculadora','guia-eleicoes']` que pula a sync genérica (S3.2). Mapear no `caminhoMap` **NÃO** resolve (confirmado no código). Inclui `'calculadora'` — corrige bug latente de produção. Regressão das 4 origens + investigação RD da Calculadora (S3.6). |
| **`rd_sync_status: 'failed'` fora do enum** quebra o `payload.update` | Médio | **Certo** | Usar `'error'` (enum real `pending|synced|error|mock`). Lógica de update em `leads` é nova (S3.3), não reuso da Calculadora. |
| **`empresa` required** quebra `payload.create` do guia | Alto | **Certo** | Default `empresa: '(não informado)'` no create do guia (DEC-1/S3.0/S3.2); collection inalterada para as outras origens. Teste de integração T-34. |
| **CSRF/Origin (RNF-11) inexistente no projeto** — não é reuso | Médio | Certo | Implementação nova (S3.2) com allowlist `GUIA_ALLOWED_ORIGINS` (subdomínio+apex+previews); Turnstile como defesa primária. |

---

## 8. Checklist final de completude (varredura seção por seção do PRD)

- **§1 Resumo executivo** — gate, blur, form 4 campos, download, share, RD, viralização: cobertos S2–S4. ✅
- **§2 Objetivos/métricas** — eventos GA4 (`pagina_carregada`, `lead_capturado`, `pdf_baixado`, `link_compartilhado`, `visita_retorno`) cobrem o instrumental das métricas: S3/S4. Dashboard interno = §10 fora de escopo. ✅
- **§3 Escopo** — todos os itens "dentro do escopo" mapeados; itens "fora" respeitados (sem admin, sem login real, só pt-BR, PDF estático, sem A/B, só `wa.me`). ✅
- **§3.3 Considerações** — PDF do HTML (decisão fechada), go-live antes da divulgação (Sprint 6), jornada via link compartilhado. ✅
- **§4 Personas/cenários** — Cenários 1–4 cobertos: mídia paga (UTM S3.1), compartilhamento (S4.2), retorno (S3.5), fechar sem cadastrar (S2.2). ✅
- **§5 Requisitos funcionais RF-01..RF-42** — matriz §2.1; único N/A = RF-24 (deal). ✅
- **§5.5 RD Station** — reinterpretado para legacy (Nota A); fallback (S3.3). ✅
- **§6 RNF-01..RNF-20** — matriz §2.2; todos mapeados. ✅
- **§7 Arquitetura** — Opção A (Next.js/Vercel) já é o projeto; storage de fallback = **Payload/Postgres** (não Supabase); captcha Turnstile; estrutura de pastas adaptada ao App Router (`src/app/guia-eleicoes-2026/`). ✅ (desvios declarados)
- **§7.3 Envs** — mapeadas em S6.3 (RD legacy substitui OAuth/CRM envs; Supabase substituído por Payload). ✅
- **§8 Fluxos de tela** — 8.1 principal (S2–S4), 8.2 fechar sem cadastrar (S2.2), 8.3 retorno (S3.5), 8.4 falha RD (S3.3). ✅
- **§9 Logging LOG-01..03** — S3.2 (log estruturado + `anonymizeIp` /24), S3.3 (alerta); LOG-03 automático = fase 2; MVP com procedimento manual (dono/ferramenta/janela definidos). ✅
- **§10 Dashboard interno** — fora de escopo (fase 2), declarado; dados já em Payload permitem extensão futura. ✅ (não no MVP)
- **§11 Testes T-01..T-37** — mapeados §5; T-17/T-18 reinterpretados; T-28..T-37 adicionados pós-auditoria. ✅
- **§12 Cronograma** — replanejado em 5 sprints (2→6) sobre a Sprint 1 entregue. ✅
- **§13 Riscos** — ampliados em §7 com subdomínio/DNS, LGPD político, labels RD, hook duplo. ✅
- **§14 Pendências D-01..D-10** — §6; D-01/D-06/D-07/D-08 resolvidos, demais com fallback. ✅
- **§15 Anexos** — Anexo A (HTML) já portado S1; Anexo B (wireframes) substituídos pela especificação visual do PRD nos CAs; Anexo C (docs API) — usamos legacy. ✅

**Conclusão:** nenhuma seção do PRD sem cobertura ou justificativa explícita.

---

## Apêndice — Inventário de arquivos a criar/alterar (referência rápida)

**Criar:**
- `src/app/guia-eleicoes-2026/_components/`: `GateProvider.tsx`, `BlurOverlay.tsx`, `LeadModal.tsx`, `LeadForm.tsx`, `StickyUnlockButton.tsx`, `DownloadButton.tsx`, `ShareButtons.tsx`, `Toast.tsx`, `GuiaHeader.tsx`, `ClearSessionButton.tsx` — **(NÃO criar `TurnstileWidget.tsx`: reusar `src/components/TurnstileWidget.tsx` existente — item 7)**
- `src/app/guia-eleicoes-2026/_lib/`: `validation.ts`, `phone-mask.ts`, `utm.ts`, `device.ts`, `session.ts`, `hash.ts`, `analytics.ts`, `share.ts`, **`anonymize-ip.ts`** (LOG-01 /24 — item 12)
- `src/app/guia-eleicoes-2026/_content/guia-blur.css` (com bloco `@media (prefers-reduced-motion: reduce)` — item 10)
- `src/app/api/guia-eleicoes/lead/route.ts`
- `src/lib/crm/rd-guia-eleicoes.ts` (+ testes)
- `public/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf` **(asset estático pré-gerado offline e commitado — item 6, NÃO gerado no build)**, `public/og-guia-eleicoes.png`

**Alterar (reuso máximo):**
- `src/lib/crm/rd-mappings.ts` (add `mapPerfilEleitoral` + 4 labels exatos)
- `src/collections/Leads.ts` (add `origem: 'guia-eleicoes'` ao enum **+ guarda allowlist `['calculadora','guia-eleicoes']` no topo do `afterChange`** — item 2/3)
- `src/middleware.ts` (**EDITAR** — estender matcher + guarda de host + rewrite/redirects — item 5; **não** `next.config`)
- `src/components/layout/Navbar.tsx` (linha 49 → subdomínio)
- `src/app/guia-eleicoes-2026/layout.tsx` / `page.tsx` (OG, schema, **`metadataBase`→`NEXT_PUBLIC_GUIA_URL`** + `alternates.canonical` — item 13)
- `src/app/sitemap.ts` (entrada do guia com a URL do subdomínio — item 13)

**Reusar sem alterar (item 7):** `src/lib/security/turnstile.ts` (`verifyTurnstile`), `src/lib/rate-limit.ts` (`rateLimit`+`resolveClientIP`), `src/lib/email/adapter.ts` (`sendEmail`), `src/components/TurnstileWidget.tsx`.

---

## 9. Changelog v1 → v2 (revisão pós-auditoria QA + Architect, 2026-06-01)

Os 16 pontos consolidados das auditorias, com o que mudou e onde. Rastreabilidade resumida em §2.4.

| # | Mudança v1→v2 | Onde |
|---|---------------|------|
| 1 | **`empresa` required (GAP-A1):** v1 não mencionava; v2 define **S3.0** (migração) + create do guia com `empresa: '(não informado)'` (DEC-1). Novo teste T-34. | Cabeçalho (DEC-1), S3.0, S3.2, T-34 |
| 2 | **Dupla conversão RD (GAP-A3/DA-2):** v1 propunha `caminhoMap → undefined` (não funciona) e classificava risco como "Médio/Média, a confirmar". v2 fecha a **guarda allowlist `['calculadora','guia-eleicoes']` no topo do `afterChange`** (obrigatória), eleva risco a **Certo**, inclui `'calculadora'` (corrige bug latente), e adiciona **S3.6** (regressão 4 origens + investigação RD da Calculadora). | S3.2, S3.6, Riscos, §2.4 |
| 3 | **Enum `rd_sync_status` (GAP-A2):** v1 usava `'failed'` (inexistente). v2 usa **`'error'`** (enum real) e descreve a lógica **nova** de update em `leads` (a v1 afirmava falsamente "padrão idêntico da Calculadora"). Add `'guia-eleicoes'` ao enum `origem`. | S3.0, S3.3, Resumo exec. |
| 4 | **CSRF/Origin (GAP-A4):** v1 marcava como "reuso da Calculadora" (não existe). v2 especifica **implementação nova** com allowlist `GUIA_ALLOWED_ORIGINS` (subdomínio+apex+previews), considerando a mudança de Origin pelo subdomínio. | S3.2, RNF-11, S6.3 |
| 5 | **Subdomínio (DA-1):** v1 deixava aberto next.config vs middleware. v2 fecha **`middleware.ts` EXISTENTE estendido**, com **guarda de host no corpo** (matcher não filtra host), matcher ampliado (`/`, `/featwork*`, `/guia-eleicoes-2026`) sem catch-all, e **S6.5** (não-regressão do apex, T-36). Cloudflare DNS-only detalhado. | S6.1, S6.5, Riscos |
| 6 | **PDF (DA-5):** v1 sugeria Playwright print-to-PDF no build (deps inexistentes). v2 fixa **asset estático pré-gerado offline e commitado** em `public/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf` (RF-28). | S4.1, Apêndice, Riscos |
| 7 | **Reuso (GAP-B1/DA-9):** v2 reusa `turnstile.ts` (`verifyTurnstile`), `rate-limit.ts` (`rateLimit`/`resolveClientIP`), `email/adapter.ts` (`sendEmail`) e o `TurnstileWidget` existente — em vez de "criar". | S2.4, S3.2, S3.3, Apêndice |
| 8 | **identifier/`+55` (GAP-M1/M2):** v2 declara **DESVIO-1** (identificador canônico `guia-eleicoes-2026`, DEC-2) e **DESVIO-2** (`+55` descartado) como fonte única documentada. | Nota A, Cabeçalho (DEC-2) |
| 9 | **Labels RD (DA-3):** v2 vira tarefa operacional explícita **S3.7** que bloqueia T-16/go-live. | S3.7, §6 |
| 10 | **`prefers-reduced-motion`:** ausente na v1. v2 adiciona à transição de blur (RF-09), pulsação CTA (RF-42) e animações do modal. Novo teste T-29. | S2.1, S2.2, S4.3, T-29 |
| 11 | **DoD:** v1 só pedia `npm test` na S5. v2 adiciona **DoD global** (`lint` + `tsc --noEmit` + `npm test` verdes) a TODAS as sprints. | §3 (DoD global) |
| 12 | **LOG-01/03 (GAP-M6):** v2 adiciona o **utilitário `anonymizeIp` /24** (não existia) e define **procedimento manual** de LOG-03 com dono/ferramenta/janela (automático = fase 2). Novo teste T-37. | S3.2, S3.3, LOG table, T-37 |
| 13 | **metadataBase/OG/sitemap:** v2 corrige `metadataBase`→`NEXT_PUBLIC_GUIA_URL` + `alternates.canonical` e inclui o guia no sitemap com a URL do subdomínio. | S5.6, S6.1, Apêndice |
| 14 | **CLS do scaling:** v2 torna obrigatório medir no Lighthouse; se >0,1, setar `--guia-scale` no SSR. | S5.2 |
| 15 | **Idempotência (GAP-M4):** v2 documenta a race do `find`+`create` e a **decisão sobre unique index** em `leads.email` (default: não adicionar; débito declarado). | S3.0, S3.4 |
| 16 | **Testes faltantes:** v2 adiciona 8 cenários (modal não-reabre 2×, reduced-motion, localStorage corrompido, falha de rede POST, concorrência real, telefone fixo 10 díg., persistência do lead, 400/403) → T-28..T-37. | S5.7, §5 |

**Outras correções v2:** GAP-M3 (RNF-08 com região `role="status"` de aviso), GAP-M5 (`landing_page` via `window.location` sob rewrite), GAP-B2 (sink de eventos GA4 client-side, sem collection nova), GAP-B3 (IP /24 também no `ip_address` persistido por cautela LGPD), DA-6 (blur só nas ~6 primeiras páginas por perf). Correção factual: o matcher do middleware existente é `/ferramentas/calculadora-trafego/r/` (não `/calculadora/r/`).

**Estrutura final:** 6 sprints (Sprint 1 entregue + Sprints 2–6). **Stories:** S2 (4) + S3 (8: S3.0–S3.7) + S4 (4) + S5 (7) + S6 (5: S6.1–S6.5) = **28 stories** nas Sprints 2–6. **Testes de aceitação:** T-01..T-37 (10 novos pós-auditoria).

**3 decisões do dono pendentes antes da Sprint 3:** DEC-1 (empresa default vs opcional), DEC-2 (identificador canônico RD), DEC-3 (classificação LGPD do dado de perfil). Ver cabeçalho.
