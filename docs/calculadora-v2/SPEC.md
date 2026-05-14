# Calculadora de Performance v2 — Especificação Condensada

> Fonte canônica: `_spec_raw.txt` (extraído de `calculadora_de_performance_especificacao_implementacao.md.docx` v1.0).
> Benchmarks: `_benchmarks_raw.txt` (extraído de `base_benchmarks_calculadora_performance.md.docx` v1.0).
> Em caso de divergência, o `.docx` original prevalece.

## 1. Escopo de mudança vs estado atual

Estado atual (`/ferramentas/calculadora-trafego`):

- Form linear de 4 etapas com submit único e cálculo via IA (Claude/OpenRouter).
- Collection Payload `calculadora-results` com `inputs` / `output` em JSON.
- Painel `/painel/calculadora` com listagem + detalhe (read-only).
- Sem fórmulas determinísticas, sem benchmarks, sem insights, sem PDF, sem dashboard, sem passagem para Diagnóstico.

Alvo (v2):

- Layout 2 colunas (desktop) / 1 coluna (mobile): inputs + premissas à esquerda, resultado dinâmico à direita.
- Etapa 1: 4 campos (nome, email, empresa, **setor**).
- Etapa 2: 6 inputs (investimento, canais multi, ticket, B2B/B2C, período 3/6/12, CRM Sim/Não) + 4 premissas editáveis (CPL, taxa qualif, conv MQL→Cliente, ciclo).
- Cálculo determinístico (5 fórmulas), recálculo em tempo real, sem chamada de IA.
- 5 insights condicionais (I-A a I-D principal + I-E override).
- Persistência por campos nominados (não JSON opaco), passagem de dados para `/diagnostico`, evento `calculadora_para_diagnostico`.
- PDF download + share por email.
- Painel: dashboard de funil + distribuição de insights + setores + taxa de edição de premissas.

## 2. Princípios não-negociáveis

1. **Recálculo é determinístico** — fórmulas puras em TS, sem IA no fluxo síncrono.
2. **Benchmarks são versionados** — módulo `benchmarks.ts` exportando defaults com nível de confiança; nunca embutir números em componentes.
3. **CTA único pós-resultado** — ponte para `/diagnostico`. Sem Calendly direto.
4. **Etapa 1 não tem cargo/faturamento** — só Diagnóstico pede.
5. **Dados Etapa 1 da Calculadora passam para Etapa 1 do Diagnóstico** via URL params + sessionStorage.
6. **LGPD preservada** — campos `consent`/`retentionUntil` mantidos.
7. **Lead score** — recalculado pela ótica da Calculadora (investimento + ticket + presença de CRM); cargo deixa de existir aqui.
8. **Insights são prosa fechada** — textos I-A a I-E vivem em constantes do código + collection `insights-variations` para edição admin (reaproveitar pattern do Diagnóstico).

## 3. Mapa de fórmulas (referência rápida)

```
investimento_total       = investimento_mensal × meses
leads_gerados            = investimento_total / CPL_aplicado
CPL_aplicado             = média dos CPLs dos canais selecionados (setor)
mqls                     = leads_gerados × taxa_qualificacao
clientes_fechados        = mqls × conversao_mql_cliente
periodo_dias             = meses × 30
fator_temporal           = max(0, (periodo_dias - ciclo_medio) / periodo_dias)
clientes_no_periodo      = clientes_fechados × fator_temporal
clientes_em_pipeline     = clientes_fechados × (1 - fator_temporal)
receita_no_periodo       = clientes_no_periodo × ticket_medio
receita_em_pipeline      = clientes_em_pipeline × ticket_medio
ROI_no_periodo           = (receita_no_periodo - investimento_total) / investimento_total × 100
ROI_total                = (receita_no_periodo + receita_em_pipeline - investimento_total) / investimento_total × 100
```

Insights:

| Insight | Condição |
| --- | --- |
| I-A | CRM=Sim & ROI_periodo ≥ 0 |
| I-B | CRM=Sim & ROI_periodo < 0 |
| I-C | CRM=Não & ROI_periodo ≥ 0 |
| I-D | CRM=Não & ROI_periodo < 0 |
| I-E (override paralelo) | (receita_em_pipeline / receita_no_periodo) > 3 |

