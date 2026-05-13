# Diagnóstico de Growth v2 — Plano de Sprints

**Versão:** 2.0
**Data:** 2026-05-13
**Spec fonte:** `docs/diagnostico-spec.md` (v1.0)
**Estado atual:** v0 — esqueleto funcional (4 pilares, 1 insight por nível, resultado por JWT)
**Estado alvo:** v1.0 — 5 eixos com Gestão, Camada 2 Fit Comercial, Camada 3 padrões P1–P8, 5 caminhos, URL pública por hash, PDF, mensuração completa, 6 automações, integrações RD/Calendly/OpenRouter

**Orquestração:** Orion (aios-master) | **PM:** plano abaixo | **Arquitetura:** validada | **QA:** gates por sprint

---

## Princípios de execução

1. **Spec é a fonte única** — em conflito, `diagnostico-spec.md` vence.
2. **Integrações em modo mock** até as keys chegarem — código fica pronto, env vars vazias.
3. **Caso Roberto (spec §11) é o golden test** — qualquer mudança no scoring engine roda o caso e deve bater: score 22, Fit Médio (58.84), padrões P4/P8/P2, caminhos C3/C4/C2.
4. **Migrations Postgres seguras** — campos novos com `defaultValue` ou nullable, nunca quebrar produção.
5. **Persistência:** Postgres no Supabase via Payload (já em produção). Sem client Supabase direto.

---

## Estado atual (v0) — o que já funciona

| Componente | Arquivo | Estado |
|---|---|---|
| Landing | `src/app/(site)/diagnostico/page.tsx` | Hero + form |
| Etapa 1 (form) | `src/components/diagnostico/DiagnosticoEtapa1Form.tsx` | 6 campos (faltam 3 da spec) |
| API Etapa 1 | `src/app/api/diagnostico/etapa-1/route.ts` | Zod + Payload + JWT 24h |
| Etapa 2 (quiz) | `src/app/(site)/diagnostico/etapa-2/[token]/page.tsx` | 12 perguntas dinâmicas |
| API Etapa 2 | `src/app/api/diagnostico/etapa-2/route.ts` | Scoring + JWT 7d |
| Engine scoring | `src/lib/scoring/engine.ts` | 4 pilares, faixas 70/40 |
| Resultado | `src/app/(site)/diagnostico/resultado/[token]/page.tsx` | JWT-based, insight único |
| Painel admin | `src/app/(painel)/painel/diagnostico/` | Lista + detalhe |
| Collection `Leads` | `src/collections/Leads.ts` | Hook syncContact (mock) |
| Collection `DiagnosticoResults` | `src/collections/DiagnosticoResults.ts` | Hook sendEmail (mock) |
| Collection `QuizQuestions` | `src/collections/QuizQuestions.ts` | 12 perguntas seed |
| Collection `InsightsVariations` | `src/collections/InsightsVariations.ts` | Textos por nivel_fit |
| Collection `AIPrompts` | `src/collections/AIPrompts.ts` | Prompts AI (não conectado) |

---

## Sprint 1 — Foundation (Schemas v2 + Engine v2)

**Objetivo:** Reescrever o sistema de scoring para a spec v1.0 e expandir os schemas. Sem mudança de UI.

### Tarefas técnicas

1. **Migration Postgres — expandir `Leads`** com campos da Etapa 1 v2:
   - `setor` (enum: 7 opções — Construção, Agro, SaaS, Automotivo, Indústria, Serviços B2B, Outro)
   - `faturamento_faixa` (enum: 5 opções da spec — substitui `receita_anual` com migração de dados)
   - `urgencia` (enum: 4 opções — Trimestre, 6 meses, Sem prazo, Pesquisando)
   - Manter `tamanho_equipe` e `receita_anual` como deprecated por 1 release.

