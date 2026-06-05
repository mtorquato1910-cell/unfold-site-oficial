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
            className="guia-lift p-5 rounded-xl flex gap-3" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
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

// Slots uniformes (TASK 7): a posição é o índice, não a data real — evita a
// colisão do cluster set/out. Os intervalos (janela/blackout) referenciam índices.
const calMarcos: { d: string; label: string; em?: boolean }[] = [
  { d: '15/05', label: 'Financiamento coletivo' },
  { d: '05/07', label: 'Propaganda intrapartidária' },
  { d: '20/07', label: 'Início das convenções' },
  { d: '05/08', label: 'Fim das convenções' },
  { d: '16/08', label: 'Início da propaganda e impulsionamento', em: true },
  { d: '13/09', label: 'Prestação parcial de contas' },
  { d: '01/10', label: 'Último dia de mídia paga', em: true },
  { d: '04/10', label: '1º turno', em: true },
  { d: '25/10', label: 'Eventual 2º turno' },
]
const CAL_N = calMarcos.length
const calSlot = (i: number) => ((i + 0.5) / CAL_N) * 100 // centro do slot, em %

export function CalendarioEleitoral() {
  // Intervalos por índice de slot: janela 16/08(4)→01/10(6), blackout 01/10(6)→04/10(7).
  const janL = calSlot(4)
  const janW = calSlot(6) - calSlot(4)
  const blkL = calSlot(6)
  const blkW = calSlot(7) - calSlot(6)
  return (
    <Reveal>
      <div className="rounded-2xl p-6 md:p-10" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
        {/* DESKTOP — bands em duas lanes ACIMA da linha; nós uniformes com descrição alternada */}
        <div className="hidden md:block relative" style={{ height: 320 }}>
          {/* Lane A — janela de campanha */}
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-7 rounded origin-left flex items-center justify-center px-2 font-mono-tag text-white whitespace-nowrap" style={{ top: 8, left: `${janL}%`, width: `${janW}%`, background: 'var(--mint-deep)' }}>
            JANELA DE CAMPANHA · 47 DIAS
          </motion.div>
          {/* Lane B — blackout (linha logo abaixo, sem sobrepor a lane A) */}
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute h-7 rounded origin-left flex items-center justify-center px-2 font-mono-tag text-white whitespace-nowrap" style={{ top: 44, left: `${blkL}%`, width: `${blkW}%`, background: 'var(--vedado)' }}>
            BLACKOUT IA · 72H
          </motion.div>

          {/* Linha principal */}
          <div className="absolute left-0 right-0 h-px" style={{ top: 165, background: 'var(--ink-hair)' }} />

          {calMarcos.map((m, i) => {
            const left = calSlot(i)
            const above = i % 2 === 1 // alterna descrição acima/abaixo p/ não colidir
            return (
              <div key={m.d}>
                {/* Ponto */}
                <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.05 }}
                  className="absolute w-3 h-3 rounded-full -translate-x-1/2" style={{ top: 159, left: `${left}%`, background: m.em ? 'var(--ink)' : 'var(--ink-faint)' }} />
                {/* Data + descrição (alternadas) */}
                <motion.div initial={{ opacity: 0, y: above ? -6 : 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 + i * 0.05 }}
                  className="absolute -translate-x-1/2 text-center" style={above ? { bottom: 163, left: `${left}%`, width: 124 } : { top: 178, left: `${left}%`, width: 124 }}>
                  <div className="font-display font-bold text-sm tabular" style={{ color: 'var(--ink)' }}>{m.d}</div>
                  <div className="text-xs mt-1 leading-snug" style={{ color: 'var(--ink-body)' }}>{m.label}</div>
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* MOBILE — segmentos rotulados + timeline vertical */}
        <div className="md:hidden">
          <div className="flex flex-col gap-2 mb-6">
            <div className="rounded-lg px-3 py-2 font-mono-tag text-white" style={{ background: 'var(--mint-deep)' }}>16/08–01/10 · Janela de campanha (47 dias)</div>
            <div className="rounded-lg px-3 py-2 font-mono-tag text-white" style={{ background: 'var(--vedado)' }}>01/10–04/10 · Blackout IA (72h)</div>
          </div>
          <ol className="relative border-l-2 pl-6 space-y-6" style={{ borderColor: 'var(--ink-hair)' }}>
            {calMarcos.map((m) => (
              <li key={m.d} className="relative">
                <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full" style={{ background: m.em ? 'var(--mint-deep)' : 'var(--ink-faint)' }} />
                <div className="font-display font-bold tabular text-lg" style={{ color: 'var(--ink)' }}>{m.d}</div>
                <div className="text-sm" style={{ color: 'var(--ink-body)' }}>{m.label}</div>
              </li>
            ))}
          </ol>
        </div>
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
        {/* Zona proibida: retângulo de altura uniforme; split 72h:24h = 3:1 → votação em 67,5% */}
        <div className="relative mt-8" style={{ height: 120 }}>
          <div className="absolute left-0 right-0 h-px" style={{ top: 50, background: 'rgba(246,244,237,0.3)' }} />
          {/* −72h (centro do segmento esquerdo) e +24h (centro do direito) */}
          <div className="absolute -translate-x-1/2 font-mono-tag" style={{ left: '41.25%', top: 4, color: 'rgba(246,244,237,0.6)' }}>−72h</div>
          <div className="absolute -translate-x-1/2 font-mono-tag" style={{ left: '76.25%', top: 4, color: 'rgba(246,244,237,0.6)' }}>+24h</div>
          {/* Retângulo hachurado (15%→85%), borda uniforme, hatch contido por overflow */}
          <div className="absolute rounded overflow-hidden" style={{ left: '15%', width: '70%', top: 30, height: 40, border: '1px solid var(--vedado)' }}>
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="origin-left w-full h-full" style={{ background: 'repeating-linear-gradient(45deg, var(--vedado) 0 6px, transparent 6px 12px)' }} />
          </div>
          {/* Marcador da votação na divisão 3:1 (não centrado) */}
          <div className="absolute" style={{ left: '67.5%', top: 22, width: 2, height: 56, background: 'var(--spark)', transform: 'translateX(-50%)' }} />
          <div className="absolute -translate-x-1/2 w-3 h-3 rounded-full" style={{ left: '67.5%', top: 18, background: 'var(--spark)' }} />
          <div className="absolute -translate-x-1/2 text-center" style={{ left: '67.5%', top: 82 }}>
            <div className="font-display font-bold" style={{ color: 'var(--paper)' }}>04/10</div>
            <div className="font-mono-tag" style={{ color: 'var(--spark)' }}>VOTAÇÃO</div>
          </div>
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
