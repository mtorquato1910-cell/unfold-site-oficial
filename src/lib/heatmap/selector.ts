/**
 * Geração de um seletor CSS ESTÁVEL para reancorar pontos do mapa de calor ao
 * DOM renderizado (Parte 1 do briefing).
 *
 * Prioridade: [data-heatmap-id] → id → [data-testid] → caminho estrutural
 * `tag:nth-of-type(n)` limitado a 5 níveis.
 *
 * NUNCA usa classes utilitárias (Tailwind) — elas mudam a cada build e
 * invalidariam o histórico. IDs "auto" do Payload/React (com dígitos aleatórios)
 * também são descartados.
 */

const MAX_DEPTH = 5

/** IDs claramente gerados (radix/react/uuid-like) não são estáveis entre builds. */
function isStableId(id: string): boolean {
  if (!id) return false
  if (id.length > 40) return false
  // Descarta ids tipo "radix-:r3:", ":R2m:", "headlessui-…-1", ou puramente numéricos.
  if (/[:]/.test(id)) return false
  if (/^\d+$/.test(id)) return false
  if (/(^|[-_])(radix|headlessui|react|mui|floating)/i.test(id)) return false
  return true
}

/** CSS.escape com fallback para ambientes sem suporte. */
function esc(value: string): string {
  try {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value)
  } catch {
    /* fallback */
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)
}

/** Índice `nth-of-type` (1-based) do elemento entre irmãos da mesma tag. */
function nthOfType(el: Element): number {
  let i = 1
  let sib = el.previousElementSibling
  while (sib) {
    if (sib.tagName === el.tagName) i++
    sib = sib.previousElementSibling
  }
  return i
}

/**
 * Retorna um seletor estável para `el`. String vazia se não for possível
 * (ex.: elemento solto sem parentNode).
 */
export function stableSelector(el: Element | null): string {
  if (!el || !el.tagName) return ''

  const parts: string[] = []
  let node: Element | null = el
  let depth = 0

  while (node && node.nodeType === 1 && depth < MAX_DEPTH) {
    // Âncora forte: para assim que houver um id/atributo único e retornamos cedo.
    const hmId = node.getAttribute?.('data-heatmap-id')
    if (hmId) {
      parts.unshift(`[data-heatmap-id="${esc(hmId)}"]`)
      return parts.join(' > ')
    }

    const id = node.getAttribute?.('id') || ''
    if (isStableId(id)) {
      parts.unshift(`#${esc(id)}`)
      return parts.join(' > ')
    }

    const testId = node.getAttribute?.('data-testid')
    if (testId) {
      parts.unshift(`[data-testid="${esc(testId)}"]`)
      return parts.join(' > ')
    }

    const tag = node.tagName.toLowerCase()
    if (tag === 'html' || tag === 'body') {
      parts.unshift(tag)
      break
    }

    parts.unshift(`${tag}:nth-of-type(${nthOfType(node)})`)
    node = node.parentElement
    depth++
  }

  return parts.join(' > ')
}
