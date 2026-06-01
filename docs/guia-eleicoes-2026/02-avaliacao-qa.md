# Avaliação QA — Plano de Sprints do Hotsite "Guia de Eleições 2026"

**Auditor:** @qa (mentalidade adversarial)
**Data:** 2026-06-01
**Documentos auditados:**
- Plano: `docs/guia-eleicoes-2026/01-plano-sprints.md`
- PRD-fonte: `Eleições/PRD_Hotsite_Guia_Eleicoes_2026.md`
**Método:** leitura integral dos dois documentos + verificação de ground truth no código (`src/lib/crm/*`, `src/middleware.ts`, `src/app/api/calculadora/route.ts`, `src/collections/Leads.ts`, `src/lib/security/turnstile.ts`, `src/lib/analytics/*`).

---

## VEREDITO: **APROVADO COM RESSALVAS**

O plano é sério, rastreável e cobre os 62 IDs de requisito do PRD com mapeamento explícito. A estratégia de reuso (RD legacy, Turnstile, rate limit, analytics server) é sólida e reduz risco real. **Porém, a auditoria encontrou 4 gaps de severidade Alta que são bloqueadores de implementação ou de go-live, e vários desalinhamentos entre o que o plano "afirma reusar" e o que o código realmente tem.** O plano não pode ir para execução da Sprint 2/3 sem corrigir os itens GAP-A1 a GAP-A4 abaixo. Nenhum deles exige replanejamento estrutural — são correções pontuais nos critérios de aceitação e nas tarefas técnicas.

**Condições para passar a "Aprovado" pleno:**
1. Resolver os 4 gaps Altos (GAP-A1..A4) no plano antes de iniciar a Sprint 3.
2. Fechar a decisão arquitetural do hook de Leads (dupla sync) — o plano a deixa "a confirmar com @architect" mas é pré-requisito da Sprint 3.
3. Adicionar os ~6 cenários de teste faltantes (lista §4) à suíte/checklist.

---

## 1. Gaps encontrados (por severidade)

### 🔴 ALTA

**GAP-A1 — `empresa` é `required: true` na collection `leads`, mas o formulário do guia NÃO tem campo empresa.**
O form do guia tem exatamente 4 campos (nome, email, telefone, perfil) — RF-14. Mas `src/collections/Leads.ts` linha 60-62 define `{ name: 'empresa', type: 'text', required: true }`. O endpoint S3.2 vai chamar `payload.create({ collection: 'leads', ... })` e **falhará na validação do Payload** por `empresa` ausente. O plano não menciona isso em lugar nenhum.
*Correção:* na Sprint 3 (S3.2), ou (a) tornar `empresa` opcional na collection (impacto em outras origens — validar), ou (b) preencher `empresa` com um placeholder padrão (ex.: `'—'` ou `'(não informado)'`) no create do guia. Decisão deve ser explicitada no plano como tarefa de S3.2 e revisada por @architect, pois mexe numa collection compartilhada.

**GAP-A2 — `rd_sync_status: 'failed'` e `'skipped'` não existem no enum da collection.**
S3.3 (CA) e S3.2 afirmam persistir `rd_sync_status: 'failed'`. O adapter da calculadora (`route.ts` linha 291) também usa `'failed'` e `'skipped'`. **Mas o enum em `Leads.ts` linha 148-155 só aceita: `pending`, `synced`, `error`, `mock`.** Não há `failed` nem `skipped`. Isso significa que ou (a) o padrão da calculadora já grava valores fora do enum (débito existente silencioso), ou (b) a calculadora grava `rd_sync_status` em outra collection (`calculadora-results`, não `leads` — confirmado: o `.then()` do route.ts atualiza `calculadora-results`, não `leads`). **Logo o "padrão idêntico ao da Calculadora" que o plano cita para atualizar `rd_sync_status` em `leads` NÃO existe** — a calculadora nunca atualiza esse campo em `leads`. O guia precisa de lógica nova.
*Correção:* (1) adicionar `failed` (e, se usado, `skipped`) ao enum `rd_sync_status` em `Leads.ts`; (2) o plano deve parar de afirmar "padrão idêntico da Calculadora" para esse update e descrever a lógica nova de atualizar `leads.rd_sync_status` no `.then()` do fire-and-forget. Tarefa de S3.2/S3.3.

