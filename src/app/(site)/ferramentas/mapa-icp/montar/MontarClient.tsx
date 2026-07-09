'use client'

/**
 * Fluxo do Radar de Comitê de Compra (Mapa de ICP).
 * Itera STEPS (13 perguntas + captura) → processamento → resultado da IA.
 * Porte fiel do protótipo proto_ferramenta_mapa_icp_unfold.html, agora consumindo
 * a API real POST /api/mapa-icp e o tipo MapaIcpAIResult.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { STEPS, LOAD_MSGS } from '@/lib/mapa-icp/steps'
import { normalizePhoneBR } from '@/lib/format/phone-mask'
import type { Step } from '@/lib/mapa-icp/steps'
import type { MapaIcpAIResult } from '@/lib/mapa-icp/types'
import ResultadoMapa from '../_components/ResultadoMapa'
import styles from './montar.module.css'

// ── tipos locais ─────────────────────────────────────────────────────────────
type AnswerValue = string | string[]
type Answers = Record<string, AnswerValue>
interface Capture {
  nome: string
  email: string
  empresa: string
  cargo: string
  telefone: string
}
type Phase = 'flow' | 'processing' | 'result' | 'error'

const STORAGE_KEY = 'mapa-icp:montar:v1'
const UTM_KEY = 'mapa-icp:utm:v1'
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
const EMAIL_RE = /^\S+@\S+\.\S+$/

// chave usada para guardar o valor livre do "Outro" de cada multi-step
const outroKey = (id: string) => `__outro_${id}`

interface PersistShape {
  i: number
  answers: Answers
  capture: Capture
  phase: Phase
  result: MapaIcpAIResult | null
  resultUrl: string | null
  resultToken: string | null
}

function emptyCapture(): Capture {
  return { nome: '', email: '', empresa: '', cargo: '', telefone: '' }
}

function dataLayerPush(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push(event)
}

export default function MontarClient() {
  const searchParams = useSearchParams()

  // ── estado (hidratado do sessionStorage) ────────────────────────────────────
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [capture, setCapture] = useState<Capture>(emptyCapture)
  const [phase, setPhase] = useState<Phase>('flow')
  const [result, setResult] = useState<MapaIcpAIResult | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultToken, setResultToken] = useState<string | null>(null)
  const [err, setErr] = useState<string>('')
  const [hydrated, setHydrated] = useState(false)
  const [loadIdx, setLoadIdx] = useState(0)

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const toolStartFired = useRef(false)

  // ── hidratação ──────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const p = JSON.parse(raw) as Partial<PersistShape>
        if (typeof p.i === 'number') setI(Math.min(p.i, STEPS.length - 1))
        if (p.answers) setAnswers(p.answers)
        if (p.capture) setCapture({ ...emptyCapture(), ...p.capture })
        if (p.phase === 'result' && p.result) {
          setPhase('result')
          setResult(p.result)
          setResultUrl(p.resultUrl ?? null)
          setResultToken(p.resultToken ?? null)
        }
        // 'processing' não é restaurado: volta para a captura para refazer o POST.
      }
    } catch {
      /* sessionStorage indisponível/corrompido — começa do zero */
    }
    setHydrated(true)
  }, [])

  // ── captura de UTM (query params com fallback p/ sessionStorage) ─────────────
  const utm = useMemo<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {}
    const out: Record<string, string> = {}
    for (const key of UTM_PARAMS) {
      const v = searchParams.get(key)
      if (v) out[key] = v
    }
    if (Object.keys(out).length > 0) {
      try {
        window.sessionStorage.setItem(UTM_KEY, JSON.stringify(out))
      } catch {}
      return out
    }
    try {
      const stored = window.sessionStorage.getItem(UTM_KEY)
      if (stored) return JSON.parse(stored) as Record<string, string>
    } catch {}
    return {}
  }, [searchParams])

  // ── persistência ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return
    try {
      const data: PersistShape = { i, answers, capture, phase, result, resultUrl, resultToken }
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [hydrated, i, answers, capture, phase, result, resultUrl, resultToken])

  // ── tool_start na 1ª pergunta ────────────────────────────────────────────────
  useEffect(() => {
    if (hydrated && phase === 'flow' && i === 0 && !toolStartFired.current) {
      toolStartFired.current = true
      dataLayerPush({ event: 'tool_start', tool: 'mapa-icp' })
    }
  }, [hydrated, phase, i])

  // ── foco automático no input de texto ────────────────────────────────────────
  const step: Step | undefined = STEPS[i]
  useEffect(() => {
    if (phase !== 'flow' || !step) return
    if (step.type === 'text' || step.type === 'textarea') {
      inputRef.current?.focus()
    }
  }, [i, phase, step])

  // ── microcopy rotativa do processamento ──────────────────────────────────────
  useEffect(() => {
    if (phase !== 'processing') return
    setLoadIdx(0)
    const t = setInterval(() => {
      setLoadIdx((k) => (k + 1 < LOAD_MSGS.length ? k + 1 : k))
    }, 1400)
    return () => clearInterval(t)
  }, [phase])

  const scrollTop = () => {
    if (typeof document !== 'undefined') {
      document.querySelector(`.${styles.root}`)?.scrollTo(0, 0)
    }
  }

  // ── validação de um step ──────────────────────────────────────────────────────
  const validateStep = useCallback(
    (s: Step): string | null => {
      if (!s.required) return null
      const v = answers[s.id]
      if (s.type === 'text' || s.type === 'textarea') {
        if (!v || (typeof v === 'string' && !v.trim())) return 'Preencha para continuar.'
        return null
      }
      if (s.type === 'multi') {
        if (!Array.isArray(v) || v.length === 0) return 'Selecione ao menos uma opção.'
        return null
      }
      if (s.type === 'single') {
        if (!v) return 'Selecione uma opção para continuar.'
        return null
      }
      return null
    },
    [answers]
  )

  const goBack = () => {
    setErr('')
    setI((n) => Math.max(0, n - 1))
    scrollTop()
  }

  const goNext = () => {
    if (!step) return
    const e = validateStep(step)
    if (e) {
      setErr(e)
      return
    }
    setErr('')
    dataLayerPush({ event: 'step_complete', tool: 'mapa-icp', step_id: step.id })
    setI((n) => Math.min(STEPS.length - 1, n + 1))
    scrollTop()
  }

  // ── handlers de input ─────────────────────────────────────────────────────────
  const setText = (id: string, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }))
    if (err) setErr('')
  }

  const toggleSingle = (id: string, val: string) => {
    setAnswers((a) => ({ ...a, [id]: val }))
    if (err) setErr('')
  }

  const toggleMulti = (id: string, val: string) => {
    setAnswers((a) => {
      const cur = Array.isArray(a[id]) ? (a[id] as string[]) : []
      const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]
      return { ...a, [id]: next }
    })
    if (err) setErr('')
  }

  const setOutro = (id: string, value: string) => {
    setAnswers((a) => ({ ...a, [outroKey(id)]: value }))
    if (err) setErr('')
  }

  // ── monta o payload de answers (injeta texto do "outro" nos arrays) ──────────
  const buildAnswers = useCallback(() => {
    const out: Record<string, unknown> = {}
    for (const s of STEPS) {
      if (s.type === 'capture') continue
      let v = answers[s.id]
      if (s.type === 'multi') {
        let arr = Array.isArray(v) ? [...(v as string[])] : []
        if (s.allowOutro && arr.includes('outro')) {
          const free = (answers[outroKey(s.id)] as string | undefined)?.trim()
          arr = arr.filter((x) => x !== 'outro')
          if (free) arr.push(free)
        }
        v = arr
      }
      out[s.id] = v
    }
    return out
  }, [answers])

  // ── envio (POST), com retry seguro ────────────────────────────────────────────
  const submit = useCallback(async () => {
    setPhase('processing')
    setErr('')
    try {
      const res = await fetch('/api/mapa-icp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: buildAnswers(),
          capture: {
            nome: capture.nome.trim(),
            email: capture.email.trim(),
            empresa: capture.empresa.trim(),
            cargo: capture.cargo.trim(),
            telefone: capture.telefone.trim(),
          },
          consent: { given: true, policyVersion: 'v1' },
          utm,
        }),
      })
      const data = (await res.json()) as
        | { ok: true; result: MapaIcpAIResult; url?: string; token?: string }
        | { ok: false; error: string; message?: string }
      if (!res.ok || !data.ok) {
        const msg =
          (data as { message?: string }).message ||
          'Não conseguimos gerar seu mapa agora. Tente de novo em instantes.'
        setErr(msg)
        setPhase('error')
        return
      }
      setResult(data.result)
      setResultUrl(data.url ?? null)
      setResultToken(data.token ?? null)
      setPhase('result')
      dataLayerPush({ event: 'result_view', tool: 'mapa-icp' })
      scrollTop()
    } catch {
      setErr('Falha de conexão. Verifique sua internet e tente de novo.')
      setPhase('error')
    }
  }, [buildAnswers, capture, utm])

  // ── envio da captura (gate) ───────────────────────────────────────────────────
  const [consentGiven, setConsentGiven] = useState(false)
  useEffect(() => {
    // mantém o consent local sincronizado em re-hidratação (sempre exige reconfirmar)
    setConsentGiven(false)
  }, [hydrated])

  const submitCapture = () => {
    const { nome, email, empresa, cargo, telefone } = capture
    if (
      !nome.trim() ||
      !empresa.trim() ||
      !cargo.trim() ||
      !EMAIL_RE.test(email.trim()) ||
      !consentGiven
    ) {
      setErr('Preencha nome, e-mail válido, empresa, cargo e o consentimento.')
      return
    }
    const tel = normalizePhoneBR(telefone)
    if (!tel.ok || !tel.isMobile) {
      setErr(
        tel.reason === 'suspeito'
          ? 'Informe um número de WhatsApp real (não use números repetidos ou sequenciais).'
          : 'Informe um WhatsApp válido com DDD (celular com 11 dígitos).',
      )
      return
    }
    setErr('')
    dataLayerPush({ event: 'lead_capture', tool: 'mapa-icp' })
    void submit()
  }

  // ── progresso ─────────────────────────────────────────────────────────────────
  const pct =
    phase === 'result' || phase === 'processing'
      ? 100
      : Math.min(100, (i / STEPS.length) * 100)
  const stepLabel =
    phase === 'result'
      ? 'Seu mapa'
      : phase === 'processing'
        ? 'Gerando...'
        : step?.type === 'capture'
          ? 'Última etapa'
          : `Etapa ${Math.min(i + 1, STEPS.length)} / ${STEPS.length}`

  if (!hydrated) {
    // evita flash/SSR mismatch — render mínimo até hidratar
    return <div className={styles.root} aria-busy="true" />
  }

  return (
    <div className={styles.root}>
      <div className={styles.topbar}>
        <div className={styles.topbarIn}>
          <a href="/ferramentas/mapa-icp" className={styles.logo}>
            UNF<span>O</span>LD
          </a>
          <div className={styles.stepCount}>{stepLabel}</div>
        </div>
        <div className={styles.progress}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={`${styles.stage} ${phase === 'result' ? styles.resultStage : ''}`}>
        {phase === 'processing' && <Processing msg={LOAD_MSGS[loadIdx]} />}

        {phase === 'error' && (
          <ErrorScreen
            message={err}
            onRetry={() => void submit()}
            onBack={() => {
              setPhase('flow')
              setErr('')
            }}
          />
        )}

        {phase === 'result' && result && (
          <ResultadoMapa
            result={result}
            nome={capture.nome.trim()}
            token={resultToken ?? undefined}
            footer={<ResultActions token={resultToken} />}
          />
        )}

        {phase === 'flow' && step && step.type !== 'capture' && (
          <QuestionScreen
            step={step}
            index={i}
            answers={answers}
            err={err}
            inputRef={inputRef}
            onText={setText}
            onSingle={toggleSingle}
            onMulti={toggleMulti}
            onOutro={setOutro}
            onBack={i > 0 ? goBack : undefined}
            onNext={goNext}
          />
        )}

        {phase === 'flow' && step && step.type === 'capture' && (
          <CaptureScreen
            step={step}
            capture={capture}
            setCapture={setCapture}
            consentGiven={consentGiven}
            setConsentGiven={(v) => {
              setConsentGiven(v)
              if (err) setErr('')
            }}
            err={err}
            onBack={goBack}
            onSubmit={submitCapture}
          />
        )}
      </div>
    </div>
  )
}

