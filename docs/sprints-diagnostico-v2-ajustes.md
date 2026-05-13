# Ajustes pós-revisão QA + Architect — Diagnóstico v2

**Data:** 2026-05-13
**Aplicados sobre:** `docs/sprints-diagnostico-v2.md`
**Veredicto QA:** APROVADO COM AJUSTES
**Veredicto Architect:** APROVADO COM AJUSTES

---

## 1. Bloqueadores técnicos (resolvidos antes da Sprint 1)

### B1 — PDF: gráfico aranha não renderiza em `@react-pdf/renderer`
**Problema:** Recharts é DOM/SVG-only, não funciona dentro de PDF.
**Decisão:** trocar stack do PDF para **`satori` + `@resvg/resvg-js`** (gera PNG do JSX server-side, embeda no PDF).
**Onde aplica:** Sprint 4 — `src/lib/pdf/diagnostico.ts`.
**Reuso:** componentes React do Sprint 3 viram source do `satori` direto.

### B2 — Migration faturamento: anual ≠ mensal
**Problema:** `receita_anual` (faixas em MM/ano) e `faturamento_faixa` (faixas em mil/mês) não têm mapping 1:1 confiável (R$1MM/ano ≈ R$83k/mês cai entre 2 faixas).
**Decisão:** migração em **2 releases**:
- Release atual (Sprint 1): `faturamento_faixa` nullable, `receita_anual` intacto. Novos leads escrevem em `faturamento_faixa`. Leads legados ficam `null` com tag `legacy_receita_anual`.
- Release +2 (Sprint 6 ou pós-launch): drop `receita_anual` após audit de reports.

### B3 — Cache SSR na rota pública `/r/[hash]`
**Problema:** Next 15 App Router faz cache estático por padrão → edits no Payload não refletem.
**Decisão:** adicionar `export const dynamic = 'force-dynamic'` na rota `/diagnostico/r/[hash]/page.tsx` (Sprint 3).

### B4 — OG tags vazam PII
**Problema:** OG image com nome+empresa+score é indexável por crawlers (LGPD/PII).
**Decisão padrão:** OG image **sem nome**, só com score consolidado + faixa de maturidade + branding Unfold. Aguardando confirmação do dono (ver seção 3).

### B5 — Sprint 5 NÃO depende de Sprint 3
**Problema:** Plano lista Sprint 5 (mensuração) bloqueada por Sprint 3 (URL hash).
**Decisão:** Sprint 5 pode rodar **em paralelo** com Sprint 3 a partir do término da Sprint 2 (que grava `result_hash`). Eventos `diagnostico_concluido` podem ser emitidos server-side no POST `/etapa-2`.

### B6 — Tela de processamento 3–5s não está no plano
**Problema:** Spec §2 exige tela com microcopy ("Analisando suas respostas...", etc.).
**Decisão:** adicionar à **Sprint 3** (junto da reformulação do resultado) — componente `TelaProcessamento.tsx` exibido entre o último submit da Etapa 2 e o redirect para `/r/{hash}`.

### B7 — PDF cache em blob storage
**Problema:** Plano regenera PDF a cada clique (300–800ms cold).
**Decisão:** Sprint 4 persiste PDF em **Vercel Blob** na primeira geração, com cache key `${hash}-${updatedAt}-${textsVersion}`.

### B8 — Q4=E precisa persistir letra bruta
**Problema:** Engine traduz E→0 pontos mas o DB perde o sinal "ausência de medição vs <20%".
**Decisão:** persistir `q4_raw='E'` em `respostas_etapa1_raw` (JSON) além do valor convertido. Aplica em Sprint 1.

### B9 — Postgres ALTER TYPE em enums
**Problema:** Adicionar valor a enum Postgres exige statement fora de transação; drizzle-kit pode falhar.
**Decisão:** usar `select` no Payload (string com `options`) em vez de enum nativo Postgres. Já é o padrão atual — manter. Sprint 1 NÃO cria enums nativos.

