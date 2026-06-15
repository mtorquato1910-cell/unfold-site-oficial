import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Nodes customizados do editor rico do painel.
 *
 *  - Figure: imagem COM legenda editável → `<figure><img><figcaption>…</figcaption></figure>`
 *  - YoutubeEmbed: vídeo do YouTube como placeholder → `<div data-youtube="ID"></div>`
 *    (vira player facade no site, em RichContent).
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figure: {
      setFigure: (attrs: { src: string; alt?: string; caption?: string }) => ReturnType
    }
    youtubeEmbed: {
      setYoutube: (attrs: { videoId: string }) => ReturnType
    }
  }
}

export const Figure = Node.create({
  name: 'figure',
  group: 'block',
  content: 'inline*',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        contentElement: 'figcaption',
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector('img')
          if (!img) return false
          return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      {},
      ['img', mergeAttributes({ src: HTMLAttributes.src, alt: HTMLAttributes.alt })],
      ['figcaption', 0],
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const figure = document.createElement('figure')
      figure.className = 'tt-figure'

      const img = document.createElement('img')
      img.src = node.attrs.src || ''
      img.alt = node.attrs.alt || ''
      img.contentEditable = 'false'
      img.draggable = false

      const caption = document.createElement('figcaption')
      caption.setAttribute('data-placeholder', 'Escreva uma legenda (opcional)…')

      figure.append(img, caption)
      return { dom: figure, contentDOM: caption }
    }
  },

  addCommands() {
    return {
      setFigure:
        (attrs) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: { src: attrs.src, alt: attrs.alt || '' },
              content: attrs.caption ? [{ type: 'text', text: attrs.caption }] : [],
            })
            .run(),
    }
  },
})

export const YoutubeEmbed = Node.create({
  name: 'youtubeEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return { videoId: { default: null } }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-youtube]',
        getAttrs: (el) => {
          const id = (el as HTMLElement).getAttribute('data-youtube')
          return id ? { videoId: id } : false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-youtube': HTMLAttributes.videoId }]
  },

  addNodeView() {
    return ({ node }) => {
      const wrap = document.createElement('div')
      wrap.className = 'tt-youtube'
      wrap.contentEditable = 'false'
      const id = node.attrs.videoId
      const img = document.createElement('img')
      img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      img.alt = 'Vídeo do YouTube'
      const badge = document.createElement('span')
      badge.className = 'tt-youtube-badge'
      badge.textContent = '▶ Vídeo do YouTube'
      wrap.append(img, badge)
      return { dom: wrap }
    }
  },

  addCommands() {
    return {
      setYoutube:
        (attrs) =>
        ({ chain }) =>
          chain().insertContent({ type: this.name, attrs: { videoId: attrs.videoId } }).run(),
    }
  },
})
