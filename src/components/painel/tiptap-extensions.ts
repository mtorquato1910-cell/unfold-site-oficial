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
      setFigure: (attrs: {
        src: string
        alt?: string
        caption?: string
        width?: number
        height?: number
      }) => ReturnType
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
      width: { default: null },
      height: { default: null },
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
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || '',
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // width/height reservam espaço no layout e evitam salto (CLS) — item 1.8.
    const imgAttrs: Record<string, any> = { src: HTMLAttributes.src, alt: HTMLAttributes.alt }
    if (HTMLAttributes.width) imgAttrs.width = HTMLAttributes.width
    if (HTMLAttributes.height) imgAttrs.height = HTMLAttributes.height
    return ['figure', {}, ['img', mergeAttributes(imgAttrs)], ['figcaption', 0]]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      let current = node
      const figure = document.createElement('figure')
      figure.className = 'tt-figure'
      figure.style.position = 'relative'

      const img = document.createElement('img')
      img.src = node.attrs.src || ''
      if (node.attrs.width) img.setAttribute('width', String(node.attrs.width))
      if (node.attrs.height) img.setAttribute('height', String(node.attrs.height))
      img.contentEditable = 'false'
      img.draggable = false

      // Botão para editar a descrição (alt) de uma imagem já inserida, sem excluir e
      // subir de novo (pedido do Ferraz, 14/10/2026). Amarelo quando está vazia.
      const altBtn = document.createElement('button')
      altBtn.type = 'button'
      altBtn.contentEditable = 'false'
      Object.assign(altBtn.style, {
        position: 'absolute',
        top: '8px',
        left: '8px',
        maxWidth: 'calc(100% - 16px)',
        padding: '4px 10px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '12px',
        lineHeight: '1.3',
        textAlign: 'left',
        color: '#fff',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        zIndex: '2',
      })

      const paint = () => {
        const alt = (current.attrs.alt as string) || ''
        img.alt = alt
        altBtn.textContent = alt ? `✎ Descrição: ${alt}` : '⚠ Sem descrição (alt): clique para adicionar'
        altBtn.title = 'Editar a descrição da imagem (alt)'
        altBtn.style.background = alt ? 'rgba(0, 30, 41, 0.78)' : 'rgba(176, 116, 0, 0.92)'
      }
      paint()

      // mousedown sem foco: não move a seleção do editor para o botão.
      altBtn.addEventListener('mousedown', (e) => e.preventDefault())
      altBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const next = window.prompt(
          'Descrição da imagem (alt): o que a imagem mostra, em uma frase.',
          (current.attrs.alt as string) || '',
        )
        if (next === null) return
        const pos = typeof getPos === 'function' ? getPos() : undefined
        if (typeof pos !== 'number') return
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(pos, undefined, { ...current.attrs, alt: next.replace(/\s+/g, ' ').trim() }),
        )
      })

      const caption = document.createElement('figcaption')
      caption.setAttribute('data-placeholder', 'Escreva uma legenda (opcional)…')

      figure.append(img, altBtn, caption)
      return {
        dom: figure,
        contentDOM: caption,
        update: (updated) => {
          if (updated.type !== current.type) return false
          current = updated
          if (img.getAttribute('src') !== (updated.attrs.src || '')) img.src = updated.attrs.src || ''
          paint()
          return true
        },
        // O botão é interface do painel, não conteúdo: o editor ignora mudanças e eventos dele.
        ignoreMutation: (m) => m.type !== 'selection' && altBtn.contains(m.target as globalThis.Node),
        stopEvent: (e) => altBtn.contains(e.target as globalThis.Node),
      }
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
              attrs: {
                src: attrs.src,
                alt: attrs.alt || '',
                width: attrs.width ?? null,
                height: attrs.height ?? null,
              },
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
