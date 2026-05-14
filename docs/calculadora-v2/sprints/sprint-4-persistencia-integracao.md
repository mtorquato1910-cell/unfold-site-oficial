# Sprint 4 — Persistência, Lead, Integrações (RD/CRM)

**Sprint owner (PM):** @pm
**Status:** PROPOSTO — aguardando validação @qa + @architect
**Duração estimada:** 2 dias úteis (~10-14h)
**Bloqueada por:** Sprints 1, 2, 3
**Bloqueia:** Sprint 5 (dashboard precisa de dados reais persistidos)

## Objetivo

Reescrever a API `/api/calculadora` para **persistir** o snapshot completo da v2 (campos nominados, não JSON), gerar URL única do resultado, integrar com a collection `Leads` (dedup por email), aplicar `origem_calculadora` no CRM/RD, e criar a página pública `/ferramentas/calculadora-trafego/r/[token]` que lê um resultado salvo (para o e-mail "seu resultado ainda está disponível").

## Backlog

### Story S4.1 — API POST /api/calculadora (reescrita)
**Executor:** @dev
**Arquivo:** `src/app/api/calculadora/route.ts`

Substitui chamada de IA por persistência pura. Recebe payload completo: etapa1 + inputs + premissas + resultado + insight + token. Servidor **valida** que o resultado recebido bate com o que `calcular(inputs, premissas)` produz no server (defesa contra adulteração). Se divergir, descarta o resultado do cliente e usa o seu.

Faz upsert em `leads` (dedup por email, igual hoje), aplica `origem = 'calculadora_performance'`, marca campo `tag_origem = 'origem_calculadora'`, cria `calculadora-results` com todos os campos nominados da Sprint 1.5, retorna `{ ok, token, url }`.

**Critério de aceitação:**
- Idempotência: mesmo token reposta sem criar registro duplicado (update only).
- Validação Zod nos 25+ campos.
- Rate limit mantido (5/hora por IP) com retorno 429.
- LGPD: `consent.given === true` obrigatório; rejeita 400 sem ele.
- Lead score recalculado pela fórmula da Calculadora v2:
  - investimento ≥ 50k → +30; ≥ 10k → +20; ≥ 3k → +10
  - ticket ≥ 50k → +25; ≥ 10k → +15; ≥ 3k → +8
  - CRM = Sim → +10; CRM = Não → 0
  - ROI_total > 100 → +10 (lead com sinal forte)
  - base 30. Cap 100.

### Story S4.2 — Página de resultado salvo
**Executor:** @dev
**Arquivo:** `src/app/(site)/ferramentas/calculadora-trafego/r/[token]/page.tsx`

SSR. Lê `calculadora-results` por `calc_url_resultado === token`. Se não existir, 404. Renderiza versão somente-leitura: header + cards ROI + funil + insight + CTA Diagnóstico + fontes.

Inputs/premissas exibidos como lista colapsável "Como cheguei nesses números". Sem edição.

**Critério de aceitação:**
- Token de 32 chars (UUID v4 sem hífens) — não enumerável.
- Cache `revalidate: 60s`.

### Story S4.3 — Integração com RD Station
**Executor:** @dev
**Arquivo:** `src/lib/integrations/rd-station.ts` (estender) + hook na route

Marcar lead da Calculadora com:
- `tags: ['origem_calculadora']`
- Custom fields: `cf_calc_setor`, `cf_calc_crm`, `cf_calc_investimento_mensal`, `cf_calc_ticket_medio`, `cf_calc_insight` (I-A..D), `cf_calc_roi_periodo`, `cf_calc_roi_total`.

Reaproveitar `rd_sync_status` da collection Leads. Sync best-effort (não bloqueia a resposta da API).

**Critério de aceitação:**
- Lead aparece no RD em < 60s com tag aplicada.
- Falha de RD não falha a API — log + status `failed` no lead.
- Spec deixa setup externo pendente (custom fields no RD) — documentar em `setup-pendente-calculadora.md`.

### Story S4.4 — Automação de notificação interna (alto valor)
**Executor:** @dev
**Arquivo:** `src/lib/jobs/notify-calc-high-value.ts`

Disparo: imediato após criar `calculadora-results` se `ticket_medio > 50.000 && crm = true && roi_periodo < 0`.

Notifica Gabriel via email/Slack (reaproveitar canal do Diagnóstico). Mensagem inclui link `/painel/calculadora/{id}`.

**Critério de aceitação:**
- Trigger via hook `afterChange` da collection.
- Idempotente (campo `notified_slack` já existe — usar).

### Story S4.5 — Collection `calculadora-events`
**Executor:** @data-engineer
**Arquivo:** `src/collections/CalculadoraEvents.ts`

Espelha `DiagnosticoEvents`. Campos: `evento` (select com 9 valores), `payload` (json), `lead` (rel), `result_token` (text), `ip`, `userAgent`, `ts` (createdAt).

**Critério de aceitação:**
- API `/api/calculadora/events` recebe POST do tracker client (já existe pattern no Diagnóstico).
- Indexes em `evento` e `result_token`.

### Story S4.6 — Server-side recompute de validação
**Executor:** @qa
**Arquivo:** `tests/api/calculadora.test.ts`

Testa anti-adulteração da S4.1: cliente envia ROI = 9999%, server recalcula e persiste valor correto.

## Critérios de aceitação da Sprint

1. Submeter uma calculadora persiste **todos** os 30+ campos nominados na collection.
2. Lead criado tem `tag_origem = origem_calculadora` no Payload e no RD.
3. Acessar `/ferramentas/calculadora-trafego/r/{token}` mostra o resultado salvo.
4. Notificação interna dispara nos casos de alto valor (cobertura por teste de integração).
5. Anti-adulteração: tentativa de injetar ROI alterado no payload é descartada.
6. 9 eventos chegam à collection `calculadora-events`.

## Riscos

- **R1** — Custom fields no RD ainda não criados (setup externo). Mitigação: PM abre ticket de setup com Matheus (igual ao Diagnóstico) — documentado em `setup-pendente-calculadora.md`.
- **R2** — Validação server-side adiciona latência. Mitigação: cálculo TS puro < 5ms (testado na Sprint 1).
- **R3** — Token UUID exposto em URL pode permitir scraping. Mitigação: rate limit também na rota `/r/[token]` (10/min/IP).

## Dependências

- Sprints 1, 2, 3 mergeadas.
- Setup externo no RD (custom fields) — pode rodar em paralelo, não bloqueia merge.

## Definition of Done

- [ ] 6 stories entregues
- [ ] @qa: smoke E2E (preenche calc → vê resultado → recarrega via /r/token)
- [ ] @data-engineer: schema validado, types regenerados
- [ ] @devops: variáveis de ambiente RD revisadas
- [ ] PR `feat(calc-v2): persistencia-integracoes` mergeado
