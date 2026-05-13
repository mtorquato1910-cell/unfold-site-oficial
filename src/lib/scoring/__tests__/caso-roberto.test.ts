// Golden test — caso Roberto Almeida (spec §11.1–11.6).
// Qualquer alteração no engine v2 que quebre este teste é regressão.

import { describe, expect, it } from 'vitest'

import { calcularCamada1, calcularDiagnostico, valorBruto } from '../index'
import type { InputDiagnostico } from '../types'

const robertoInput: InputDiagnostico = {
  etapa1: {
    cargo: 'ceo',
    setor: 'construcao',
    faturamento_faixa: '200k-500k',
    urgencia: '6-meses',
  },
  quiz: {
    q1: 'B',
    q2: 'A',
    q3: 'B',
    q4: 'A',
    q5: 'B',
    q6: 'C',
    q7: 'A',
    q8: 'D',
    q9: 'B',
    q10: 'D',
    q11: 'A',
    q12: 'A',
  },
}

describe('caso Roberto Almeida (spec §11) — golden test', () => {
  const r = calcularDiagnostico(robertoInput)

  // Camada 1 — eixos (spec §11.2)
  it('eixo Diagnosticar = 17 (Crítica)', () => {
    expect(r.score_diagnosticar).toBe(17)
    expect(r.faixas_eixos.diagnosticar).toBe('critica')
  })

  it('eixo Estruturar = 33 (Em formação)', () => {
    expect(r.score_estruturar).toBe(33)
    expect(r.faixas_eixos.estruturar).toBe('em-formacao')
  })

  it('eixo Operar = 11 (Crítica) — Q8=D entra invertida', () => {
    expect(r.score_operar).toBe(11)
    expect(r.faixas_eixos.operar).toBe('critica')
  })

  it('eixo Evoluir = 33 (Em formação)', () => {
    expect(r.score_evoluir).toBe(33)
    expect(r.faixas_eixos.evoluir).toBe('em-formacao')
  })

  it('eixo Gestão = 17 (Crítica) — 3 sinais cruzados', () => {
    expect(r.score_gestao).toBe(17)
    expect(r.faixas_eixos.gestao).toBe('critica')
  })

  it('score consolidado = 22 (Crítica)', () => {
    expect(r.score_consolidado).toBe(22)
    expect(r.faixa_consolidada).toBe('critica')
  })

  // Camada 2 — Fit (spec §11.3)
  it('fit_estrutural = 97.5', () => {
    expect(r.fit_estrutural).toBe(97.5)
  })

  it('fit_dor = 30 (curva U invertido, soma 0-3)', () => {
    expect(r.fit_dor).toBe(30)
  })

  it('fit_cabeca = 17 (= score Gestão arredondado)', () => {
    expect(r.fit_cabeca).toBe(17)
  })

  it('fit_urgencia = 75 (6 meses)', () => {
    expect(r.fit_urgencia).toBe(75)
  })

  it('score_fit ≈ 58.9 (Fit Médio)', () => {
    // Spec calcula 58.84 com fit_cabeca = 16.7. Como a Camada 2 lê o score arredondado
    // (17), a Camada 2 vê fit_cabeca exatamente 17 → score 58.9. Aceita ±0.5.
    expect(r.score_fit).toBeGreaterThanOrEqual(58.5)
    expect(r.score_fit).toBeLessThanOrEqual(59.3)
    expect(r.faixa_fit).toBe('fit-medio')
  })

  // Camada 3 — padrões (spec §11.4)
  it('padrões acionados: P1, P2, P4, P5, P6, P8 (não P3, não P7)', () => {
    expect(r.padroes_acionados).toContain('P1')
    expect(r.padroes_acionados).toContain('P2')
    expect(r.padroes_acionados).toContain('P4')
    expect(r.padroes_acionados).toContain('P5')
    expect(r.padroes_acionados).toContain('P6')
    expect(r.padroes_acionados).toContain('P8')
    expect(r.padroes_acionados).not.toContain('P3')
    expect(r.padroes_acionados).not.toContain('P7')
  })

  it('top 3 padrões exibidos: P4, P8, P2 (nessa ordem)', () => {
    expect(r.padroes_exibidos).toEqual(['P4', 'P8', 'P2'])
  })

  // Camada 3 — caminhos (spec §11.5)
  it('caminhos exibidos: C3, C4, C2 (sem duplicação)', () => {
    expect(r.caminhos_exibidos).toEqual(['C3', 'C4', 'C2'])
  })
})