**GAP-A3 — Risco de dupla sync ao RD é CERTO, não "Médio/Média", e a mitigação proposta tem efeito colateral.**
O hook `afterChange` de `Leads.ts` (linha 18-56) dispara `syncContact()` em **todo** `operation === 'create'`, incondicionalmente. Ao criar o lead do guia (S3.2), o hook **vai** disparar uma conversão genérica (`identificador: 'lead_capturado'`, sem os `cf_*` do guia) AO MESMO TEMPO que o adapter dedicado dispara `guia-eleicoes-2026`. Resultado: **duas conversões no RD para o mesmo cadastro** — uma completa e uma "pelada". O plano reconhece o risco mas o classifica como prob. Média (é Certo) e propõe "mapear `guia-eleicoes` para não acionar o hook". **Problema:** o hook não tem opt-out por origem hoje; adicionar um `if (doc.origem === 'guia-eleicoes') return doc` no hook é mexer em código compartilhado e precisa de teste de regressão para garantir que diagnóstico/calculadora/newsletter continuam sincronizando.
*Correção:* decisão arquitetural OBRIGATÓRIA antes de S3.2 (não "a confirmar"): adicionar guard explícito no hook (`origem` na lista de exclusão) OU desabilitar o hook genérico e centralizar 100% da sync nos adapters dedicados por origem. Exige teste de regressão das 4 origens existentes. Elevar prob. para "Certo" na matriz de riscos.

**GAP-A4 — CSRF/same-origin (RNF-11) é afirmado como "reusa padrão da Calculadora", mas o padrão NÃO existe.**
S3.2 CA: "Verifica `Origin`/same-origin (RNF-11) — rejeita cross-origin". Verifiquei `src/app/api/calculadora/route.ts`: **não há nenhuma verificação de `Origin`, `Referer` ou `x-forwarded-host`** (grep retornou zero matches). O plano herda uma proteção que não está implementada em lugar nenhum do projeto. Além disso, há um detalhe de subdomínio: com o rewrite por host (S6), o request chega via `eleicoes.unfoldgrowth.com.br`, então a checagem de `Origin` precisa aceitar o subdomínio E o apex — implementação não-trivial que o plano trata como reuso trivial.
*Correção:* S3.2 deve implementar a verificação de `Origin`/`Host` do zero (não é reuso), com allowlist contemplando `eleicoes.unfoldgrowth.com.br` e o apex de preview/prod da Vercel. Considerar que Turnstile já é a defesa primária contra abuso cross-origin e que `mailto:`/`wa.me` não fazem POST — mas RNF-11 pede a verificação explicitamente, então não pode ser silenciosamente omitida.

### 🟡 MÉDIA

**GAP-M1 — `conversion_identifier` diverge entre PRD e plano.**
PRD RF-21 especifica `conversion_identifier: "hotsite-guia-eleicoes-2026"` e `cf_origem_hotsite: "hotsite-guia-eleicoes-2026"`. O plano (Nota A, S3.2) usa `identificador: 'guia-eleicoes-2026'` e `cf_origem_hotsite: 'guia-eleicoes-2026'` (sem o prefixo `hotsite-`). Divergência não declarada como desvio. Como o `identificador` é o **gatilho da automação do RD** (que cria o deal), o valor precisa bater 100% com o que for configurado no painel. Não é errado, mas precisa de uma decisão única e documentada para evitar que código e painel RD usem strings diferentes.
*Correção:* fixar UM identificador canônico (recomendo seguir o PRD: `hotsite-guia-eleicoes-2026`) e usá-lo consistentemente em código + painel + T-01. Declarar como desvio se mantiver `guia-eleicoes-2026`.

**GAP-M2 — `mobile_phone`/`personal_phone` com prefixo `+55` (PRD RF-21) vs. `celular` só-dígitos (plano).**
PRD RF-21 envia `"mobile_phone": "+55[telefone]"`. O plano mapeia para `celular: normalizeTelefone(telefone)` que retorna **só dígitos sem +55** (verificado em `rd-mappings.ts` linha 120-125: faz `replace(/\D/g,'')`, então remove o `+`). Para a API legacy isso é provavelmente o correto (o padrão da calculadora faz igual e está em produção), mas é um desvio do PRD não declarado. Aceitável, mas registrar.
*Correção:* declarar na Nota A que `+55` do PRD é descartado em favor de dígitos puros (consistente com legacy/calculadora).

