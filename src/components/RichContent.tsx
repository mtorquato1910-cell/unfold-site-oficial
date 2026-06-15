import YouTubeEmbed from './site/YouTubeEmbed'

/**
 * Renderiza o HTML produzido pelo editor rico (já sanitizado na escrita).
 *
 * Os vídeos do YouTube ficam salvos como placeholders `<div data-youtube="ID">`.
 * Aqui dividimos o HTML nesses marcadores e trocamos cada um pelo componente
 * client <YouTubeEmbed/> (capa + clique). O restante é HTML estático seguro.
 *
 * Use `<RichContent html={...} />` para conteúdo novo (campo *_html). Posts antigos
 * em Lexical continuam com <RichTextRenderer/>.
 */

const SPLIT_RE = /(<div[^>]*data-youtube="[A-Za-z0-9_-]{6,20}"[^>]*>\s*<\/div>)/g
const ID_RE = /data-youtube="([A-Za-z0-9_-]{6,20})"/

export default function RichContent({
  html,
  className,
}: {
  html: string | null | undefined
  className?: string
}) {
  if (!html) return null
  const parts = html.split(SPLIT_RE).filter((p) => p !== '')

  return (
    <div className={className}>
      {parts.map((part, i) => {
        const isYt = part.startsWith('<div')
        const m = isYt ? part.match(ID_RE) : null
        if (m) return <YouTubeEmbed key={i} id={m[1]} />
        return <div key={i} dangerouslySetInnerHTML={{ __html: part }} />
      })}
    </div>
  )
}
