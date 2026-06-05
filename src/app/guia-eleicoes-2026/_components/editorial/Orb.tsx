import type { CSSProperties } from 'react'

/**
 * "Orb" da marca Unfold — recriado em CSS (radial-gradient) porque a imagem
 * original do esboço Lovable só existe na CDN do Lovable (não veio no export).
 * Uma esfera mint com brilho, usada como elemento decorativo do hero/spreads e
 * como ícone do logotipo no header/footer.
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
    <div
      aria-hidden={ariaHidden}
      className={className}
      style={{
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 32% 28%, #d6ffee 0%, var(--spark) 18%, var(--mint) 42%, var(--mint-deep) 70%, #0a5c44 100%)',
        boxShadow: 'inset -8px -10px 28px rgba(0,30,41,0.35), 0 18px 60px rgba(30,157,116,0.25)',
        aspectRatio: '1 / 1',
        ...style,
      }}
    />
  )
}
