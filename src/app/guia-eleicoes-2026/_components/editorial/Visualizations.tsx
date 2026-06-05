'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, X, AlertTriangle, Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell as RCell } from 'recharts'
import { Reveal } from './primitives'

const PODE: [string, string][] = [
  ['Impulsionar posts na Meta', "Só 16/08–01/10, anunciante verificado, pagamento da conta de campanha, criativo com 'Propaganda Eleitoral' + CNPJ/CPF"],
  ['Anúncios em vídeo na Meta', 'Rótulo legível durante todo o vídeo'],
  ['Click-to-WhatsApp via Meta', 'Para iniciar conversa; depois humano ou bot identificado, sem disparo em massa'],
  ['Anúncios de geração de leads', 'Base legal LGPD documentada, opt-in claro'],
  ['Segmentação geográfica', 'Recomendada, coerente com a circunscrição'],
  ['Segmentação por interesse', 'Com cuidado; sem dado sensível sem RIPD'],
  ['Lookalike', 'Semente lícita e consentida; documentar'],
  ['Remarketing', 'Sobre visitantes lícitos; pixel declarado'],
  ['Conteúdo orgânico em todas as redes', 'Sem pedido de voto antes de 16/08'],
  ['E-mail marketing', 'Base própria consentida, descadastro, resposta em 48h'],
  ['Site próprio e landing pages', "Após 16/08, rodapé com CNPJ + 'Propaganda Eleitoral'"],
  ['Lives no canal do candidato/partido', 'Vedada retransmissão por PJ que não seja partido/federação/coligação'],
  ['Direito de resposta', 'Via Justiça Eleitoral'],
]

const NAO: [string, string][] = [
  ['Deepfake com imagem/voz real', 'MULTA + CASSAÇÃO + CRIME'],
  ['Disparo em massa WhatsApp/SMS', 'MULTA + ABUSO + CASSAÇÃO'],
  ['Telemarketing eleitoral', 'MULTA R$ 5–30K'],
  ['Anúncios em Google Ads/YouTube', 'CONTA SUSPENSA'],
  ['Anúncios pagos TikTok/LinkedIn', 'CONTA SUSPENSA'],
  ["Anúncio sem CNPJ + 'Propaganda Eleitoral' no criativo", 'MULTA R$ 5–30K'],
  ['Impulsionamento por terceiro', 'MULTA + RONI + CASSAÇÃO'],
  ['Compra de base de eleitores', 'CASSAÇÃO + CRIME + ANPD'],
  ['Pedido de voto antes de 16/08', 'MULTA R$ 5–25K'],
  ['Impulsionamento antes de 16/08', 'MULTA'],
  ['Palavra-chave de adversário em buscador', 'MULTA + REMOÇÃO'],
  ['Robôs/chatbots simulando candidato', 'MULTA + APURAÇÃO'],
  ['Conteúdo de IA não rotulado', 'MULTA + REMOÇÃO'],
  ['Conteúdo sintético no blackout', 'MULTA + APURAÇÃO'],
  ['Fato sabidamente inverídico', 'MULTA + CASSAÇÃO'],
  ['Live em canal de PJ', 'MULTA'],
  ['Ferramentas de WhatsApp não oficiais', 'MULTA + CASSAÇÃO'],
]

