/**
 * Renderer mínimo para Payload Lexical RichText.
 * Suporta os tipos comuns: paragraph, heading, list, listitem, link, text (com format bitmask).
 */

type LexicalNode = {
  type: string
  children?: LexicalNode[]
  text?: string
  format?: number | string
  tag?: string // h1..h6
  listType?: 'bullet' | 'number' | 'check'
  fields?: Record<string, any>
  url?: string
  newTab?: boolean
  value?: any
}

const FORMAT = {
  BOLD: 1,
  ITALIC: 1 << 1,
  STRIKETHROUGH: 1 << 2,
  UNDERLINE: 1 << 3,
  CODE: 1 << 4,
  SUBSCRIPT: 1 << 5,
  SUPERSCRIPT: 1 << 6,
}

function renderText(node: LexicalNode, key: number): React.ReactNode {
  const text = node.text ?? ''
  const fmt = typeof node.format === 'number' ? node.format : 0
  let el: React.ReactNode = text

  if (fmt & FORMAT.CODE) el = <code key={`c-${key}`}>{el}</code>
  if (fmt & FORMAT.BOLD) el = <strong key={`b-${key}`}>{el}</strong>
  if (fmt & FORMAT.ITALIC) el = <em key={`i-${key}`}>{el}</em>
  if (fmt & FORMAT.UNDERLINE) el = <u key={`u-${key}`}>{el}</u>
  if (fmt & FORMAT.STRIKETHROUGH) el = <s key={`s-${key}`}>{el}</s>
  if (fmt & FORMAT.SUBSCRIPT) el = <sub key={`sub-${key}`}>{el}</sub>
  if (fmt & FORMAT.SUPERSCRIPT) el = <sup key={`sup-${key}`}>{el}</sup>

  return el
}

function renderChildren(nodes: LexicalNode[] | undefined): React.ReactNode {
  if (!nodes) return null
  return nodes.map((n, i) => renderNode(n, i))
}

function renderNode(node: LexicalNode, key: number): React.ReactNode {
  switch (node.type) {
    case 'text':
      return <span key={key}>{renderText(node, key)}</span>

    case 'paragraph':
      return <p key={key}>{renderChildren(node.children)}</p>

    case 'heading': {
      const Tag = (node.tag || 'h2') as keyof React.JSX.IntrinsicElements
      return <Tag key={key}>{renderChildren(node.children)}</Tag>
    }

    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return <Tag key={key}>{renderChildren(node.children)}</Tag>
    }

    case 'listitem':
      return <li key={key}>{renderChildren(node.children)}</li>

    case 'quote':
      return <blockquote key={key}>{renderChildren(node.children)}</blockquote>

    case 'link':
    case 'autolink': {
      const url = node.fields?.url || node.url || '#'
      const newTab = node.fields?.newTab || node.newTab
      return (
        <a key={key} href={url} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined}>
          {renderChildren(node.children)}
        </a>
      )
    }

    case 'linebreak':
      return <br key={key} />

    case 'horizontalrule':
      return <hr key={key} />

    case 'upload': {
      const upload: any = node.value
      if (upload?.url) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img key={key} src={upload.url} alt={upload.alt || ''} />
      }
      return null
    }

    default:
      // Fallback: renderiza children genéricos
      return <div key={key}>{renderChildren(node.children)}</div>
  }
}

export default function RichTextRenderer({ data }: { data: any }) {
  if (!data?.root?.children) return null
  return <>{renderChildren(data.root.children)}</>
}
