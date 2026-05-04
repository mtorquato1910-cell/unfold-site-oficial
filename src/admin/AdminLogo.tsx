export function AdminLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="unfold-admin-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6DF9C6" />
            <stop offset="60%" stopColor="#93BAFB" />
            <stop offset="100%" stopColor="#6b59d0" />
          </linearGradient>
        </defs>
        <path
          d="M20 2 C30 2 38 10 38 20 C38 30 30 38 20 38 C10 38 2 30 2 20 C2 10 10 2 20 2 Z M20 12 L12 20 L20 28 L28 20 Z"
          fill="url(#unfold-admin-grad)"
          fillRule="evenodd"
        />
      </svg>
      <span style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: '#e7e7e7',
      }}>
        UNFOLD
      </span>
      <span style={{
        fontFamily: '"IBM Plex Mono", "SF Mono", Menlo, monospace',
        fontSize: '9px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'rgba(109, 249, 198, 0.6)',
        marginLeft: '2px',
        alignSelf: 'flex-end',
        paddingBottom: '1px',
      }}>
        admin
      </span>
    </div>
  )
}

export function AdminIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="unfold-icon-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6DF9C6" />
          <stop offset="60%" stopColor="#93BAFB" />
          <stop offset="100%" stopColor="#6b59d0" />
        </linearGradient>
      </defs>
      <path
        d="M20 2 C30 2 38 10 38 20 C38 30 30 38 20 38 C10 38 2 30 2 20 C2 10 10 2 20 2 Z M20 12 L12 20 L20 28 L28 20 Z"
        fill="url(#unfold-icon-grad)"
        fillRule="evenodd"
      />
    </svg>
  )
}
