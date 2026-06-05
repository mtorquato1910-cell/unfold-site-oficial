import type { CSSProperties } from 'react'

/**
 * Ícone da marca Unfold (anel mint com losango). Usado como logotipo no header/
 * footer (cor cheia) e como elemento decorativo nas seções (opacidade controlada
 * pelo call site — 30% no corpo do site). A imagem vive em /guia/unfold-icone.png.
 */
export function Orb({
  className = '',
  style,
  'aria-hidden': ariaHidden = true,
}: {
  className?: string
  style?: CSSProperties
  'aria-hidden'?: boolean
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/guia/unfold-icone.png"
      alt=""
      aria-hidden={ariaHidden}
      draggable={false}
      className={className}
      style={{ objectFit: 'contain', ...style }}
    />
  )
}