**GAP-M3 — Cobertura de RNF-08 (aria-hidden do conteúdo bloqueado) tem conflito interno não resolvido.**
RNF-08 do PRD diz: o conteúdo bloqueado deve continuar acessível a leitor de tela COM aviso semântico — MAS recomenda ocultar via `aria-hidden="true"`. São duas instruções contraditórias (acessível vs. oculto). O plano escolhe `aria-hidden="true"` (S2.1) sem registrar o aviso semântico de "conteúdo bloqueado, cadastre-se". Se aplicar `aria-hidden` no conteúdo, o leitor de tela fica SEM nada — viola a parte "com aviso" do próprio RNF-08, e pode reduzir score de acessibilidade (T-22 A11y ≥ 90).
*Correção:* S2.1/S5.1 deve adicionar uma região `role="status"`/aviso textual visível a leitores ("Conteúdo bloqueado. Cadastre-se para liberar o estudo completo.") FORA do bloco com `aria-hidden`, e garantir que o modal seja o foco. Critério de aceitação explícito para isso.

**GAP-M4 — Idempotência de submit duplo (T-07) depende de upsert por email, mas a janela de corrida não é tratada.**
S3.4 promete "idempotência por e-mail no server (upsert)". O padrão da calculadora faz `find` + `create/update` (não atômico). Dois POSTs simultâneos (rage-click, antes do guard de `submitting` no client pegar) podem ambos passar pelo `find` (nenhum acha) e ambos `create` → 2 leads. O guard de client (`RF-18` botão desabilitado) mitiga o caso comum, mas T-07 fala explicitamente de "rage-click" e o teste automatizado de idempotência precisa cobrir corrida real.
*Correção:* documentar que a defesa primária de T-07 é o guard de client + botão disabled; a defesa server (upsert por email) reduz mas não elimina corrida sob concorrência verdadeira. Aceitar como débito (igual calculadora) OU adicionar unique constraint/índice por email se a collection permitir. Decidir e registrar.

**GAP-M5 — `landing_page` "URL sem params" pode capturar errado sob rewrite de subdomínio.**
RF-39 pede `landing_page` = URL do 1º acesso sem params. Sob o rewrite S6, a URL real é `eleicoes.unfoldgrowth.com.br/featwork` mas a rota interna é `/guia-eleicoes-2026`. Se `captureOrigin()` usar `window.location` no client, pega `/featwork` (correto). Se algum código usar a rota interna, registra errado. Não é bug garantido, mas o plano não trata a interação entre captura de origem e rewrite.
*Correção:* CA de S3.1 deve fixar que `landing_page`/`utm` vêm de `window.location` no client (vê o host público), e adicionar um teste manual pós-deploy (S6) confirmando que o landing capturado é `/featwork`.

**GAP-M6 — LOG-03 (alertas de taxa) rebaixado a "monitoramento manual 48h" sem critério verificável.**
O PRD LOG-03 lista 3 alertas automáticos (erro >5%/10min, RD 5xx >5min, >100 sub/min). O plano os converte em "monitoramento manual nas 48h". Isso é uma decisão de escopo legítima para MVP, mas vira um requisito sem critério de aceitação testável e sem dono operacional definido (quem olha? onde? com que frequência?).
*Correção:* ou (a) declarar LOG-03-automático como "fase 2 / fora do MVP" explicitamente (como foi feito com o dashboard §10), ou (b) definir o procedimento manual com dono, ferramenta (Vercel Logs query) e janela. Hoje está num limbo.

### 🟢 BAIXA

**GAP-B1 — Plano diz "criar `TurnstileWidget.tsx`" sem reusar o existente.**
Já existem `src/components/TurnstileWidget.tsx` e `src/components/diagnostico/TurnstileWidget.tsx`, além de `src/lib/security/turnstile.ts` (verifyTurnstile server-side com bypass-dev já pronto). O plano lista `TurnstileWidget.tsx` em "criar" e descreve a verificação server como se fosse nova (S3.2), quando `verifyTurnstile()` já faz exatamente o que o CA pede.
*Correção:* S2.4/S3.2 devem **reusar** `src/lib/security/turnstile.ts` e avaliar reuso do widget existente. Reduz esforço; o plano subestima o reuso aqui (oposto do erro nos GAP-A).