---

## 2. Gates QA adicionais (consolidados nas stories)

### Sprint 1 — adicionar 5 gates
- **G1.6** Fit de Dor com soma=8 e =9 retorna 70 (curva U invertido, branch 8-9 testado)
- **G1.7** Empate em prioridade base com >2 padrões → desempate determinístico pela hierarquia (P4>P3>P8>P2>P7>P1>P6>P5)
- **G1.8** Fallback §7.2 com 2 eixos baixos mapeando para mesmo padrão → sem duplicação na lista final
- **G1.9** Engine determinística — 1000× mesmo input retorna scores idênticos (sem `Math.random`, sem dependência de ordem de `Object.entries`)
- **G1.10** Score Gestão = 99.99 com 3 sinais máximos → arredondar para 100, clamp [0,100]

### Sprint 2 — adicionar 3 gates
- **G2.5** Retomada de sessão pós-drop-off: link do email reabre Etapa 1 com dados preservados, JWT regenerado
- **G2.6** Submit duplicado do Etapa 2 (double-click/retry) → idempotência por `(lead_id, token)`, não cria 2 results
- **G2.7** 2 abas com mesmo token submetem respostas diferentes → última gravação vence, sem corromper DB

### Sprint 3 — adicionar 3 gates
- **G3.5** Crawler Googlebot em `/r/{hash}` → `X-Robots-Tag: noindex` no header HTTP + OG image sem PII
- **G3.6** Enumeração: 1000 requests a hashes inválidos têm timing constante (anti-side-channel)
- **G3.7** Aranha com score 0 em todos os eixos renderiza polígono válido (não NaN/degenerado)

### Sprint 4 — adicionar 4 gates
- **G4.6** Idempotência: `afterChange` disparado 2× para mesmo doc não envia 2 notificações ao Gabriel nem 2 emails ao lead (flag `notificado_at`)
- **G4.7** Webhook Calendly retry com mesmo `event_id` → automação 6 só dispara uma vez
- **G4.8** PDF não contém PII além do primeiro nome (escaneamento de bytestream sem email/telefone)
- **G4.9** Falha no RD não bloqueia geração do resultado para o lead (degradação graciosa, retry em background)

### Sprint 5 — adicionar 2 gates
- **G5.5** `DiagnosticoEvents` anti-flood: lead que recarrega 50× não gera 50× `diagnostico_iniciado` (dedup por session_id)
- **G5.6** Filtros do painel respeitam timezone BRT (relatórios diários cortam às 23:59 BRT, não 21h UTC)

### Sprint 6 — adicionar 3 gates
- **G6.5** Migration rollback testado: aplicar v2 → reverter → dados antigos voltam intactos
- **G6.6** LGPD `delete-me` remove também `DiagnosticoEvents` e PDF cacheado em Vercel Blob
- **G6.7** Rate limit por IP funciona atrás do CDN: leitura correta de `X-Forwarded-For`, não rate-limita IP da Vercel

**Total novo:** 20 gates adicionais → **43 gates totais**.

---

## 3. Ambiguidades da spec (escaladas ao dono — ver §3 abaixo)

| # | Local | Ambiguidade | Sugestão da revisão |
|---|---|---|---|
| A1 | §5.4 Sinal 2 | `Q10=A/B + Q12=B = 0.6` é MENOR que `Q12=A = 0.75`. Contra-intuitivo (B mais maduro que A). | Provável typo. Trocar para 0.8 (acima de A) ou confirmar com produto. |
| A2 | §6.3 Fit Dor | `Q4=E` pontua 0 (=pouca dor). Mas E = "não tem como medir" semanticamente é dor alta. | Confirmar: manter spec (0) OU tratar E como B (1 ponto) no Fit de Dor. |
| A3 | §7.2 Fallback | Eixo Diagnosticar mapeia para "P1 ou P3" sem critério de desempate. | Definir: ordem por prioridade base (P3 antes de P1). |
| A4 | §7.2 Empate múltiplo | Hierarquia P4>P3>P8>P2>P7>P1>P6>P5 é total (ordem única) — empate ≥4 resolvido. | OK, não precisa decisão. |