export function LedgerPodeNaoPode() {
  const [tab, setTab] = useState<'pode' | 'nao'>('pode')
  const [q, setQ] = useState('')
  const list = tab === 'pode' ? PODE : NAO
  const filtered = useMemo(() => list.filter(([t]) => t.toLowerCase().includes(q.toLowerCase())), [list, q])
  return (
    <div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-2xl" style={{ background: 'var(--pode-wash)', border: '1px solid var(--ink-hair)' }}>
          <div className="font-display font-bold text-5xl tabular" style={{ color: 'var(--pode)' }}>13</div>
          <div className="font-mono-tag mt-2">Práticas permitidas</div>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: 'var(--vedado-wash)', border: '1px solid var(--ink-hair)' }}>
          <div className="font-display font-bold text-5xl tabular" style={{ color: 'var(--vedado)' }}>17</div>
          <div className="font-mono-tag mt-2">Práticas vedadas</div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 sticky top-16 z-10 py-3" style={{ background: 'var(--paper)' }}>
        <div className="inline-flex p-1 rounded-full" style={{ background: 'var(--paper-band)' }}>
          <button onClick={() => setTab('pode')} className="px-5 py-2 rounded-full font-display text-sm" style={{ background: tab === 'pode' ? 'var(--pode)' : 'transparent', color: tab === 'pode' ? 'white' : 'var(--ink)' }}>Pode</button>
          <button onClick={() => setTab('nao')} className="px-5 py-2 rounded-full font-display text-sm" style={{ background: tab === 'nao' ? 'var(--vedado)' : 'transparent', color: tab === 'nao' ? 'white' : 'var(--ink)' }}>Não pode</button>
        </div>
        <div className="flex-1 flex items-center gap-2 px-4 rounded-full" style={{ border: '1px solid var(--ink-hair)', background: 'var(--paper-hi)' }}>
          <Search className="w-4 h-4 opacity-60" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar prática…" className="flex-1 bg-transparent py-2 outline-none text-sm" />
        </div>
      </div>
      {filtered.length === 0 && <p className="font-mono-tag py-8">Nenhuma prática encontrada. Limpe a busca para ver tudo.</p>}
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map(([title, info], i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-5 rounded-xl flex gap-3" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
            {tab === 'pode'
              ? <Check className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--pode)' }} />
              : <X className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--vedado)' }} />}
            <div>
              <div className="font-serif text-lg leading-tight" style={{ color: 'var(--ink)' }}>{title}</div>
              {tab === 'pode'
                ? <div className="mt-1 text-sm" style={{ color: 'var(--ink-body)' }}>{info}</div>
                : <span className="font-mono-tag inline-block mt-2 px-2 py-1 rounded" style={{ background: 'var(--vedado-wash)', color: 'var(--vedado)' }}>{info}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const PLATFORMS: { name: string; paid: 'ok' | 'no' | 'warn'; org: 'ok' | 'no' | 'warn'; note?: string }[] = [
  { name: 'Meta (Facebook/Instagram)', paid: 'ok', org: 'ok', note: 'Único motor pago de escala em 2026' },
  { name: 'Google Ads', paid: 'no', org: 'ok', note: 'SEO permitido, mídia eleitoral proibida desde mai/2024' },
  { name: 'YouTube', paid: 'no', org: 'ok', note: 'Canal próprio sim, anúncios não' },
  { name: 'TikTok', paid: 'no', org: 'ok', note: 'Alcance orgânico jovem' },
  { name: 'Kwai', paid: 'no', org: 'ok', note: 'Forte no interior e Nordeste' },
  { name: 'LinkedIn', paid: 'no', org: 'ok', note: 'Comunicação corporativa' },
  { name: 'X (Twitter)', paid: 'no', org: 'ok', note: 'Diálogo com imprensa' },
  { name: 'WhatsApp', paid: 'warn', org: 'warn', note: 'Click-to-WA via Meta; nunca disparo em massa' },
]

function Cell({ s }: { s: 'ok' | 'no' | 'warn' }) {
  const map = {
    ok: { bg: 'var(--pode-wash)', color: 'var(--pode)', icon: <Check className="w-5 h-5" /> },
    no: { bg: 'var(--vedado-wash)', color: 'var(--vedado)', icon: <X className="w-5 h-5" /> },
    warn: { bg: 'var(--atencao-wash)', color: 'var(--atencao)', icon: <AlertTriangle className="w-5 h-5" /> },
  }[s]
  return <div className="flex items-center justify-center h-12 rounded-md" style={{ background: map.bg, color: map.color }}>{map.icon}</div>
}

export function MatrizPlataformas() {
  return (
    <Reveal>
      <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_2fr] gap-4 font-mono-tag pb-4" style={{ borderBottom: '1px solid var(--ink-hair)' }}>
          <div>Plataforma</div><div className="text-center">Mídia paga</div><div className="text-center">Orgânico</div><div>Observação</div>
        </div>
        {PLATFORMS.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="grid md:grid-cols-[2fr_1fr_1fr_2fr] grid-cols-2 gap-4 py-4" style={{ borderBottom: '1px solid var(--ink-hair)' }}>
            <div className="font-serif text-lg col-span-2 md:col-span-1" style={{ color: 'var(--ink)' }}>{p.name}</div>
            <div><div className="md:hidden font-mono-tag mb-1">Paga</div><Cell s={p.paid} /></div>
            <div><div className="md:hidden font-mono-tag mb-1">Orgânico</div><Cell s={p.org} /></div>
            <div className="text-sm col-span-2 md:col-span-1" style={{ color: 'var(--ink-body)' }}>{p.note}</div>
          </motion.div>
        ))}
      </div>
    </Reveal>
  )
}

