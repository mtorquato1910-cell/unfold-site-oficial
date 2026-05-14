# Sprint 1 — Foundation: Benchmarks, Fórmulas, Schema

**Sprint owner (PM):** @pm
**Status:** PROPOSTO — aguardando validação @qa + @architect
**Duração estimada:** 2 dias úteis (~12-16h)
**Bloqueia:** Sprints 2, 3, 4 (todo o resto depende desta base)

## Objetivo

Criar a base determinística da Calculadora v2: módulo de benchmarks versionado, motor de cálculo puro com as 5 fórmulas, motor de seleção de insights, types compartilhados e schema estendido da collection. Zero UI nesta sprint — só código de domínio + collection + testes.

## Por quê primeiro

A spec é numérica e fechada. Se as fórmulas/benchmarks estiverem errados, toda UI e dashboard estarão errados. Validamos o motor com o exemplo E2E da Marina Costa (§11.3 do spec) antes de tocar em qualquer pixel.

## Backlog

### Story S1.1 — Módulo de benchmarks
**Executor:** @dev
**Arquivo:** `src/lib/calculadora/benchmarks.ts`

Exportar três tabelas tipadas:

- `CPL_POR_SETOR_CANAL`: matriz setor × canal (Google/Meta/LinkedIn) com `{ valor, confianca }`. Valores da Base de Benchmarks §7.1.
- `TAXAS_QUALIFICACAO`: tabela B2B/B2C × CRM Sim/Não → `{ valor, confianca }`. Valores §7.2.
- `CONVERSOES_MQL_CLIENTE`: idem §7.3.
- `CICLO_POR_SETOR`: setor → dias + confiança. Valores §7.4.
- `SETORES`: lista de 7 setores (com `Outro`) + label PT-BR.
- `CANAIS`: 3 canais (LinkedIn, Google, Meta) + label.
- Função `calcularDefaults(setor, modelo, crm, canais): { cpl, taxa_qualif, conv_mql, ciclo, confianca_por_premissa }`.

**Critério de aceitação:**
- Todos os 7 setores × 3 canais cobertos.
- Helper `cplPonderado(setor, canais[]): { valor, confianca }` retorna média aritmética simples (spec §5.2 P1) e a menor confiança entre os canais usados.
- Snapshot test garante que mudanças nos benchmarks são deliberadas.

### Story S1.2 — Motor de cálculo
**Executor:** @dev
**Arquivo:** `src/lib/calculadora/formulas.ts`

```ts
export function calcular(inputs: CalculadoraInputs, premissas: Premissas): Resultado
```

Implementa as 5 fórmulas do §6.1 com:
- Números exatos internamente (sem arredondar entre passos).
- Função `formatarExibicao(resultado)` aplica regras de arredondamento §6.2 (inteiros para leads/MQLs/clientes, sem decimais para valores, "~" prefixo quando vier de decimal).
- `fator_temporal` usa `max(0, ...)` para ciclo ≥ período.

**Critério de aceitação:**
- Teste do exemplo §11.3 Marina (agro, 12m, sem CRM): leads=511, mqls=92, clientes=~6, periodo=4, pipeline=1, ROI_periodo=-20%, ROI_total=+7%.
- Teste do cenário §11.6 Marina com CRM=Sim: ROI_periodo=+168%, ROI_total=+257%.
- 4 testes adicionais para limites: ciclo > período, investimento = 1k mínimo, ticket muito alto, todos canais.

### Story S1.3 — Motor de insights
**Executor:** @dev
**Arquivo:** `src/lib/calculadora/insights.ts`

Constantes com os 5 textos completos (I-A a I-E) extraídos do §7.2 do spec, sem alterar uma palavra. Função `selecionarInsight(crm: boolean, roiPeriodo: number, receitaPipeline: number, receitaPeriodo: number): { principal: InsightId, override: boolean }`.

**Critério de aceitação:**
- Tabela §7.1 do spec coberta: 4 testes de combinatória (CRM × ROI sinal) + 2 testes de override I-E (ratio > 3 e ratio ≤ 3).
- Textos batem caractere a caractere com o spec.