// ─── Seta (CTA) ────────────────────────────────────────────────────────────────
function Arrow() {
  return (
    <svg width="16" height="12" viewBox="0 0 18 14" fill="none" aria-hidden="true">
      <path
        d="M1 7h15M11 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Tela de pergunta ────────────────────────────────────────────────────────────
function QuestionScreen({
  step,
  index,
  answers,
  err,
  inputRef,
  onText,
  onSingle,
  onMulti,
  onOutro,
  onBack,
  onNext,
}: {
  step: Step
  index: number
  answers: Answers
  err: string
  inputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>
  onText: (id: string, v: string) => void
  onSingle: (id: string, v: string) => void
  onMulti: (id: string, v: string) => void
  onOutro: (id: string, v: string) => void
  onBack?: () => void
  onNext: () => void
}) {
  const isText = step.type === 'text' || step.type === 'textarea'
  const isMulti = step.type === 'multi'
  const grid = (step.options?.length || 0) > 4
  const selected = answers[step.id]
  const outroActive = isMulti && Array.isArray(selected) && (selected as string[]).includes('outro')

  return (
    <div className={styles.screen}>
      <span className={styles.eyebrow}>
        {step.block} · {String(index + 1).padStart(2, '0')}
      </span>
      <h2 className={styles.q}>{step.q}</h2>
      {step.helper && <p className={styles.helper}>{step.helper}</p>}

      {isText ? (
        step.type === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            className={styles.textarea}
            placeholder={step.placeholder || ''}
            value={(selected as string) || ''}
            onChange={(e) => onText(step.id, e.target.value)}
            aria-label={step.q}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            className={styles.input}
            type="text"
            placeholder={step.placeholder || ''}
            value={(selected as string) || ''}
            onChange={(e) => onText(step.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onNext()
              }
            }}
            aria-label={step.q}
          />
        )
      ) : (
        <div
          className={`${styles.opts} ${grid ? styles.optsGrid : ''}`}
          role={isMulti ? 'group' : 'radiogroup'}
          aria-label={step.q}
        >
          {step.options?.map(([val, label]) => {
            const on = isMulti
              ? Array.isArray(selected) && (selected as string[]).includes(val)
              : selected === val
            return (
              <button
                type="button"
                key={val}
                className={`${styles.opt} ${on ? styles.optSel : ''}`}
                onClick={() => (isMulti ? onMulti(step.id, val) : onSingle(step.id, val))}
                role={isMulti ? 'checkbox' : 'radio'}
                aria-checked={on}
              >
                <span className={`${styles.box} ${!isMulti ? styles.boxSingle : ''}`} />
                <span>{label}</span>
              </button>
            )
          })}
          {step.allowOutro && (
            <button
              type="button"
              className={`${styles.opt} ${outroActive ? styles.optSel : ''}`}
              onClick={() => onMulti(step.id, 'outro')}
              role="checkbox"
              aria-checked={outroActive}
            >
              <span className={styles.box} />
              <span>Outro</span>
            </button>
          )}
        </div>
      )}

      {outroActive && (
        <div className={styles.outroWrap}>
          <input
            className={styles.input}
            type="text"
            placeholder="Descreva em poucas palavras"
            value={(answers[outroKey(step.id)] as string) || ''}
            onChange={(e) => onOutro(step.id, e.target.value)}
            aria-label="Outro — descreva"
            maxLength={120}
          />
        </div>
      )}

      {err && (
        <p className={styles.err} role="alert">
          {err}
        </p>
      )}

      <div className={styles.navBtns}>
        {onBack && (
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onBack}>
            Voltar
          </button>
        )}
        <button type="button" className={styles.btn} onClick={onNext}>
          Continuar <Arrow />
        </button>
      </div>
    </div>
  )
}