const calMarcos = [
  { d: '15/05', label: 'Financiamento coletivo', t: 0 },
  { d: '05/07', label: 'Propaganda intrapartidária', t: 12 },
  { d: '20/07', label: 'Início das convenções', t: 18 },
  { d: '05/08', label: 'Fim das convenções', t: 22 },
  { d: '16/08', label: 'Início propaganda + impulsionamento', t: 27, em: true },
  { d: '13/09', label: 'Prestação parcial de contas', t: 42 },
  { d: '01/10', label: 'Último dia de mídia paga · início blackout IA (72h)', t: 50, em: true },
  { d: '04/10', label: '1º turno', t: 53, em: true },
  { d: '05/10', label: 'Fim do blackout · reabertura 2º turno', t: 54, em: true },
  { d: '25/10', label: 'Eventual 2º turno', t: 75 },
]

export function CalendarioEleitoral() {
  return (
    <Reveal>
      <div className="rounded-2xl p-6 md:p-10" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
        <div className="hidden md:block relative h-64">
          <div className="absolute left-0 right-0 top-32 h-px" style={{ background: 'var(--ink-hair)' }} />
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-28 h-9 rounded origin-left flex items-center justify-center font-mono-tag text-white" style={{ left: `${(27 / 80) * 100}%`, width: `${(23 / 80) * 100}%`, background: 'var(--mint-deep)' }}>
            JANELA DE CAMPANHA · 47 DIAS
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 1 }}
            className="absolute top-28 h-9 origin-left flex items-center justify-center font-mono-tag text-white rounded" style={{ left: `${(50 / 80) * 100}%`, width: `${(4 / 80) * 100}%`, background: 'var(--vedado)' }}>
            BLACKOUT 72H
          </motion.div>
          {calMarcos.map((m, i) => (
            <motion.div key={m.d} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.06 }}
              className="absolute -translate-x-1/2 top-32 group cursor-pointer" style={{ left: `${(m.t / 80) * 100}%` }}>
              <div className="w-3 h-3 rounded-full -mt-1.5" style={{ background: m.em ? 'var(--ink)' : 'var(--ink-faint)' }} />
              <div className="font-display font-bold text-sm mt-3 tabular" style={{ color: 'var(--ink)' }}>{m.d}</div>
              <div className="text-xs max-w-[120px] mt-1" style={{ color: 'var(--ink-body)' }}>{m.label}</div>
            </motion.div>
          ))}
        </div>
        <ol className="md:hidden relative border-l-2 pl-6 space-y-6" style={{ borderColor: 'var(--ink-hair)' }}>
          {calMarcos.map((m) => (
            <li key={m.d} className="relative">
              <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full" style={{ background: m.em ? 'var(--mint-deep)' : 'var(--ink-faint)' }} />
              <div className="font-display font-bold tabular text-lg" style={{ color: 'var(--ink)' }}>{m.d}</div>
              <div className="text-sm" style={{ color: 'var(--ink-body)' }}>{m.label}</div>
            </li>
          ))}
        </ol>
        <div className="font-mono-tag mt-8 pt-6" style={{ borderTop: '1px solid var(--ink-hair)' }}>Fonte: Res. TSE 23.760/2026</div>
      </div>
    </Reveal>
  )
}

