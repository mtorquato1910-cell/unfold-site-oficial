/**
 * Google Tag Manager — container loader.
 *
 * Renderiza dois pedaços:
 *  - <Script>: snippet do head (carrega gtm.js e inicializa dataLayer)
 *  - <GTMNoScript />: <iframe> de fallback que entra logo após a abertura do <body>
 *
 * O ID é controlado pela env NEXT_PUBLIC_GTM_ID (com fallback hardcoded para o
 * container atual da Unfold), portanto basta configurar no Vercel para trocar.
 */

import Script from 'next/script'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-M43H2LKF'

export default function GTMScript() {
  if (!GTM_ID) return null

  return (
    <Script
      id="gtm-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `,
      }}
    />
  )
}

export function GTMNoScript() {
  if (!GTM_ID) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
