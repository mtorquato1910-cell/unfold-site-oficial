/**
 * Geração de PDF do diagnóstico.
 *
 * VERSÃO ATUAL (Sprint 4): rota retorna HTML "print-ready". O usuário usa Ctrl+P para salvar como PDF.
 * Vercel-safe, sem deps novas.
 *
 * VERSÃO FUTURA (Sprint 6): trocar por geração binária com `satori` + `@resvg/resvg-js`,
 * cachear o blob em Vercel Blob com key `${hash}-${updatedAt}` e servir `Content-Type: application/pdf`.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import {
  FRASE_FAIXA_CONSOLIDADA,
  FRASES_EIXOS,
  LABEL_EIXO,
  LABEL_FAIXA,
  LABEL_FAIXA_FIT,
  TEXTOS_CAMINHOS,
  textoPadrao,
} from '@/lib/scoring/textos'
import { trackEventServer } from '@/lib/analytics/diagnostico-events'
import type {
  CodigoCaminho,
  CodigoInsight,
  Eixo,
  FaixaFit,
  FaixaMaturidade,
} from '@/lib/scoring/types'

interface ResultDocPDF {
  url_resultado_hash?: string
  lead_email?: string
  score_diagnosticar?: number | null
  score_estruturar?: number | null
  score_operar?: number | null
  score_evoluir?: number | null
  score_gestao?: number | null
  score_total?: number | null
  faixa_consolidada?: FaixaMaturidade | null
  score_fit?: number | null
  faixa_fit?: FaixaFit | null
  padroes_exibidos?: unknown
  caminhos_exibidos?: unknown
}

function readArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[]
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }
  return []
}

function faixaFromScore(s: number): FaixaMaturidade {
  if (s <= 25) return 'critica'
  if (s <= 50) return 'em-formacao'
  if (s <= 75) return 'estruturada'
  return 'madura'
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ hash: string }> }) {
  const { hash } = await ctx.params

  let doc: ResultDocPDF | null = null
  let nome = 'visitante'
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'diagnostico-results',
      where: { url_resultado_hash: { equals: hash } },
      limit: 1,
    })
    doc = (docs[0] as unknown as ResultDocPDF) ?? null
    if (doc?.lead_email) {
      const r = await payload.find({
        collection: 'leads',
        where: { email: { equals: doc.lead_email } },
        limit: 1,
      })
      nome = (r.docs[0]?.nome as string) || nome
    }
  } catch {
    /* fallback abaixo */
  }

  if (!doc) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const primeiroNome = nome.split(' ')[0] || nome
  const scores: Record<Eixo, number> = {
    diagnosticar: doc.score_diagnosticar ?? 0,
    estruturar: doc.score_estruturar ?? 0,
    operar: doc.score_operar ?? 0,
    evoluir: doc.score_evoluir ?? 0,
    gestao: doc.score_gestao ?? 0,
  }
  const consolidado = doc.score_total ?? 0
  const faixaC = (doc.faixa_consolidada ?? 'critica') as FaixaMaturidade
  const faixaFit = (doc.faixa_fit ?? 'desfit') as FaixaFit
  const insights = readArray<CodigoInsight>(doc.padroes_exibidos)
  const caminhos = readArray<CodigoCaminho>(doc.caminhos_exibidos)

  const html = renderPrint({
    primeiroNome,
    scores,
    consolidado,
    faixaC,
    faixaFit,
    score_fit: doc.score_fit ?? 0,
    insights,
    caminhos,
  })

  // Evento spec §10.3: PDF baixado.
  void trackEventServer({
    event_name: 'pdf_baixado',
    result_hash: hash,
    lead_email: doc.lead_email,
  })

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Encoraja browser a abrir em modo de visualização (pronto para Ctrl+P).
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