2. **Migration Postgres — expandir `DiagnosticoResults`** com campos das Camadas 2 e 3:
   - `score_gestao` (number 0–100)
   - `faixa_consolidada` (enum: Crítica / Em formação / Estruturada / Madura)
   - `fit_estrutural`, `fit_dor`, `fit_cabeca`, `fit_urgencia`, `score_fit` (number 0–100)
   - `faixa_fit` (enum: Fit Alto / Fit Médio / Fit Baixo / Desfit)
   - `padroes_acionados` (array de strings P1–P8)
   - `padroes_exibidos` (array, 3 itens, ordem)
   - `caminhos_exibidos` (array, 3 itens, ordem)
   - `url_resultado_hash` (string única, indexed) — gerado em `afterChange`
   - `data_inicio`, `data_conclusao`, `tempo_total_segundos`
   - `agendou` (boolean), `slot_agendado` (date)
   - `respostas_etapa1_raw` (JSON — snapshot dos 7 campos)

3. **Reescrever `src/lib/scoring/engine.ts` → engine v2:**
   - 5 eixos (Diagnosticar, Estruturar, Operar, Evoluir, Gestão).
   - Q4 com 5 opções (E pontua 0 como A).
   - Q8 invertida no eixo Operar (`contribuição = 3 − pontos_brutos`).
   - Eixo Gestão = (Sinal 1 + Sinal 2 + Sinal 3) × 33.33 — tabelas exatas da spec §5.4.
   - Faixas dos eixos: 0–25 Crítica / 26–50 Em formação / 51–75 Estruturada / 76–100 Madura.

4. **Criar `src/lib/scoring/fit.ts`** — Camada 2 (Fit Comercial):
   - 4 dimensões pesadas (Estrutural 40%, Dor 30%, Cabeça 20%, Urgência 10%).
   - Curva em U invertido no Fit de Dor (8–9 = 70, não 100).
   - Faixas: 75–100 Alto / 50–74 Médio / 25–49 Baixo / 0–24 Desfit.

5. **Criar `src/lib/scoring/padroes.ts`** — Camada 3:
   - 8 padrões P1–P8 com condições de acionamento (spec §7.1).
   - Função `selecionar3(acionados, prioridades, scores)` com regra de prioridade base + desempate por hierarquia (P4>P3>P8>P2>P7>P1>P6>P5).
   - Fallback: completar pelo eixo mais fraco (mapping em §7.2).
   - Padrão neutro positivo se nenhum acionado.

6. **Criar `src/lib/scoring/caminhos.ts`** — mapping P→C com regra de deduplicação (spec §8.1, §8.2).

7. **Criar `src/lib/scoring/__tests__/caso-roberto.test.ts`** — golden test:
   - Inputs: spec §11.1.
   - Asserts: score 22 (faixa Crítica), score_fit 58.84 (Fit Médio), padrões selecionados [P4, P8, P2], caminhos [C3, C4, C2], score_gestao 16.7.

### Arquivos novos/modificados

- 🆕 `src/lib/scoring/engine.ts` (rewrite)
- 🆕 `src/lib/scoring/fit.ts`
- 🆕 `src/lib/scoring/padroes.ts`
- 🆕 `src/lib/scoring/caminhos.ts`
- 🆕 `src/lib/scoring/__tests__/caso-roberto.test.ts`
- 🆕 `src/lib/scoring/textos.ts` (textos dos 8 insights + 5 caminhos da spec §7.3 e §8.3)
- ✏️ `src/collections/Leads.ts`
- ✏️ `src/collections/DiagnosticoResults.ts`
- 🆕 `migrations/2026-05-XX_diagnostico_v2.ts`

### Definition of Done

- [ ] Migration aplica sem perda de dados (testado em SQLite local e Postgres staging).
- [ ] `npm test src/lib/scoring` passa (golden test caso Roberto).
- [ ] Lint + typecheck verdes.
- [ ] Admin panel exibe campos novos em `/admin/collections/diagnostico-results`.

### Gates QA

