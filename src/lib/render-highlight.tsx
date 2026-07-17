import React from 'react'

/**
 * Renderiza um texto com suporte aos marcadores de destaque usados no painel:
 *   {{primary}}trecho{{/primary}}     → <span className="text-primary">
 *   {{secondary}}trecho{{/secondary}} → <span className="text-secondary">
 *
 * Mantém o padrão já adotado no HomeSettings/HeroClient, permitindo que o admin
 * mova o trecho colorido dos títulos sem mexer em código. Trechos sem marcador
 * são renderizados como texto puro.
 */
export function renderHighlight(text: string): React.ReactNode {
  if (!text) return null
  const parts: React.ReactNode[] = []
  const regex = /\{\{(primary|secondary)\}\}([\s\S]+?)\{\{\/\1\}\}/g
  let last = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const cls = match[1] === 'secondary' ? 'text-secondary' : 'text-primary'
    parts.push(
      <span key={i++} className={cls}>
        {match[2]}
      </span>,
    )
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length > 0 ? parts : text
}
