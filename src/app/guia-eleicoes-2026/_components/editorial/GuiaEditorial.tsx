'use client'

import { motion, MotionConfig, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Download, Share2, ArrowDown, Check, X } from 'lucide-react'
import { Header, Footer, CoBrand } from './Chrome'
import { Orb } from './Orb'
import { EditorialGate } from './EditorialGate'
import { useDownloadGuia, useShareGuia } from './actions'
import {
  Reveal, Eyebrow, StatCounter, PullQuote, ChapterCover, Section, SectionTitle,
} from './primitives'
import {
  LedgerPodeNaoPode, MatrizPlataformas, CalendarioEleitoral, RankingErros,
  ChecklistPublicacao, UsoRedesChart, BlackoutVisualizer, Janela47Dias,
} from './Visualizations'
import { ContatoForm } from './ContatoForm'

const verdades: [string, string, string][] = [
  ['01', 'A Meta é praticamente o único motor pago de escala', 'Google/YouTube proíbem anúncios eleitorais desde mai/2024; TikTok, Kwai, LinkedIn e X também vetam. Em 2026, só Facebook e Instagram operam impulsionamento eleitoral no Brasil.'],
  ['02', 'A janela de campanha é curta', 'Mídia paga só de 16/08 a 01/10/2026 (47 dias). O 2º turno reabre 24h após o 1º turno e vai até 24/10.'],
  ['03', 'As regras de IA e deepfake são novas, severas e podem cassar mandato', 'Resolução TSE 23.755/2026: deepfake com imagem ou voz real é proibido (inclusive em sátira), todo conteúdo sintético deve ser rotulado, blackout de 72h antes e 24h depois da votação, inversão do ônus da prova.'],
  ['04', 'A LGPD se aplica integralmente', 'Comprar lista leva à cassação; disparo em massa sem consentimento é vedado; microdirecionamento pode exigir RIPD.'],
  ['05', 'O custo da mídia subiu', 'Desde jan/2026 a Meta inclui PIS, Cofins e ISS; CPM efetivo +12% a +15%.'],
]

const fases = [
  { t: 'Institucional', w: 'Qualquer momento', pode: ['Divulgar agenda e atos institucionais', 'Posicionamento sobre temas públicos'], naoPode: ['Pedido explícito de voto', 'Mídia paga eleitoral'], color: 'var(--blue)' },
  { t: 'Pré-campanha', w: 'Até 15/08/2026', pode: ['Mencionar pretensão de candidatura', 'Eventos com apoiadores'], naoPode: ['Pedido explícito de voto', 'Impulsionamento eleitoral', 'Distribuir material gráfico'], color: 'var(--mint)' },
  { t: 'Campanha', w: '16/08 – 03/10 · 2º turno até 24/10', pode: ['Pedido explícito de voto', 'Impulsionamento na Meta', 'Material gráfico em todos os formatos'], naoPode: ['IA não rotulada', 'Disparo em massa', 'Anúncios fora da Meta'], color: 'var(--mint-deep)' },
]

const roadmap: [string, string, string, string][] = [
  ['FEV', 'T-6', 'Estruturação', 'Definir governança, mapear stack, contratar jurídico e contábil eleitoral.'],
  ['MAR', 'T-5', 'Base de autoridade', 'Construir conteúdo institucional, redes orgânicas, presença digital sólida.'],
  ['ABR', 'T-4', 'Base própria e ativos', 'Pixel, CRM, e-mail próprio, landing pages, política de privacidade.'],
  ['MAI', 'T-3', 'Operação e jurídico', 'DPO, fluxo de aprovação, RIPD, política de IA, contratos com a Meta.'],
  ['JUN', 'T-2', 'Técnica e criativos', "Banco de criativos com 'Propaganda Eleitoral' + CNPJ, planos de mídia."],
  ['JUL', 'T-1', 'Ensaio operacional', 'Simulações de publicação, conciliação contábil, rotina de moderação.'],
  ['AGO', 'D-DAY', '16/08 — início', 'Início da propaganda e do impulsionamento pago na Meta.'],
]

const papeis: [string, string][] = [
  ['Head de operação digital', 'Responde pelo plano, pela governança e pelo risco.'],
  ['Gestor de mídia paga', 'Conta autorizada na Meta, criativos, conciliação contábil.'],
  ['Coordenador de conteúdo', 'Pauta diária, narrativa, calendário editorial.'],
  ['Analista de dados', 'Métricas de signal, painel semanal, leitura de saturação.'],
  ['Moderador de comunidade', 'Atendimento, moderação, gestão de crise nos canais.'],
]