## 4. Decisões de implementação fechadas (Orion)

- **DB**: continuar em Payload CMS (Postgres/Supabase). Não migrar para Supabase nativo — Payload já é a camada canônica do site.
- **Benchmarks**: arquivo TS `src/lib/calculadora/benchmarks.ts` versionado, com tipo `Confianca = 'alta' | 'media' | 'baixa'`. Em sprint posterior pode virar collection editável; v1 fica em código.
- **Insights**: constantes em `src/lib/calculadora/insights.ts` (igual padrão do Diagnóstico). Collection editável fica como Fast-Follow.
- **Cálculo**: 100% client-side em hook `useCalculadora()`. Server só persiste e gera PDF.
- **PDF**: gerado server-side com `@react-pdf/renderer` (já no projeto? checar) ou `pdf-lib`. Decisão na Sprint 5.
- **Eventos**: reaproveitar `useEventTracker` do Diagnóstico (já implementado conforme commit `e4d0985`).
- **Layout**: APR V2 paleta. Tipografia display Relicus já no projeto. Reaproveitar `<input-field>` global.

## 5. Compatibilidade com legado

A versão atual da calculadora é descartada. Histórico de submissões antigas:

- Campos `inputs`/`output` (JSON) permanecem na collection (deprecated, opcionais).
- Painel exibe novos registros com os campos v2 nominados; legados continuam visíveis como "Submissão v1 (legacy)" usando o JSON antigo.
- Sem migração de dados — a base atual é pequena e os números são diferentes (IA vs fórmulas).

## 6. Componentes do entregável

```
src/
├── lib/calculadora/
│   ├── benchmarks.ts          # CPL, taxas, ciclos por setor/canal/CRM
│   ├── formulas.ts            # 5 fórmulas + helpers de arredondamento
│   ├── insights.ts            # I-A a I-E + função de seleção
│   └── types.ts               # CalculadoraInputs, Premissas, Resultado
├── app/(site)/ferramentas/calculadora-trafego/
│   ├── page.tsx               # SSR landing + metadata
│   └── _components/
│       ├── CalculadoraShell.tsx        # orquestrador 2 colunas
│       ├── Etapa1Qualificacao.tsx      # 4 campos + LGPD
│       ├── BlocoInputs.tsx             # 6 inputs (Etapa 2)
│       ├── BlocoPremissas.tsx          # 4 premissas + confiança
│       ├── BlocoResultado.tsx          # 2 cards ROI + funil
│       ├── BlocoInsight.tsx            # I-A..D + override I-E
│       ├── BlocoCTA.tsx                # ponte para /diagnostico
│       └── BlocoFontes.tsx             # rodapé
├── app/api/calculadora/
│   ├── route.ts               # persistência (não calcula)
│   ├── pdf/route.ts           # geração de PDF
│   └── share/route.ts         # envio por e-mail
├── app/(painel)/painel/calculadora/
│   ├── page.tsx               # dashboard + listagem
│   ├── DashboardFunil.tsx
│   └── [id]/page.tsx          # detalhe v2
└── collections/
    └── CalculadoraResults.ts  # estende com 30+ campos nominados
```

## 7. Critérios de aceitação globais

- A 11.x **exemplo end-to-end** (Marina Costa, agro, sem CRM, 12m) bate número a número com a tela.
- Edição de CRM Sim → Não atualiza P2 e P3 automaticamente, exceto se já editadas.
- Lead que vem da Calculadora aparece no `/diagnostico` com nome/email/empresa/setor pré-preenchidos.
- PDF baixado contém todos os blocos (inputs, premissas, resultado, insight, fontes).
- Painel exibe funil (Visitas → Etapa 1 → Resultado → CTA → Diagnóstico) e distribuição I-A/B/C/D.
- Cobertura de testes: fórmulas 100%, seleção de insight 100%, persistência + integração ≥ 80%.

---

**Owner do produto:** Matheus (Unfold)
**PM responsável pela criação das sprints:** @pm
**Validadores:** @qa + @architect (pre-sprint review)
**Última atualização:** 2026-05-13
