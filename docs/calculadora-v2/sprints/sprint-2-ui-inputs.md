# Sprint 2 — UI: Etapa 1 + Etapa 2 (inputs + premissas + recálculo)

**Sprint owner (PM):** @pm
**Status:** PROPOSTO — aguardando validação @qa + @architect
**Duração estimada:** 3 dias úteis (~16-20h)
**Bloqueada por:** Sprint 1
**Bloqueia:** Sprint 3 (resultado depende da estrutura de inputs)

## Objetivo

Implementar a interface da Calculadora v2 do começo da Etapa 1 até o final da Etapa 2, com recálculo em tempo real **funcional** (a tela à direita mostra resultado bruto enquanto Sprint 3 ainda não polou os cards). Construir o esqueleto 2 colunas, os 4 campos de qualificação, os 6 inputs, as 4 premissas editáveis com nível de confiança, e o hook de estado que conecta tudo com `formulas.calcular()`.

## Backlog

### Story S2.1 — Shell e roteamento
**Executor:** @dev
**Arquivos:**
- `src/app/(site)/ferramentas/calculadora-trafego/page.tsx` (reescrever)
- `src/app/(site)/ferramentas/calculadora-trafego/_components/CalculadoraShell.tsx`

Header (Bloco A) + grid 2 colunas (Bloco B + Bloco C). Etapa 1 ocupa Bloco B até concluir; depois Bloco B vira inputs+premissas e Bloco C aparece. Mobile = coluna única, Bloco C abaixo.

**Critério de aceitação:**
- Lighthouse Performance ≥ 90 em mobile.
- Layout responsivo testado em 360/768/1280px.

### Story S2.2 — Etapa 1 (qualificação)
**Executor:** @dev
**Arquivo:** `_components/Etapa1Qualificacao.tsx`

4 campos: nome (text), email (email), empresa (text), setor (select com 7 opções). Validação Zod inline. Microcopy abertura: "Para acessar a Calculadora, precisamos apenas de algumas informações básicas. Leva menos de 30 segundos." Botão: "Acessar a Calculadora".

Ao submeter: dispara `etapa_1_concluida`, salva em sessionStorage como `calc:etapa1`, transita para Etapa 2.

**Critério de aceitação:**
- Não permite avançar sem os 4 campos válidos.
- Dispara evento `etapa_1_concluida` com payload `{ setor }`.
- Persistência local sobrevive refresh.

### Story S2.3 — Bloco de inputs (Etapa 2)
**Executor:** @dev
**Arquivo:** `_components/BlocoInputs.tsx`

6 inputs conforme §4.2:
1. Investimento mensal — numérico R$ com máscara + slider 1k-500k.
2. Canais — checkboxes multi (LinkedIn / Google / Meta), mín. 1.
3. Ticket médio — numérico R$ sem máximo.
4. Modelo — toggle B2B (default) / B2C.
5. Período — select 3/6/12, default 6.
6. CRM funcional — toggle Sim/Não, sem default.

Microcopy idêntica ao spec (já inclui reframe Unfold no input 6).

**Critério de aceitação:**
- Estado dos 6 inputs em hook `useCalculadora()` (criado nesta story).
- Cada mudança dispara evento `calculadora_input_alterado` com `{ input, valor }`.
- Validação leve client-side: investimento ≥ 1.000, ticket ≥ 1.000, canais ≥ 1, CRM definido para liberar cálculo.

### Story S2.4 — Bloco de premissas
**Executor:** @dev
**Arquivo:** `_components/BlocoPremissas.tsx`

Bloco colapsável fechado por default ("Ajustar premissas do mercado"). Ao abrir, mostra as 4 premissas com:

- Label + campo editável (number).
- Valor inicial vindo de `calcularDefaults()` (Sprint 1).
- Ícone de confiança (verde/amarelo/laranja) com tooltip "Nível de confiança da fonte do benchmark. Edite o valor se sua operação tem dados próprios."
- Botão "Resetar premissas para defaults do setor" — aparece apenas se alguma foi editada.

Lógica de atualização dinâmica do §5.3: quando lead muda input 6 (CRM), P2 e P3 atualizam para o novo default **só se** o valor atual == default anterior. Implementar via comparação contra refs do default vigente.

**Critério de aceitação:**
- Editar uma premissa dispara `premissa_alterada` com `{ premissa, valor }` (debounce 400ms para não flood).
- Botão "Resetar" volta as 4 ao default atual do setor+modelo+CRM.
- Trocar CRM Sim↔Não atualiza P2/P3 não editadas; preserva editadas (cenário §5.3).
- Cada premissa tem aria-label e tooltip acessível via teclado.

### Story S2.5 — Hook `useCalculadora()`
**Executor:** @dev
**Arquivo:** `src/lib/calculadora/useCalculadora.ts`

State central: `{ etapa1, inputs, premissas, premissasEditadas, resultado, insight }`. Recálculo automático via `useMemo` quando inputs/premissas mudam. Expõe ações: `setInput`, `setPremissa`, `resetPremissas`, `concluirEtapa1`.

**Critério de aceitação:**
- Recálculo executa em < 5ms para um conjunto de inputs (benchmark via `performance.now()` em teste).
- Nunca chama `fetch` durante recálculo.
- Persistência opcional em sessionStorage `calc:state`.

### Story S2.6 — Stub do Bloco Resultado
**Executor:** @dev
**Arquivo:** `_components/BlocoResultado.tsx`

Versão mínima: exibe os 10 números crus em uma lista (sem cards, sem funil). Só para validar que o hook está propagando.

## Critérios de aceitação da Sprint

1. Rota `/ferramentas/calculadora-trafego` em produção exibe a Etapa 1 funcional.
2. Após Etapa 1, layout 2 colunas aparece com os 6 inputs e a lista de premissas colapsada.
3. Editar qualquer input/premissa atualiza a coluna direita (stub) em tempo real, < 50ms percebido.
4. Trocar CRM Sim↔Não com premissas não editadas recalcula automaticamente.
5. `pnpm typecheck` + `pnpm lint` verdes.
6. Eventos `etapa_1_concluida`, `calculadora_input_alterado`, `premissa_alterada` aparecem no console (tracker real vem na Sprint 4).

## Riscos

- **R1** — Performance ruim com slider + recálculo. Mitigação: throttle 60fps no slider; `useMemo` no cálculo.
- **R2** — Confusão UX com bloco de premissas colapsado. Mitigação: tooltip ao lado do título + microcopy "Personalize com dados da sua operação".
- **R3** — Conflito com sessão antiga (calculadora v1 deixou cookies). Mitigação: chave nova `calc-v2:*` em sessionStorage.

## Dependências

- Sprint 1 mergeada (`formulas.calcular`, `benchmarks.calcularDefaults`, types).

## Definition of Done

- [ ] 6 stories entregues
- [ ] @qa: smoke manual nos 3 breakpoints (360/768/1280)
- [ ] @ux-design-expert: passada de revisão visual (paleta APR V2, tipografia Relicus)
- [ ] PR `feat(calc-v2): etapa-1-e-2` mergeado
