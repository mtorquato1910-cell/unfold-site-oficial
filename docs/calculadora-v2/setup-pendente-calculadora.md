# Setup externo pendente — Calculadora de Performance v2

> Itens que precisam de ação fora do código antes do go-live da Sprint 4.
> Owner: **Matheus** (com apoio @devops).
> Atualizado: 2026-05-13.

## Sumário rápido

| # | Item | Onde | Obrigatório p/ | Sem isso… |
| --- | --- | --- | --- | --- |
| 1 | 7 custom fields no RD Station | Painel RD → Configurações → Campos personalizados | Sprint 4 / S4.3 ir para prod com flag ON | Lead vai ao RD sem tags/CF customizadas (`rd_sync_status='skipped'`) |
| 2 | Var `RD_CALC_CUSTOM_FIELDS_READY=true` em prod | Vercel env vars | S4.3 ativar custom fields | Mock-only no RD |
| 3 | Var `CRM_MODE=rd-station` em prod | Vercel env vars (já existe?) | Toda a S4.3 | Mock-only (já é o default em dev) |
| 4 | Var `RD_STATION_API_KEY` em prod | Vercel env vars | S4.3 fazer PATCH real | Mock-only |
| 5 | `SLACK_WEBHOOK_URL` (já existe?) | Vercel env vars | S4.4 notificar alto-valor | Hook silencioso |

## 1. Os 7 custom fields no RD Station

Caminho no painel: **RD Station Marketing → Engajar → Configurações → Campos personalizados → Novo campo**.

Para cada campo abaixo, criar **EXATAMENTE** com o identificador na coluna `Identificador API` (a parte que vai como key no JSON do PATCH):

| # | Identificador API | Tipo | Visível no contato? | Descrição |
| --- | --- | --- | --- | --- |
| 1 | `cf_calc_setor` | Texto | Sim | Setor selecionado (construcao/agro/saas/automotivo/industria/servicos_b2b/outro) |
| 2 | `cf_calc_crm_funcional` | Texto | Sim | "sim" ou "nao" |
| 3 | `cf_calc_investimento_mensal` | Número (decimal) | Não | Investimento mensal em R$ |
| 4 | `cf_calc_ticket_medio` | Número (decimal) | Sim | Ticket médio em R$ |
| 5 | `cf_calc_modelo` | Texto | Sim | "b2b" ou "b2c" |
| 6 | `cf_calc_periodo_meses` | Número (inteiro) | Não | 3, 6 ou 12 |
| 7 | `cf_calc_roi_periodo` | Número (inteiro) | Sim | % inteiro com sinal embutido no contexto (pode ser negativo) |
| 8 | `cf_calc_roi_total` | Número (inteiro) | Sim | % inteiro (com pipeline) |
| 9 | `cf_calc_insight` | Texto | Sim | "I-A", "I-B", "I-C" ou "I-D" |
| 10 | `cf_calc_url_resultado` | Texto longo | Não | URL pública do resultado salvo (/r/{token}) |

> **Atenção** — RD numera campos por ordem de criação. Os identificadores acima precisam ser **EXATOS** porque o adapter `src/lib/crm/rd-calculadora.ts` envia esses nomes literais.

## 2. Tags que o adapter aplica (não precisa criar antes — RD aceita)

- `origem_calculadora` — todo lead da calculadora.
- `calc_i-a` / `calc_i-b` / `calc_i-c` / `calc_i-d` — insight exibido.
- `calc_pipeline_dominante` — quando override I-E acionou.

## 3. Validação pós-setup

1. Confirmar com Matheus que os 10 custom fields foram criados.
2. Setar `RD_CALC_CUSTOM_FIELDS_READY=true` no Vercel (preview + production).
3. Setar `CRM_MODE=rd-station` no Vercel (production).
4. Submeter uma calculadora teste com email `qa@unfoldgrowth.com.br`.
5. Verificar no RD em < 60s:
   - Tag `origem_calculadora` aplicada.
   - Tag `calc_i-X` correspondente ao insight do teste.
   - Custom fields preenchidos no contato.
6. Marcar este checklist como completo nesta página.

## 4. Comportamento sem setup (estado atual)

- `CRM_MODE` ausente ou `mock` → adapter loga no console, marca `rd_sync_status='mock'`.
- `CRM_MODE=rd-station` mas `RD_CALC_CUSTOM_FIELDS_READY` ausente → PATCH é enviado **sem** custom fields, só com tags.
- `RD_STATION_API_KEY` ausente → adapter lança erro, marca `rd_sync_status='failed'`.

A API de submissão da Calculadora **não falha** em nenhum desses cenários — o RD é fire-and-forget.

## 5. Riscos conhecidos

- **R1** — Nome do campo no RD diferente do identificador esperado. Mitigação: prints documentando o cadastro (anexar à esta página).
- **R2** — RD Station tem limite de 50 custom fields no plano Marketing Basic. Confirmar plano antes da criação.
- **R3** — Custom field "Texto longo" para URL — confirmar se RD aceita > 255 chars (URL completa com host).

## 6. Histórico

- 2026-05-13 — Criado por Orion (aios-master) ao concluir Sprint 4 / S4.0.
- ⬜ aguardando Matheus aplicar os 10 campos no RD.
