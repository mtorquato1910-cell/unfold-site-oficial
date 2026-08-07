'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Plus, Type, Heading, Image as ImageIcon, Youtube, Table as TableIcon,
  Trash2, ArrowUp, ArrowDown, Loader2, X,
} from 'lucide-react'
import RichTextEditor from './RichTextEditor'
import { compressImage } from '@/lib/compress-image'
import { extractYouTubeId } from '@/lib/rich-text'
import { uploadMedia } from '@/lib/actions/media-actions'
import styles from './BlockEditor.module.css'

/**
 * Editor por blocos: o usuário vai adicionando "pedaços" de conteúdo na ordem que
 * quiser (texto, título, imagem, vídeo, tabela) via "+ Adicionar conteúdo".
 *
 * A saída é o MESMO HTML do editor anterior — então armazenamento (campos *_html),
 * sanitização e render no site (RichContent) continuam idênticos.
 */

type Block =
  | { id: string; type: 'texto'; html: string }
  | { id: string; type: 'titulo'; level: 2 | 3 | 4; text: string }
  | { id: string; type: 'imagem'; src: string; alt: string; caption: string }
  | { id: string; type: 'video'; videoId: string }
  | { id: string; type: 'tabela'; cells: string[][] }

let counter = 0
function newId() {
  counter += 1
  return `b${counter}_${Math.random().toString(36).slice(2, 7)}`
}

function esc(s: string) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function tableToHtml(cells: string[][]) {
  if (!cells?.length) return ''
  const [head, ...body] = cells
  const thead = `<thead><tr>${head.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>`
  const tbody = body.length
    ? `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>`
    : ''
  return `<table>${thead}${tbody}</table>`
}

function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'texto':
          return (b.html || '').trim()
        case 'titulo': {
          const t = esc(b.text || '')
          return t ? `<h${b.level}>${t}</h${b.level}>` : ''
        }
        case 'imagem':
          return b.src
            ? `<figure><img src="${esc(b.src)}" alt="${esc(b.alt || '')}" /><figcaption>${esc(b.caption || '')}</figcaption></figure>`
            : ''
        case 'video':
          return b.videoId ? `<div data-youtube="${b.videoId}"></div>` : ''
        case 'tabela':
          return tableToHtml(b.cells)
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join('\n')
}

function parseTable(table: Element): string[][] {
  const rows: string[][] = []
  table.querySelectorAll('tr').forEach((tr) => {
    const r: string[] = []
    tr.querySelectorAll('th,td').forEach((c) => r.push(c.textContent || ''))
    if (r.length) rows.push(r)
  })
  const maxC = Math.max(1, ...rows.map((r) => r.length))
  return rows.map((r) => {
    while (r.length < maxC) r.push('')
    return r
  })
}

function parseHtmlToBlocks(html: string): Block[] {
  if (!html) return []
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return [{ id: newId(), type: 'texto', html }]
  }
  const doc = new DOMParser().parseFromString(`<div id="__r">${html}</div>`, 'text/html')
  const root = doc.getElementById('__r')
  const blocks: Block[] = []
  let textBuf: string[] = []
  const flush = () => {
    if (textBuf.length) {
      blocks.push({ id: newId(), type: 'texto', html: textBuf.join('') })
      textBuf = []
    }
  }
  Array.from(root?.children || []).forEach((el) => {
    const tag = el.tagName.toLowerCase()
    if (/^h[1-6]$/.test(tag)) {
      flush()
      const lvl = Math.min(4, Math.max(2, parseInt(tag[1], 10))) as 2 | 3 | 4
      blocks.push({ id: newId(), type: 'titulo', level: lvl, text: el.textContent || '' })
    } else if (tag === 'figure') {
      flush()
      const img = el.querySelector('img')
      const cap = el.querySelector('figcaption')
      blocks.push({
        id: newId(),
        type: 'imagem',
        src: img?.getAttribute('src') || '',
        alt: img?.getAttribute('alt') || '',
        caption: cap?.textContent || '',
      })
    } else if (tag === 'div' && el.getAttribute('data-youtube')) {
      flush()
      blocks.push({ id: newId(), type: 'video', videoId: el.getAttribute('data-youtube') || '' })
    } else if (tag === 'table') {
      flush()
      blocks.push({ id: newId(), type: 'tabela', cells: parseTable(el) })
    } else {
      textBuf.push(el.outerHTML)
    }
  })
  flush()
  return blocks
}

