/**
 * Adapter OpenRouter — usado opcionalmente para gerar textos AI-augmented dos insights.
 *
 * Decisão D1 (registrada em `memory/decisoes_diagnostico_v2.md`):
 * gateway OpenRouter, modelo `anthropic/claude-sonnet-4.5`. Sem prompt caching nativo;
 * cache fica para a Sprint 5 (event store) caso necessário.
 *
 * Modo mock: sem `OPENROUTER_API_KEY` → retorna `null`, consumer usa fallback estático.
 */

export interface OpenRouterResult {
  texto: string | null
  modelo?: string
  tokens_usados?: number
}

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4.5'

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  model?: string
  usage?: {
    total_tokens?: number
  }
}

export async function gerarInsightAI(opts: {
  systemPrompt: string
  userPrompt: string
  modelo?: string
  maxTokens?: number
}): Promise<OpenRouterResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return { texto: null }
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Recomendação OpenRouter para identificação/rate-limit:
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://unfoldgrowth.com.br',
        'X-Title': 'Unfold Growth — Diagnóstico',
      },
      body: JSON.stringify({
        model: opts.modelo || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: opts.systemPrompt },
          { role: 'user', content: opts.userPrompt },
        ],
        max_tokens: opts.maxTokens ?? 400,
        temperature: 0.4,
      }),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.error('[OpenRouter] HTTP', res.status, txt.slice(0, 200))
      return { texto: null }
    }

    const data = (await res.json()) as OpenRouterChatResponse
    const texto = data.choices?.[0]?.message?.content?.trim() || null
    return {
      texto,
      modelo: data.model,
      tokens_usados: data.usage?.total_tokens,
    }
  } catch (err) {
    console.error('[OpenRouter] erro:', err)
    return { texto: null }
  }
}

/**
 * Carrega um prompt da collection `AIPrompts` por slug.
 * Retorna `null` se não encontrar (consumer cai no prompt embutido).
 */
export async function carregarPromptDoCMS(slug: string): Promise<string | null> {
  try {
    const { getPayload } = await import('payload')
    const configPromise = await import('@payload-config')
    const payload = await getPayload({ config: configPromise.default })
    const { docs } = await payload.find({
      collection: 'ai-prompts',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    if (docs.length === 0) return null
    const doc = docs[0] as unknown as { prompt?: string; conteudo?: string; texto?: string }
    return doc.prompt || doc.conteudo || doc.texto || null
  } catch {
    return null
  }
}
