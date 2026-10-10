'use client'

/**
 * Campos de artigo compartilhados por Posts e Cases no painel (S10 — épico
 * seo-tecnico-2026-10): contador de caracteres, prévia no Google, editor de FAQ e
 * avisos de qualidade antes de publicar. Extraídos do PostsClient para os cases
 * publicarem "da mesma forma dos posts" sem duplicar código.
 */

/** Contador de caracteres com alerta ao passar do ideal (item 1.5). */
export function CharCount({ value, max }: { value: string; max: number }) {
  const len = (value || '').length
  const over = len > max
  return (
    <span
      className="mt-1 block text-right font-mono text-[10px]"
      style={{ color: over ? 'hsl(0 70% 72%)' : 'hsl(0 0% 91% / 0.4)' }}
    >
      {len}/{max}
      {over ? ' \u2014 acima do ideal' : ''}
    </span>
  )
}

/** Prévia de como o artigo aparece no resultado de busca do Google (estilo WordPress). */
export function SerpPreview({ title, slug, desc, section = 'blog' }: { title: string; slug: string; desc: string; section?: string }) {
  const url = `unfoldgrowth.com.br \u203a ${section} \u203a ${slug || 'seu-artigo'}`
  const t = (title || 'T\u00edtulo do artigo').slice(0, 60)
  const d = (desc || 'Resumo de busca do artigo\u2026').slice(0, 160)
  return (
    <div className="rounded-lg p-3" style={{ background: 'hsl(0 0% 100% / 0.03)', border: '1px solid hsl(0 0% 100% / 0.06)' }}>
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] mb-2" style={{ color: 'hsl(0 0% 91% / 0.35)' }}>
        Prévia no Google
      </p>
      <p className="text-[12px]" style={{ color: 'hsl(140 40% 62%)' }}>{url}</p>
      <p className="text-[15px] leading-snug" style={{ color: 'hsl(214 90% 74%)' }}>{t}</p>
      <p className="text-[12px] leading-snug mt-0.5" style={{ color: 'hsl(0 0% 91% / 0.55)' }}>{d}</p>
    </div>
  )
}

export type FaqItem = { pergunta: string; resposta: string }

/** Editor de perguntas frequentes (item 1.4): add/remover/reordenar pares Q&A. */
export function FaqEditor({ value, onChange }: { value: FaqItem[]; onChange: (v: FaqItem[]) => void }) {
  const items = value || []
  const fieldStyle = { background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' } as const
  const set = (i: number, patch: Partial<FaqItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const add = () => onChange([...items, { pergunta: '', resposta: '' }])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-[12px]" style={{ color: 'hsl(0 0% 91% / 0.4)' }}>Nenhuma pergunta ainda.</p>
      )}
      {items.map((it, i) => (
        <div key={i} className="rounded-lg p-3" style={{ background: 'hsl(0 0% 100% / 0.03)', border: '1px solid hsl(0 0% 100% / 0.06)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px]" style={{ color: 'hsl(0 0% 91% / 0.4)' }}>#{i + 1}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 text-[13px]" style={{ color: 'hsl(0 0% 91% / 0.6)' }}>↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="px-1.5 text-[13px]" style={{ color: 'hsl(0 0% 91% / 0.6)' }}>↓</button>
              <button type="button" onClick={() => remove(i)} className="px-1.5 text-[12px]" style={{ color: 'hsl(0 70% 72%)' }}>remover</button>
            </div>
          </div>
          <input className="w-full h-9 px-3 rounded-lg text-[13px] mb-2" style={fieldStyle} value={it.pergunta} onChange={(e) => set(i, { pergunta: e.target.value })} placeholder="Pergunta (como a pessoa perguntaria)" />
          <textarea rows={2} className="w-full px-3 py-2 rounded-lg text-[13px] resize-none" style={fieldStyle} value={it.resposta} onChange={(e) => set(i, { resposta: e.target.value })} placeholder="Resposta completa já nas primeiras 40 palavras" />
        </div>
      ))}
      <button type="button" onClick={add} className="text-[12px] px-3 py-1.5 rounded-lg" style={{ background: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)' }}>+ Adicionar pergunta</button>
    </div>
  )
}

/** Avisos de qualidade antes de publicar (item 1.3 — validação). */
export function validateArticle(html: string, faq: FaqItem[], kind: string = 'post'): string[] {
  const warns: string[] = []
  const h = html || ''
  const words = h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
  if (words > 800 && !/<h2[\s>]/i.test(h)) warns.push('Mais de 800 palavras e nenhum Título 2 (H2). Adicione capítulos.')
  if ((h.match(/<h1[\s>]/gi) || []).length > 0) warns.push(`Há Título 1 (H1) no corpo — o H1 é só o título do ${kind}. Use H2 em diante.`)
  const levels = [...h.matchAll(/<h([2-6])[\s>]/gi)].map((m) => Number(m[1]))
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) { warns.push('A hierarquia de títulos pula um nível (ex.: H2 → H4). Desça um nível por vez.'); break }
  }
  // Título sem texto abaixo (ex.: roteiro "Desafio/Solução" não preenchido).
  const empty = [...h.matchAll(/<h([2-6])[^>]*>((?:(?!<\/h[1-6]>)[\s\S])*)<\/h\1>\s*(?:<p>\s*(?:<br\s*\/?>)?\s*<\/p>\s*)*(?=<h[1-6][\s>]|$)/gi)]
    .map((m) => m[2].replace(/<[^>]+>/g, '').trim())
    .filter(Boolean)
  if (empty.length) warns.push(`Há título sem texto abaixo: ${empty.join(', ')}.`)
  if ([...h.matchAll(/<img\b[^>]*>/gi)].some((m) => !/\balt="[^"]+"/i.test(m[0]))) warns.push('Há imagem sem descrição (alt).')
  const f = (faq || []).filter((q) => q.pergunta?.trim() && q.resposta?.trim())
  if (f.length > 0 && f.length < 3) warns.push('A seção de FAQ tem menos de 3 perguntas — o ideal é 3 a 8.')
  if (f.length > 8) warns.push('A seção de FAQ tem mais de 8 perguntas — o ideal é 3 a 8.')
  return warns
}