A3 e A4 podem ser decididas internamente (determinístico). **A1 e A2 precisam do dono** — afetam scoring de leads no caso real.

---

## 4. Decisão estratégica adicional

### D1 — OpenRouter vs Anthropic SDK direto

`@anthropic-ai/sdk` **já está instalado** no projeto. Anthropic direto oferece:
- ✅ Prompt caching nativo (cache hit em prompts longos de `AIPrompts`)
- ✅ Mais barato (sem markup do gateway)
- ✅ Suporte oficial para `claude-sonnet-4-6` (modelo mais recente, dezembro/2025)
- ❌ Lock-in maior, sem fallback automático para outros providers

OpenRouter (plano atual):
- ✅ Fallback automático para outros providers
- ✅ Model ID único `anthropic/claude-sonnet-4.5` agnóstico
- ❌ Markup ~10-20%, sem prompt caching nativo
- ❌ Memória diz "Claude Sonnet 4.5 via OpenRouter" mas SDK direto é mais idiomático

**Recomendação Architect:** Anthropic SDK direto. **Aguardando confirmação do dono.**

---

## 5. Decisões técnicas aplicadas (sem ação do dono)

Todas estas são incorporadas no plano e nas stories sem precisar de aprovação:

| # | Decisão |
|---|---|
| 1 | PDF via `satori` + `@resvg/resvg-js` (substitui `@react-pdf/renderer` puro) |
| 2 | Migration faturamento em 2 releases (additive primeiro, drop depois) |
| 3 | `export const dynamic = 'force-dynamic'` na rota `/r/[hash]` |
| 4 | Sprint 5 paralela à Sprint 3 a partir de S2 concluída |
| 5 | Tela de processamento 3–5s adicionada à Sprint 3 |
| 6 | PDF cacheado em Vercel Blob (key inclui versão dos textos) |
| 7 | Q4 letra bruta persistida em `respostas_etapa1_raw` |
| 8 | Manter `select` Payload (não enum Postgres nativo) |
| 9 | Tela 404 "diagnóstico removido" para leads que executaram LGPD delete-me |
| 10 | `data-testid` distintos em CTAs por faixa de Fit |
| 11 | Texto-equivalente do aranha em `<table>` oculta (screen readers) |
| 12 | Property-based test com `fast-check` no engine (input válido → nunca NaN/null) |
| 13 | Snapshot test de 50 casos sintéticos cobrindo combinações de faixa |
| 14 | Anti-flood `DiagnosticoEvents` via `session_id` |
| 15 | Source maps Sentry configurados em prod |
| 16 | Backup Postgres antes da migration (snapshot Supabase) |
| 17 | Smoke E2E rodado 10× consecutivos em CI (anti-flakiness) |
| 18 | DELETE LGPD por POST com token assinado (não GET com email) |
| 19 | Dry-run obrigatório de migration antes de aplicar em prod |
| 20 | OG image dinâmica gerada via `@vercel/og` sem PII (só score+faixa+branding) |

---

## 6. Próximo passo

3 decisões aguardam o dono (Matheus):

1. **A1 (spec §5.4 Sinal 2):** typo `Q12=B = 0.6`? Trocar para 0.8 ou confirmar manter 0.6?
2. **A2 (spec §6.3 Fit Dor):** `Q4=E` pontua 0 (mantém spec) OU vira 1 ponto (tratamento semântico)?
3. **D1 (gateway IA):** Anthropic SDK direto (recomendado) ou manter OpenRouter?

Após as 3 respostas, **Sprint 1 inicia** com o engine v2 codificado corretamente desde o começo.
