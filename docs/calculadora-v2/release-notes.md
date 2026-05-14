# Release Notes — Calculadora de Performance v2

> Produto descartado da v1 e reescrito conforme spec literal v1.0 (`_spec_raw.txt`).
> Stack: Next.js 15 + Payload CMS 3 + Postgres (Supabase) + @react-pdf/renderer.

## 2026-05-14 — v2.0.1 (correções pós-auditoria QA + Architect)

6 fixes aplicados após auditoria pós-entrega:

1. **Auto-save dedup** (`BlocoResultado.tsx`) — `useRef` por token previne POST a cada keystroke. Persistência inicial vira singleton por sessão; updates subsequentes só on CTA/PDF/share (chamadas explícitas que já existiam).
2. **Host header injection** (`route.ts`, `pdf/route.ts`, `share/route.ts`) — novo helper `src/lib/calculadora-server/public-url.ts` usa `NEXT_PUBLIC_SITE_URL` como source-of-truth com allowlist em prod. Headers `x-forwarded-host` não confiáveis perdem efeito.
3. **Rate limit `/api/calculadora/events`** — 60 req/min/IP + content-length max 4kb (anti-flood). Mantém UX porque um lead normal emite 5-10 eventos por sessão.
4. **Rate limit `/r/[token]`** — middleware aplica 10/min/IP + `X-Robots-Tag: noindex` no header HTTP (não só meta). Cobre Diagnóstico + Calculadora.
5. **Links painel** — confirmado que `next.config` faz rewrite `/admin/*→/painel/*`. Não era bug real; reverti para `/admin/calculadora` (consistência com sidebar).
6. **Testes regra §5.3** — `aplicarNovosDefaults` extraído de `useCalculadora` para `src/lib/calculadora/aplicar-defaults.ts` (módulo puro). 6 testes cobrem: nada editado, CPL editado preservado, edição com tolerância de drift, cenário Marina §11.6.

Estado pós-fixes: **80 testes verdes**, typecheck verde, ESLint verde, ADRs todos respeitados.

## 2026-05-14 — v2.0 (entrega completa)

Entrega das 5 sprints planejadas + bloqueadores externos documentados.

### Sprint 1 — Foundation

- Módulo puro `src/lib/calculadora/*` (ADR-1, enforced por ESLint).
- Benchmarks v1.0 cobrindo 7 setores × 3 canais com nível de confiança.
- 5 fórmulas determinísticas + arredondamento §6.2.
- Insights I-A..I-D + override I-E.
- Collection `calculadora-results` estendida com 30+ campos nominados.
- Nova collection `calculadora-events` (espelha `DiagnosticoEvents`).
- Contrato cross-product `src/lib/contracts/calc-to-diag.ts (v:1)`.
- Schema Zod compartilhado client/server (ADR-6).
- 61 testes verdes (cobertura 100% em formulas/insights).

### Sprint 2 — UI Etapa 1 + 2

- Layout 2 colunas / coluna única mobile.
- Etapa 1: 4 campos (nome, e-mail, empresa, setor) + Zod.
- Etapa 2: 6 inputs (investimento+slider, canais multi, ticket, B2B/B2C, período, CRM).
- 4 premissas editáveis colapsáveis com ícone de confiança.
- Regra §5.3: troca de CRM/modelo/canais/setor atualiza defaults só se não editado.
- Hook `useCalculadora` com `useDeferredValue` + sessionStorage debounced 1s.
- Tracker debounce 700ms.
- Legacy `src/components/calculadora/CalculadoraClient.tsx` removido.

### Sprint 3 — Resultado + Insights

- 2 cards ROI animados (período + total c/ pipeline) respeitando `prefers-reduced-motion`.
- Funil visual 5 etapas com tooltips e atalho "Editar premissa".
- Bloco de insight com texto completo + override I-E paralelo.
- CTA único para `/diagnostico` com `CalcToDiagPayload` em sessionStorage + URL.
- Bloco de fontes com 6 referências + versão dos benchmarks.
- Eventos `resultado_visualizado` (singleton) e `insight_exibido` conectados.

### Sprint 4 — Persistência + Integrações

- `POST /api/calculadora` reescrita: server-side recompute (ADR-7), upsert por token, score v2, rate limit 5/h/IP.
- `POST /api/calculadora/events` para tracker client (fire-and-forget).
- Página `/r/[token]` SSR read-only com `X-Robots-Tag: noindex`.
- Adapter RD Station (`rd-calculadora.ts`) com feature flag `RD_CALC_CUSTOM_FIELDS_READY`.
- Hook `afterChange` em `calculadora-results` notifica Slack quando ticket>50k + CRM + ROI<0.
- 13 testes adicionais (anti-tamper + lead score). **74 testes verdes**.
- Auto-save: `useCalculadora.persistir()` chamado on visualização + on CTA.

### Sprint 5 — Painel + PDF + Share + Polish

- Dashboard de funil no painel admin: 5 widgets (funil completo, % premissas editadas, distribuição I-A..D, distribuição setores, ROI médio por setor).
- Detalhe v2 com 6 cards (identificação, inputs+premissas, resultado, insight, funil/status, LGPD). Fallback legacy v1.
- `GET /api/calculadora/pdf?token=X` gera PDF via `@react-pdf/renderer` (dynamic import).
- `POST /api/calculadora/share` envia link por e-mail via Resend, rate limit 3/h/IP.
- Cron `processarNutricaoPosCalculadora` com 5 estágios (D+1, D+3, D+7, D+14, D+21) + base passiva.
- LGPD ADR-9: unsubscribe link obrigatório (`GET /api/calculadora/unsubscribe`).
- Pausas automáticas: `consent.withdrawn` ou `calc_avancou_para_diagnostico`.
- Botões "Baixar PDF" + "Compartilhar por e-mail" no Shell e em `/r/[token]`.

## Dependências de setup externo (Matheus + DevOps)

Ver `docs/calculadora-v2/setup-pendente-calculadora.md`:

1. 10 custom fields no RD Station (Identificadores `cf_calc_*`).
2. Env vars Vercel: `CRM_MODE=rd-station`, `RD_STATION_API_KEY`, `RD_CALC_CUSTOM_FIELDS_READY=true`, `SLACK_WEBHOOK_URL`, `EMAIL_MODE=resend`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`.
3. Change request no produto Diagnóstico (`docs/calculadora-v2/change-request-diagnostico.md`).

## Riscos / débitos técnicos aceitos (Fast-Follow)

- **Rate limit in-memory** (ADR-8) — não sobrevive a múltiplas instâncias serverless. Migrar para Vercel KV pós go-live se tráfego justificar.
- **Anexos PDF no share** — Resend exige `attachments[]` no adapter; v1 envia só o link. Anexo é Fast-Follow.
- **Retry job RD** — leads com `rd_sync_status='failed'` ficam parados; reaplicar manualmente no admin até implementarmos retry cron.
- **Cron Vercel** — confirmar plano com paginação de 100 leads/run (Hobby 60s vs Pro 300s).

## Stats finais

- Arquivos novos/alterados: ~60.
- Testes: 74 verdes (formulas, insights, benchmarks, schema, anti-tamper, score).
- 9 ADRs registrados em `VALIDACAO-QA-ARCHITECT.md`.
- ESLint enforced: módulo puro `src/lib/calculadora/*` proibido de importar Payload/Next/React.