**GAP-B2 — Evento `pagina_carregada` (RF/PRD §8.1) e `visita_retorno` não têm collection/sink server definido.**
O plano cita os eventos GA4 mas a infra de analytics existente (`calculadora-events-server.ts`) grava em collection Payload `calculadora-events`. Não há equivalente para o guia. Os eventos GA4 client-side (via GTM) podem cobrir, mas o plano mistura "GA4 event" com o padrão server de persistência sem dizer qual via cada evento usa.
*Correção:* S4/S3 esclarecer: eventos do guia vão para GA4 via `gtag`/GTM client-side (sem collection nova), OU criar sink server. Recomendo client-side GA4 (mais simples, já há GTM-M43H2LKF). Só precisa ficar explícito.

**GAP-B3 — `ip_address` é gravado em texto pleno em `leads` (calculadora faz isso, linha 159), mas LOG-01 exige IP /24.**
LOG-01 pede IP anonimizado /24 no log. Mas a persistência da calculadora grava `ip_address: ip` (IP completo) na collection. Se o guia copiar o padrão, grava IP completo em `leads` — possível tensão com a postura LGPD reforçada (dado político). O log estruturado /24 é uma coisa; o campo persistido é outra.
*Correção:* decidir se `ip_address` em `leads` para o guia deve ser anonimizado /24 (coerente com a cautela LGPD do dado político) ou se segue o padrão. Registrar.

---

## 2. Cobertura de requisitos — análise da matriz

A matriz §2 do plano é boa e mapeia 61/62 com 1 N/A. Avaliação dos pontos sensíveis:

- **RF-24 (deal no CRM) = N/A:** **justificável.** Plano Basic não libera `/deals`; a automação do RD cria a negociação a partir da conversão. Decisão fechada do dono. Aceito. T-17/T-18 reinterpretados como validação manual no painel — aceito, mas dependem 100% de configuração externa (ver pendência crítica de labels).
- **RF-23 (endpoints OAuth/CRM):** sobrescrito por legacy via Nota A. Aceito, mas com GAP-M1/M2 acima.
- **RF-21:** mapeado, mas com as divergências GAP-M1 (identificador) e GAP-M2 (+55). Cobertura **fraca em precisão** — os valores exatos não batem com o PRD e precisam de fonte única de verdade.
- **RNF-08:** cobertura **fraca** — ver GAP-M3 (conflito acessível vs. oculto não resolvido).
- **RNF-10/RNF-11:** RNF-10 OK (Zod existe). RNF-11 **falsamente marcado como reuso** — ver GAP-A4.
- **RF-25 / fallback:** marcado como "padrão idêntico da Calculadora" — **parcialmente falso** (ver GAP-A2: a calculadora não atualiza `rd_sync_status` em `leads`). O conceito está certo, a afirmação de reuso direto está errada.
- **RNF-05:** marcado ✅/🟡 — aceitável (S1 fez, S5 revalida).

**IDs com cobertura fraca (precisam reforço no plano):** RF-21, RF-25, RNF-08, RNF-11. Mais o gap implícito de `empresa` (GAP-A1) que não tem ID mas quebra RF-20 (persistência).

---

## 3. Critérios de aceitação — verificabilidade

Maioria dos CAs é verificável e específica (cores hex, ms, dígitos — bom). Pontos vagos/incompletos:

