/**
 * Template do email de resultado do Diagnóstico v2.
 * Substitui `templateResultadoDiagnostico` (legado v0) em chamadas novas.
 *
 * Envia link `/diagnostico/r/{hash}` + faixa de maturidade + faixa de Fit + CTA por faixa.
 */

import { CTA_POR_FAIXA, FRASE_FAIXA_CONSOLIDADA, LABEL_FAIXA } from '@/lib/scoring/textos'
import type { FaixaFit, FaixaMaturidade } from '@/lib/scoring/types'

export interface TemplateResultadoV2Input {
  primeiroNome: string
  score_consolidado: number
  faixa_consolidada: FaixaMaturidade
  faixa_fit: FaixaFit
  url_resultado_hash: string
  pdfDisponivel?: boolean
}

export function templateResultadoDiagnosticoV2(input: TemplateResultadoV2Input): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br'
  const url = `${baseUrl}/diagnostico/r/${input.url_resultado_hash}`
  const urlPdf = `${baseUrl}/api/diagnostico/pdf/${input.url_resultado_hash}`
  const cta = CTA_POR_FAIXA[input.faixa_fit]
  const frase = FRASE_FAIXA_CONSOLIDADA[input.faixa_consolidada]
  const labelFaixa = LABEL_FAIXA[input.faixa_consolidada]
  const ano = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Seu diagnóstico de growth</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#001E29;color:#E7E7E7;padding:40px 20px;">
  <div style="max-width:600px;margin:0 auto;background:#0a2a36;border-radius:16px;padding:40px 36px;border:1px solid #1a3a45;">

    <p style="font-family:'SF Mono','Roboto Mono',monospace;font-size:11px;color:#6DF9C6;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 20px;">
      Diagnóstico de Growth
    </p>

    <h1 style="font-size:26px;font-weight:700;line-height:1.3;margin:0 0 24px;">
      ${escapeHtml(input.primeiroNome)}, seu diagnóstico está pronto.
    </h1>

    <div style="background:#001E29;border-radius:12px;padding:24px;margin:0 0 24px;">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);">Score consolidado</p>
      <p style="margin:6px 0 0;font-size:42px;font-weight:700;">${input.score_consolidado}<span style="font-size:18px;color:rgba(255,255,255,0.4);"> / 100</span></p>
      <p style="margin:6px 0 0;font-size:13px;color:#6DF9C6;text-transform:uppercase;letter-spacing:0.1em;">${labelFaixa}</p>
    </div>

    <p style="color:rgba(255,255,255,0.75);line-height:1.6;font-size:15px;margin:0 0 24px;">
      ${escapeHtml(frase)}
    </p>

    <p style="color:rgba(255,255,255,0.85);font-weight:600;line-height:1.45;font-size:16px;margin:0 0 8px;">
      ${escapeHtml(cta.headline)}
    </p>
    <p style="color:rgba(255,255,255,0.6);line-height:1.6;font-size:14px;margin:0 0 28px;">
      ${escapeHtml(cta.microcopy)}
    </p>

    <p style="margin:0 0 12px;">
      <a href="${url}"
         style="display:inline-block;background:#6DF9C6;color:#001E29;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;">
        Ver diagnóstico completo
      </a>
    </p>
    ${input.pdfDisponivel === false ? '' : `
    <p style="margin:0 0 24px;font-size:13px;">
      <a href="${urlPdf}" style="color:#93BAFB;text-decoration:underline;">Baixar versão para impressão (PDF)</a>
    </p>`}

    <hr style="border:none;border-top:1px solid #1a3a45;margin:32px 0 20px;">
    <p style="color:rgba(255,255,255,0.35);font-size:12px;line-height:1.6;margin:0;">
      Este link é único e privado. Você pode compartilhá-lo, mas nenhum dado pessoal aparece na página pública.
      <br>© ${ano} Unfold Growth · Método UGS
    </p>
  </div>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