function renderPrint(p: {
  primeiroNome: string
  scores: Record<Eixo, number>
  consolidado: number
  faixaC: FaixaMaturidade
  faixaFit: FaixaFit
  score_fit: number
  insights: CodigoInsight[]
  caminhos: CodigoCaminho[]
}): string {
  const eixos: Eixo[] = ['diagnosticar', 'estruturar', 'operar', 'evoluir', 'gestao']
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Diagnóstico de Growth — ${esc(p.primeiroNome)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; color: #001E29; line-height: 1.55; margin: 0; padding: 24px; background:#fff; }
  .header { border-bottom: 2px solid #001E29; padding-bottom: 12px; margin-bottom: 24px; }
  .header .brand { font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: #00808a; text-transform: uppercase; }
  .header h1 { margin: 8px 0 0; font-size: 24px; }
  .section { margin-bottom: 28px; page-break-inside: avoid; }
  .score-big { font-size: 64px; font-weight: 800; line-height: 1; margin: 0; }
  .score-faixa { font-size: 16px; font-weight: 700; color: #00808a; margin: 8px 0 4px; text-transform: uppercase; letter-spacing: 0.1em; }
  .frase { color: #2a3f4a; font-size: 13px; }
  table.eixos { width: 100%; border-collapse: collapse; margin-top: 12px; }
  table.eixos th, table.eixos td { padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: left; font-size: 12px; }
  table.eixos th { background: #f0f5f7; font-weight: 600; }
  .card { border: 1px solid #ccd6db; border-radius: 8px; padding: 16px; margin-bottom: 12px; page-break-inside: avoid; }
  .card h3 { margin: 0 0 8px; font-size: 14px; }
  .card .resumo { font-weight: 600; font-size: 13px; margin: 0 0 8px; }
  .card .corpo { font-size: 12px; color: #2a3f4a; margin: 0; }
  .card .sub { font-family: monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #6a8a94; margin: 0 0 4px; }
  .cta { background: #001E29; color: #fff; padding: 20px; border-radius: 10px; }
  .cta h2 { margin: 0 0 8px; font-size: 18px; }
  .cta p { margin: 0; font-size: 13px; opacity: 0.85; }
  .print-note { background: #fffae5; border: 1px solid #f5d97f; padding: 10px 14px; border-radius: 6px; font-size: 12px; color: #5b4500; margin-bottom: 24px; }
  @media print { .print-note { display: none; } body { padding: 0; } }
</style>
</head>
<body>
  <p class="print-note">
    💡 Use <strong>Ctrl + P</strong> (ou Cmd + P) para salvar como PDF. Esta nota não aparece na impressão.
  </p>

  <div class="header">
    <span class="brand">Unfold Growth · Diagnóstico de Growth</span>
    <h1>Olá, ${esc(p.primeiroNome)}. Aqui está o diagnóstico da sua operação.</h1>
  </div>

  <div class="section">
    <p style="font-size:11px;color:#6a8a94;text-transform:uppercase;letter-spacing:0.18em;margin:0 0 8px;">Score consolidado</p>
    <p class="score-big">${p.consolidado}<span style="font-size:24px;color:#9aaab2;">/100</span></p>
    <p class="score-faixa">${LABEL_FAIXA[p.faixaC]}</p>
    <p class="frase">${esc(FRASE_FAIXA_CONSOLIDADA[p.faixaC])}</p>
  </div>

  <div class="section">
    <p style="font-size:11px;color:#6a8a94;text-transform:uppercase;letter-spacing:0.18em;margin:0 0 8px;">Sua maturidade por eixo</p>
    <table class="eixos">
      <thead><tr><th>Eixo</th><th>Score</th><th>Faixa</th><th>Leitura</th></tr></thead>
      <tbody>
        ${eixos
          .map((e) => {
            const s = p.scores[e]
            const fx = faixaFromScore(s)
            return `<tr><td><strong>${LABEL_EIXO[e]}</strong></td><td>${s}</td><td>${LABEL_FAIXA[fx]}</td><td>${esc(FRASES_EIXOS[e][fx])}</td></tr>`
          })
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <p style="font-size:11px;color:#6a8a94;text-transform:uppercase;letter-spacing:0.18em;margin:0 0 8px;">O que mais aparece</p>
    ${p.insights
      .slice(0, 3)
      .map((codigo, i) => {
        const t = textoPadrao(codigo)
        return `<div class="card">
          <p class="sub">Insight ${i + 1}</p>
          <h3>${esc(t.titulo)}</h3>
          <p class="resumo">${esc(t.resumo)}</p>
          <p class="corpo">${esc(t.corpo)}</p>
        </div>`
      })
      .join('')}
  </div>

  <div class="section">
    <p style="font-size:11px;color:#6a8a94;text-transform:uppercase;letter-spacing:0.18em;margin:0 0 8px;">Caminhos de melhoria</p>
    ${p.caminhos
      .slice(0, 3)
      .map((codigo, i) => {
        const t = TEXTOS_CAMINHOS[codigo]
        return `<div class="card">
          <p class="sub">Caminho ${i + 1}</p>
          <h3>${esc(t.titulo)}</h3>
          <p class="corpo"><strong>A alavanca:</strong> ${esc(t.alavanca)}</p>
          <p class="corpo" style="margin-top:6px;"><strong>Por que para você:</strong> ${esc(t.por_que_para_voce)}</p>
          <p class="corpo" style="margin-top:6px;color:#00808a;"><strong>Como a Unfold endereça:</strong> ${esc(t.como_unfold_endereca)}</p>
        </div>`
      })
      .join('')}
  </div>

  <div class="cta section">
    <p style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 8px;color:#6DF9C6;">${LABEL_FAIXA_FIT[p.faixaFit]} · Score Fit ${p.score_fit.toFixed(1)}</p>
    <h2>Quer aprofundar a leitura deste diagnóstico?</h2>
    <p>Entre em contato pelo email ou pelo link enviado na sua mensagem para agendar uma conversa.</p>
  </div>
</body>
</html>`
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