export default function BlockEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseHtmlToBlocks(value))
  const blocksRef = useRef<Block[]>(blocks)
  blocksRef.current = blocks
  const lastEmitted = useRef<string>(value)

  // Re-parseia quando o valor muda DE FORA (abrir outra edição). Ignora o que nós
  // mesmos emitimos para não entrar em loop nem perder o cursor.
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value
      setBlocks(parseHtmlToBlocks(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function commit(next: Block[]) {
    blocksRef.current = next
    setBlocks(next)
    const html = blocksToHtml(next)
    lastEmitted.current = html
    onChange(html)
  }

  function addBlock(type: Block['type']) {
    const base = blocksRef.current
    let block: Block
    if (type === 'texto') block = { id: newId(), type: 'texto', html: '' }
    else if (type === 'titulo') block = { id: newId(), type: 'titulo', level: 2, text: '' }
    else if (type === 'imagem') block = { id: newId(), type: 'imagem', src: '', alt: '', caption: '' }
    else if (type === 'video') block = { id: newId(), type: 'video', videoId: '' }
    else block = { id: newId(), type: 'tabela', cells: [['', ''], ['', '']] }
    commit([...base, block])
  }

  function patch(id: string, data: Partial<Block>) {
    commit(blocksRef.current.map((b) => (b.id === id ? ({ ...b, ...data } as Block) : b)))
  }

  function remove(id: string) {
    commit(blocksRef.current.filter((b) => b.id !== id))
  }

  function move(id: string, dir: -1 | 1) {
    const arr = [...blocksRef.current]
    const i = arr.findIndex((b) => b.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    commit(arr)
  }

  return (
    <div className={styles.root}>
      {blocks.length === 0 && (
        <p className={styles.empty}>Nenhum conteúdo ainda. Use “+ Adicionar conteúdo” abaixo.</p>
      )}

      {blocks.map((b, i) => (
        <div key={b.id} className={styles.block}>
          <div className={styles.blockHead}>
            <span className={styles.blockLabel}>{labelFor(b.type)}</span>
            <div className={styles.blockTools}>
              <button type="button" className={styles.iconBtn} title="Mover para cima"
                disabled={i === 0} onClick={() => move(b.id, -1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" className={styles.iconBtn} title="Mover para baixo"
                disabled={i === blocks.length - 1} onClick={() => move(b.id, 1)}>
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" className={`${styles.iconBtn} ${styles.danger}`} title="Remover bloco"
                onClick={() => remove(b.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {b.type === 'texto' && (
            <LazyText html={b.html} onChange={(html) => patch(b.id, { html })} />
          )}

          {b.type === 'titulo' && (
            <div className={styles.titleRow}>
              <select
                className={styles.levelSelect}
                value={b.level}
                onChange={(e) => patch(b.id, { level: Number(e.target.value) as 2 | 3 | 4 })}
              >
                <option value={2}>Título (grande)</option>
                <option value={3}>Subtítulo (médio)</option>
                <option value={4}>Tópico (pequeno)</option>
              </select>
              <input
                className={styles.input}
                value={b.text}
                onChange={(e) => patch(b.id, { text: e.target.value })}
                placeholder="Texto do título…"
              />
            </div>
          )}

          {b.type === 'imagem' && (
            <ImageBlock
              src={b.src}
              caption={b.caption}
              onSrc={(src) => patch(b.id, { src })}
              onCaption={(caption) => patch(b.id, { caption })}
            />
          )}

          {b.type === 'video' && (
            <VideoBlock videoId={b.videoId} onVideoId={(videoId) => patch(b.id, { videoId })} />
          )}

          {b.type === 'tabela' && (
            <TableBlock cells={b.cells} onCells={(cells) => patch(b.id, { cells })} />
          )}
        </div>
      ))}

      <div className={styles.addBar}>
        <span className={styles.addLabel}>+ Adicionar conteúdo:</span>
        <button type="button" className={styles.addBtn} onClick={() => addBlock('texto')}>
          <Type className="h-3.5 w-3.5" /> Texto
        </button>
        <button type="button" className={styles.addBtn} onClick={() => addBlock('titulo')}>
          <Heading className="h-3.5 w-3.5" /> Título
        </button>
        <button type="button" className={styles.addBtn} onClick={() => addBlock('imagem')}>
          <ImageIcon className="h-3.5 w-3.5" /> Imagem
        </button>
        <button type="button" className={styles.addBtn} onClick={() => addBlock('video')}>
          <Youtube className="h-3.5 w-3.5" /> Vídeo
        </button>
        <button type="button" className={styles.addBtn} onClick={() => addBlock('tabela')}>
          <TableIcon className="h-3.5 w-3.5" /> Tabela
        </button>
      </div>
    </div>
  )
}

/**
 * Bloco de texto com montagem preguiçosa do editor rico.
 *
 * PROBLEMA: montar um RichTextEditor (TipTap/ProseMirror) por bloco de uma vez
 * trava a thread principal por segundos em artigos longos (10-18 blocos) →
 * modal "congela" sem erro no console, especialmente em máquinas lentas.
 *
 * SOLUÇÃO: enquanto o bloco não é focado, mostra só uma prévia HTML leve.
 * O editor pesado só monta quando o usuário clica para editar aquele bloco —
 * então no máximo 1 (ou poucos) editores existem ao mesmo tempo.
 */
function LazyText({ html, onChange }: { html: string; onChange: (html: string) => void }) {
  const [active, setActive] = useState(false)

  if (active) {
    return (
      <RichTextEditor
        variant="text"
        compact
        autoFocus
        value={html}
        onChange={onChange}
        placeholder="Escreva o texto…"
      />
    )
  }

  const hasContent = !!html && html.replace(/<[^>]*>/g, '').trim().length > 0
  return (
    <div
      role="textbox"
      tabIndex={0}
      className={styles.textPreview}
      onMouseDown={() => setActive(true)}
      onFocus={() => setActive(true)}
      title="Clique para editar"
    >
      {hasContent ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <span className={styles.previewPlaceholder}>Escreva o texto…</span>
      )}
    </div>
  )
}

function labelFor(type: Block['type']) {
  switch (type) {
    case 'texto': return 'Texto'
    case 'titulo': return 'Título'
    case 'imagem': return 'Imagem'
    case 'video': return 'Vídeo do YouTube'
    case 'tabela': return 'Tabela'
  }
}

function ImageBlock({
  src, caption, onSrc, onCaption,
}: {
  src: string
  caption: string
  onSrc: (v: string) => void
  onCaption: (v: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setErr(null)
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
      if (res?.ok && res.url) onSrc(res.url)
      else setErr(res?.error || 'Falha no upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {src ? (
        <div className={styles.imgPreview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={caption || 'imagem'} />
          <button type="button" className={`${styles.iconBtn} ${styles.danger}`}
            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)' }}
            title="Trocar imagem" onClick={() => onSrc('')}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className={styles.dropzone} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
          <span>{uploading ? 'Enviando…' : 'Clique para anexar uma imagem (PNG, JPG, WEBP)'}</span>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />
      <input
        className={styles.input}
        style={{ marginTop: 8 }}
        value={caption}
        onChange={(e) => onCaption(e.target.value)}
        placeholder="Legenda da imagem (opcional)"
      />
      {err && <p className={styles.hint} style={{ color: 'hsl(0 70% 80%)' }}>{err}</p>}
    </div>
  )
}

function VideoBlock({ videoId, onVideoId }: { videoId: string; onVideoId: (v: string) => void }) {
  const [url, setUrl] = useState('')
  const [err, setErr] = useState<string | null>(null)

  function apply(raw: string) {
    setErr(null)
    const id = extractYouTubeId(raw)
    if (id) onVideoId(id)
    else if (raw.trim()) setErr('Não reconheci esse link do YouTube. Cole o endereço completo do vídeo.')
  }

  if (videoId) {
    return (
      <div className={styles.videoPreview}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="Vídeo do YouTube" />
        <span className={styles.videoBadge}>
          ▶ Vídeo anexado
          <button type="button" className={`${styles.iconBtn} ${styles.danger}`}
            style={{ background: 'rgba(0,0,0,0.5)' }} title="Trocar vídeo" onClick={() => onVideoId('')}>
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>
    )
  }

  return (
    <div>
      <input
        className={styles.input}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={(e) => apply(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            apply((e.target as HTMLInputElement).value)
          }
        }}
        placeholder="Cole o link do vídeo do YouTube e tecle Enter"
      />
      {err && <p className={styles.hint} style={{ color: 'hsl(0 70% 80%)' }}>{err}</p>}
      {!err && <p className={styles.hint}>O vídeo abre com capa + play no site.</p>}
    </div>
  )
}

function TableBlock({ cells, onCells }: { cells: string[][]; onCells: (c: string[][]) => void }) {
  const cols = cells[0]?.length || 0

  function setCell(r: number, c: number, v: string) {
    const next = cells.map((row) => [...row])
    next[r][c] = v
    onCells(next)
  }
  function addRow() {
    onCells([...cells, Array.from({ length: cols }, () => '')])
  }
  function addCol() {
    onCells(cells.map((row) => [...row, '']))
  }
  function removeRow() {
    if (cells.length > 1) onCells(cells.slice(0, -1))
  }
  function removeCol() {
    if (cols > 1) onCells(cells.map((row) => row.slice(0, -1)))
  }

  return (
    <div>
      <div className={styles.tableWrap}>
        <table className={styles.tableGrid}>
          <tbody>
            {cells.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>
                    <input
                      className={styles.cellInput}
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      placeholder={r === 0 ? 'Cabeçalho' : ''}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.tableActions}>
        <button type="button" className={styles.addBtn} onClick={addRow}>+ Linha</button>
        <button type="button" className={styles.addBtn} onClick={addCol}>+ Coluna</button>
        <button type="button" className={styles.addBtn} onClick={removeRow}>− Linha</button>
        <button type="button" className={styles.addBtn} onClick={removeCol}>− Coluna</button>
      </div>
      <p className={styles.hint}>A primeira linha vira o cabeçalho da tabela.</p>
    </div>
  )
}
