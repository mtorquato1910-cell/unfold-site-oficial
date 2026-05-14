# Sprint 3 — Resultado dinâmico + Insights + CTA Diagnóstico

**Sprint owner (PM):** @pm
**Status:** PROPOSTO — aguardando validação @qa + @architect
**Duração estimada:** 2 dias úteis (~10-14h)
**Bloqueada por:** Sprints 1, 2
**Bloqueia:** Sprint 4 (persistência precisa do estado final)

## Objetivo

Substituir o stub de resultado por: 2 cards de ROI (período + total com pipeline), funil visual de 5 etapas com tooltips, bloco de insight personalizado (I-A a I-D) com override opcional I-E, CTA único para o Diagnóstico, e bloco de fontes (rodapé).

## Backlog

### Story S3.1 — Cards ROI
**Executor:** @dev
**Arquivo:** `_components/BlocoResultado.tsx`

Grid 2×1 desktop / coluna mobile.

- Card 1: "ROI no período" — número grande com sinal, "Receita: R$ X" abaixo.
- Card 2: "ROI total (com pipeline)" — número + "Pipeline: R$ X".
- Cor: ROI ≥ 0 → fundo mint sutil; ROI < 0 → fundo purple discreto da paleta (não vermelho).
- Peso visual idêntico.

Eventos: `resultado_visualizado` na primeira vez que cards renderizam com inputs válidos.

**Critério de aceitação:**
- Animação número-a-número (~250ms) ao mudar valor.
- Acessibilidade: `aria-live="polite"` para leitura por screen readers a cada recálculo (debounce 800ms).

### Story S3.2 — Funil visual de 5 etapas
**Executor:** @dev + @ux-design-expert
**Arquivo:** `_components/FunilVisual.tsx`

Cinco linhas: Investimento → Leads → MQLs → Clientes → split (Período / Pipeline). Cada linha:
- Valor formatado (regras §6.2 do spec).
- % aplicada como sub-label (CPL, taxa qualif, conv MQL→Cliente).
- Tooltip no hover mostrando premissa e link "Editar premissa" que rola até o bloco de premissas e expande.

**Critério de aceitação:**
- Pegar exemplo §11.5 Marina e validar render visual com print comparativo no story.
- Tooltip funciona no mobile via tap.

### Story S3.3 — Bloco de insight
**Executor:** @dev
**Arquivo:** `_components/BlocoInsight.tsx`

Largura total. Card principal com título + corpo (70-90 palavras, textos do spec §7.2). Se override I-E ativo, card secundário menor abaixo: "Observação adicional sobre seu ciclo de venda" + texto I-E.

**Critério de aceitação:**
- Evento `insight_exibido` dispara com `{ principal, override }` quando insight muda.
- Textos vêm de `src/lib/calculadora/insights.ts` (Sprint 1) — proibido inline.
- Transição suave (fade 200ms) quando insight troca de tipo.

### Story S3.4 — CTA Diagnóstico (Bloco E)
**Executor:** @dev
**Arquivo:** `_components/BlocoCTA.tsx`

Card de destaque visual. Headline fixa (spec §8.2 Bloco E). Botão "Fazer o Diagnóstico de Growth →" com:

- `href = /diagnostico?origem=calculadora&token={uuid}` — token corresponde ao registro persistido (Sprint 4 implementa persistência; Sprint 3 já gera o token e passa por URL).
- onClick: dispara evento `calculadora_para_diagnostico`, persiste sessionStorage `calc-v2:para-diagnostico` com payload (nome, email, empresa, setor, ticket, investimento, crm).
- Diagnóstico (separado) lê esse payload para pré-preencher Etapa 1 — **change request** documentado em §9 do spec, executado em sprint paralela do time Diagnóstico (fora deste escopo, mas combinado).

**Critério de aceitação:**
- Em mobile, este card aparece **antes** do bloco de fontes (spec §8.2 Bloco E nota mobile).
- Token gerado é UUID v4 e fica disponível em `state.token` do hook.

### Story S3.5 — Bloco de fontes (Bloco F)
**Executor:** @dev
**Arquivo:** `_components/BlocoFontes.tsx`

Lista de 6 fontes da Base de Benchmarks §6 + texto "Base de benchmarks v1.0 — atualizada em maio de 2026." Tipografia mono pequena, sem CTA.

### Story S3.6 — Integração de eventos
**Executor:** @dev
**Arquivo:** `src/lib/calculadora/useTracker.ts` (novo) ou reaproveita `useEventTracker` do Diagnóstico

Mapear os 9 eventos do spec §10.3 para o tracker existente:
`calculadora_iniciada`, `etapa_1_concluida`, `calculadora_input_alterado`, `premissa_alterada`, `resultado_visualizado`, `insight_exibido`, `pdf_baixado` (stub, Sprint 5), `resultado_compartilhado` (stub), `calculadora_para_diagnostico`.

**Critério de aceitação:**
- Eventos chegam à collection `calculadora-events` (criar se não existir — espelhar `DiagnosticoEvents`).
- @data-engineer cria a collection.

## Critérios de aceitação da Sprint

1. Exemplo §11.5 Marina exibido na tela bate número a número (snapshot visual aprovado por Matheus).
2. Trocar CRM Sim↔Não muda o insight em < 800ms (anim + recálculo).
3. CTA do Diagnóstico carrega `/diagnostico` com query params e o sessionStorage populado.
4. Funil exibe valores arredondados conforme §6.2.
5. Sem regressão nos sprints 1/2 (`pnpm test` verde).

## Riscos

- **R1** — Integração com o Diagnóstico exige sprint paralela no outro produto. Mitigação: PM combina backlog com time Diagnóstico antes de iniciar S3.4; documento de change `/diagnostico/etapa1-aceita-prefill.md` registrado.
- **R2** — Tooltip mobile não-trivial. Mitigação: @ux-design-expert define padrão (tap-to-show, dismiss on outside tap).
- **R3** — Animação número-a-número pode causar jitter em mobile fraco. Mitigação: skip animação se `prefers-reduced-motion`.

## Dependências

- Sprints 1 e 2 mergeadas.
- @data-engineer disponível para criar collection `calculadora-events`.
- Time Diagnóstico aceita a passagem de dados (combinar antes da S3.4).

## Definition of Done

- [ ] 6 stories entregues
- [ ] @qa: cenários §11.5 e §11.6 validados na UI
- [ ] @ux-design-expert: aprovação visual + acessibilidade
- [ ] @architect: revisão do contrato de query params com Diagnóstico
- [ ] PR `feat(calc-v2): resultado-insights-cta` mergeado
