'use client'

/**
 * Hook central da Calculadora v2 (S2.5).
 *
 * Estado: { etapa1, inputs, premissas, premissasEditadas, token }.
 * Recálculo é puro e síncrono via useMemo; o valor exposto ao consumidor
 * passa por useDeferredValue para não bloquear a UI em interações rápidas.
 *
 * Não importa `payload`/`next` — só usa o motor puro de `src/lib/calculadora/*`.
 * É *client-side* (React) — por isso vive fora de `src/lib/calculadora/`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDeferredValue } from 'react'
import {
  calcularDefaults,
} from '@/lib/calculadora/benchmarks'
import { calcular, formatarExibicao } from '@/lib/calculadora/formulas'
import { selecionarInsight } from '@/lib/calculadora/insights'
import {
  aplicarNovosDefaults as aplicarNovosDefaultsPuro,
  premissasFromDefaults,
  type PremissasEditadasFlags,
} from '@/lib/calculadora/aplicar-defaults'
import type {
  CalculadoraInputs,
  Canal,
  DefaultsPremissas,
  Etapa1,
  Modelo,
  Periodo,
  Premissas,
  Resultado,
  ResultadoExibicao,
  SelecaoInsight,
  Setor,
} from '@/lib/calculadora/types'

const STORAGE_KEY_ETAPA1 = 'calc-v2:etapa1'
const STORAGE_KEY_STATE = 'calc-v2:state'
const TOKEN_BYTES = 16

function gerarToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  // fallback determinístico-ish
  let hex = ''
  for (let i = 0; i < TOKEN_BYTES * 2; i++) hex += Math.floor(Math.random() * 16).toString(16)
  return hex
}

const INPUTS_DEFAULTS: CalculadoraInputs = {
  investimento_mensal: 15000,
  canais: ['google'],
  ticket_medio: 10000,
  modelo: 'b2b',
  periodo: 6,
  crm_funcional: false,
}

const SETOR_DEFAULT: Setor = 'servicos_b2b'

interface State {
  etapa1Concluida: boolean
  etapa1: Etapa1
  inputs: CalculadoraInputs
  premissas: Premissas
  premissasEditadas: { cpl: boolean; taxa_qualificacao: boolean; conversao_mql_cliente: boolean; ciclo_dias: boolean }
  /** Snapshot do default vigente para detectar "ainda no default" (§5.3). */
  premissasDefaultRef: Premissas
  defaults: DefaultsPremissas
  token: string
}

function makeInitialState(): State {
  const setor: Setor = SETOR_DEFAULT
  const defaults = calcularDefaults({
    setor,
    modelo: INPUTS_DEFAULTS.modelo,
    crm_funcional: INPUTS_DEFAULTS.crm_funcional,
    canais: INPUTS_DEFAULTS.canais,
  })
  const premissas = premissasFromDefaults(defaults)
  return {
    etapa1Concluida: false,
    etapa1: { nome: '', email: '', empresa: '', telefone: '', setor },
    inputs: INPUTS_DEFAULTS,
    premissas,
    premissasDefaultRef: premissas,
    premissasEditadas: {
      cpl: false,
      taxa_qualificacao: false,
      conversao_mql_cliente: false,
      ciclo_dias: false,
    },
    defaults,
    token: gerarToken(),
  }
}

export interface UseCalculadora {
  // estado bruto
  etapa1Concluida: boolean
  etapa1: Etapa1
  inputs: CalculadoraInputs
  premissas: Premissas
  premissasEditadas: State['premissasEditadas']
  defaults: DefaultsPremissas
  token: string
  // derivado (deferred — UI não bloqueia)
  resultado: Resultado
  resultadoExibicao: ResultadoExibicao
  insight: SelecaoInsight
  inputsValidos: boolean
  // ações
  concluirEtapa1: (e: Etapa1) => void
  resetEtapa1: () => void
  setInput: <K extends keyof CalculadoraInputs>(key: K, value: CalculadoraInputs[K]) => void
  setPremissa: <K extends keyof Premissas>(key: K, value: Premissas[K]) => void
  resetPremissas: () => void
  /** Persiste o snapshot atual via POST /api/calculadora (idempotente por token). */
  persistir: () => Promise<{ ok: boolean; tampered?: boolean } | null>
}