- **S2.1 blur:** "sem CLS ao alternar" — bom, mas falta CA para `prefers-reduced-motion` (a transição de 600ms + pulsação RF-42 deve respeitar reduced-motion; o plano NÃO menciona reduced-motion em nenhum lugar). **Faltante.**
- **S2.2 modal:** reabertura 30s "uma única vez por sessão" — falta definir o que é "sessão" (sessionStorage? aba? recarga zera?). Ambíguo. T-08/T-09 cobrem fechar/ESC mas não há teste para "modal NÃO reabre uma 2ª vez".
- **S2.3 form:** RFC 5322 "validado no submit" — bom. Mas falta CA para: nome com 2 palavras mas uma é 1 letra ("a b")? espaços múltiplos? trim? E telefone: aceita exatamente 10 (fixo) e 11 (celular) — a máscara `(00) 00000-0000` é de 11 dígitos; como exibe 10 dígitos? Não especificado. **Caso de borda faltante.**
- **S3.4 erro de rede:** CA bom (mensagem literal). Mas não cobre: e se o fetch der timeout muito longo? Há timeout configurado no fetch? `rd-legacy-client.ts` não tem `AbortController`/timeout — uma RD pendurada segura o request. Embora seja fire-and-forget para o RD, a persistência é síncrona; ok. Registrar que não há timeout no fetch RD (aceitável por ser fire-and-forget).
- **S6.1 rewrite:** CAs claros e testáveis (3 comportamentos). Bom. Mas falta CA para: API `/api/guia-eleicoes/lead` sob o subdomínio — o matcher do middleware atual NÃO inclui `/api/*` e o rewrite por host precisa não quebrar same-origin do POST. Interage com GAP-A4.

---

## 4. Testes T-01..T-27 + cenários faltantes

**Dono e método:** todos os 27 têm sprint e tipo atribuídos (§5 do plano). Bom. T-17/T-18 reinterpretados (manual no painel RD) — aceito com a ressalva de dependência externa.

**Difíceis de automatizar e mitigação:**
- T-22 (Lighthouse) — manual; mitigar com CI opcional (Lighthouse CI) mas aceitável manual.
- T-23 (captcha bloqueia bot) — difícil de testar real; mitigar testando o caminho server `verifyTurnstile` retornando `ok:false` em unit test (mockar siteverify), não só "user-agent suspeito" (que o Turnstile real nem usa). O plano deixa T-23 só manual — **adicionar unit test do path de rejeição**.
- T-13/T-14 (share abre app) — manual inevitável; OK.

**Cenários que o PRD implica mas o plano NÃO lista como teste (ADICIONAR):**

1. **Modal NÃO reabre 2ª vez na mesma sessão** (RF-13: "uma única vez por sessão"). Nenhum teste cobre o "uma única vez". **Faltante.**
2. **`prefers-reduced-motion`**: transição de blur (RF-09) e pulsação (RF-42) respeitam reduced-motion. Nenhum CA nem teste. **Faltante.**
3. **Retorno com localStorage corrompido/parcial**: `hotsite_unlocked` presente mas `lead_id` ausente, ou JSON inválido. T-10/T-11 cobrem o caminho feliz e o limpar, não o corrompido. **Faltante** (robustez de `getUnlockSession`).
4. **Falha de rede no submit (não falha do RD, mas o próprio POST não chega)**: distinto de T-19 (RD cai mas endpoint responde). Aqui o fetch do client falha. RF-19 cobre a mensagem, mas não há teste. **Faltante.**
5. **Dupla submissão concorrente real** (não só rage-click sequencial): T-07 + GAP-M4. **Reforçar T-07** com cenário de concorrência.
6. **Telefone fixo de 10 dígitos** (DDD + 8) com a máscara de 11: como valida e exibe. **Faltante** — só há T-05 (<10 bloqueia).
7. **Payload inválido / Turnstile inválido no endpoint** (400/403): o plano cita em S5.7 mas não há entrada T-* explícita; garantir unit tests de 400 (Zod) e 403 (Turnstile). **Cobrir em S5.7.**
8. **`empresa` ausente quebrando o create** (GAP-A1): adicionar teste de integração do endpoint que confirme que o lead do guia persiste com sucesso. **Faltante e crítico.**

---

## 5. Pontos levantados pelo PM (avaliação item a item)

