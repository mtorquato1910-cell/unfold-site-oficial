# Validação QA + Architect — Sprints Calculadora v2

> Data: 2026-05-13
> Reviewers: @qa (Quinn) + @architect (Winston)
> Veredito conjunto: **GO COM AJUSTES** — plano sólido, ajustes críticos abaixo precisam aplicar antes/durante S1.

## ADRs (Architectural Decision Records) — fechados nesta validação

| # | Decisão | Origem | Sprint impactada |
| --- | --- | --- | --- |
| ADR-1 | Módulo `src/lib/calculadora/*` puro, enforced por ESLint `no-restricted-imports` (proíbe `payload`, `next/*`, `react`, `fetch`) | @architect | S1 |
| ADR-2 | PDF stack = **`@react-pdf/renderer`** com `dynamic import` no route handler. Decisão tomada agora, não na S5 | @architect | S5 (afeta S5.3) |
| ADR-3 | Token = UUID v4 sem hífens (32 chars). `/r/[token]` retorna `X-Robots-Tag: noindex`. Rate limit 10/min/IP independente da rota de submissão | @architect | S4 |
| ADR-4 | Contrato Calc→Diagnóstico vive em `src/lib/contracts/calc-to-diag.ts` com type `CalcToDiagPayload` versionado (`v: 1`). Importado pelos dois produtos | @architect | S3 |
| ADR-5 | Collection `calculadora-events` criada na **Sprint 1** (junto com S1.5), não na Sprint 4. S3.6 só conecta o tracker | @architect | S1, S3, S4 |
| ADR-6 | Schema Zod do payload em `src/lib/calculadora/schema.ts` (módulo puro), importado por `useCalculadora` + `route.ts` — evita drift client/server | @architect | S1, S2, S4 |
| ADR-7 | Política de divergência client↔server: **server sempre vence**. Divergência > 1% → log warn + evento opcional `payload_tampered` | @qa + @architect | S4 |
| ADR-8 | Rate limit in-memory aceito como **débito técnico v1**. Fast-Follow: migrar para Vercel KV / Upstash | @architect | S4 |
| ADR-9 | LGPD unsubscribe link **obrigatório** em todos os emails do fluxo de nutrição. Não é débito | @architect | S5 |

## Bloqueadores que travam a Sprint 1

1. **Stories pré-sprint criadas:**
   - **S3.0** — Change request no produto Diagnóstico (PR que aceita prefill via `?origem=calculadora&token=` + sessionStorage). Bloqueia S3.4.
   - **S4.0** — Setup custom fields no RD Station (7 campos). Owner: @devops + Matheus. Bloqueia S4.3 ou exige feature flag.
   - **S5.0** — RFC curto fechando PDF stack (resolvido por ADR-2 — apenas registrar no doc).

2. **Diretrizes técnicas para S1:**
   - Adicionar regra ESLint `no-restricted-imports` no `eslint.config.*`.
   - Criar collection `calculadora-events` junto com S1.5.
   - Criar `src/lib/contracts/calc-to-diag.ts` em S1 (mesmo que Diagnóstico só leia em sprint paralela).
   - Criar `src/lib/calculadora/schema.ts` (Zod) consumido por useCalculadora e API.

## Ajustes aplicados nas sprints existentes

### Sprint 1 — Foundation
- **S1.2 — Refinamento**: separar nos testes `valor_calculado` (decimal exato) de `valor_exibido` (inteiro arredondado). 2 asserts por número.
- **S1.2 — Adicionar testes**: ROI quando investimento_total=0 (deve retornar 0 ou exibir N/A), `cplPonderado` com 1 canal, `calcularDefaults("Outro")`, `fator_temporal` com ciclo=período (esperado 0).
- **S1.3 — Refinamento**: definir explicitamente que override I-E aparece **junto** com I-A/B/C/D (nunca substitui). Testar combinatória 4×2.
- **S1.5 — Adicionar CA**: "registros v1 (legacy) continuam renderizando sem erro 500 no painel".
- **Nova story S1.7 — Collection `calculadora-events`** (executor: @data-engineer): espelha `DiagnosticoEvents`, índice em `evento`, `result_token`, `lead_email`.
- **Nova story S1.8 — Contrato cross-product** (executor: @architect): cria `src/lib/contracts/calc-to-diag.ts` com `CalcToDiagPayload v:1` + schema Zod.
- **Nova story S1.9 — Schema Zod compartilhado** (executor: @dev): `src/lib/calculadora/schema.ts` + ESLint `no-restricted-imports`.

### Sprint 2 — UI inputs
- **S2.3 — Refinamento**: debounce **600-800ms** no tracker antes de disparar `calculadora_input_alterado`. Recálculo segue síncrono (via `useDeferredValue` do React 19).
- **S2.4 — Adicionar testes**:
  - Given premissa editada para X, when CRM muda, then permanece X.
  - Given premissa intocada, when CRM muda, then atualiza para novo default.
  - Trocar setor recalcula todas as 4 premissas não editadas.
  - Input numérico aceita máscara `R$ 15.000` e paste `15000`.
- **S2.5 — Refinamento**: persistência em sessionStorage com **debounce 1s** separado do recálculo (não no caminho quente).
- **S2.1 — Trocar CA**: substituir "Lighthouse ≥ 90" por "LCP < 2.5s mobile via WebVitals (medido na S5 com Lighthouse CI)".

