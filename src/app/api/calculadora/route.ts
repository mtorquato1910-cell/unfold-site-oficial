import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { callAI } from '@/lib/ai/adapter'
import { z } from 'zod'

// In-memory rate limit: max 5 requests per IP per hour
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

const schema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  empresa: z.string().min(2),
  cargo: z.string().optional(),
  telefone: z.string().optional(),
  investimento_atual: z.string(),
  ticket_medio: z.string(),
  ciclo_vendas: z.string(),
  taxa_conversao_lead: z.string().optional(),
  taxa_conversao_opo: z.string().optional(),
  canais: z.array(z.string()),
  objetivo_receita: z.string().optional(),
  vertical: z.string().optional(),
  // LGPD (S15 AC15)
  consent: z.boolean().refine((v) => v === true, {
    message: 'Consentimento obrigatório.',
  }),
})

function calcLeadScore(d: { investimento_atual: string; ticket_medio: string; cargo?: string }): number {
  let score = 30
  const inv = parseFloat(d.investimento_atual.replace(/\D/g, '')) || 0
  if (inv >= 50000) score += 30
  else if (inv >= 10000) score += 20
  else if (inv >= 3000) score += 10
  const ticket = parseFloat(d.ticket_medio.replace(/\D/g, '')) || 0
  if (ticket >= 50000) score += 25
  else if (ticket >= 10000) score += 15
  else if (ticket >= 3000) score += 8
  if (d.cargo) {
    const c = d.cargo.toLowerCase()
    if (c.includes('ceo') || c.includes('founder') || c.includes('socio') || c.includes('sócio')) score += 15
    else if (c.includes('diretor') || c.includes('cmo') || c.includes('cgo') || c.includes('head')) score += 10
  }
  return Math.min(100, score)
}

const SYSTEM_PROMPT = `Você é um especialista em geração de demanda B2B e tráfego pago para empresas com vendas complexas.
Sua função é analisar os dados fornecidos e gerar uma projeção técnica e realista de retorno do investimento.
Responda SEMPRE em JSON válido com os campos: projecao_leads, projecao_oportunidades, projecao_clientes, ticket_medio_sugerido, receita_projetada, investimento_recomendado, roi_estimado, principais_alavancas (array de strings), proximos_passos.
Seja direto, técnico e honesto. Não prometa resultados impossíveis.`

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Limite de requisições atingido. Tente novamente em 1 hora.' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const d = parsed.data
    const userPrompt = `
Analise a operação comercial abaixo e gere uma projeção de tráfego pago:

- Investimento mensal atual em tráfego: R$ ${d.investimento_atual}
- Ticket médio: R$ ${d.ticket_medio}
- Ciclo de vendas: ${d.ciclo_vendas} dias
- Taxa de conversão lead→oportunidade: ${d.taxa_conversao_lead || 'não informada'}%
- Taxa de conversão oportunidade→cliente: ${d.taxa_conversao_opo || 'não informada'}%
- Canais utilizados: ${d.canais.join(', ')}
- Meta de receita anual: ${d.objetivo_receita ? 'R$ ' + d.objetivo_receita : 'não informada'}
- Vertical de mercado: ${d.vertical || 'não informado'}

Gere uma projeção mensal realista e recomendações estratégicas.
`

    // Buscar prompt customizado do admin (opcional)
    let systemPrompt = SYSTEM_PROMPT
    try {
      const payloadCMS = await getPayload({ config: configPromise })
      const { docs } = await payloadCMS.find({
        collection: 'ai-prompts',
        where: { tipo: { equals: 'calculadora' }, ativo: { equals: true } },
        limit: 1,
      })
      if (docs[0]) {
        systemPrompt = docs[0].system_prompt as string
      }
    } catch {
      // DB indisponível — usa prompt hardcoded
    }

    const aiResponse = await callAI({
      systemPrompt,
      userPrompt,
      model: 'anthropic/claude-sonnet-4-5',
      temperature: 0.7,
      maxTokens: 1500,
    })

    // Parsear JSON da resposta
    let resultado: Record<string, unknown>
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/)
      resultado = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: aiResponse.content }
    } catch {
      resultado = { raw: aiResponse.content }
    }

    // ── Persistência: dedup com Leads + CalculadoraResults ────────
    const ipAddr = req.headers.get('x-forwarded-for') || ip
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const score = calcLeadScore(d)
    let leadId: string | null = null

    try {
      const payloadCMS = await getPayload({ config: configPromise })

      // Upsert em Leads por email (S15 AC17)
      const existingLead = await payloadCMS.find({
        collection: 'leads',
        where: { email: { equals: d.email } },
        limit: 1,
      })

      if (existingLead.docs[0]) {
        const lead = existingLead.docs[0]
        leadId = String(lead.id)
        await payloadCMS.update({
          collection: 'leads',
          id: lead.id,
          data: {
            nome: d.nome,
            empresa: d.empresa,
            cargo: d.cargo,
            telefone: d.telefone,
          } as any,
        })
      } else {
        const newLead = await payloadCMS.create({
          collection: 'leads',
          data: {
            nome: d.nome,
            email: d.email,
            empresa: d.empresa,
            cargo: d.cargo,
            telefone: d.telefone,
            origem: 'calculadora',
            rd_sync_status: 'pending',
            ip_address: ipAddr,
          } as any,
        })
        leadId = String(newLead.id)
      }

      // Cria CalculadoraResults vinculado
      const retentionDate = new Date()
      retentionDate.setMonth(retentionDate.getMonth() + 24)

      await payloadCMS.create({
        collection: 'calculadora-results',
        data: {
          nome: d.nome,
          email: d.email,
          empresa: d.empresa,
          cargo: d.cargo,
          telefone: d.telefone,
          lead: leadId,
          inputs: {
            investimento_atual: d.investimento_atual,
            ticket_medio: d.ticket_medio,
            ciclo_vendas: d.ciclo_vendas,
            taxa_conversao_lead: d.taxa_conversao_lead,
            taxa_conversao_opo: d.taxa_conversao_opo,
            canais: d.canais,
            objetivo_receita: d.objetivo_receita,
            vertical: d.vertical,
          },
          output: resultado,
          score,
          emailStatus: 'pending',
          consent: {
            given: true,
            timestamp: new Date().toISOString(),
            ip: ipAddr,
            userAgent,
            policyVersion: 'v1.0',
          },
          retentionUntil: retentionDate.toISOString(),
        } as any,
      })
    } catch (err) {
      console.error('[calculadora] persistência falhou:', err)
    }

    return NextResponse.json({ ok: true, resultado, mode: aiResponse.mode, leadId, score })
  } catch (err) {
    console.error('[calculadora]', err)
    return NextResponse.json({ error: 'Erro interno ao calcular projeção' }, { status: 500 })
  }
}