- **G1.1** Caso Roberto bate scores exatos (margem ±0.5 em pontos fracionários).
- **G1.2** Q4=E retorna 0 pontos (não E quebra).
- **G1.3** Q8=D dá 0 em Operar e 100 em Fit Estrutural — verificar isolamento.
- **G1.4** Eixo Gestão respeita as 3 tabelas da spec §5.4.
- **G1.5** Padrão neutro positivo aciona quando nenhum P1–P8 dispara (operação madura simulada).

### Notas arquiteturais

- Engine v2 é **puro** (sem side effects, sem fetch) — facilita testes.
- Mapeamento de respostas brutas (A/B/C/D/E) → pontos vive na engine, não no client.
- Textos dos padrões e caminhos ficam em arquivo TS estático (`textos.ts`) — versionados no git, podem ser sobrescritos por `InsightsVariations` no CMS (override opcional).

---

## Sprint 2 — Etapa 1 v2 + Quiz v2

**Objetivo:** Atualizar UX para refletir spec §3 (7 campos) e §4 (microcopy + Q4/Q8).

### Tarefas técnicas

1. **`DiagnosticoEtapa1Form.tsx`** — refator:
   - Adicionar campos `setor`, `faturamento_faixa`, `urgencia` (selects com opções exatas da spec).
   - Remover campos antigos da UI (`tamanho_equipe`, `receita_anual`) mas manter no payload de transição.
   - Microcopy de abertura (spec §3.3).
   - Botão "Iniciar diagnóstico".
   - Captura UTM via `useSearchParams` (já existe? confirmar).

2. **Schema Zod** em `api/diagnostico/etapa-1/route.ts`:
   - Adicionar 3 campos novos (required exceto `cargo`).
   - Persistir `data_inicio` ao criar lead.

3. **QuizClient.tsx** — atualizar:
   - Microcopy de transição entre pilares (4 textos da spec §4.2).
   - Q4: 5 opções (atual lê de `opcoes` do CMS, então **basta seedar Q4 com 5 opções**).
   - Q8: nota visual de "ciclo de venda" — não mostrar ao usuário que pontua diferente, mas garantir que payload envia `valor` bruto correto.
   - Barra de progresso X/12 visível.
   - Salvar `data_conclusao` e `tempo_total_segundos` no submit final.

4. **Seed `QuizQuestions`** — regenerar via `src/app/api/seed/diagnostico/route.ts`:
   - Atualizar textos exatos da spec §4.3.
   - Q4: 5 opções com valores [0, 1, 2, 3, 0] (E como A).
   - Q8: 4 opções com valores [0, 1, 2, 3] — engine v2 cuida da inversão para Operar.

5. **Reengajamento drop-off:**
   - Cookie de sessão JWT (já existe) com `etapa1_concluida_em`.
   - Cron `src/app/api/cron/reengajamento-drop-off/route.ts` — busca leads com etapa-1 concluída há >1h sem etapa-2 e dispara email (modo mock se Resend vazio).

### Arquivos novos/modificados

- ✏️ `src/components/diagnostico/DiagnosticoEtapa1Form.tsx`
- ✏️ `src/components/diagnostico/QuizClient.tsx`
- ✏️ `src/app/api/diagnostico/etapa-1/route.ts`
- ✏️ `src/app/api/diagnostico/etapa-2/route.ts`
- ✏️ `src/app/api/seed/diagnostico/route.ts`
- 🆕 `src/app/api/cron/reengajamento-drop-off/route.ts`
- ✏️ `vercel.json` (cron schedule)

### Definition of Done

- [ ] Form Etapa 1 com 7 campos exatos da spec, validação Zod, microcopy de abertura.
- [ ] Quiz com microcopy de transição e barra de progresso.
- [ ] Seed atualizado — `curl /api/seed/diagnostico` reseta as 12 perguntas para a spec.
- [ ] Q4=E gera lead persistido sem quebrar (valor=0).
- [ ] Cron de drop-off agendado no Vercel.

### Gates QA