// ─── Tela de captura ───────────────────────────────────────────────────────────
function CaptureScreen({
  step,
  capture,
  setCapture,
  consentGiven,
  setConsentGiven,
  err,
  onBack,
  onSubmit,
}: {
  step: Step
  capture: Capture
  setCapture: React.Dispatch<React.SetStateAction<Capture>>
  consentGiven: boolean
  setConsentGiven: (v: boolean) => void
  err: string
  onBack: () => void
  onSubmit: () => void
}) {
  const upd = (k: keyof Capture) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCapture((c) => ({ ...c, [k]: e.target.value }))

  return (
    <div className={styles.screen}>
      <span className={styles.eyebrow}>{step.block}</span>
      <h2 className={styles.q}>{step.q}</h2>
      {step.helper && <p className={styles.helper}>{step.helper}</p>}

      <div className={styles.field}>
        <label htmlFor="c_nome">Nome</label>
        <input id="c_nome" className={styles.input} type="text" placeholder="Seu nome" value={capture.nome} onChange={upd('nome')} autoComplete="name" />
      </div>
      <div className={styles.field}>
        <label htmlFor="c_email">E-mail corporativo</label>
        <input id="c_email" className={styles.input} type="email" placeholder="voce@empresa.com" value={capture.email} onChange={upd('email')} autoComplete="email" />
      </div>
      <div className={styles.two}>
        <div className={styles.field}>
          <label htmlFor="c_emp">Empresa</label>
          <input id="c_emp" className={styles.input} type="text" placeholder="Nome da empresa" value={capture.empresa} onChange={upd('empresa')} autoComplete="organization" />
        </div>
        <div className={styles.field}>
          <label htmlFor="c_cargo">Cargo</label>
          <input id="c_cargo" className={styles.input} type="text" placeholder="Seu cargo" value={capture.cargo} onChange={upd('cargo')} autoComplete="organization-title" />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="c_tel">WhatsApp</label>
        <input id="c_tel" className={styles.input} type="tel" placeholder="(00) 00000-0000" value={capture.telefone} onChange={upd('telefone')} autoComplete="tel" />
      </div>

      <label className={styles.consent}>
        <input type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} />
        <span>
          Autorizo o contato da Unfold e o tratamento dos meus dados conforme a{' '}
          <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer">
            Política de Privacidade
          </a>
          .
        </span>
      </label>

      {err && (
        <p className={styles.err} role="alert">
          {err}
        </p>
      )}

      <div className={styles.navBtns}>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onBack}>
          Voltar
        </button>
        <button type="button" className={styles.btn} onClick={onSubmit}>
          Gerar meu mapa <Arrow />
        </button>
      </div>
    </div>
  )
}

