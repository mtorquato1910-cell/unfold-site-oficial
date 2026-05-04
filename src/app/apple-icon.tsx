import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#001E29',
          borderRadius: 36,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4DFFB4" />
              <stop offset="60%" stopColor="#7EB8FF" />
              <stop offset="100%" stopColor="#8B63FF" />
            </linearGradient>
          </defs>
          <path
            d="M20 2 C30 2 38 10 38 20 C38 30 30 38 20 38 C10 38 2 30 2 20 C2 10 10 2 20 2 Z M20 12 L12 20 L20 28 L28 20 Z"
            fill="url(#g)"
            fillRule="evenodd"
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}
