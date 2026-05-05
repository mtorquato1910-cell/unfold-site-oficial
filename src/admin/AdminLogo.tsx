export function AdminLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <img
        src="/logo.jpeg"
        alt="Unfold Growth"
        width={28}
        height={28}
        style={{ borderRadius: 6, objectFit: 'cover', display: 'block' }}
      />
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
    <img
      src="/logo.jpeg"
      alt="Unfold"
      width={26}
      height={26}
      style={{ borderRadius: 5, objectFit: 'cover', display: 'block' }}
    />
  )
}