### Story S1.4 — Types compartilhados
**Executor:** @dev
**Arquivo:** `src/lib/calculadora/types.ts`

`Setor`, `Canal`, `Modelo` ('b2b'|'b2c'), `Periodo` (3|6|12), `CalculadoraInputs`, `Premissas`, `Resultado`, `InsightId` ('I-A'|'I-B'|'I-C'|'I-D'), `Confianca` ('alta'|'media'|'baixa').

### Story S1.5 — Estender collection `calculadora-results`
**Executor:** @data-engineer
**Arquivo:** `src/collections/CalculadoraResults.ts`

Adicionar campos (todos opcionais para preservar registros legados):

- Etapa 1 v2: `setor` (select com 7 opções).
- Etapa 2: `calc_investimento_mensal` (number), `calc_canais_selecionados` (array text), `calc_ticket_medio` (number), `calc_modelo_negocio` (select b2b/b2c), `calc_periodo_meses` (select 3/6/12), `calc_crm_funcional` (checkbox).
- Premissas finais: `calc_premissa_cpl`, `calc_premissa_taxa_qualif`, `calc_premissa_conv_mql_cliente`, `calc_premissa_ciclo_dias`, `calc_premissas_editadas` (checkbox).
- Resultados: `calc_investimento_total`, `calc_leads_gerados`, `calc_mqls`, `calc_clientes_total`, `calc_clientes_no_periodo`, `calc_clientes_pipeline`, `calc_receita_periodo`, `calc_receita_pipeline`, `calc_roi_periodo`, `calc_roi_total`.
- Insight: `calc_insight_principal` (select I-A..D), `calc_insight_override` (checkbox).
- Metadados: `calc_url_resultado` (text), `calc_avancou_para_diagnostico` (checkbox), `calc_data_avancou_diagnostico` (date).
- Group `admin.group: 'Ferramentas'` mantido. Index em `setor`, `calc_insight_principal`, `calc_avancou_para_diagnostico`.

**Critério de aceitação:**
- `pnpm payload generate:types` roda sem erro.
- Painel admin Payload exibe os novos campos agrupados em tabs: "Identificação", "Inputs", "Premissas", "Resultado", "Insight", "LGPD".

### Story S1.6 — Suite de testes
**Executor:** @qa
**Arquivos:** `tests/calculadora/*.test.ts`

Cobertura mínima 100% para `formulas.ts` e `insights.ts`, ≥ 90% para `benchmarks.ts`.

## Critérios de aceitação da Sprint

1. `pnpm test src/lib/calculadora` verde, 100% lines/branches em formulas + insights.
2. `pnpm typecheck` verde.
3. Snapshot do exemplo Marina (sem CRM e com CRM) reproduz os números do spec §11.
4. Nenhum import de UI, fetch ou Payload dentro de `src/lib/calculadora/*` — módulo puro.
5. Documentação inline mínima (JSDoc nas funções públicas com referência à seção do spec).

## Riscos

- **R1** — Confiança "Baixa" em alguns benchmarks (Agro). Mitigação: já está sinalizado, UI mostrará tooltip.
- **R2** — Arredondamento pode divergir entre TS (`Math.round`) e expectativa do spec (`~9`). Mitigação: helper `formatarExibicao` documentado, snapshot tests fixos.
- **R3** — Schema da collection muda — registros legados quebram painel. Mitigação: campos opcionais + branch v1/v2 na render.

## Dependências externas

Nenhuma. Tudo é código local.

## Definition of Done

- [ ] S1.1 entregue + revisão @architect
- [ ] S1.2 entregue + 6 testes verdes
- [ ] S1.3 entregue + 6 testes verdes
- [ ] S1.4 entregue
- [ ] S1.5 entregue + types regenerados
- [ ] S1.6 cobertura ≥ 100% no motor
- [ ] @qa: smoke test do exemplo Marina passa
- [ ] PR único `feat(calc-v2): foundation` mergeado em `main`