const erros = [
  { t: 'Anúncio sem CNPJ no criativo', s: 'MULTA R$ 5–30K + REMOÇÃO', sev: 35, color: 'var(--atencao)', evitar: "Padronize um template com 'Propaganda Eleitoral' + CNPJ visível em todo criativo pago." },
  { t: 'Apoiador impulsionando posts', s: 'MULTA + RONI + CASSAÇÃO', sev: 85, color: 'var(--vedado)', evitar: 'Só candidato/partido/federação/coligação contratam mídia, com pagamento da conta de campanha.' },
  { t: 'Disparo em massa no WhatsApp', s: 'MULTA + ABUSO + CASSAÇÃO', sev: 90, color: 'var(--vedado)', evitar: 'Use Click-to-WhatsApp via Meta e API oficial; nunca compre listas.' },
  { t: 'Pedido de voto antes de 16/08', s: 'MULTA R$ 5–25K', sev: 30, color: 'var(--atencao)', evitar: "Antes de 16/08 só pré-campanha — sem 'vote em mim' explícito." },
  { t: 'IA com voz ou imagem de adversário', s: 'MULTA + CASSAÇÃO + CRIME', sev: 100, color: '#8B1F18', evitar: 'Política interna: jamais usar voz/imagem real de pessoa, nem em sátira.' },
  { t: 'Compra de base de eleitores', s: 'CASSAÇÃO + CRIME + ANPD', sev: 95, color: '#8B1F18', evitar: 'Construa base própria com opt-in documentado.' },
  { t: 'Não declarar despesa com Meta', s: 'REPROVAÇÃO + INELEGIBILIDADE', sev: 80, color: 'var(--vedado)', evitar: 'Conciliação semanal Meta × prestação, NF para o CNPJ de campanha.' },
]