- **G2.1** Fluxo completo manual: 7 campos preenchidos → 12 perguntas → resultado salvo no banco com **todos** os scores das 3 camadas.
- **G2.2** Lead em `setor=Construção, cargo=CEO, faturamento=200–500k, urgencia=6 meses` + respostas do caso Roberto → DB grava `score_consolidado=22, score_fit=58.84, padroes_exibidos=["P4","P8","P2"]`.
- **G2.3** Mudar idioma do navegador não quebra (sem locale).
- **G2.4** Mobile (375px): form e quiz renderizam sem overflow.

---

## Sprint 3 — Resultado Público v2 (URL hash + Gráfico Aranha)

**Objetivo:** Substituir resultado por JWT por URL pública hash + implementar os 7 blocos da spec §9.

### Tarefas técnicas

1. **Geração de hash:**
   - Hook `afterChange` em `DiagnosticoResults`: se `url_resultado_hash` vazio, gerar `nanoid(12)` e salvar.
   - Garantir unicidade (índice DB).

2. **Nova rota `/diagnostico/r/[hash]`:**
   - Server component: busca `DiagnosticoResults` por hash → 404 se não existir.
   - Não expõe email/telefone — só nome (primeiro), empresa e scores.
   - Metadata: `robots: { index: false }` mas permite share via OG tags.
   - **Manter `/diagnostico/resultado/[token]` por 30 dias** como fallback redirect para a URL hash.

3. **Componente `DiagnosticoResultadoV2.tsx`** — 7 blocos:
   - **Bloco 1** Cabeçalho: "Olá, {nome}. Aqui está o diagnóstico..."
   - **Bloco 2** Score consolidado: número grande, faixa, frase descritiva (mapping spec §9.2).
   - **Bloco 3** Gráfico aranha (5 eixos) + leitura por eixo (mapping eixo×faixa em §9.3).
   - **Bloco 4** 3 cards de insight — textos de `src/lib/scoring/textos.ts` (P1–P8).
   - **Bloco 5** 3 caminhos de melhoria — textos de `textos.ts` (C1–C5).
   - **Bloco 6** CTA de agendamento — headline/microcopy/slot por `faixa_fit` (§9.6). Calendly **placeholder** (div com texto "Calendário em breve" enquanto URL não chega).
   - **Bloco 7** Footer: botões "Baixar PDF" (stub Sprint 4), "Compartilhar por email", opt-in nutrição (pré-preenchido).

4. **Gráfico aranha:**
   - Lib: **Recharts** (`RadarChart`) — já no `package.json`? Confirmar; se não, instalar.
   - Cores APR V2: Crítica `#001E29`, Em formação `#2E1A7F`, Estruturada `#93BAFB`, Madura `#6DF9C6`.
   - Linha/área preenchida na cor da média dos 5 eixos.

5. **CTA Fit:** select dinâmico do componente `CTAAgendamento.tsx` por `faixa_fit` — textos em `textos.ts`.

### Arquivos novos/modificados

- 🆕 `src/app/(site)/diagnostico/r/[hash]/page.tsx`
- 🆕 `src/components/diagnostico/DiagnosticoResultadoV2.tsx`
- 🆕 `src/components/diagnostico/GraficoAranha.tsx`
- 🆕 `src/components/diagnostico/InsightCard.tsx`
- 🆕 `src/components/diagnostico/CaminhoCard.tsx`
- 🆕 `src/components/diagnostico/CTAAgendamento.tsx`
- ✏️ `src/collections/DiagnosticoResults.ts` (hook hash)
- ✏️ `src/app/(site)/diagnostico/resultado/[token]/page.tsx` (redirect)

### Definition of Done

- [ ] URL `/diagnostico/r/{hash}` carrega para qualquer resultado salvo (sem auth).
- [ ] Compartilhar URL no WhatsApp mostra OG image + título correto.
- [ ] Gráfico aranha renderiza com 5 eixos e cor proporcional à faixa.
- [ ] CTA muda visualmente por faixa de Fit (Alto destacado, Desfit discreto).
- [ ] Dados sensíveis (email, telefone) não estão no HTML público.

### Gates QA