export function useCalculadora(): UseCalculadora {
  const [state, setState] = useState<State>(() => {
    if (typeof window === 'undefined') return makeInitialState()
    // Hydratação simples — não bloqueia se sessionStorage corrompido.
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY_STATE)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>
        if (parsed && typeof parsed === 'object') {
          const initial = makeInitialState()
          return { ...initial, ...parsed }
        }
      }
    } catch {
      /* ignore */
    }
    return makeInitialState()
  })

  // ── Persistência em sessionStorage com debounce 1s (separado do recálculo) ──
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state))
      } catch {
        /* quota ou modo privado — ignora */
      }
    }, 1000)
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [state])

  // ── Inputs válidos para destravar a coluna de resultado ────────────────────
  const inputsValidos =
    state.inputs.investimento_mensal >= 1000 &&
    state.inputs.ticket_medio >= 1000 &&
    state.inputs.canais.length >= 1

  // ── Recálculo determinístico (síncrono) ────────────────────────────────────
  const resultado = useMemo(
    () => calcular(state.inputs, state.premissas),
    [state.inputs, state.premissas],
  )

  // useDeferredValue para que digitação não jankifique animações
  const deferredResultado = useDeferredValue(resultado)

  const resultadoExibicao = useMemo(
    () => formatarExibicao(deferredResultado),
    [deferredResultado],
  )

  const insight = useMemo(
    () =>
      selecionarInsight({
        crm_funcional: state.inputs.crm_funcional,
        roi_no_periodo: deferredResultado.roi_no_periodo,
        receita_no_periodo: deferredResultado.receita_no_periodo,
        receita_em_pipeline: deferredResultado.receita_em_pipeline,
      }),
    [
      state.inputs.crm_funcional,
      deferredResultado.roi_no_periodo,
      deferredResultado.receita_no_periodo,
      deferredResultado.receita_em_pipeline,
    ],
  )

  // ── Ações ──────────────────────────────────────────────────────────────────
  const concluirEtapa1 = useCallback((e: Etapa1) => {
    setState((prev) => {
      const setorMudou = prev.etapa1.setor !== e.setor
      const novosDefaults = setorMudou
        ? calcularDefaults({
            setor: e.setor,
            modelo: prev.inputs.modelo,
            crm_funcional: prev.inputs.crm_funcional,
            canais: prev.inputs.canais,
          })
        : prev.defaults
      const novasPremissas = setorMudou
        ? aplicarNovosDefaultsPuro({ atual: prev.premissas, defaultRef: prev.premissasDefaultRef, editadas: prev.premissasEditadas, novos: novosDefaults })
        : prev.premissas
      const refAtualizada = setorMudou ? premissasFromDefaults(novosDefaults) : prev.premissasDefaultRef
      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(STORAGE_KEY_ETAPA1, JSON.stringify(e))
        } catch {}
      }
      return {
        ...prev,
        etapa1: e,
        etapa1Concluida: true,
        defaults: novosDefaults,
        premissas: novasPremissas,
        premissasDefaultRef: refAtualizada,
      }
    })
  }, [])

  const resetEtapa1 = useCallback(() => {
    setState((prev) => ({ ...prev, etapa1Concluida: false }))
  }, [])

  const setInput = useCallback(
    <K extends keyof CalculadoraInputs>(key: K, value: CalculadoraInputs[K]) => {
      setState((prev) => {
        const novosInputs = { ...prev.inputs, [key]: value }
        const afetaDefaults =
          key === 'modelo' || key === 'crm_funcional' || key === 'canais'
        const novosDefaults = afetaDefaults
          ? calcularDefaults({
              setor: prev.etapa1.setor,
              modelo: novosInputs.modelo,
              crm_funcional: novosInputs.crm_funcional,
              canais: novosInputs.canais,
            })
          : prev.defaults
        const novasPremissas = afetaDefaults
          ? aplicarNovosDefaultsPuro({ atual: prev.premissas, defaultRef: prev.premissasDefaultRef, editadas: prev.premissasEditadas, novos: novosDefaults })
          : prev.premissas
        const refAtualizada = afetaDefaults
          ? premissasFromDefaults(novosDefaults)
          : prev.premissasDefaultRef
        return {
          ...prev,
          inputs: novosInputs,
          defaults: novosDefaults,
          premissas: novasPremissas,
          premissasDefaultRef: refAtualizada,
        }
      })
    },
    [],
  )

  const setPremissa = useCallback(
    <K extends keyof Premissas>(key: K, value: Premissas[K]) => {
      setState((prev) => ({
        ...prev,
        premissas: { ...prev.premissas, [key]: value },
        premissasEditadas: { ...prev.premissasEditadas, [key]: true },
      }))
    },
    [],
  )

  // Persistir snapshot atual via API. Idempotente: mesmo token reposta = update.
  const persistir = useCallback(async (): Promise<{ ok: boolean; tampered?: boolean } | null> => {
    if (!state.etapa1Concluida) return null
    if (
      state.inputs.investimento_mensal < 1000 ||
      state.inputs.ticket_medio < 1000 ||
      state.inputs.canais.length < 1
    ) {
      return null
    }
    try {
      const body = {
        token: state.token,
        etapa1: state.etapa1,
        inputs: state.inputs,
        premissas: state.premissas,
        premissas_editadas: Object.values(state.premissasEditadas).some(Boolean),
        resultado,
        insight: { principal: insight.principal, override_ie: insight.override_ie },
        consent: { given: true as const, policyVersion: 'v1.0' },
      }
      const res = await fetch('/api/calculadora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      })
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        tampered?: boolean
      }
      return { ok: Boolean(json.ok), tampered: json.tampered }
    } catch {
      return { ok: false }
    }
  }, [
    state.etapa1Concluida,
    state.token,
    state.etapa1,
    state.inputs,
    state.premissas,
    state.premissasEditadas,
    resultado,
    insight.principal,
    insight.override_ie,
  ])

  const resetPremissas = useCallback(() => {
    setState((prev) => {
      const novasPremissas = premissasFromDefaults(prev.defaults)
      return {
        ...prev,
        premissas: novasPremissas,
        premissasDefaultRef: novasPremissas,
        premissasEditadas: {
          cpl: false,
          taxa_qualificacao: false,
          conversao_mql_cliente: false,
          ciclo_dias: false,
        },
      }
    })
  }, [])

  return {
    etapa1Concluida: state.etapa1Concluida,
    etapa1: state.etapa1,
    inputs: state.inputs,
    premissas: state.premissas,
    premissasEditadas: state.premissasEditadas,
    defaults: state.defaults,
    token: state.token,
    resultado: deferredResultado,
    resultadoExibicao,
    insight,
    inputsValidos,
    concluirEtapa1,
    resetEtapa1,
    setInput,
    setPremissa,
    resetPremissas,
    persistir,
  }
}

/** Helpers exportados para a UI rotular canais/setores/períodos. */
export type { Canal, Modelo, Periodo, Setor }
