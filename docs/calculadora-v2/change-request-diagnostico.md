# Change Request — Diagnóstico aceita prefill da Calculadora

> Story: **S3.0** (bloqueia S3.4 da Sprint 3 da Calculadora v2)
> Owner: time Diagnóstico
> Solicitante: time Calculadora v2 (Orion / Matheus)
> Data: 2026-05-13
> Status: **PENDENTE** — aplicar antes da Sprint 3 da Calculadora ir para prod.

## Objetivo

Permitir que leads que vêm da Calculadora de Performance aterrissem em
`/diagnostico` com a Etapa 1 já pré-preenchida (nome, email, empresa, setor).
Isso reduz fricção e mantém a coerência da hierarquia "Calculadora alimenta
Diagnóstico" (spec §1).

## Contrato (já existente no projeto)

O arquivo `src/lib/contracts/calc-to-diag.ts` define o tipo versionado
`CalcToDiagPayload (v:1)` + schema Zod. Este contrato é a **fonte única de
verdade** — qualquer divergência deve ser tratada com bump de versão (`v: 2`)
no contrato, nunca com forks.

```ts
import {
  calcToDiagSchema,
  decodeCalcToDiag,
  CALC_TO_DIAG_STORAGE_KEY,
  CALC_TO_DIAG_QUERY_PARAM,
  CALC_TO_DIAG_TOKEN_PARAM,
} from '@/lib/contracts/calc-to-diag'
```

## O que a Calculadora já entrega (Sprint 3 / S3.4)

Quando o lead clica em "Fazer o Diagnóstico de Growth" no Bloco E da
Calculadora:

1. Persiste no sessionStorage do browser:
   - Key: `calc-v2:para-diagnostico` (a const `CALC_TO_DIAG_STORAGE_KEY`).
   - Valor: JSON serializado de `CalcToDiagPayload`.
2. Navega para a URL:
   `/diagnostico?origem=calculadora&token=<uuid-32-hex>`
3. Dispara o evento `calculadora_para_diagnostico` na collection
   `calculadora-events`.

## O que o Diagnóstico precisa fazer

### 1. Detectar a origem na Etapa 1

No componente `src/components/diagnostico/DiagnosticoEtapa1Form.tsx` (ou
equivalente no lado Diagnóstico), no mount:

```tsx
useEffect(() => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  const origem = url.searchParams.get(CALC_TO_DIAG_QUERY_PARAM)
  if (origem !== 'calculadora') return

  const raw = window.sessionStorage.getItem(CALC_TO_DIAG_STORAGE_KEY)
  const payload = decodeCalcToDiag(raw)
  if (!payload) return

  // Pré-preenche os campos correspondentes (não força — lead pode editar).
  setValue('nome', payload.nome)
  setValue('email', payload.email)
  setValue('empresa', payload.empresa)
  setValue('setor', payload.setor)

  // Marca origem para o backend
  setOrigem('calculadora')
}, [setValue])
```

### 2. Persistir a origem no resultado

Quando o Diagnóstico criar o `DiagnosticoResults`, gravar:

- `origem: 'calculadora_performance'` (já é enum, basta adicionar valor).
- `origem_token: payload.token` — para que o painel possa cruzar
  `DiagnosticoResults` ↔ `CalculadoraResults` via token.
- Tag no lead vinculado: `origem_calculadora` (espelha o que a calc faz).

### 3. Atualizar `CalculadoraResults.calc_avancou_para_diagnostico`

No callback `afterChange` do `DiagnosticoResults` (ou route handler):

```ts
if (doc.origem === 'calculadora_performance' && doc.origem_token) {
  await payload.update({
    collection: 'calculadora-results',
    where: { calc_url_resultado: { equals: doc.origem_token } },
    data: {
      calc_avancou_para_diagnostico: true,
      calc_data_avancou_diagnostico: new Date().toISOString(),
    },
  })
}
```

Isso destrava o dashboard de funil cruzado (Sprint 5 da Calculadora).

## Tolerância a falha

- Se `sessionStorage` foi limpo (modo privado, refresh longo): o Diagnóstico
  segue fluxo normal, lead preenche manualmente. Sem regressão.
- Se o payload no storage estiver corrompido: `decodeCalcToDiag()` retorna
  `null`. Não loga warn em prod — é caso esperado.
- Versão futura (`v: 2`): se o Diagnóstico for atualizado primeiro, ele
  rejeita silenciosamente payloads com `v` desconhecido. Sem quebra.

## Critérios de aceitação

- [ ] `/diagnostico?origem=calculadora&token=<x>` com sessionStorage válido
      pré-preenche os 4 campos da Etapa 1 do Diagnóstico.
- [ ] Sem `origem=calculadora` na URL, fluxo do Diagnóstico permanece idêntico.
- [ ] `DiagnosticoResults.origem` armazena `calculadora_performance` quando
      aplicável.
- [ ] `CalculadoraResults.calc_avancou_para_diagnostico` é marcado `true`
      ao concluir Diagnóstico vindo de Calc.
- [ ] Teste E2E (lado Calculadora → lado Diagnóstico) implementado em
      `tests/e2e/calculadora-para-diagnostico.spec.ts`.

## Riscos identificados

- **R1** — Refresh hard (ctrl+shift+R) pode limpar sessionStorage. Mitigação:
  fallback que tenta `localStorage` se sessionStorage não tiver. Diagnóstico
  decide se quer essa robustez extra.
- **R2** — Lead muda de browser/dispositivo entre clicar e acessar. Aceita —
  pré-preenchimento é otimização, não requisito.

## Coordenação

- Sprint 3 da Calculadora já mergeada **não bloqueia** o site — sem o lado
  Diagnóstico aplicado, leads vão para `/diagnostico` e preenchem
  manualmente. Sem regressão visível.
- A integração só é exercitada em produção quando o lado Diagnóstico aplicar
  este change.
- Comunicar mudança para Matheus + time comercial (vai aparecer leads com
  tag `origem_calculadora` no RD).
