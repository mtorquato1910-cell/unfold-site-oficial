const HIGHLIGHTED = new Set(['AL', 'BA', 'MG', 'SC', 'SP', 'MT', 'MS', 'GO', 'PE', 'PR'])

const STATES = [
  // North
  { id: 'RR', d: 'M 108 5 L 175 5 L 178 78 L 118 82 Z' },
  { id: 'AP', d: 'M 280 12 L 358 15 L 355 98 L 278 95 Z' },
  { id: 'AM', d: 'M 12 55 L 195 50 L 215 170 L 190 215 L 95 232 L 35 215 L 10 148 Z' },
  { id: 'PA', d: 'M 195 50 L 358 35 L 385 85 L 380 155 L 340 185 L 285 210 L 220 210 L 215 170 Z' },
  { id: 'AC', d: 'M 12 215 L 128 205 L 115 298 L 12 290 Z' },
  { id: 'RO', d: 'M 115 215 L 210 210 L 218 298 L 112 300 Z' },
  { id: 'TO', d: 'M 285 178 L 340 180 L 348 278 L 292 285 L 268 268 Z' },
  // Northeast
  { id: 'MA', d: 'M 310 100 L 380 95 L 388 165 L 340 185 L 295 175 L 298 135 Z' },
  { id: 'PI', d: 'M 338 162 L 388 162 L 392 240 L 352 248 L 328 225 L 335 185 Z' },
  { id: 'CE', d: 'M 388 120 L 435 125 L 432 185 L 392 188 L 388 162 Z' },
  { id: 'RN', d: 'M 432 128 L 460 133 L 458 178 L 432 178 Z' },
  { id: 'PB', d: 'M 410 178 L 456 175 L 454 205 L 412 207 Z' },
  { id: 'PE', d: 'M 362 200 L 456 202 L 455 228 L 365 230 L 350 215 Z' },
  { id: 'AL', d: 'M 408 228 L 452 225 L 450 252 L 410 250 Z' },
  { id: 'SE', d: 'M 400 250 L 445 248 L 443 268 L 400 268 Z' },
  { id: 'BA', d: 'M 335 195 L 460 205 L 465 315 L 405 338 L 335 338 L 302 305 L 298 255 L 320 230 Z' },
  // Central-West
  { id: 'MT', d: 'M 118 225 L 280 215 L 295 175 L 295 260 L 275 338 L 205 342 L 115 318 Z' },
  { id: 'GO', d: 'M 285 255 L 345 260 L 350 340 L 310 355 L 278 342 L 270 300 Z' },
  { id: 'DF', d: 'M 306 294 L 322 290 L 323 308 L 306 310 Z' },
  { id: 'MS', d: 'M 200 340 L 278 342 L 282 418 L 230 430 L 185 410 L 185 358 Z' },
  // Southeast
  { id: 'MG', d: 'M 295 285 L 425 280 L 430 370 L 375 392 L 295 388 L 282 358 L 285 320 Z' },
  { id: 'ES', d: 'M 418 278 L 452 285 L 448 355 L 418 352 Z' },
  { id: 'RJ', d: 'M 372 380 L 452 358 L 458 402 L 388 408 Z' },
  { id: 'SP', d: 'M 248 382 L 378 380 L 375 432 L 268 438 L 235 420 Z' },
  // South
  { id: 'PR', d: 'M 248 432 L 370 430 L 362 475 L 250 478 Z' },
  { id: 'SC', d: 'M 260 478 L 362 472 L 350 515 L 258 518 Z' },
  { id: 'RS', d: 'M 215 518 L 354 512 L 340 555 L 215 555 Z' },
]

export function BrazilMap({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 565"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Mapa do Brasil com estados de atuação da Unfold Growth"
    >
      <defs>
        <filter id="state-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {STATES.map((s) => {
        const active = HIGHLIGHTED.has(s.id)
        return (
          <path
            key={s.id}
            d={s.d}
            fill={active ? '#6DF9C6' : 'rgba(255,255,255,0.04)'}
            stroke={active ? '#6DF9C6' : 'rgba(255,255,255,0.12)'}
            strokeWidth={active ? 0.5 : 0.8}
            opacity={active ? 0.9 : 1}
            filter={active ? 'url(#state-glow)' : undefined}
          />
        )
      })}
    </svg>
  )
}
