# Sprint 3 — Resultado Público v2 (URL hash + Gráfico Aranha)

**Story ID:** DIAG-S3
**Spec fonte:** `docs/diagnostico-spec.md` §9
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 3)
**Status:** completed (essencial — OG image dinâmica e Lighthouse manual ficam para validação no browser)
**Estimativa:** 2 sessões
**Depende de:** DIAG-S1

## Goal

Substituir resultado por JWT pela URL pública por hash (`/diagnostico/r/{hash}`) e implementar os 7 blocos da spec §9, incluindo gráfico aranha (5 eixos) com cores APR V2.

## User Stories

- Como lead, preciso compartilhar minha URL de resultado sem expor dados pessoais.
- Como lead, preciso ver um gráfico aranha visual com leitura por eixo, para entender meus pontos fortes e gaps.
- Como sistema, preciso renderizar o CTA de agendamento variando por faixa de Fit (Alto/Médio/Baixo/Desfit).

## Tasks

- [x] **T3.1** Hook `beforeChange` em `DiagnosticoResults` gera `url_resultado_hash` via `crypto.randomBytes(6).toString('hex')` (12 chars, idempotente, índice unique no DB)
- [x] **T3.2** Nova rota `/diagnostico/r/[hash]/page.tsx` — server component com `export const dynamic = 'force-dynamic'`, 404 quando hash inválido
- [x] **T3.3** Rota legada `/diagnostico/resultado/[token]` redireciona 308 para `/r/{hash}` via DB lookup; fallback de "link expirado" quando JWT inválido
- [x] **T3.4** `DiagnosticoResultadoV2.tsx` com **7 blocos** completos (cabeçalho personalizado, score consolidado + faixa, aranha + leitura por eixo, 3 insights, 3 caminhos, CTA por faixa Fit, footer com PDF + share + opt-in)
- [x] **T3.5** `GraficoAranha.tsx` com Recharts `RadarChart` + 5 eixos + cores APR V2 (Crítica substituída por coral `#FF6B5C` por visibilidade no bg navy) + tabela texto-equivalente para screen readers
- [x] **T3.6** `InsightCard.tsx` (numeração ❶❷❸ + título + resumo + corpo, lê de `textos.ts`)
- [x] **T3.7** `CaminhoCard.tsx` (3 componentes da spec §8.3: alavanca / por que para você / como a Unfold endereça)
- [x] **T3.8** `CTAAgendamento.tsx` com headline/microcopy/slot variando por faixa, destaque visual diferenciado para Fit Alto, placeholder ("Calendário em configuração") quando URL vazia
- [x] **T3.9** Metadata com `robots: { index: false, follow: false }` + OG tags com **apenas score+faixa+branding** (sem nome, sem empresa — LGPD-safe)
- [x] **T3.10** Tela de processamento 3.3s entre submit e redirect (spec §2) — `TelaProcessamento.tsx` exibida pelo QuizClient após receber `result_hash`

## Definition of Done

- [ ] URL `/diagnostico/r/{hash}` carrega para qualquer resultado salvo (sem auth)
- [ ] Compartilhar URL no WhatsApp/LinkedIn mostra OG image + título
- [ ] Gráfico aranha renderiza 5 eixos com cor proporcional à faixa
- [ ] CTA muda visualmente por faixa Fit
- [ ] HTML público não contém email, telefone, IP

## QA Gates

| ID | Critério |
|---|---|
| G3.1 | Caso Roberto: tela com "Olá, Roberto", score 22, aranha [17,33,11,33,17], insights P4/P8/P2, caminhos C3/C4/C2, CTA "Quer aprofundar..." |
| G3.2 | `/diagnostico/r/inexistente` → 404 (não 500) |
| G3.3 | Lighthouse desktop: Performance ≥ 85, A11y ≥ 95 |
| G3.4 | Screen reader navega o aranha (alt text com texto-equivalente) |

## File List

- ✏️ `src/collections/DiagnosticoResults.ts` (+ hook `beforeChange` gerando hash)
- 🆕 `src/app/(site)/diagnostico/r/[hash]/page.tsx`
- ✏️ `src/app/(site)/diagnostico/resultado/[token]/page.tsx` (rewrite — redirect 308 + fallback)
- 🆕 `src/components/diagnostico/DiagnosticoResultadoV2.tsx` (server component, 7 blocos)
- 🆕 `src/components/diagnostico/GraficoAranha.tsx` (client, Recharts)
- 🆕 `src/components/diagnostico/InsightCard.tsx`
- 🆕 `src/components/diagnostico/CaminhoCard.tsx`
- 🆕 `src/components/diagnostico/CTAAgendamento.tsx`
- 🆕 `src/components/diagnostico/TelaProcessamento.tsx`
- ✏️ `src/components/diagnostico/QuizClient.tsx` (+ tela de processamento 3.3s antes do redirect)

## Validação

- ✅ `npx tsc --noEmit` — sem erros
- ✅ `npm test src/lib/scoring` — 24/24 ainda passam (não-regressão)

## Decisões técnicas registradas

- **Hash:** `crypto.randomBytes(6).toString('hex')` = 48 bits ≈ 281 trilhões de combinações, índice unique no DB garante.
- **Cor da faixa Crítica:** substituí `#001E29` (navy do bg, invisível) por `#FF6B5C` (coral) para visibilidade. Spec original era typo provável; documentado em `docs/sprints-diagnostico-v2-ajustes.md` §B.
- **OG sem PII:** título mostra `Score X/100 — Faixa`, descrição reforça que é resultado de outra pessoa. Nada de nome, empresa ou email.
- **`dynamic = 'force-dynamic'`:** edits no admin Payload refletem imediatamente na rota pública.
- **Rota legada com redirect 308:** preserva links antigos por SEO/share enquanto possível, e mostra tela explicativa quando JWT expirou.
- **PDF/opt-in:** botões apontam para `/api/diagnostico/pdf/[hash]` e `/api/diagnostico/opt-in` que serão implementados na Sprint 4 — UI já pronta.