const funil: [string, string, string][] = [
  ['01', 'Reconhecimento', 'TV digital, OOH, vídeo curto no Instagram/TikTok orgânico'],
  ['02', 'Reputação', 'Imprensa, entrevistas, conteúdo de autoridade'],
  ['03', 'Educação', 'Vídeos explicativos, propostas, posicionamentos'],
  ['04', 'Engajamento', 'Conteúdo dialogado, lives, comentários, comunidades'],
  ['05', 'Mobilização', 'E-mail, WhatsApp opt-in, eventos, voluntariado'],
  ['06', 'Conversão', 'Última semana: lembrete de voto e contraste com o adversário'],
]

const metricasImportam = ['CPM por segmento', 'Frequência semanal por base', 'View-through rate em vídeo', 'Custo por contato qualificado', 'Crescimento de base own (e-mail/WA opt-in)', 'Sentimento qualitativo em comentários', 'Taxa de resposta em DM/WA', 'Cobertura geográfica por região-alvo']
const metricasEnganam = ['Curtidas totais', 'Seguidores brutos', 'Compartilhamentos sem contexto', 'Impressões agregadas', 'Visualizações de 3s', "CPM 'mais barato' fora do segmento", 'Engajamento de fora da circunscrição', 'Picos virais sem retenção']