// ─── Tela de processamento ──────────────────────────────────────────────────────
function Processing({ msg }: { msg: string }) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.loadMsg}>{msg}</p>
    </div>
  )
}

// ─── Tela de erro ───────────────────────────────────────────────────────────────
function ErrorScreen({
  message,
  onRetry,
  onBack,
}: {
  message: string
  onRetry: () => void
  onBack: () => void
}) {
  return (
    <div className={styles.screen}>
      <span className={styles.eyebrow}>Quase lá</span>
      <h2 className={styles.q}>Não conseguimos gerar seu mapa.</h2>
      <p className={styles.helper}>
        {message || 'Tivemos um problema ao processar suas respostas. Tente de novo — seus dados foram preservados.'}
      </p>
      <div className={styles.navBtns}>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onBack}>
          Revisar dados
        </button>
        <button type="button" className={styles.btn} onClick={onRetry}>
          Tentar de novo <Arrow />
        </button>
      </div>
    </div>
  )
}

// ─── Ações do resultado (CTA + PDF) — client (eventos no dataLayer) ──────────────
function ResultActions({ token }: { token: string | null }) {
  return (
    <div className={styles.nextActions}>
      <a
        className={styles.btn}
        href="/diagnostico"
        onClick={() => dataLayerPush({ event: 'cta_diagnostico_click', tool: 'mapa-icp' })}
      >
        Fazer o Diagnóstico de Growth <Arrow />
      </a>
      {token ? (
        <a
          className={`${styles.btn} ${styles.btnGhost}`}
          href={`/api/mapa-icp/pdf?token=${token}`}
          onClick={() => dataLayerPush({ event: 'pdf_download', tool: 'mapa-icp' })}
        >
          Receber em PDF
        </a>
      ) : (
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} disabled title="Indisponível">
          Receber em PDF
        </button>
      )}
    </div>
  )
}