- **G3.1** Caso Roberto: tela exibe headline "Olá, Roberto", score 22, gráfico com vértices [17, 33, 11, 33, 17], 3 insights P4/P8/P2, 3 caminhos C3/C4/C2, CTA "Quer aprofundar a leitura...".
- **G3.2** Tentar acessar `/diagnostico/r/inexistente` → 404 page renderiza, não 500.
- **G3.3** Lighthouse desktop: Performance ≥ 85, A11y ≥ 95.
- **G3.4** Screen reader navega o aranha (alt text com texto-equivalente).

---

## Sprint 4 — Integrações + Automações + PDF

**Objetivo:** Codificar os 6 fluxos automatizados e a geração de PDF. **Todas as integrações em modo mock até as keys chegarem.**

### Tarefas técnicas

1. **Adapter RD Station v2 — `src/lib/crm/rd-station.ts`:**
   - Mapping dos 10 custom fields para campos do diagnóstico (spec §10.1).
   - Sync de `score_consolidado`, `score_fit`, `faixa_fit`, `padroes_acionados`, `url_resultado_publico`.
   - Aplicar tag `fit_alto | fit_medio | fit_baixo | desfit` automaticamente.
   - Mover lead para estágio "Aguardando Briefing" no funil "Diagnóstico Concluído".
   - Modo mock se `RD_STATION_API_KEY` vazio — logs estruturados.
   - Retry exponencial (3 tentativas) + persistir falhas em `rd_sync_status='error'`.
   - Webhook signing HMAC SHA256 em `/api/webhooks/rd-station`.

2. **Adapter Calendly — `src/lib/calendar/calendly.ts`:**
   - Embed component `CalendlyEmbed.tsx` lê URL por faixa de `SiteSettings` (Payload global).
   - Placeholder visual enquanto URL vazia.
   - Webhook `/api/webhooks/calendly` com signing key — atualiza `DiagnosticoResults.agendou=true` e `slot_agendado`.
   - Detectar cancelamento → trigger automação 6 (reengajamento).

3. **Adapter OpenRouter — `src/lib/ai/openrouter.ts`:**
   - Cliente `claude-sonnet-4-5` via OpenRouter (`Authorization: Bearer ${OPENROUTER_API_KEY}`).
   - Função `gerarInsightCustomizado(scoreData, padroes)` — opcional, sobrescreve textos estáticos.
   - Collection `AIPrompts` já existe → carregar prompt por slug `diagnostico-insight-v2`.
   - Modo mock: retorna texto estático de `textos.ts`.

4. **Geração de PDF — `src/lib/pdf/diagnostico.ts`:**
   - Lib: **`@react-pdf/renderer`** (lightweight, sem headless browser).
   - Mesmo conteúdo dos 7 blocos, layout adaptado A4.
   - Route handler `/api/diagnostico/pdf/[hash]` — gera e serve `application/pdf`.
   - Cache: regenera se `updatedAt` mudou.

5. **6 Automações:**

   | # | Trigger | Ação | Arquivo |
   |---|---|---|---|
   | 1 | `DiagnosticoResults` afterChange | Email resultado (já existe — atualizar template com link `/r/{hash}` + PDF anexo) | `src/lib/email/templates/resultado-diagnostico.ts` |
   | 2 | `DiagnosticoResults` afterChange | Aplicar tag faixa_fit no RD via adapter | `src/collections/DiagnosticoResults.ts` (hook) |
   | 3 | `DiagnosticoResults` afterChange + fit=alto\|medio | Notificar Gabriel (email/Slack webhook) com link resultado + dados | `src/lib/notifications/gabriel.ts` |
   | 4 | Cron 24h pós-conclusão sem agendamento + fit=baixo\|desfit | Entrada em fluxo nutrição (sequência de 5 emails) | `src/app/api/cron/nutricao-fit-baixo/route.ts` |
   | 5 | Cron 1h pós-Etapa 1 sem Etapa 2 | Email de retomada | `src/app/api/cron/reengajamento-drop-off/route.ts` (já existe) |
   | 6 | Webhook Calendly cancelamento | Email remarcar + nutrição leve | `src/app/api/webhooks/calendly/route.ts` |