function GuiaContent() {
  const downloadHero = useDownloadGuia('hero')
  const downloadConvite = useDownloadGuia('convite_final')
  const share = useShareGuia()

  // Parallax do orb do hero (TASK 9) — desativado sob prefers-reduced-motion.
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const orbYRaw = useTransform(scrollY, [0, 800], [0, -120])
  const orbY = reduce ? 0 : orbYRaw

  return (
    <div id="top">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: 'var(--paper)' }}>
        {/* Profundidade: blobs desfocados atrás do conteúdo */}
        <div className="guia-blob" style={{ background: 'var(--mint-wash)', width: 420, height: 420, left: -90, top: -80, opacity: 0.6 }} />
        <div className="guia-blob" style={{ background: 'var(--blue)', width: 300, height: 300, right: '12%', bottom: -60, opacity: 0.22, animationDelay: '-7s' }} />
        <motion.div style={{ y: orbY }} className="absolute right-[-10%] top-10 hidden md:block pointer-events-none select-none">
          <Orb className="w-[60vw] max-w-[700px] opacity-90" />
        </motion.div>
        <motion.div initial={{ y: 0 }} animate={{ y: [0, -16, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[-30%] top-20 w-[80vw] opacity-60 pointer-events-none select-none md:hidden">
          <Orb className="w-full" />
        </motion.div>
        <div className="container-edit pt-16 md:pt-28 pb-20 md:pb-32 relative z-[1]">
          <Reveal><Eyebrow>ESTUDO · ELEIÇÕES 2026 · UNFOLD ✕ FEAT.WORK</Eyebrow></Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-serif max-w-4xl" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.02, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              Guia de anúncios digitais para as <em className="italic" style={{ color: 'var(--mint-deep)' }}>Eleições de 2026</em>.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-xl" style={{ color: 'var(--ink-body)' }}>
              Regras, plataformas, riscos e oportunidades da operação política online.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap gap-3 mt-10">
              <button onClick={downloadHero} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-medium" style={{ background: 'var(--mint)', color: 'var(--ink)' }}>
                <Download className="w-4 h-4" /> Baixar PDF
              </button>
              <button onClick={share} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-medium" style={{ border: '1px solid var(--ink-hair)', color: 'var(--ink)' }}>
                <Share2 className="w-4 h-4" /> Compartilhar
              </button>
              <a href="#abertura" className="inline-flex items-center gap-2 px-6 py-3 font-mono-tag" style={{ color: 'var(--ink-faint)' }}>
                Ler o estudo <ArrowDown className="w-4 h-4" />
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="font-mono-tag mt-16 flex flex-wrap items-center gap-x-3 gap-y-2 pt-6" style={{ borderTop: '1px solid var(--ink-hair)' }}>
              <span>36 PÁGINAS</span><span aria-hidden style={{ color: 'var(--mint-deep)' }}>·</span>
              <span>5 PARTES</span><span aria-hidden style={{ color: 'var(--mint-deep)' }}>·</span>
              <span>EDIÇÃO 1.0</span><span aria-hidden style={{ color: 'var(--mint-deep)' }}>·</span>
              <span>MAIO 2026</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PARTNERSHIP STRIP */}
      <section style={{ background: 'var(--paper-band)', borderTop: '1px solid var(--ink-hair)', borderBottom: '1px solid var(--ink-hair)' }}>
        <div className="container-edit py-8 md:py-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <CoBrand size="md" />
          <p className="font-serif italic text-lg md:text-xl flex-1" style={{ color: 'var(--ink)', lineHeight: 1.35 }}>
            Um estudo em parceria entre a Unfold e a Feat.Work — growth, mídia e dados de um lado; comunicação e campanha política do outro.
          </p>
        </div>
      </section>

      {/* OPENING — hierarquia: eyebrow → tese (foco) → apoio → citação (offset) */}
      <Section id="abertura">
        <Eyebrow>POR QUE ESTE GUIA EXISTE</Eyebrow>
        <Reveal>
          <p className="mt-6 font-serif max-w-4xl" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3.5rem)', lineHeight: 1.12, color: 'var(--ink)' }}>
            O cenário de 2026 é mais restritivo, mais complexo e tem{' '}
            <em className="italic" style={{ color: 'var(--mint-deep)' }}>menos margem para improviso</em> do que qualquer ciclo anterior.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 mt-12 md:mt-16 items-start">
          <Reveal>
            <p style={{ color: 'var(--ink-body)' }}>
              Em 2024, candidatos brasileiros descobriram, no meio da campanha, que o Google tinha proibido anúncios políticos. Plataformas que operavam mídia eleitoral em ciclos anteriores deixaram de operar. Outras criaram regras mais rigorosas, com janelas de blackout para conteúdo de IA. O TSE atualizou a regulamentação. A LGPD entrou em vigor de vez para campanhas, sob fiscalização cooperada da ANPD.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
              <PullQuote attribution="EQUIPE UNFOLD × FEAT.WORK">
                Uma sem a outra produz risco. As duas juntas produzem resultado.
              </PullQuote>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* INDEX */}
      <Section band="band" id="indice">
        <SectionTitle eyebrow="ÍNDICE DO ESTUDO" title="Cinco partes para entender o jogo." />
        <div className="divide-y" style={{ borderTop: '1px solid var(--ink-hair)' }}>
          {([
            ['00', 'O cenário', 'Brasil digital em números e o que isso significa para a operação.', 'parte-00'],
            ['01', 'Como está o jogo', 'As 5 verdades, as 3 fases, o calendário, o que mudou.', 'parte-01'],
            ['02', 'O que pode e o que não pode', 'Matriz de plataformas, ledger pode/não-pode, Meta, WhatsApp, IA.', 'parte-02'],
            ['03', 'Como pensar a operação', 'Roadmap, papéis, funil, métricas, LGPD, prestação de contas.', 'parte-03'],
            ['04', 'Os erros que mais custam', '7 erros em ranking de severidade + checklist antes de publicar.', 'parte-04'],
            ['05', 'Quem somos & convite', 'Unfold × Feat.Work — e a conversa final.', 'convite'],
          ] as [string, string, string, string][]).map(([n, t, d, id]) => (
            <Reveal key={n}>
              <a href={`#${id}`} className="grid md:grid-cols-[80px_1fr_auto] gap-4 md:gap-8 py-6 group items-baseline" style={{ borderColor: 'var(--ink-hair)' }}>
                <div className="font-display font-bold text-3xl tabular" style={{ color: 'var(--ink-faint)' }}>{n}</div>
                <div>
                  <div className="font-serif text-2xl md:text-3xl group-hover:text-[var(--mint-deep)] transition-colors" style={{ color: 'var(--ink)' }}>{t}</div>
                  <div className="mt-2 text-sm" style={{ color: 'var(--ink-body)' }}>{d}</div>
                </div>
                <div className="font-mono-tag opacity-0 group-hover:opacity-100 transition-opacity">Ler →</div>
              </a>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* PARTE 00 */}
      <ChapterCover num="00" eyebrow="PARTE 00 · O CENÁRIO" title="O Brasil digital, em números." intro="A operação política em 2026 começa entendendo o terreno: penetração, tempo, redes, dispositivos. Não é pano de fundo — é a engenharia da campanha." band="var(--mint-wash)" />
      <Section id="parte-00">
        <SectionTitle eyebrow="O DIGITAL NO BRASIL EM NÚMEROS" title="166 milhões de pessoas, 9 horas por dia." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          <StatCounter value={89} suffix="%" label="Usuária de internet — 166 milhões de pessoas." source="TIC DOMICÍLIOS 2024 · CGI.BR" />
          <StatCounter value={60} suffix="%" label="Acessam só pelo celular (86% nas classes DE)." source="TIC DOMICÍLIOS 2024" />
          <StatCounter staticValue="9h13" label="Tempo médio diário online — 2º do mundo." source="DIGITAL 2024 · WE ARE SOCIAL" />
          <StatCounter staticValue="3h37" label="Por dia em redes sociais — 3º do mundo." source="DIGITAL 2024" />
          <StatCounter value={93} suffix="%" label="Usam WhatsApp (IG 91% · FB 83% · TikTok 65%)." source="DATA REPORT 2024" />
          <StatCounter value={144} suffix="M" label="Usuários ativos de redes sociais." source="DIGITAL 2024" />
        </div>
        <div className="mt-16 grid lg:grid-cols-2 gap-10 items-start">
          <UsoRedesChart />
          <Reveal>
            <div className="p-8 rounded-2xl" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
              <div className="font-mono-tag" style={{ color: 'var(--mint-deep)' }}>IMPLICAÇÃO</div>
              <p className="mt-3 font-serif text-2xl" style={{ color: 'var(--ink)', lineHeight: 1.25 }}>
                Se 2 em cada 3 horas online de um brasileiro acontecem dentro de uma rede social — e WhatsApp + Instagram concentram quase tudo — a operação política precisa nascer dentro desses ambientes, não fora deles.
              </p>
              <p className="mt-6" style={{ color: 'var(--ink-body)' }}>
                Mais: <strong>mais informações sobre candidatos vêm do digital do que da TV — em uma proporção de 2 para 1</strong>. O ponto não é se a campanha será digital — é como ela vai operar sob as regras que mudaram.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* PARTE 01 */}
      <ChapterCover num="01" eyebrow="PARTE 01 · COMO ESTÁ O JOGO" title="As cinco verdades de 2026." intro="O que mudou desde 2022 não é cosmético. Plataformas saíram do mercado eleitoral, a IA virou linha vermelha, a LGPD passou a morder. Cinco fatos para começar." band="var(--mint-wash)" />
      <Section id="parte-01">
        <div className="space-y-12">
          {verdades.map(([n, t, d]) => (
            <Reveal key={n}>
              <div className="grid md:grid-cols-[120px_1fr] gap-6 md:gap-10 py-8" style={{ borderTop: '1px solid var(--ink-hair)' }}>
                <div className="font-display font-bold tabular" style={{ fontSize: '3rem', color: 'var(--mint-deep)', lineHeight: 1 }}>{n}</div>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl" style={{ color: 'var(--ink)', lineHeight: 1.15 }}>{t}</h3>
                  <p className="mt-4 text-lg max-w-3xl" style={{ color: 'var(--ink-body)' }}>{d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-16 p-8 md:p-12 rounded-2xl text-center" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
            <p className="font-serif text-2xl md:text-3xl" style={{ lineHeight: 1.3 }}>
              &ldquo;A campanha digital de 2026 não é a de 2022. Quem replicar o playbook anterior vai jogar com regras que mudaram <span style={{ color: 'var(--spark)' }}>e contra plataformas que mudaram.</span>&rdquo;
            </p>
          </div>
        </Reveal>
      </Section>

      {/* As 3 fases */}
      <Section band="band">
        <SectionTitle eyebrow="AS 3 FASES DA COMUNICAÇÃO POLÍTICA" title="Antes, durante e depois da janela." />
        <div className="grid md:grid-cols-3 gap-4">
          {fases.map((f) => (
            <Reveal key={f.t}>
              <div className="rounded-2xl p-6 h-full flex flex-col" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
                <div className="h-2 rounded-full mb-4" style={{ background: f.color }} />
                <div className="font-mono-tag">{f.w}</div>
                <h4 className="font-serif text-2xl mt-2" style={{ color: 'var(--ink)' }}>{f.t}</h4>
                <div className="mt-5">
                  <div className="font-mono-tag mb-2" style={{ color: 'var(--pode)' }}>PERMITIDO</div>
                  <ul className="space-y-1.5">
                    {f.pode.map((p) => <li key={p} className="flex gap-2 text-sm"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--pode)' }} /><span>{p}</span></li>)}
                  </ul>
                </div>
                <div className="mt-5">
                  <div className="font-mono-tag mb-2" style={{ color: 'var(--vedado)' }}>VEDADO</div>
                  <ul className="space-y-1.5">
                    {f.naoPode.map((p) => <li key={p} className="flex gap-2 text-sm"><X className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--vedado)' }} /><span>{p}</span></li>)}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="font-mono-tag mt-8">Base normativa: Lei 9.504/1997, art. 36 e 36-A · Res. TSE 23.610/2019, alt. pela 23.755/2026.</div>
      </Section>

      {/* Calendário + 47 dias */}
      <Section>
        <SectionTitle eyebrow="CALENDÁRIO ELEITORAL 2026" title="Marcos que definem a operação." />
        <CalendarioEleitoral />
        <div className="mt-12">
          <Janela47Dias />
        </div>
      </Section>

      {/* PARTE 02 */}
      <ChapterCover num="02" eyebrow="PARTE 02 · PODE × NÃO PODE" title="O que cada plataforma aceita, e o preço de cada erro." intro="A matriz, o ledger, a Meta como motor, o WhatsApp como armadilha — e a nova linha vermelha da IA." band="var(--paper-band)" />
      <Section id="parte-02">
        <SectionTitle eyebrow="MATRIZ DE PLATAFORMAS" title="Onde anunciar — e onde apenas existir." />
        <MatrizPlataformas />
        <p className="mt-6 text-sm" style={{ color: 'var(--ink-faint)' }}>
          *Kwai: forte no interior e Nordeste — uso estratégico orgânico, sem mídia paga eleitoral.
        </p>
      </Section>

      <Section band="band">
        <SectionTitle eyebrow="PODE × NÃO PODE" title="O ledger completo do ciclo 2026." lede="Filtre por categoria, busque por prática. Sanções de acordo com Res. TSE 23.610/2019, atualizada pela 23.755/2026." />
        <LedgerPodeNaoPode />
      </Section>

      <Section>
        <SectionTitle eyebrow="META · MOTOR PRINCIPAL" title="O processo de autorização, em 4 passos." />
        <div className="grid md:grid-cols-4 gap-4">
          {[
            'Verificação de identidade do anunciante (documento + selfie).',
            'Vinculação do Business Manager ao CNPJ da campanha.',
            "Submissão à categoria 'Anúncios sobre temas sociais, eleições ou política'.",
            'Aprovação manual da Meta — começar com antecedência mínima de 30 dias.',
          ].map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="p-6 rounded-2xl h-full" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
                <div className="font-display font-bold text-3xl tabular" style={{ color: 'var(--mint-deep)' }}>{String(i + 1).padStart(2, '0')}</div>
                <p className="mt-3 text-sm" style={{ color: 'var(--ink)' }}>{p}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-10 p-6 md:p-8 rounded-2xl" style={{ background: 'var(--vedado-wash)', border: '1px solid var(--vedado)' }}>
            <div className="font-mono-tag" style={{ color: 'var(--vedado)' }}>ATENÇÃO CRÍTICA</div>
            <p className="mt-3 font-serif text-xl md:text-2xl" style={{ color: 'var(--ink)', lineHeight: 1.3 }}>
              O rótulo automático &ldquo;Pago por&rdquo; da Meta NÃO substitui a obrigação de exibir <strong>&ldquo;Propaganda Eleitoral&rdquo; + CNPJ</strong> no próprio criativo.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* WhatsApp */}
      <Section band="band">
        <SectionTitle eyebrow="WHATSAPP · O MAIS ARRISCADO" title="93% dos brasileiros estão lá. E é onde mais se perde mandato." />
        <div className="grid md:grid-cols-2 gap-6">
          <Reveal>
            <div className="p-8 rounded-2xl h-full" style={{ background: 'var(--pode-wash)', border: '1px solid var(--pode)' }}>
              <div className="font-mono-tag" style={{ color: 'var(--pode)' }}>O QUE PODE</div>
              <ul className="mt-4 space-y-3">
                {['Click-to-WhatsApp via Meta', 'Atendimento humano em listas opt-in da própria campanha', 'WhatsApp Business API oficial com chatbot identificado', 'Comunidades e grupos com regras públicas'].map((p) => (
                  <li key={p} className="flex gap-3"><Check className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--pode)' }} /><span>{p}</span></li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="p-8 rounded-2xl h-full" style={{ background: 'var(--vedado-wash)', border: '1px solid var(--vedado)' }}>
              <div className="font-mono-tag" style={{ color: 'var(--vedado)' }}>O QUE NÃO PODE</div>
              <ul className="mt-4 space-y-3">
                {['Disparo em massa em listas externas', 'Ferramentas não oficiais', 'Compra de bancos de números', 'Robôs sem identificação como bot', 'Mensagens com fato sabidamente inverídico'].map((p) => (
                  <li key={p} className="flex gap-3"><X className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--vedado)' }} /><span>{p}</span></li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal>
          <p className="mt-8 font-serif italic text-xl md:text-2xl max-w-3xl" style={{ color: 'var(--ink)' }}>
            &ldquo;Disparo em massa documentado pode levar à cassação do mandato, mesmo após a posse.&rdquo;
          </p>
        </Reveal>
      </Section>

      {/* IA DARK SPREAD */}
      <Section band="dark">
        <SectionTitle dark eyebrow="IA E DEEPFAKE · A NOVA LINHA VERMELHA" title="Conteúdo sintético: rotule, evite a manipulação de pessoas reais e respeite o blackout." lede="A Resolução TSE 23.755/2026 endureceu como nenhum ciclo anterior o uso de IA generativa em campanha." />
        <div className="grid md:grid-cols-2 gap-6">
          {([
            ['Definição de deepfake', 'Qualquer conteúdo sintético com imagem ou voz de pessoa real — inclui paródia e sátira.'],
            ['Rotulagem obrigatória', 'Rótulo visível e legível, mesmo quando o uso é só de fundo ou tradução.'],
            ['Blackout 72h / 24h', 'Nas 72h antes e 24h depois da votação, nenhum conteúdo sintético pode circular — mesmo rotulado.'],
            ['Inversão do ônus', 'Cabe a quem publicou provar a integridade do conteúdo.'],
          ] as [string, string][]).map(([t, d]) => (
            <Reveal key={t}>
              <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <h4 className="font-serif text-2xl" style={{ color: 'var(--paper)' }}>{t}</h4>
                <p className="mt-3" style={{ color: 'rgba(246,244,237,0.78)' }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10">
          <BlackoutVisualizer />
        </div>
        <Reveal>
          <p className="mt-8 font-mono-tag" style={{ color: 'var(--spark)' }}>
            CONSEQUÊNCIA: CASSAÇÃO DO REGISTRO + MULTA R$ 5–30K — E, EM DEEPFAKE, CONFIGURAÇÃO DE CRIME.
          </p>
        </Reveal>
      </Section>

      {/* PARTE 03 */}
      <ChapterCover num="03" eyebrow="PARTE 03 · OPERAÇÃO" title="Como pensar a operação digital." intro="Seis meses até o D-Day, cinco papéis essenciais, um funil em seis etapas e a LGPD como espinha dorsal." band="var(--mint-wash)" />
      <Section id="parte-03">
        <SectionTitle eyebrow="ROADMAP · 6 MESES ATÉ A URNA" title="Mês a mês, do T-6 ao D-Day." />
        <div className="space-y-3">
          {roadmap.map(([m, ms, t, d]) => (
            <Reveal key={m}>
              <div className="grid md:grid-cols-[80px_80px_1fr_2fr] gap-4 md:gap-8 items-baseline py-5" style={{ borderTop: '1px solid var(--ink-hair)' }}>
                <div className="font-display font-bold text-2xl" style={{ color: 'var(--ink)' }}>{m}</div>
                <div className="font-mono-tag" style={{ color: 'var(--mint-deep)' }}>{ms}</div>
                <div className="font-serif text-xl" style={{ color: 'var(--ink)' }}>{t}</div>
                <p style={{ color: 'var(--ink-body)' }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section band="band">
        <SectionTitle eyebrow="OS 5 PAPÉIS ESSENCIAIS" title="Operação enxuta, sem buracos." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papeis.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.05}>
              <div className="p-6 rounded-2xl h-full" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
                <div className="font-display font-bold text-2xl tabular" style={{ color: 'var(--mint-deep)' }}>{String(i + 1).padStart(2, '0')}</div>
                <h4 className="mt-2 font-serif text-xl" style={{ color: 'var(--ink)' }}>{t}</h4>
                <p className="mt-2 text-sm" style={{ color: 'var(--ink-body)' }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 font-mono-tag">Operações enxutas costumam acumular funções — viável até certo porte. Acima disso, o acúmulo vira gargalo.</p>
      </Section>

      <Section>
        <SectionTitle eyebrow="FUNIL ELEITORAL · 6 ETAPAS" title="Do reconhecimento ao voto." />
        <div className="space-y-2">
          {funil.map(([n, t, c], i) => (
            <Reveal key={n}>
              <div className="grid md:grid-cols-[60px_1fr_2fr] gap-4 md:gap-8 p-5 rounded-xl items-center" style={{ background: `color-mix(in oklab, var(--mint) ${5 + i * 3}%, var(--paper-hi))`, border: '1px solid var(--ink-hair)', marginLeft: `${i * 1.5}%`, marginRight: `${i * 1.5}%` }}>
                <div className="font-display font-bold text-3xl tabular" style={{ color: 'var(--mint-deep)' }}>{n}</div>
                <div className="font-serif text-xl" style={{ color: 'var(--ink)' }}>{t}</div>
                <p className="text-sm" style={{ color: 'var(--ink-body)' }}>{c}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section band="band">
        <SectionTitle eyebrow="MÉTRICAS · SIGNAL × NOISE" title="O que importam — e o que enganam." />
        <div className="grid md:grid-cols-2 gap-6">
          <Reveal>
            <div className="p-6 rounded-2xl" style={{ background: 'var(--pode-wash)', border: '1px solid var(--pode)' }}>
              <div className="font-mono-tag" style={{ color: 'var(--pode)' }}>IMPORTAM</div>
              <ul className="mt-4 space-y-2">
                {metricasImportam.map((m) => <li key={m} className="flex gap-2"><Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--pode)' }} /><span>{m}</span></li>)}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="p-6 rounded-2xl" style={{ background: 'var(--paper-hi)', border: '1px dashed var(--ink-hair)' }}>
              <div className="font-mono-tag" style={{ color: 'var(--ink-faint)' }}>ENGANAM</div>
              <ul className="mt-4 space-y-2">
                {metricasEnganam.map((m) => <li key={m} className="flex gap-2 line-through" style={{ color: 'var(--ink-faint)' }}><X className="w-4 h-4 mt-1 flex-shrink-0" /><span>{m}</span></li>)}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionTitle eyebrow="LGPD NA CAMPANHA" title="O essencial em cinco pontos." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {([
            ['O candidato é controlador', 'Responsabilidade direta sobre o tratamento de dados.'],
            ['Dado sensível tem cerco', 'Origem racial, religião, opinião política exigem base legal específica.'],
            ['Lista comprada é proibida', 'Cassação e crime — ANPD e Justiça Eleitoral atuam em conjunto.'],
            ['Microdirecionamento pode exigir RIPD', 'Relatório de Impacto à Proteção de Dados, documentado.'],
            ['Descadastro em 48h', 'Pedido de opt-out deve ser atendido em até 48h, sob multa de R$ 100/mensagem.'],
          ] as [string, string][]).map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.05}>
              <div className="p-5 rounded-xl h-full" style={{ background: 'var(--mint-wash)' }}>
                <div className="font-mono-tag" style={{ color: 'var(--mint-deep)' }}>{String(i + 1).padStart(2, '0')}</div>
                <h5 className="font-serif text-lg mt-2" style={{ color: 'var(--ink)' }}>{t}</h5>
                <p className="mt-2 text-sm">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 font-mono-tag">Recomendação: nomear DPO (encarregado) formalmente, mesmo em operações menores.</p>
      </Section>

      {/* PARTE 04 */}
      <ChapterCover num="04" eyebrow="PARTE 04 · ERROS" title="Os sete erros que mais custam." intro="Em sete entre sete casos, o erro é de governança — não de criatividade nem de dinheiro." band="var(--paper)" />
      <Section id="parte-04">
        <SectionTitle eyebrow="RANKING DE SEVERIDADE" title="Do mais punível ao reparável." />
        <RankingErros />
        <Reveal>
          <p className="mt-12 font-serif italic text-2xl md:text-3xl max-w-3xl" style={{ color: 'var(--ink)', lineHeight: 1.25 }}>
            &ldquo;O padrão: em sete entre sete casos, o erro é de governança — não de criatividade nem de dinheiro.&rdquo;
          </p>
        </Reveal>
      </Section>

      <Section band="band">
        <SectionTitle eyebrow="CHECKLIST · 15 PERGUNTAS ANTES DE PUBLICAR" title="Marque até zerar a lista." />
        <ChecklistPublicacao />
      </Section>

      {/* CONTATO / CONSULTORIA */}
      <Section id="contato" band="mint">
        <SectionTitle eyebrow="CONSULTORIA" title="Consultoria em marketing e mídia política." lede="Operação digital, regras e estratégia para 2026 — estruturada por quem faz growth e por quem faz campanha política." />
        <ContatoForm />
      </Section>

      {/* QUEM SOMOS */}
      <ChapterCover num="05" eyebrow="PARTE 05 · QUEM SOMOS" title="Unfold × Feat.Work, em colaboração." intro="Este guia nasce do encontro entre a disciplina de growth da Unfold e a experiência política da Feat.Work." band="var(--paper-band)" />
      <Section>
        <div className="grid md:grid-cols-2 gap-10 items-stretch">
          <Reveal className="h-full">
            <div className="p-8 rounded-2xl h-full" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
              <div className="font-display font-bold text-2xl" style={{ color: 'var(--ink)' }}>UNFOLD</div>
              <div className="font-mono-tag mt-2" style={{ color: 'var(--mint-deep)' }}>GROWTH MARKETING</div>
              <p className="mt-4">Consultoria e assessoria de growth marketing. Estruturamos operações de geração de demanda, mídia paga, dados e monitoramento — com foco em resultado mensurável e governança rigorosa. Mais de R$ 850k gerenciados em mídia nas principais plataformas digitais.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="h-full">
            <div className="p-8 rounded-2xl h-full" style={{ background: 'var(--paper-hi)', border: '1px solid var(--ink-hair)' }}>
              <div className="font-display font-bold text-2xl" style={{ color: 'var(--ink)' }}>Feat<span style={{ color: 'var(--feat-dot)' }}>.</span>Work</div>
              <div className="font-mono-tag mt-2" style={{ color: 'var(--mint-deep)' }}>MARKETING E COMUNICAÇÃO POLÍTICA</div>
              <p className="mt-4">Agência especializada em comunicação estratégica, marketing político e operação eleitoral. Unimos planejamento, criatividade, produção audiovisual e estratégias digitais para construir posicionamento e fortalecer a imagem pública de lideranças e instituições. Premiada no Prêmio CAMP de Marketing Político (Melhor Filme e Melhor Slogan de Campanha).</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* CONVITE — DARK SPREAD */}
      <Section id="convite" band="dark">
        <div className="relative overflow-hidden">
          <Orb className="absolute -right-20 -top-20 w-[300px] md:w-[500px] opacity-30 pointer-events-none select-none" style={{ filter: 'hue-rotate(120deg) saturate(1.4)' }} />
          <div className="relative max-w-3xl">
            <Eyebrow><span style={{ color: 'var(--spark)' }}>CONVITE</span></Eyebrow>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-serif" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', color: 'var(--paper)', lineHeight: 1.05 }}>
                Se você está estruturando uma operação digital para 2026, <span style={{ color: 'var(--spark)' }}>vamos conversar.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-lg" style={{ color: 'rgba(246,244,237,0.78)' }}>
                Não é diagnóstico gratuito nem proposta automática. É uma conversa para entender seu cenário — e, se não fizer sentido, indicar caminhos. Em qualquer hipótese, você sai com clareza.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="flex flex-wrap gap-3 mt-10">
                <a href="#contato" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-display font-medium text-lg" style={{ background: 'var(--spark)', color: 'var(--ink)' }}>
                  Agendar uma conversa →
                </a>
                <button onClick={downloadConvite} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-display font-medium text-lg" style={{ border: '1px solid rgba(246,244,237,0.3)', color: 'var(--paper)' }}>
                  <Download className="w-4 h-4" /> Baixar o PDF
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* FONTES */}
      <Section band="band" id="fontes">
        <SectionTitle eyebrow="FONTES & METODOLOGIA" title="Base normativa e estatística." />
        <ul className="grid md:grid-cols-2 gap-x-10 gap-y-3 font-mono-tag text-sm">
          {['Res. TSE 23.610/2019', 'Res. TSE 23.755/2026', 'Res. TSE 23.760/2026', 'Lei 9.504/1997', 'LGPD (Lei 13.709/2018)', 'TIC Domicílios 2024 (CGI.br)', 'Digital 2024 (We Are Social/Meltwater)'].map((f) => (
            <li key={f} className="py-3" style={{ borderTop: '1px solid var(--ink-hair)', color: 'var(--ink-body)' }}>{f}</li>
          ))}
        </ul>
      </Section>

      <Footer />
    </div>
  )
}

export function GuiaEditorial() {
  return (
    <MotionConfig reducedMotion="user">
      <EditorialGate>
        <GuiaContent />
      </EditorialGate>
    </MotionConfig>
  )
}
