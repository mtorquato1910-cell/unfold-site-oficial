'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote,
  Link2, Image as ImageIcon, Table as TableIcon, Youtube, Undo2, Redo2, Loader2,
} from 'lucide-react'
import { Figure, YoutubeEmbed } from './tiptap-extensions'
import { compressImage } from '@/lib/compress-image'
import { extractYouTubeId } from '@/lib/rich-text'
import { uploadMedia } from '@/lib/actions/media-actions'
import styles from './RichTextEditor.module.css'

/** Lê as dimensões naturais de uma imagem já hospedada (para width/height — CLS). */
function imageDimensions(url: string): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// full: tudo (legado, cases). article: editor de texto corrido do post — H2–H6 SEM
// H1, tabela, imagem com alt obrigatório, YouTube (item 1.3). text: parágrafo rico
// SEM títulos nem mídia (bloco legado). lite: negrito/itálico/sublinhado/link (depoimentos).
type Variant = 'full' | 'lite' | 'text' | 'article'

export default function RichTextEditor({
  value,
  onChange,
  variant = 'full',
  placeholder = 'Escreva o conteúdo…',
  compact = false,
  autoFocus = false,
}: {
  value: string
  onChange: (html: string) => void
  variant?: Variant
  placeholder?: string
  compact?: boolean
  autoFocus?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const lastEmitted = useRef(value)
  const full = variant === 'full'
  const article = variant === 'article' // texto corrido do post: H2–H6, sem H1
  const rich = full || article // mídia: imagem, tabela, YouTube
  const showBlocks = full || article || variant === 'text' // listas e citação
  const headingLevels = article ? [2, 3, 4, 5, 6] : [1, 2, 3, 4]

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autoFocus ? 'end' : false,
    extensions: [
      StarterKit.configure({ heading: { levels: headingLevels as any } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder }),
      ...(rich
        ? [
            Figure,
            YoutubeEmbed,
            Table.configure({ resizable: false }),
            TableRow,
            TableHeader,
            TableCell,
          ]
        : []),
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'tt-prose' },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      lastEmitted.current = html
      onChange(html)
    },
  })

  // Sincroniza quando o valor muda DE FORA (abrir edição, resetar após salvar).
  useEffect(() => {
    if (!editor) return
    if (value !== lastEmitted.current && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
      lastEmitted.current = value
    }
  }, [value, editor])

  const addImage = useCallback(
    async (file: File) => {
      if (!editor) return
      setUploading(true)
      try {
        let toSend = file
        try {
          toSend = await compressImage(file)
        } catch {
          toSend = file
        }
        const fd = new FormData()
        fd.append('file', toSend)
        const res: any = await uploadMedia(fd)
        if (res?.ok && res.url) {
          // Alt obrigatório (item 1.6): imagem sem descrição não é inserida.
          const alt = window
            .prompt('Descreva a imagem em uma frase (obrigatório para SEO e acessibilidade):', '')
            ?.trim()
          if (!alt) {
            alert('A imagem não foi inserida: a descrição (alt) é obrigatória.')
            return
          }
          // Dimensão automática (item 1.8): reserva espaço e evita salto de layout (CLS).
          const dims = await imageDimensions(res.url)
          editor.chain().focus().setFigure({ src: res.url, alt, width: dims?.w, height: dims?.h }).run()
        } else {
          alert(res?.error || 'Falha no upload da imagem')
        }
      } finally {
        setUploading(false)
      }
    },
    [editor],
  )

  const addLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link')?.href || ''
    const url = window.prompt('Cole o link (URL):', prev)
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    const href = /^https?:\/\//i.test(url) || /^mailto:|^tel:/i.test(url) ? url : `https://${url}`
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }, [editor])

  const addYoutube = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Cole o link do vídeo do YouTube:')
    if (!url) return
    const id = extractYouTubeId(url)
    if (!id) {
      alert('Não reconheci esse link do YouTube. Cole o endereço completo do vídeo.')
      return
    }
    editor.chain().focus().setYoutube({ videoId: id }).run()
  }, [editor])

  if (!editor) {
    return (
      <div className={`${styles.wrapper} ${compact ? styles.compact : ''}`}>
        <div className={styles.content} style={{ color: 'hsl(0 0% 91% / 0.4)', fontSize: 13 }}>
          Carregando editor…
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.wrapper} ${compact ? styles.compact : ''}`}>
      <div className={styles.toolbar}>
        <Btn icon={<Bold className="h-4 w-4" />} title="Negrito"
          active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Btn icon={<Italic className="h-4 w-4" />} title="Itálico"
          active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Btn icon={<UnderlineIcon className="h-4 w-4" />} title="Sublinhado"
          active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />

        {(full || article) && (
          <>
            <span className={styles.sep} />
            {headingLevels.map((lvl) => (
              <Btn key={lvl} label={`H${lvl}`} title={`Título ${lvl} (H${lvl})`}
                active={editor.isActive('heading', { level: lvl })}
                onClick={() => editor.chain().focus().toggleHeading({ level: lvl as any }).run()} />
            ))}
          </>
        )}

        {showBlocks && (
          <>
            <span className={styles.sep} />
            <Btn icon={<List className="h-4 w-4" />} title="Lista"
              active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
            <Btn icon={<ListOrdered className="h-4 w-4" />} title="Lista numerada"
              active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
            <Btn icon={<Quote className="h-4 w-4" />} title="Citação"
              active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          </>
        )}

        <span className={styles.sep} />
        <Btn icon={<Link2 className="h-4 w-4" />} title="Link" active={editor.isActive('link')} onClick={addLink} />

        {rich && (
          <>
            <Btn
              icon={uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              title="Inserir imagem" disabled={uploading}
              onClick={() => fileRef.current?.click()} />
            <Btn icon={<Youtube className="h-4 w-4" />} title="Vídeo do YouTube" onClick={addYoutube} />
            <Btn icon={<TableIcon className="h-4 w-4" />} title="Inserir tabela"
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
            <Btn label="—" title="Linha divisória"
              onClick={() => editor.chain().focus().setHorizontalRule().run()} />
          </>
        )}

        <span className={styles.sep} />
        <Btn icon={<Undo2 className="h-4 w-4" />} title="Desfazer" disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()} />
        <Btn icon={<Redo2 className="h-4 w-4" />} title="Refazer" disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()} />
      </div>

      <div className={styles.content}>
        <EditorContent editor={editor} />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) addImage(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function Btn({
  icon, label, title, active, disabled, onClick,
}: {
  icon?: React.ReactNode
  label?: string
  title: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.btn} ${active ? styles.active : ''}`}
    >
      {icon}
      {label}
    </button>
  )
}