### Arquivos novos/modificados

- 🆕 `src/lib/crm/rd-station.ts`
- 🆕 `src/lib/calendar/calendly.ts`
- 🆕 `src/lib/ai/openrouter.ts`
- 🆕 `src/lib/pdf/diagnostico.ts`
- 🆕 `src/lib/notifications/gabriel.ts`
- 🆕 `src/components/diagnostico/CalendlyEmbed.tsx`
- 🆕 `src/app/api/webhooks/rd-station/route.ts`
- 🆕 `src/app/api/webhooks/calendly/route.ts`
- 🆕 `src/app/api/diagnostico/pdf/[hash]/route.ts`
- 🆕 `src/app/api/cron/nutricao-fit-baixo/route.ts`
- ✏️ `src/lib/email/templates/resultado-diagnostico.ts`
- ✏️ `src/collections/DiagnosticoResults.ts` (hooks adicionais)
- ✏️ `src/globals/SiteSettings.ts` (URLs Calendly por faixa)
- ✏️ `.env.example` (todas as keys novas — vazias, comentadas com instruções)
- ✏️ `vercel.json` (crons)

### Definition of Done

- [ ] Todas as integrações funcionam em modo mock (logs claros).
- [ ] Lead novo → email mock loga payload completo.
- [ ] PDF gerado para caso Roberto contém 7 blocos.
- [ ] `SiteSettings` no admin tem 3 campos novos (URLs Calendly por faixa) — vazios.
- [ ] Webhooks validam HMAC quando recebem requisição.

### Gates QA

- **G4.1** Preencher `RD_STATION_API_KEY` fake → adapter retorna erro estruturado, `rd_sync_status='error'`, retry job pega.
- **G4.2** PDF do caso Roberto abre no Chrome, Adobe Reader e Preview macOS sem erro.
- **G4.3** Webhook Calendly assinado errado → 401.
- **G4.4** Cron drop-off não dispara para lead que completou Etapa 2.
- **G4.5** OpenRouter timeout (mockar) → fallback para textos estáticos sem quebrar fluxo.

---

## Sprint 5 — Mensuração + Painel v2

**Objetivo:** 9 eventos rastreados + dashboard de funil interno em `/painel/diagnostico`.

### Tarefas técnicas

1. **Tracking client-side — `src/lib/analytics/diagnostico-events.ts`:**
   - 9 eventos da spec §10.3.
   - Dispara para GA4 (`gtag`) e endpoint interno `/api/analytics/event`.
   - Persiste em collection `DiagnosticoEvents` (nova, append-only).

2. **Collection nova `DiagnosticoEvents`:**
   - Fields: `event_name`, `result_hash`, `lead_email`, `metadata` (JSON), `created_at`.
   - Read access: super-admin.
   - Index em `event_name` + `created_at`.

3. **Painel v2 — `/painel/diagnostico/funil`:**
   - Cards de funil: iniciados → Etapa 1 → Etapa 2 → Resultado → Agendado.
   - Conversion rate entre etapas.
   - Drilldown por padrão acionado (top P1–P8).
   - Drilldown por faixa de Fit (distribuição).
   - Filtros: data, setor, urgencia, faixa_fit.
   - Export CSV: lista de leads com scores e padrões.

4. **Painel `/painel/diagnostico/[id]`** (existente) — atualizar para v2:
   - Mostrar 5 scores + 4 dimensões de Fit + padrões acionados/exibidos + caminhos.
   - Link direto para URL pública `/r/{hash}`.
   - Botão "Reenviar email", "Sincronizar RD agora", "Forçar nova nutrição".

### Arquivos novos/modificados

