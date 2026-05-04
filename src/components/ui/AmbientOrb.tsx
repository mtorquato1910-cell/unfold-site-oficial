import type { CSSProperties } from 'react'

interface AmbientOrbProps {
  color?: 'mint' | 'blue' | 'purple'
  size?: number
  opacity?: number
  className?: string
  duration?: number
  style?: CSSProperties
}

const COLORS = {
  mint: '#6DF9C6',
  blue: '#93BAFB',
  purple: '#6b59d0',
}

export function AmbientOrb({
  color = 'mint',
  size = 700,
  opacity = 0.035,
  className = '',
  duration = 13,
  style,
}: AmbientOrbProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${COLORS[color]} 0%, transparent 68%)`,
        opacity,
        animation: `orb-float ${duration}s ease-in-out infinite alternate`,
        borderRadius: '50%',
        ...style,
      }}
    />
  )
}