### Sprint 3 — Resultado
- **Nova story S3.0 — Change request Diagnóstico** (executor: time Diagnóstico): PR no produto Diagnóstico que lê `CalcToDiagPayload` e pré-preenche Etapa 1. **Bloqueia S3.4**.
- **S3.4 — Refinamento**: token é gerado client-side, mas servidor (S4.1) valida formato e unicidade no insert. Dois cliques rápidos não criam duplicados.
- **S3.6 — Simplificar**: collection `calculadora-events` agora vem da S1.7. S3.6 só conecta o tracker `useTracker` aos eventos.
- **Adicionar testes**:
  - Insight muda quando CRM toggle dispara recálculo.
  - Override I-E aparece **junto** com I-A quando ratio > 3.
  - Screen reader anuncia novo valor após debounce com `aria-busy` durante transição.

### Sprint 4 — Persistência
- **Nova story S4.0 — Setup custom fields RD** (executor: @devops + Matheus): aplicar os 7 custom fields em prod. Bloqueia S4.3 ou ativa feature flag `RD_CALC_CUSTOM_FIELDS_READY`.
- **S4.1 — Refinamento**:
  - Política ADR-7: server sempre vence; log warn em divergência > 1%; evento opcional `payload_tampered`.
  - Validar formato UUID e checar unicidade antes do insert.
  - Schema Zod vem de `src/lib/calculadora/schema.ts` (S1.9).
- **S4.2 — Refinamento**: `/r/[token]` retorna `X-Robots-Tag: noindex` + rate limit 10/min/IP.
- **S4.3 — Refinamento**: feature flag `RD_CALC_CUSTOM_FIELDS_READY`. Sem flag, skip sync e marca `rd_sync_status='skipped'`.
- **S4.5 — Remover** (movida para S1.7).
- **S4.6 — Expandir suite**: testes de inputs forjados (investimento=1), premissa forjada (CPL=0,01), email diferente do lead com mesmo token, reposting mesmo token não duplica RD sync, sem consent → 400.
- **Adicionar S4.7 — Retry job RD** (executor: @data-engineer): cron diário que repete leads com `rd_sync_status='failed'`. Pode virar Fast-Follow se prazo apertar.

### Sprint 5 — Painel/PDF/polish
- **S5.0 — Removida** (resolvida por ADR-2 antes de S5).
- **S5.1 — Refinamento**: helper `normalizeEmail()` (lower+trim) usado nos dois lados ao cruzar com Diagnóstico. Garantir índice em `lead_email` na `calculadora-events` (cobre S1.7).
- **S5.3 — Trocar**: usar **`@react-pdf/renderer`** (ADR-2), import dinâmico no route handler. PDF reaproveita componentes "leves" (cards ROI, funil texto). SVG complexo do funil simplifica para texto no PDF.
- **S5.5 — Refinamento crítico**:
  - **Unsubscribe link obrigatório** em todos os 5 emails (ADR-9).
  - Pausa se `consent.withdrawn === true`.
  - Idempotência por `nutricao_step_atual` + lock `runId`.
  - Paginação: processar em lotes de 100 leads por execução do cron (limite Vercel 60s).
  - Confirmar plano Vercel (Hobby/Pro) com @devops — Pro tem limite 300s; Hobby 60s pode estourar.
- **S5.6 — Adicionar**: a11y de erros de form (Zod) anunciados por screen reader.

## Smoke E2E mínimo (validar antes de cada release de sprint)

1. **Marina §11.3 sem CRM** — preenche 4 campos + 6 inputs Agro/12m/sem CRM → cards exibem -20% / +7%, insight I-D, sem override I-E.
2. **Marina §11.6 toggle CRM=Sim** — clica toggle, premissas P2/P3 atualizam, cards viram +168% / +257%, insight troca para I-A em < 800ms.
3. **Premissa editada preservada** — edita CPL manualmente, troca CRM, CPL editado permanece, P2/P3 atualizam.
4. **Persistência + URL pública** — submete, recebe token, abre `/r/{token}` em aba anônima e vê os mesmos números (com `X-Robots-Tag: noindex`).
5. **Anti-adulteração** — POST direto com ROI=9999% via curl → server descarta, persiste valor correto, log warn.
6. **Cross-product** — clica CTA → Diagnóstico Etapa 1 vem com nome/email/empresa/setor pré-preenchidos. Evento `calculadora_para_diagnostico` na collection.
7. **LGPD** — sem consent → 400 + nada persiste; refresh durante Etapa 2 restaura estado; consent withdrawn pausa nutrição; unsubscribe link funciona em todos os emails.

## Riscos arquiteturais que justificam re-escopo (não bloqueio)

1. **Rate limit in-memory em serverless** — vira débito v1 (ADR-8). Fast-Follow após go-live se tráfego justificar.
2. **Cron de nutrição em Vercel** — confirmar plano antes de habilitar. Se Hobby (60s), paginar lote de 100. Se Pro (300s), folga maior.
3. **Drift schema client/server** — mitigado por ADR-6, mas exige disciplina em PRs.

## Próximos passos

1. **PM** atualiza os arquivos de sprint conforme esta validação (refinamentos S1.x, novas stories S1.7-9, S3.0, S4.0, S4.7).
2. **PM** abre conversa com time Diagnóstico para destravar S3.0.
3. **DevOps + Matheus** alinham setup RD para destravar S4.0.
4. **Architect** assina os 9 ADRs e adiciona-os a `docs/architecture/` (se existir).
5. **QA** prepara templates dos 7 cenários E2E em `tests/e2e/calculadora-v2/`.

---

Sem novos bloqueadores. Após aplicar os ajustes acima, Sprint 1 pode começar.
