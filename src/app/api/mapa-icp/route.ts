/**
 * POST /api/mapa-icp — Radar de Comitê de Compra.
 * Fluxo: rate-limit → zod → validação de contato → scoring determinístico →
 * IA (síntese, com fallback) → persistência (lead + mapa-icp-results) → retorna token.
 * RD Station + e-mail/PDF: ver Fase 4 (sync fire-and-forget adicionado lá).
 */
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { randomBytes } from 'crypto'
import { mapaIcpSubmissaoSchema } from '@/lib/mapa-icp/schema'
import { scoreFit } from '@/lib/mapa-icp/scoring'
import { generateMapa } from '@/lib/mapa-icp/generate'
import { enforceContato } from '@/lib/validation/enforce-contato'
import { syncMapaIcpToRD } from '@/lib/crm/rd-mapa-icp'
import { sendEmail } from '@/lib/email/adapter'
import type { MapaIcpAnswers } from '@/lib/mapa-icp/types'

/** E-mail simples HTML com link do resultado + menção ao PDF (identidade navy/mint). */
function templateMapaIcpEmail(nome: string, url: string, pdfUrl: string): string {
  const primeiroNome = (nome || '').split(' ')[0] || 'Olá'
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Seu mapa de ICP & comitê</title></head>
<body style="font-family: Arial, sans-serif; background: #001E29; color: #E7E7E7; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #0a2a35; border-radius: 12px; padding: 40px; border: 1px solid #1a3a45;">
    <p style="font-family: monospace; font-size: 11px; color: #16a34a; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px;">Radar de Comitê de Compra</p>
    <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #E7E7E7;">${primeiroNome}, seu mapa de ICP & comitê está pronto.</h1>
    <p style="color: #9db5c0; line-height: 1.7; margin-bottom: 24px;">
      Mapeamos quem realmente vale o seu pipeline e como falar com cada decisor do comitê de compra. Acesse o resultado completo a qualquer momento:
    </p>
    <a href="${url}" style="display: inline-block; background: #16a34a; color: #001E29; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Ver meu mapa
    </a>
    <p style="color: #9db5c0; line-height: 1.7; margin-top: 24px;">
      Você também pode <a href="${pdfUrl}" style="color: #16a34a;">baixar a versão em PDF</a> para compartilhar com o time.
    </p>
    <p style="color: #6a8a94; font-size: 13px; margin-top: 40px; border-top: 1px solid #1a3a45; padding-top: 20px;">
      © ${new Date().getFullYear()} Unfold Growth
    </p>
  </div>
</body>
</html>`
}

const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const e = rateMap.get(ip)
  if (!e || now > e.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (e.count >= RATE_LIMIT) return false
  e.count++
  return true
}

function resultUrl(req: NextRequest, token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    || `${req.nextUrl.protocol}//${req.headers.get('host')}`
  return `${base}/ferramentas/mapa-icp/r/${token}`
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limit', message: 'Limite atingido. Tente em 1 hora.' }, { status: 429 })
  }

  let raw: unknown
  try { raw = await req.json() } catch { return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 }) }

  const parsed = mapaIcpSubmissaoSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload', details: parsed.error.flatten() }, { status: 400 })
  }
  const { answers, capture, consent, utm } = parsed.data
  const a = answers as MapaIcpAnswers

  // Validação reforçada de e-mail (MX/DNS) + WhatsApp obrigatório (fail-open só p/ Evolution offline).
  const contato = await enforceContato({ email: capture.email, telefone: capture.telefone || undefined, requirePhone: true })
  if (!contato.ok) {
    return NextResponse.json({ ok: false, error: 'contato_invalido', field: contato.field, message: contato.error }, { status: 400 })
  }
  const telefoneNorm = contato.telefone

  // Scoring determinístico (interno, server-side).
  const fit = scoreFit(a)

  // Síntese por IA (com fallback determinístico).
  const { result: aiResult, source } = await generateMapa(a)

  const emailLower = capture.email.toLowerCase().trim()
  const token = randomBytes(8).toString('hex')
  const ua = req.headers.get('user-agent') || 'unknown'
  const url = resultUrl(req, token)

  let leadId: string | null = null
  let resultId: string | null = null

  try {
    const payload = await getPayload({ config: configPromise })

    // 1. Upsert lead por email
    const existingLead = await payload.find({ collection: 'leads', where: { email: { equals: emailLower } }, limit: 1 })
    if (existingLead.docs[0]) {
      leadId = String(existingLead.docs[0].id)
      await payload.update({
        collection: 'leads', id: existingLead.docs[0].id,
        data: { nome: capture.nome, empresa: capture.empresa, ...(telefoneNorm ? { telefone: telefoneNorm } : {}) } as never,
      })
    } else {
      const novo = await payload.create({
        collection: 'leads',
        data: { nome: capture.nome, email: emailLower, empresa: capture.empresa, telefone: telefoneNorm, origem: 'mapa-icp', rd_sync_status: 'pending', ip_address: ip } as never,
      })
      leadId = String(novo.id)
    }

    // 2. Cria resultado
    const retention = new Date(); retention.setMonth(retention.getMonth() + 24)
    const created = await payload.create({
      collection: 'mapa-icp-results',
      data: {
        lead_email: emailLower, nome: capture.nome, empresa: capture.empresa, cargo: capture.cargo, telefone: telefoneNorm, lead: leadId,
        vende: a.A1, transformacao: a.A2, ticket_range: a.A3, ciclo: a.A4, modelo: a.A5,
        melhores_clientes: a.B1, motivos_fechamento: a.B2, cliente_ruim: a.B3,
        n_decisores: a.C1, areas_comite: a.C2, veto_owner: a.C3, objecao_principal: a.D1, maturidade_icp: a.D2,
        ai_result: aiResult, fit_score: fit.fit_score, fit_tier: fit.fit_tier,
        url_resultado_hash: token, origem: 'mapa-icp', rd_sync_status: 'pending',
        consent: { given: true, timestamp: new Date().toISOString(), ip, userAgent: ua, policyVersion: consent.policyVersion },
        retentionUntil: retention.toISOString(),
        utm: utm || {},
      } as never,
    })
    resultId = String(created.id)
  } catch (err) {
    console.error('[mapa-icp] persistência falhou:', err)
    return NextResponse.json({ ok: false, error: 'persistence_error' }, { status: 500 })
  }

  // ── RD sync (fire-and-forget, não bloqueia resposta) ───────────────────────
  void syncMapaIcpToRD({
    email: emailLower,
    nome: capture.nome,
    empresa: capture.empresa,
    cargo: capture.cargo,
    telefone: telefoneNorm,
    ticket_range: a.A3,
    ciclo: a.A4,
    modelo: a.A5,
    n_decisores: a.C1,
    areas_comite: Array.isArray(a.C2) ? a.C2 : [],
    veto_owner: a.C3,
    objecao_principal: Array.isArray(a.D1) ? a.D1 : [],
    maturidade_icp: a.D2,
    fit_score: fit.fit_score,
    fit_tier: fit.fit_tier,
    result_token: token,
    url_resultado: url,
  })
    .then(async (r) => {
      if (!resultId) return
      const status =
        r.mode === 'rd-station' && r.success
          ? 'synced'
          : r.mode === 'skipped'
            ? 'skipped'
            : !r.success
              ? 'failed'
              : null
      if (!status) return
      try {
        const payload = await getPayload({ config: configPromise })
        await payload.update({
          collection: 'mapa-icp-results',
          id: resultId,
          data: { rd_sync_status: status } as never,
        })
      } catch {}
    })
    .catch(() => {})

  // ── E-mail imediato com link do resultado + menção ao PDF (fire-and-forget) ─
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    `${req.nextUrl.protocol}//${req.headers.get('host')}`
  const pdfUrl = `${baseUrl}/api/mapa-icp/pdf?token=${token}`
  void sendEmail({
    to: emailLower,
    subject: 'Seu mapa de ICP & comitê está pronto',
    html: templateMapaIcpEmail(capture.nome, url, pdfUrl),
  })
    .then(async (r) => {
      if (r.success && resultId) {
        try {
          const payload = await getPayload({ config: configPromise })
          await payload.update({
            collection: 'mapa-icp-results',
            id: resultId,
            data: { email_enviado: true } as never,
          })
        } catch {}
      }
    })
    .catch(() => {})

  return NextResponse.json({
    ok: true,
    token,
    url,
    result: aiResult,
    fit_tier: fit.fit_tier, // usado só p/ modular CTA no client; score não é exposto
    ai_source: source,
    resultId,
  })
}