| Ponto do PM | Avaliação @qa |
|---|---|
| Rewrite por host (S6.1) | **Concordo com a abordagem** (middleware com matcher por host). Risco real: middleware atual (`src/middleware.ts`) já existe com matcher restrito a `/admin`,`/painel`,`/diagnostico/r/`,`/calculadora/r/`. Adicionar host-rewrite exige ESTENDER esse middleware (não criar novo) e ampliar o `matcher`. O plano diz "verificar se já existe" — **existe, e o plano deve dizer claramente que é edição, não criação**, com teste de regressão das rotas atuais. Ver também: rewrite precisa cobrir `/api/guia-eleicoes/*` para same-origin do POST (interage com GAP-A4). |
| Hook duplo de sync RD | **Risco subestimado.** Ver GAP-A3 — é Certo, não Médio. Mitigação proposta tem efeito colateral em código compartilhado. Pré-requisito de S3.2, não "a confirmar depois". |
| LGPD do dado "candidato sim/não" | **Concordo e reforço.** O PRD (RNF-14) e o plano tratam como legítimo interesse com cautela. @qa endossa a recomendação de validar com jurídico se "intenção de candidatura" é dado sensível (opinião política, art. 5º II LGPD). Adicionalmente: ver GAP-B3 (não gravar IP completo + dado político juntos sem necessidade). Recomendo **não bloquear o desenvolvimento** por isso, mas marcar como condição de go-live (igual D-02/D-04). |
| Labels exatos do RD | **Concordo — é o maior risco operacional silencioso.** O comentário em `rd-mappings.ts` confirma: divergência de label descarta o valor sem erro. O plano captura isso bem (pendência crítica §6). Reforço: o teste de payload Vitest (S5.7) valida o formato mas NÃO valida que os labels existem no painel — isso só T-16 manual em S6 pega. Aceito, mas o dono precisa criar os campos ANTES de S6. |
| Desvios declarados do PRD | Bem declarados em geral (legacy, Payload≠Supabase, Turnstile). **Não declarados:** GAP-M1 (identificador `hotsite-` ausente), GAP-M2 (+55), GAP-A1 (empresa). Esses precisam virar desvios explícitos. |

---

## 6. Definição de Pronto (DoD) por sprint

Os DoD são razoáveis e citam testes específicos (T-xx), mas **nenhum DoD de sprint menciona `npm run lint` nem `typecheck` verdes** — apenas S5.7 fala em `npm test` verde. Dado que o CLAUDE.md do projeto exige lint+typecheck antes de marcar tarefas completas, isto é uma lacuna.
*Correção:* adicionar a TODOS os DoD de sprint: "lint e typecheck verdes; testes Vitest existentes não regridem". S2-S4 mexem em TS e podem quebrar build.

---

## 7. Observabilidade (LOG) e Segurança (RNF-09..15)

- **LOG-01** (log estruturado /24): coberto S3.2. **Verificar** que o IP é de fato truncado para /24 no log (o snippet da calculadora loga objetos sem /24). Adicionar utilitário `anonymizeIp(ip)` — não existe no projeto (grep). **Faltante como tarefa.**
- **LOG-02** (centralização Vercel Logs): OK via `console` → Vercel. Aceito.
- **LOG-03** (alertas de taxa): ver GAP-M6 — em limbo, definir escopo.
- **RNF-09** (SSL): OK via Vercel auto-SSL (S6). Bom.
- **RNF-10** (sanitização + revalidação): Zod no server OK. Front sanitiza via validação. Aceito.
- **RNF-11** (CSRF/same-origin): **NÃO coberto de fato** — ver GAP-A4.
- **RNF-12** (rate limit 3/IP/60s): reusa padrão in-memory. **OK, mas atenção:** o padrão da calculadora é 5/hora (`RATE_WINDOW_MS = 60*60*1000`), e o do middleware é 10/min. O guia quer 3/60s — é um terceiro valor. O plano diz "ajustar limite/janela" — correto, só confirmar que a cópia ajusta de fato para 3 e 60s. Débito conhecido: in-memory não compartilha entre instâncias serverless (plano reconhece, Turnstile como defesa primária — aceito).
- **RNF-13** (Turnstile): infra já existe (`verifyTurnstile`). Plano subestima reuso (GAP-B1). Coberto.
- **RNF-14** (LGPD): aviso S2.3 + limpar S4.3 + política/DPO S5.4. Coberto, com pendências externas D-02/D-04 e a cautela do dado político.
- **RNF-15** (credenciais no server): OK — adapter no server, token via env. Verificado que o padrão não vaza token ao front.

---

