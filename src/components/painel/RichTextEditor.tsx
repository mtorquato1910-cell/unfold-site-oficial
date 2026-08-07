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

// full: tudo (legado). text: parágrafo rico SEM títulos nem mídia (bloco de texto do
// BlockEditor). lite: só negrito/itálico/sublinhado/link (depoimentos).
type Variant = 'full' | 'lite' | 'text'

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
  const showBlocks = variant === 'full' || variant === 'text' // listas e citação

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autoFocus ? 'end' : false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder }),
      ...(full
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
          editor.chain().focus().setFigure({ src: res.url, alt: '' }).run()
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

        {full && (
          <>
            <span className={styles.sep} />
            {[1, 2, 3, 4].map((lvl) => (
              <Btn key={lvl} label={`H${lvl}`} title={`Título ${lvl}`}
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

        {full && (
          <>
            <Btn
              icon={uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              title="Inserir imagem" disabled={uploading}
              onClick={() => fileRef.current?.click()} />
            <Btn icon={<Youtube className="h-4 w-4" />} title="Vídeo do YouTube" onClick={addYoutube} />
            <Btn icon={<TableIcon className="h-4 w-4" />} title="Inserir tabela"
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
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