export function RankingErros() {
  const sorted = [...erros].sort((a, b) => b.sev - a.sev)
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="space-y-3">
      {sorted.map((e, i) => (
        <motion.div
          key={e.t}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}
        >
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full p-5 flex items-center gap-4 text-left">
            <span className="font-display font-bold tabular text-2xl w-10 flex-shrink-0" style={{ color: 'var(--ink-faint)' }}>{String(i + 1).padStart(2, '0')}</span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <div className="font-serif text-lg" style={{ color: 'var(--ink)' }}>{e.t}</div>
                <span className="font-mono-tag" style={{ color: e.color }}>{e.s}</span>
              </div>
              <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'var(--paper-band)' }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${e.sev}%` }} viewport={{ once: true }} transition={{ duration: 1.1, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full" style={{ background: e.color }} />
              </div>
            </div>
          </button>
          {open === i && (
            <div className="px-5 pb-5 pl-[3.75rem] grid md:grid-cols-2 gap-4">
              <div>
                <div className="font-mono-tag mb-1" style={{ color: 'var(--vedado)' }}>Sanção</div>
                <div className="text-sm">{e.s}</div>
              </div>
              <div>
                <div className="font-mono-tag mb-1" style={{ color: 'var(--pode)' }}>Como evitar</div>
                <div className="text-sm">{e.evitar}</div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

const checks = [
  'A data está dentro da janela (16/08–01/10)?',
  'A conta está autorizada na Meta para anúncios eleitorais?',
  'A página está verificada?',
  "O rótulo 'Pago por' está ativo?",
  "O criativo exibe 'Propaganda Eleitoral' + CNPJ?",
  'O conteúdo está livre de fato sabidamente inverídico?',
  'Não há nome de adversário usado como palavra-chave?',
  'Conteúdo sintético está corretamente rotulado?',
  'Não há voz ou imagem manipulada de pessoa real?',
  'Está livre de discurso de ódio?',
  'Uso de imagem, marca ou voz de terceiros está autorizado?',
  'A política de privacidade está acessível?',
  'O pagamento sai apenas da conta de campanha?',
  'A segmentação evita dado sensível e é coerente com a circunscrição?',
  'O criativo foi aprovado pelo jurídico?',
]

export function ChecklistPublicacao() {
  const [done, setDone] = useState<boolean[]>(Array(15).fill(false))
  const count = done.filter(Boolean).length
  const all = count === 15
  return (
    <Reveal>
      <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="font-display font-bold text-xl tabular" style={{ color: 'var(--ink)' }}>{count} <span className="font-mono-tag font-normal">de 15 verificadas</span></div>
          <div className="flex gap-2">
            <button onClick={() => setDone(Array(15).fill(true))} className="font-mono-tag px-3 py-1 rounded-full" style={{ border: '1px solid var(--ink-hair)' }}>Marcar todas</button>
            <button onClick={() => setDone(Array(15).fill(false))} className="font-mono-tag px-3 py-1 rounded-full" style={{ border: '1px solid var(--ink-hair)' }}>Limpar</button>
          </div>
        </div>
        <div className="h-1.5 rounded-full mb-8" style={{ background: 'var(--paper-band)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(count / 15) * 100}%`, background: all ? 'var(--pode)' : 'var(--mint-deep)' }} />
        </div>
        <div className="space-y-2">
          {checks.map((qst, i) => (
            <label key={i} className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors" style={{ background: done[i] ? 'var(--pode-wash)' : 'transparent' }}>
              <input type="checkbox" checked={done[i]} onChange={(e) => setDone((d) => d.map((v, j) => (j === i ? e.target.checked : v)))}
                className="mt-1 w-5 h-5 accent-[var(--mint-deep)]" />
              <span className="font-display text-sm" style={{ color: 'var(--ink)' }}>{i + 1}. {qst}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 p-5 rounded-xl" style={{ background: all ? 'var(--pode-wash)' : 'var(--vedado-wash)', border: `1px solid ${all ? 'var(--pode)' : 'var(--vedado)'}` }}>
          <div className="font-serif text-lg" style={{ color: all ? 'var(--pode)' : 'var(--vedado)' }}>
            {all ? 'Liberado para publicar.' : `Ainda não. Faltam ${15 - count}. Ajuste os itens pendentes ou consulte o jurídico antes de publicar.`}
          </div>
        </div>
      </div>
    </Reveal>
  )
}

const diagQs = [
  "Todos os criativos pagos vão exibir 'Propaganda Eleitoral' + CNPJ no próprio conteúdo?",
  'O pagamento da mídia sairá só da conta de campanha (nunca de apoiador/terceiro)?',
  'Sua base foi construída com consentimento (sem lista comprada)?',
  'A operação evita qualquer disparo em massa por WhatsApp/SMS?',
  'Há regra interna proibindo IA com voz/imagem de pessoa real (inclusive sátira)?',
  'Existe um encarregado de LGPD (DPO) definido?',
  'Há contador eleitoral conciliando gasto na Meta vs. declarado, toda semana?',
]

export function DiagnosticoRisco() {
  const [answers, setAnswers] = useState<('sim' | 'nao' | 'ns' | null)[]>(Array(7).fill(null))
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)

  function answer(v: 'sim' | 'nao' | 'ns') {
    const next = [...answers]
    next[step] = v
    setAnswers(next)
    if (step < 6) setStep(step + 1)
    else setDone(true)
  }
  function restart() {
    setAnswers(Array(7).fill(null))
    setStep(0)
    setDone(false)
    setStarted(false)
  }

  const sims = answers.filter((a) => a === 'sim').length
  const result =
    sims >= 6
      ? { t: 'Operação blindada', c: 'var(--pode)', bg: 'var(--pode-wash)' }
      : sims >= 3
        ? { t: 'Zona de atenção', c: 'var(--atencao)', bg: 'var(--atencao-wash)' }
        : { t: 'Risco de cassação', c: 'var(--vedado)', bg: 'var(--vedado-wash)' }

  return (
    <div className="max-w-2xl mx-auto rounded-3xl p-8 md:p-12" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
      {!started ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="font-mono-tag" style={{ color: 'var(--mint-deep)' }}>DIAGNÓSTICO</div>
          <h4 className="font-serif mt-3" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.1, color: 'var(--ink)' }}>Sua operação está blindada para 2026?</h4>
          <p className="mt-5 text-lg" style={{ color: 'var(--ink-body)' }}>Sete perguntas. Dois minutos. Sem cadastro.</p>
          <button onClick={() => setStarted(true)} className="mt-8 px-8 py-4 rounded-full font-display font-medium" style={{ background: 'var(--mint)', color: 'var(--ink)' }}>Começar →</button>
        </motion.div>
      ) : !done ? (
        <>
          <div className="flex items-center justify-between mb-8">
            <span className="font-mono-tag">Pergunta {step + 1} / 7</span>
            <div className="flex-1 mx-4 h-1 rounded-full" style={{ background: 'var(--paper-band)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(step / 7) * 100}%`, background: 'var(--mint-deep)' }} />
            </div>
          </div>
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h4 className="font-serif text-2xl md:text-3xl leading-tight" style={{ color: 'var(--ink)' }}>{diagQs[step]}</h4>
            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <button onClick={() => answer('sim')} className="flex-1 py-4 rounded-full font-display font-medium" style={{ background: 'var(--mint)', color: 'var(--ink)' }}>Sim</button>
              <button onClick={() => answer('nao')} className="flex-1 py-4 rounded-full font-display font-medium" style={{ background: 'var(--vedado-wash)', color: 'var(--vedado)', border: '1px solid var(--vedado)' }}>Não</button>
              <button onClick={() => answer('ns')} className="flex-1 py-4 rounded-full font-display font-medium" style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--ink-hair)' }}>Não sei</button>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="font-mono-tag" style={{ color: result.c }}>RESULTADO</div>
          <h4 className="font-serif text-4xl md:text-5xl mt-3" style={{ color: 'var(--ink)' }}>{result.t}</h4>
          <div className="mt-6 p-5 rounded-xl" style={{ background: result.bg }}>
            <div className="font-display font-bold text-3xl tabular" style={{ color: result.c }}>{sims}/7</div>
            <div className="text-sm mt-1">respostas &ldquo;Sim&rdquo; — quanto mais, mais blindada está a operação.</div>
          </div>
          {answers.some((a) => a !== 'sim') && (
            <div className="mt-6">
              <div className="font-mono-tag mb-3">Pontos de atenção</div>
              <ul className="space-y-2">
                {answers.map((a, i) =>
                  a !== 'sim' ? (
                    <li key={i} className="flex gap-3 text-sm"><AlertTriangle className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: 'var(--atencao)' }} /><span>{diagQs[i]}</span></li>
                  ) : null,
                )}
              </ul>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a href="#convite" className="flex-1 text-center py-3 rounded-full font-display font-medium" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>Quer revisar isso com a gente? Agendar conversa →</a>
            <button onClick={restart} className="px-6 py-3 rounded-full font-display font-medium" style={{ border: '1px solid var(--ink-hair)', color: 'var(--ink)' }}>Refazer</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export function UsoRedesChart() {
  const data = [
    { name: 'WhatsApp', v: 93 }, { name: 'Instagram', v: 91 }, { name: 'Facebook', v: 83 }, { name: 'TikTok', v: 65 }, { name: 'Kwai', v: 38 }, { name: 'X', v: 26 },
  ]
  return (
    <Reveal>
      <div className="rounded-2xl p-6" style={{ background: 'var(--mint-wash)' }}>
        <div className="font-mono-tag mb-4">USO POR REDE · % DOS BRASILEIROS</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40 }}>
            <CartesianGrid horizontal={false} stroke="rgba(0,30,41,0.08)" />
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#001E29', fontFamily: 'Space Grotesk', fontSize: 13 }} width={90} />
            <Tooltip contentStyle={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)', borderRadius: 8, fontFamily: 'Space Grotesk' }} formatter={(v: number) => `${v}%`} />
            <Bar dataKey="v" radius={[0, 6, 6, 0]} animationDuration={1200}>
              {data.map((_, i) => <RCell key={i} fill={i === 0 ? 'var(--mint-deep)' : 'var(--mint)'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="font-mono-tag mt-2">Fonte: Data Report 2024</div>
      </div>
    </Reveal>
  )
}

export function BlackoutVisualizer() {
  return (
    <Reveal>
      <div className="rounded-2xl p-8 md:p-10" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="font-mono-tag" style={{ color: 'var(--spark)' }}>BLACKOUT IA · 01–04/10/2026</div>
        <div className="relative mt-8 h-24">
          <div className="absolute left-0 right-0 top-12 h-px" style={{ background: 'rgba(246,244,237,0.3)' }} />
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }}
            className="absolute top-8 h-10 origin-center rounded" style={{ left: '20%', width: '60%', background: 'repeating-linear-gradient(45deg, var(--vedado) 0 6px, transparent 6px 12px)' }} />
          <div className="absolute -translate-x-1/2 top-12" style={{ left: '50%' }}>
            <div className="w-4 h-4 rounded-full -mt-2" style={{ background: 'var(--spark)' }} />
            <div className="font-display font-bold mt-3" style={{ color: 'var(--paper)' }}>04/10</div>
            <div className="font-mono-tag" style={{ color: 'var(--spark)' }}>VOTAÇÃO</div>
          </div>
          <div className="absolute font-mono-tag" style={{ left: '18%', top: '70%', color: 'rgba(246,244,237,0.6)' }}>−72h</div>
          <div className="absolute font-mono-tag" style={{ left: '78%', top: '70%', color: 'rgba(246,244,237,0.6)' }}>+24h</div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div><div className="font-mono-tag" style={{ color: 'var(--spark)' }}>JANELA</div><div className="mt-2">72h antes · 24h depois</div></div>
          <div><div className="font-mono-tag" style={{ color: 'var(--spark)' }}>ESCOPO</div><div className="mt-2">Todo conteúdo sintético, mesmo rotulado</div></div>
          <div><div className="font-mono-tag" style={{ color: 'var(--spark)' }}>SANÇÃO</div><div className="mt-2">Multa R$ 5–30K + apuração</div></div>
        </div>
      </div>
    </Reveal>
  )
}

export function Janela47Dias() {
  return (
    <Reveal>
      <div className="rounded-2xl p-8" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
          <div>
            <div className="font-display font-bold leading-none tabular" style={{ fontSize: 'clamp(5rem, 12vw, 9rem)', color: 'var(--mint-deep)' }}>47</div>
            <div className="font-mono-tag mt-2">DIAS DE MÍDIA PAGA</div>
          </div>
          <div>
            <div className="font-mono-tag mb-3">ANO DE 2026</div>
            <div className="h-10 rounded-md relative overflow-hidden" style={{ background: 'var(--paper-band)' }}>
              <motion.div initial={{ width: 0 }} whileInView={{ width: '12.9%' }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-0 h-full" style={{ left: '61.6%', background: 'var(--mint-deep)' }} />
            </div>
            <div className="flex justify-between font-mono-tag mt-2"><span>JAN</span><span>ABR</span><span>JUL</span><span>OUT</span><span>DEZ</span></div>
            <p className="mt-4" style={{ color: 'var(--ink-body)' }}>De <strong>16/08</strong> a <strong>01/10</strong>. Toda a operação de impulsionamento eleitoral acontece nessa faixa.</p>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
