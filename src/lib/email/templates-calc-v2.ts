/**
 * Templates HTML dos e-mails da Calculadora v2 (Sprint 5 / S5.4 + S5.5).
 *
 * Todos os e-mails incluem link de unsubscribe (ADR-9 obrigatório).
 * Variantes:
 *   - share:   compartilhamento por e-mail (one-off).
 *   - d1/d3/d7/d14/d21:  fluxo de nutrição pós-Calculadora.
 *
 * O link de unsubscribe aponta para `/api/calculadora/unsubscribe?t={token}&e={email}`.
 * Recipient nunca recebe o token UUID de outro lead — cada lead tem o seu próprio.
 */

import type { InsightId } from '@/lib/calculadora/types'

const BG = '#001E29'
const CARD = '#0a2a35'
const ACCENT = '#4CAFBF'
const MUTED = '#6a8a94'
const FG = '#E7E7E7'

interface BaseProps {
  recipient_nome: string
  url_resultado: string
  unsubscribe_url: string
}

function wrapper(title: string, inner: string, props: BaseProps): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="font-family: Arial, sans-serif; background: ${BG}; color: ${FG}; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: ${CARD}; border-radius: 12px; padding: 40px; border: 1px solid #1a3a45;">
    <p style="font-family: monospace; font-size: 11px; color: ${ACCENT}; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px;">Unfold Growth · Calculadora</p>
    ${inner}
    <p style="color: ${MUTED}; font-size: 12px; margin-top: 36px; border-top: 1px solid #1a3a45; padding-top: 20px;">
      © ${new Date().getFullYear()} Unfold Growth
    </p>
    <p style="color: ${MUTED}; font-size: 11px; margin-top: 12px;">
      Não quer mais receber estes e-mails?
      <a href="${props.unsubscribe_url}" style="color: ${ACCENT};">Cancelar inscrição</a>.
    </p>
  </div>
</body>
</html>`
}

export function templateShareCalc(props: BaseProps & {
  remetente_nome: string
  empresa: string
}): string {
  const inner = `
    <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">${props.remetente_nome} compartilhou um resultado com você</h1>
    <p style="color: #9db5c0; line-height: 1.7; margin-bottom: 24px;">
      O cálculo de retorno da Calculadora de Performance da <strong style="color: ${FG};">${props.empresa}</strong> está disponível no link abaixo. O PDF completo segue em anexo.
    </p>
    <a href="${props.url_resultado}" style="display: inline-block; background: ${ACCENT}; color: ${BG}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Abrir resultado online</a>
  `
  return wrapper('Resultado da Calculadora', inner, props)
}

export function templateD1(props: BaseProps): string {
  const inner = `
    <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">${props.recipient_nome}, seu resultado ainda está disponível</h1>
    <p style="color: #9db5c0; line-height: 1.7; margin-bottom: 20px;">
      Salvamos sua Calculadora de Performance. Você pode reabrir, ajustar premissas e ver
      o impacto a qualquer momento.
    </p>
    <a href="${props.url_resultado}" style="display: inline-block; background: ${ACCENT}; color: ${BG}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Ver resultado</a>
  `
  return wrapper('Seu resultado está salvo', inner, props)
}

export function templateD3(props: BaseProps & { insight: InsightId }): string {
  const insightTexto: Record<InsightId, string> = {
    'I-A': 'Operações com sistema validado têm um teto diferente: o limite vira <em>operar o sistema com inteligência</em>, não construir do zero.',
    'I-B': 'Calibração — não tamanho — é a alavanca. Em sistemas com CRM funcional, quase sempre o gargalo está em ticket, qualificação ou estratégia de canal.',
    'I-C': 'Resultado positivo sem CRM é estatisticamente frágil. Operações que dependem disso oscilam quando o vendedor sênior sai de férias.',
    'I-D': 'Mais investimento sobre um sistema frágil acelera o problema, não resolve. Estruturar antes de aumentar verba é a leitura correta.',
  }
  const inner = `
    <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">A leitura da sua Calculadora apontou um padrão.</h1>
    <p style="color: #9db5c0; line-height: 1.7; margin-bottom: 20px;">${insightTexto[props.insight]}</p>
    <p style="color: #9db5c0; line-height: 1.7; margin-bottom: 24px;">
      Quer destrinchar isso com um especialista? O Diagnóstico de Growth aprofunda essa leitura.
    </p>
    <a href="${props.url_resultado}" style="display: inline-block; background: ${ACCENT}; color: ${BG}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reabrir minha Calculadora</a>
  `
  return wrapper('Sobre o seu resultado', inner, props)
}

export function templateD7(props: BaseProps & { diagnostico_url: string }): string {
  const inner = `
    <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">${props.recipient_nome}, o próximo passo é o Diagnóstico</h1>
    <p style="color: #9db5c0; line-height: 1.7; margin-bottom: 20px;">
      A Calculadora simula com premissas médias de mercado. O Diagnóstico mede <strong>sua</strong>
      operação contra esses benchmarks — 12 perguntas, 5 minutos, gratuito.
    </p>
    <a href="${props.diagnostico_url}" style="display: inline-block; background: ${ACCENT}; color: ${BG}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Fazer o Diagnóstico</a>
  `
  return wrapper('Faça o Diagnóstico de Growth', inner, props)
}

export function templateD14(props: BaseProps): string {
  const inner = `
    <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">B2B previsível é sistema, não execução</h1>
    <p style="color: #9db5c0; line-height: 1.7; margin-bottom: 20px;">
      Operações que escalam sem virar caos têm três coisas em comum: integração, dados rastreáveis e ciclo de aprendizado. A Unfold trabalha exatamente nessas três.
    </p>
    <a href="${props.url_resultado}" style="display: inline-block; background: ${ACCENT}; color: ${BG}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Voltar à Calculadora</a>
  `
  return wrapper('B2B previsível é sistema', inner, props)
}

export function templateD21(props: BaseProps & { diagnostico_url: string }): string {
  const inner = `
    <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">Última oportunidade</h1>
    <p style="color: #9db5c0; line-height: 1.7; margin-bottom: 20px;">
      Este é o último e-mail da sequência. Se o tema continua relevante,
      o Diagnóstico de Growth é o caminho mais direto para conversar com a Unfold.
    </p>
    <a href="${props.diagnostico_url}" style="display: inline-block; background: ${ACCENT}; color: ${BG}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Quero fazer o Diagnóstico</a>
  `
  return wrapper('Última oportunidade', inner, props)
}