## 8. Top 5 gaps mais críticos (resumo para o orquestrador)

1. **GAP-A1 (Alta):** `empresa` é `required` em `leads`, mas o form do guia não tem o campo → `payload.create` falha. Quebra RF-20. Sem fix, a Sprint 3 não funciona.
2. **GAP-A3 (Alta):** dupla sync ao RD é **certa** (hook `afterChange` dispara sempre) → 2 conversões por cadastro. Mitigação mexe em código compartilhado e exige teste de regressão. Pré-requisito de S3.2.
3. **GAP-A2 (Alta):** `rd_sync_status: 'failed'` não existe no enum da collection; e o "padrão idêntico da Calculadora" para atualizar `leads.rd_sync_status` **não existe** (a calculadora atualiza `calculadora-results`, não `leads`). Lógica nova + enum novo.
4. **GAP-A4 (Alta):** RNF-11 (same-origin/CSRF) marcado como "reuso da Calculadora", mas **não há nenhuma verificação de Origin no projeto**. É implementação nova, complicada pelo subdomínio.
5. **GAP-M1+M2 (Média):** divergências não-declaradas entre PRD e plano nos valores que vão ao RD: `conversion_identifier` perde o prefixo `hotsite-`; `+55` do PRD é descartado. Como o identificador é o gatilho da automação, precisa de fonte única de verdade código↔painel.

---

## 9. Requisitos do PRD ainda não plenamente endereçados

- **RF-20 (persistência do lead):** bloqueado por GAP-A1 (empresa required) até correção.
- **RNF-08 (acessível com aviso):** parcial — conflito acessível-vs-oculto não resolvido (GAP-M3).
- **RNF-11 (CSRF):** não implementado de fato (GAP-A4).
- **RF-25 (fallback status):** conceito ok, mas afirmação de reuso falsa + enum faltando (GAP-A2).
- **LOG-01 (/24):** falta o utilitário de anonimização de IP.
- **LOG-03 (alertas automáticos):** rebaixado sem critério (GAP-M6).
- **prefers-reduced-motion** (implícito em WCAG/RNF-07): ausente em todo o plano.
- **RF-21 valores exatos:** divergências M1/M2 não declaradas.

---

## 10. Recomendações de correção por sprint

- **Sprint 2:** adicionar CA de `prefers-reduced-motion` (S2.1); resolver RNF-08 com região de aviso semântico (GAP-M3); definir "sessão" para a regra dos 30s + teste de "não reabre 2ª vez"; CA de telefone fixo 10 dígitos; reusar `src/lib/security/turnstile.ts` e avaliar widget existente (GAP-B1).
- **Sprint 3:** **resolver GAP-A1 (empresa), A2 (enum + lógica de status), A3 (hook double-sync), A4 (Origin check) — bloqueadores.** Fixar identificador canônico (GAP-M1) e declarar +55 (GAP-M2). Adicionar utilitário `anonymizeIp` /24 (LOG-01). Confirmar rate limit ajustado para 3/60s. Tratar timeout do fetch RD (registrar como aceito por fire-and-forget). Teste de integração do endpoint cobrindo persistência bem-sucedida do lead do guia.
- **Sprint 4:** esclarecer sink dos eventos GA4 (client GTM vs server) — GAP-B2; reduced-motion na pulsação RF-42.
- **Sprint 5:** S5.7 — adicionar unit tests de 400 (Zod) e 403 (Turnstile rejeitado), teste de localStorage corrompido, teste de idempotência sob concorrência. S5.1 — fechar RNF-08.
- **Sprint 6:** middleware é **edição** do existente, não criação; ampliar matcher e testar regressão de `/admin`,`/painel`,`/r/`; garantir `/api/guia-eleicoes/*` same-origin sob subdomínio; teste pós-deploy do `landing_page` capturado (GAP-M5).
- **Todas as sprints:** adicionar "lint + typecheck verdes; sem regressão de testes" ao DoD.

---

*Avaliação @qa — adversarial, baseada em verificação de código. O plano está bom de estrutura e rastreabilidade; reprova-se apenas a precisão de 4 afirmações de "reuso" que não correspondem ao código e a 1 conflito de schema (empresa required). Corrigidos esses, o plano é executável.*