describe('determinismo do engine', () => {
  it('1000× mesmo input retorna scores idênticos', () => {
    const referencia = calcularDiagnostico(robertoInput)
    for (let i = 0; i < 1000; i++) {
      const r = calcularDiagnostico(robertoInput)
      expect(r.score_consolidado).toBe(referencia.score_consolidado)
      expect(r.score_fit).toBe(referencia.score_fit)
      expect(r.padroes_exibidos).toEqual(referencia.padroes_exibidos)
      expect(r.caminhos_exibidos).toEqual(referencia.caminhos_exibidos)
    }
  })
})

describe('valor bruto por letra (spec §5.1)', () => {
  it.each([
    ['A', 0],
    ['B', 1],
    ['C', 2],
    ['D', 3],
    ['E', 0], // Q4 — E pontua 0 (mesma pontuação que A)
  ])('letra %s → %i pontos', (letra, esperado) => {
    expect(valorBruto(letra as 'A' | 'B' | 'C' | 'D' | 'E')).toBe(esperado)
  })
})

describe('casos sintéticos extremos', () => {
  const baseEtapa1 = {
    cargo: 'ceo',
    setor: 'construcao',
    faturamento_faixa: 'acima-500k',
    urgencia: 'trimestre',
  } as const

  it('operação imatura (tudo A, Q8=A) → todos eixos 0 ou baixos', () => {
    const r = calcularCamada1({
      q1: 'A', q2: 'A', q3: 'A', q4: 'A', q5: 'A', q6: 'A',
      q7: 'A', q8: 'A', q9: 'A', q10: 'A', q11: 'A', q12: 'A',
    })
    expect(r.score_diagnosticar).toBe(0)
    expect(r.score_estruturar).toBe(0)
    expect(r.score_evoluir).toBe(0)
    expect(r.score_operar).toBe(33) // (0+0+(3-0))/9 = 33.3
    // Sinal 2 dispara 0.75 com Q10=A + Q12=A (spec §5.4) → Gestão = 25 (Crítica).
    expect(r.score_gestao).toBe(25)
    expect(r.faixas_eixos.gestao).toBe('critica')
    expect(r.faixa_consolidada).toBe('critica')
  })

  it('operação perfeita (tudo D, Q8=D) → diagnosticar/estruturar/evoluir/gestao máximos, operar drop por Q8', () => {
    const r = calcularCamada1({
      q1: 'D', q2: 'D', q3: 'D', q4: 'D', q5: 'D', q6: 'D',
      q7: 'D', q8: 'D', q9: 'D', q10: 'D', q11: 'D', q12: 'D',
    })
    expect(r.score_diagnosticar).toBe(100)
    expect(r.score_estruturar).toBe(100)
    expect(r.score_evoluir).toBe(100)
    expect(r.score_operar).toBe(67) // (3+3+(3-3))/9 = 6/9 = 66.7
    expect(r.score_gestao).toBe(100) // 3 sinais máximos → 99.99 → arredonda para 100
  })

  it('Q4=E não quebra: retorna 0 pontos em Estruturar', () => {
    const r = calcularCamada1({
      q1: 'A', q2: 'A', q3: 'A', q4: 'E', q5: 'A', q6: 'A',
      q7: 'A', q8: 'A', q9: 'A', q10: 'A', q11: 'A', q12: 'A',
    })
    expect(r.score_estruturar).toBe(0) // E=0, mesmo que A
  })

  it('zero padrões acionados (operação madura) → padrão neutro positivo', () => {
    const r = calcularDiagnostico({
      etapa1: baseEtapa1,
      quiz: {
        q1: 'D', q2: 'D', q3: 'D', q4: 'D', q5: 'D', q6: 'D',
        q7: 'D', q8: 'D', q9: 'D', q10: 'D', q11: 'D', q12: 'D',
      },
    })
    // Nenhum P1-P8 dispara com tudo D (verificar P3 needs Q4=E, P7 needs operar≥60 ✓ mas diagnosticar 100 ✗).
    expect(r.padroes_exibidos).toEqual(['NEUTRO_POSITIVO'])
    expect(r.caminhos_exibidos.length).toBe(3)
  })
})
