import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2D1B8E',
          borderRadius: 6,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="17" stroke="white" strokeWidth="5" fill="none" />
          <rect
            x="13" y="13" width="14" height="14"
            rx="3" ry="3"
            fill="white"
            transform="rotate(45 20 20)"
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}
