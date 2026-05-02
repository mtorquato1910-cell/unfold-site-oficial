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
  investimento_atual: z.string(),
  ticket_medio: z.string(),
  ciclo_vendas: z.string(),
  taxa_conversao_lead: z.string().optional(),
  taxa_conversao_opo: z.string().optional(),
  canais: z.array(z.string()),
  objetivo_receita: z.string().optional(),
  vertical: z.string().optional(),
})

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

    // Salvar lead com origem=calculadora
    try {
      const payloadCMS = await getPayload({ config: configPromise })
      await payloadCMS.create({
        collection: 'leads',
        data: {
          nome: d.nome,
          email: d.email,
          empresa: d.empresa,
          origem: 'calculadora',
          rd_sync_status: 'pending',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        },
      })
    } catch {
      // DB indisponível
    }

    return NextResponse.json({ ok: true, resultado, mode: aiResponse.mode })
  } catch (err) {
    console.error('[calculadora]', err)
    return NextResponse.json({ error: 'Erro interno ao calcular projeção' }, { status: 500 })
  }
}
