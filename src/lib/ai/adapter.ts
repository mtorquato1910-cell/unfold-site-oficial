/**
 * Adapter de IA com 3 modos:
 * - mock: resposta hardcoded (dev sem key)
 * - openrouter: produção via OpenRouter
 * - anthropic-direct: futuro, API Anthropic direto
 *
 * Controlado por AI_MODE env var (default: mock)
 */

export type AIMode = 'mock' | 'openrouter' | 'anthropic-direct'

export interface AIRequest {
  systemPrompt: string
  userPrompt: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  content: string
  mode: AIMode
  model: string
  metadados: {
    tokens_usados?: number
    search_status?: 'ok' | 'stub'
    [key: string]: unknown
  }
}

function getMode(): AIMode {
  const mode = process.env.AI_MODE as AIMode
  if (mode === 'openrouter' || mode === 'anthropic-direct') return mode
  return 'mock'
}

async function callOpenRouter(req: AIRequest): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY não configurada')

  const model = req.model || 'google/gemini-2.0-flash-001'
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br',
      'X-Title': 'Unfold Growth',
    },
    body: JSON.stringify({
      model,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 1500,
      messages: [
        { role: 'system', content: req.systemPrompt },
        { role: 'user', content: req.userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  return {
    content,
    mode: 'openrouter',
    model,
    metadados: {
      tokens_usados: data.usage?.total_tokens,
      search_status: 'stub', // Tavily não integrado ainda
    },
  }
}

function getMockResponse(userPrompt: string): AIResponse {
  // Mock estruturado para Calculadora de Tráfego
  const isCalculadora = userPrompt.includes('tráfego') || userPrompt.includes('leads') || userPrompt.includes('faturamento')

  if (isCalculadora) {
    const mockContent = JSON.stringify({
      projecao_leads: 120,
      projecao_oportunidades: 36,
      projecao_clientes: 9,
      ticket_medio_sugerido: 8500,
      receita_projetada: 76500,
      investimento_recomendado: 12000,
      roi_estimado: '6,4x',
      principais_alavancas: [
        'Qualificação mais rigorosa do ICP para reduzir ciclo de vendas',
        'Implementação de cadências de nutrição para leads frios',
        'Estruturação de playbook para reduzir dependência de top performers',
      ],
      proximos_passos: 'Com base no seu perfil, recomendamos iniciar pelo diagnóstico completo do seu processo comercial antes de escalar o tráfego.',
      nota: '[MOCK - Substituir quando OPENROUTER_API_KEY disponível]',
    })
    return { content: mockContent, mode: 'mock', model: 'mock', metadados: { search_status: 'stub' } }
  }

  return {
    content: '[MOCK] Resposta de IA não disponível. Configure AI_MODE=openrouter e OPENROUTER_API_KEY.',
    mode: 'mock',
    model: 'mock',
    metadados: { search_status: 'stub' },
  }
}

export async function callAI(req: AIRequest): Promise<AIResponse> {
  const mode = getMode()

  switch (mode) {
    case 'openrouter':
      return callOpenRouter(req)
    case 'anthropic-direct':
      // Futuro: implementar com @anthropic-ai/sdk diretamente
      throw new Error('anthropic-direct não implementado ainda. Use openrouter.')
    case 'mock':
    default:
      return getMockResponse(req.userPrompt)
  }
}