- 🆕 `src/lib/analytics/diagnostico-events.ts`
- 🆕 `src/collections/DiagnosticoEvents.ts`
- 🆕 `src/app/api/analytics/event/route.ts`
- 🆕 `src/app/(painel)/painel/diagnostico/funil/page.tsx`
- 🆕 `src/app/(painel)/painel/diagnostico/funil/FunilClient.tsx`
- ✏️ `src/app/(painel)/painel/diagnostico/[id]/page.tsx`
- ✏️ `src/payload.config.ts` (registrar `DiagnosticoEvents`)

### Definition of Done

- [ ] Abrir `/diagnostico` dispara `diagnostico_iniciado` (verificar no Network e na collection).
- [ ] Painel funil mostra contagens reais e taxas de conversão.
- [ ] Export CSV gera arquivo com header e linhas corretas.
- [ ] Botão "Sincronizar RD agora" reprocessa lead.

### Gates QA

- **G5.1** Simular 10 leads via API → painel funil mostra 10 → ramificação correta.
- **G5.2** Filtro `setor=Construção` filtra também no export CSV.
- **G5.3** Drilldown P4 mostra todos os leads que tiveram P4 acionado.
- **G5.4** Performance: `/painel/diagnostico/funil` carrega < 1.5s com 1000 leads (mockar seed).

---

## Sprint 6 — Go-live & Hardening

**Objetivo:** Levar o sistema para produção com confiança.

### Tarefas técnicas

1. **Smoke tests CI:**
   - GitHub Action que roda `caso-roberto.test.ts` em cada PR.
   - E2E (Playwright): fluxo completo da Etapa 1 ao Resultado.

2. **LGPD:**
   - Atualizar tela de consentimento Etapa 1 (texto explícito sobre uso dos dados, RD, nutrição).
   - Página `/diagnostico/privacidade` linkada no footer da Etapa 1.
   - Endpoint `/api/diagnostico/lgpd/delete-me?email=` (DELETE) — soft delete em `Leads` e `DiagnosticoResults`.

3. **Anti-spam:**
   - Cloudflare Turnstile no submit da Etapa 1 (já no `.env.example`).
   - Rate limit: 5 submissions/hora por IP em `/api/diagnostico/etapa-1`.

4. **Observabilidade:**
   - Sentry no front e nas API routes (DSN já no `.env.example`).
   - Logs estruturados (JSON) com `result_hash` em todos os pontos.

5. **Documentação operacional — `docs/diagnostico-runbook.md`:**
   - Como trocar URLs Calendly.
   - Como ativar RD Station (passo a passo + checklist).
   - Como ativar OpenRouter.
   - Como rodar smoke test manual.
   - Troubleshooting comum.

6. **Checklist de go-live:**
   - [ ] `.env` produção com `RD_STATION_API_KEY`, `RD_STATION_WEBHOOK_SECRET`, `CRM_MODE=rd-station`.
   - [ ] `.env` produção com `OPENROUTER_API_KEY`.
   - [ ] `SiteSettings` no admin com 3 URLs Calendly + `CALENDLY_WEBHOOK_SIGNING_KEY`.
   - [ ] Funil "Diagnóstico Concluído" criado no RD.
   - [ ] 10 custom fields criados no RD.
   - [ ] Migration aplicada em produção.
   - [ ] Smoke test do caso Roberto passa em prod.

### Arquivos novos/modificados

- 🆕 `.github/workflows/diagnostico-smoke.yml`
- 🆕 `tests/e2e/diagnostico-fluxo-completo.spec.ts`
- 🆕 `src/app/api/diagnostico/lgpd/delete-me/route.ts`
- 🆕 `src/app/(site)/diagnostico/privacidade/page.tsx`
- 🆕 `docs/diagnostico-runbook.md`
- ✏️ `src/components/diagnostico/DiagnosticoEtapa1Form.tsx` (Turnstile)

### Definition of Done

- [ ] CI green em `main`.
- [ ] Sentry capturando erros (testar com erro forçado).
- [ ] Runbook revisado por @qa.
- [ ] Checklist 100% antes do switch produtivo.

### Gates QA

- **G6.1** Submit Etapa 1 sem Turnstile → 401.
- **G6.2** 6 submits do mesmo IP em 1h → 429 no 6º.
- **G6.3** DELETE `/api/diagnostico/lgpd/delete-me?email=x` remove lead e resultado.
- **G6.4** Erro forçado na API → aparece no Sentry com `result_hash`.

---

## Validação arquitetural (Orion atuando como @architect)

✅ **Compatibilidade Payload 3:** todas as alterações usam APIs estáveis (`afterChange`, `relationship`, `select`). Sem hacks.

✅ **Migration segura:** campos novos sempre `nullable` ou `defaultValue`. Migração de `receita_anual` → `faturamento_faixa` em script idempotente com mapping fixo.

✅ **Engine puro:** scoring não depende de DB, facilita testes e SSR.

✅ **URL hash vs JWT:** decisão correta. JWT estoura em 7 dias; hash é permanente e indexável. Privacidade preservada não expondo PII no HTML público.

✅ **OpenRouter via AIPrompts collection:** desacopla prompt de código. Versionável no admin sem deploy.

✅ **PDF com @react-pdf/renderer:** evita Puppeteer (overhead 200MB, lento no serverless). Mesmo bundle Node — Vercel safe.

✅ **Mensuração via collection própria:** `DiagnosticoEvents` separado de `DiagnosticoResults` evita poluir o doc principal e permite append-only sem locks.

⚠️ **Risco identificado:** RD Station tem rate limit não documentado (~120 req/min). Adapter precisa de queue se houver spike. **Mitigação:** Sprint 4 implementa retry + backoff; Sprint 6 monitora via Sentry.

⚠️ **Risco identificado:** `nanoid(12)` tem ~71 trilhões de combinações, colisão muito improvável mas índice único no DB garante.

---

## Sequenciamento & dependências

```
Sprint 1 (Foundation)
   │
   ├── habilita Sprint 2 (UI consome schema/engine v2)
   │
   └── habilita Sprint 3 (URL hash + 7 blocos)
                │
                ├── habilita Sprint 4 (PDF + automações que precisam do hash)
                │
                └── habilita Sprint 5 (mensuração + painel v2)
                            │
                            └── habilita Sprint 6 (go-live)
```

**Paralelismo possível:**
- Sprint 4 (adapters mock) pode começar com Sprint 3 quase finalizada.
- Sprint 5 (mensuração) pode começar com Sprint 3 finalizada.
- Sprint 6 (LGPD/runbook/CI) pode ser drafted desde Sprint 4.

---

## Estimativa (sessões de trabalho)

| Sprint | Estimativa | Risco |
|---|---|---|
| 1 — Foundation | 2 sessões | baixo |
| 2 — Etapa 1 + Quiz | 1 sessão | baixo |
| 3 — Resultado v2 | 2 sessões | médio (gráfico aranha + responsividade) |
| 4 — Integrações + PDF | 2 sessões | médio (PDF rendering edge cases) |
| 5 — Mensuração + Painel | 1 sessão | baixo |
| 6 — Go-live | 1 sessão | baixo |
| **Total** | **9 sessões** | — |

---

## Pendências externas (Matheus + Gabriel) — adiadas

| # | Item | Quando preciso |
|---|---|---|
| 1 | RD Station — 10 custom fields | Antes do go-live (Sprint 6) |
| 2 | RD Station — funil "Diagnóstico Concluído" | Antes do go-live (Sprint 6) |
| 3 | `RD_STATION_API_KEY` + `RD_STATION_WEBHOOK_SECRET` | Antes do go-live (Sprint 6) |
| 4 | `OPENROUTER_API_KEY` | Antes do go-live (Sprint 6) — opcional, fallback existe |
| 5 | Calendly: 3 URLs + signing key | Antes do go-live (Sprint 6) |

Todos os 5 estão codificados como placeholder/mock — não bloqueiam Sprints 1–5.

---

## Próximo passo

Aguardando aprovação para iniciar **Sprint 1**.
