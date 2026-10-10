/**
 * S03 (épico seo-tecnico-2026-10) — remoção de links internos quebrados do HTML dos
 * posts, conforme a decisão D2 do cliente (08/10/2026):
 *  - tirar só o `<a>` e manter o texto da âncora na frase (UNWRAP);
 *  - se o link estiver num item de "Leia também" ou num parágrafo que só existe
 *    para indicar o link, remover o item/parágrafo inteiro (REMOVE_BLOCK);
 *  - se for uma frase que só existe para indicar o link ("Esse é o tema de X.",
 *    "Aprofundamos isso em X.") remover a frase (REMOVE_SENTENCE); se for só a oração
 *    final (", assunto de X."), remover a oração (REMOVE_CLAUSE);
 *  - casos ambíguos viram REVISAR (aplica UNWRAP por padrão e vão para o relatório).
 *
 * Usado por `scripts/remove-broken-links.ts`. Só aceita um `Document` (jsdom no
 * script/teste) para não puxar dependência de DOM para o bundle do app.
 */

export type LinkAction = 'UNWRAP' | 'REMOVE_BLOCK' | 'REMOVE_SENTENCE' | 'REMOVE_CLAUSE' | 'REVISAR'

export type LinkChange = {
  href: string
  path: string
  anchorText: string
  action: LinkAction
  before: string
  after: string
}

const SITE_HOST_RE = /(^|\.)unfoldgrowth\.com\.br$/i

/**
 * Normaliza um href para o caminho interno (sem domínio, query, hash e barra final).
 * Retorna null para links externos, âncoras puras, mailto/tel etc.
 */
export function internalPath(href: string | null | undefined): string | null {
  if (!href) return null
  const h = href.trim()
  if (!h || h.startsWith('#') || /^(mailto|tel|javascript):/i.test(h)) return null
  try {
    const u = new URL(h, 'https://unfoldgrowth.com.br')
    if (!SITE_HOST_RE.test(u.hostname)) return null
    const p = u.pathname.replace(/\/+$/, '')
    return p || '/'
  } catch {
    return null
  }
}

/** Blocos de texto onde a frase é avaliada. */
const BLOCK_SELECTOR = 'p, li, td, th, h2, h3, h4, h5, h6, blockquote, figcaption'
/** Títulos de seções que só existem para listar links. */
const LINK_LIST_HEADING_RE = /^(leia tamb[ée]m|veja tamb[ée]m|artigos relacionados|conte[úu]dos relacionados|continue lendo|saiba mais)\b/i

/** Texto ANTES do link que indica frase inteira só de referência. */
const SENTENCE_PREFIX_RES = [
  /^(esse|este|isso|esta|essa)\s+(é|e)\s+(o|um)\s+(tema|assunto)(\s+central)?\s+(de|do|da)$/,
  /^(aprofundamos|detalhamos|explicamos|exploramos|tratamos|falamos|abordamos)(\s+(isso|disso|esse tema|esse assunto|mais|o tema))?\s+(em|no|na|sobre)$/,
  /^(veja|leia|confira|saiba mais)(\s+tamb[ée]m)?(\s+(em|no|na|sobre))?:?$/,
  /^(para|pra)\s+(saber|entender|ver)\s+mais,?\s+(veja|leia|confira)(\s+(em|no|na))?:?$/,
  // "É exatamente o que detalhamos em X."
  /^(é|e)\s+(exatamente\s+)?(o que|isso que|aquilo que)\s+(detalhamos|aprofundamos|explicamos|exploramos|tratamos|abordamos|mostramos)\s+(em|no|na)$/,
  // "É a tese que sustenta X." · "Essa é a lógica que detalhamos em X." · "É a lógica de leitura da cadeia de X."
  // Ancorado no fim (≤ 5 palavras entre o substantivo e o link) para não engolir
  // frases com conteúdo próprio ("Essa é a ideia central do método: medir tudo, do lead ao X.").
  /^((essa|esta|esse|este)\s+)?(é|e)\s+(a|o)\s+(tese|lógica|logica|argumento|raciocínio|raciocinio|ideia)(\s+[\wà-ú]+){0,5}\s+(de|do|da|em|no|na|sustenta|sustentam)$/,
]
/**
 * Coordenação com OUTRO link: "detalhados em <a>A</a> e em X." → remove " e em X".
 * Exige o `</a>` imediatamente antes — sem ele ("Invista em mídia e em X.") é REVISAR.
 */
const COORD_RE = /\s+e\s+(em|de|do|da|no|na)$/
const COORD_HTML_RE = /<\/a>(?:<\/[a-z0-9]+>)*\s+e\s+(em|de|do|da|no|na)\s*$/i
/** Oração final de referência: ", assunto de X." / ", tema que detalhamos em X." */
const CLAUSE_RE =
  /,\s*(o\s+|um\s+)?(tema|assunto)(\s+central)?(\s+que\s+(detalhamos|aprofundamos|tratamos|explicamos|exploramos|abordamos))?\s+(de|do|da|em|no|na)$/

const PREPOSITION_END_RE = /\b(de|do|da|em|no|na|sobre)$/

const VOID_TAGS = new Set(['br', 'img', 'hr', 'wbr', 'input', 'source', 'col', 'meta', 'link', 'area', 'embed', 'track'])

/** As tags do trecho abrem e fecham dentro dele (ignora tags vazias)? */
function tagsBalanced(fragment: string): boolean {
  const stack: string[] = []
  for (const m of fragment.matchAll(/<(\/?)([a-z0-9]+)\b[^>]*?(\/?)>/gi)) {
    const name = m[2].toLowerCase()
    if (VOID_TAGS.has(name) || m[3] === '/') continue
    if (m[1] === '/') {
      if (stack.pop() !== name) return false
    } else stack.push(name)
  }
  return stack.length === 0
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
}

function norm(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function lowerNorm(s: string): string {
  return norm(stripTags(s)).toLowerCase()
}

const PH_OPEN = '\u0001'
const PH_CLOSE = '\u0002'

/**
 * Remove os links para `targets` (caminhos internos normalizados) do `doc.body`.
 * Muta o documento e devolve as mudanças aplicadas, na ordem.
 */
export function removeBrokenLinks(doc: Document, targets: Set<string>): LinkChange[] {
  const changes: LinkChange[] = []
  // Reconsulta a cada volta: uma remoção pode tirar outros links do DOM.
  for (;;) {
    const a = Array.from(doc.body.querySelectorAll('a[href]')).find((el) => {
      const p = internalPath(el.getAttribute('href'))
      return p !== null && targets.has(p)
    }) as HTMLAnchorElement | undefined
    if (!a) break
    changes.push(handleLink(doc, a))
  }
  return changes
}

function handleLink(doc: Document, a: HTMLAnchorElement): LinkChange {
  const href = a.getAttribute('href') || ''
  const path = internalPath(href) || href
  const anchorText = norm(a.textContent || '')
  const block = (a.closest(BLOCK_SELECTOR) as HTMLElement | null) || (a.parentElement as HTMLElement)
  const blockForReport = block.closest('li') || block
  const before = norm(blockForReport.outerHTML)

  // 1) Bloco que só contém o link (item de "Leia também", parágrafo-card). Só em
  //    <p>/<li> sem mídia: em <td>/<th> a coluna da tabela se deslocaria, num título
  //    a seção perderia o cabeçalho, e uma imagem dentro do bloco seria apagada.
  const removable =
    /^(P|LI)$/.test(block.tagName) && block !== doc.body && !block.querySelector('img, iframe, video, picture')
  if (removable && norm(block.textContent || '') === anchorText) {
    const removedFrom = removeBlockCascade(block)
    return { href, path, anchorText, action: 'REMOVE_BLOCK', before, after: removedFrom }
  }

  // 2) Avalia a frase onde o link está.
  const inner = doc.createElement('span')
  inner.innerHTML = a.innerHTML
  a.replaceWith(doc.createTextNode(`${PH_OPEN}${inner.textContent ?? ''}${PH_CLOSE}`))
  // innerHTML escapa o texto, mas os marcadores \u0001/\u0002 passam intactos.
  let html = block.innerHTML
  const phStart = html.indexOf(PH_OPEN)
  const phEnd = html.indexOf(PH_CLOSE) + 1
  // O editor sublinha (<u>) o texto dos links; sem o link, o sublinhado faria o texto
  // continuar parecendo clicável → sai junto no UNWRAP.
  const anchorInner = a.innerHTML.replace(/<\/?u(\s[^>]*)?>/gi, '')

  // Início da frase: fim do último [.!?] seguido de espaço (ignorando tags de fecho) antes do link.
  let sentStart = 0
  const boundary = /[.!?](?:<\/[a-z0-9]+>)*\s+/gi
  let m: RegExpExecArray | null
  while ((m = boundary.exec(html)) && m.index < phStart) sentStart = m.index + m[0].length
  // Fim da frase: primeiro [.!?] depois do link (inclusive), ou fim do bloco.
  const tail = html.slice(phEnd)
  const endRel = tail.search(/[.!?]/)
  const sentEnd = endRel >= 0 ? phEnd + endRel + 1 : html.length

  const prefixHtml = html.slice(sentStart, phStart)
  const prefix = lowerNorm(prefixHtml)
  const suffix = norm(stripTags(html.slice(phEnd, sentEnd)))
  const linkEndsSentence = suffix === '' || /^[.!?:]$/.test(suffix)

  // Cortes por índice no HTML serializado só são seguros se o trecho removido tiver
  // tags balanceadas — senão a formatação vazaria para o texto seguinte.
  const balanced = (from: number, to: number) => tagsBalanced(html.slice(from, to))
  const coord = COORD_HTML_RE.exec(prefixHtml)
  // Corte da coordenação: logo após o </a> do link anterior (mantém o link válido).
  const coordCut = coord ? sentStart + coord.index + coord[0].indexOf('</a>') + '</a>'.length : -1
  const clauseCut = sentStart + prefixHtml.lastIndexOf(',')

  let action: LinkAction = 'UNWRAP'
  if (linkEndsSentence && SENTENCE_PREFIX_RES.some((re) => re.test(prefix)) && balanced(sentStart, sentEnd)) {
    action = 'REMOVE_SENTENCE'
    html = (html.slice(0, sentStart) + html.slice(sentEnd)).replace(/\s{2,}/g, ' ')
  } else if (linkEndsSentence && COORD_RE.test(prefix) && coord && balanced(coordCut, sentEnd - 1)) {
    action = 'REMOVE_CLAUSE'
    html = html.slice(0, coordCut) + html.slice(sentEnd - 1)
  } else if (linkEndsSentence && CLAUSE_RE.test(prefix) && balanced(clauseCut, sentEnd - 1)) {
    action = 'REMOVE_CLAUSE'
    // Mantém a pontuação final da frase.
    html = html.slice(0, clauseCut) + html.slice(sentEnd - 1)
  } else {
    // Ambíguos: link fecha a frase após preposição, coordenação sem outro link, ou
    // corte que desbalancearia tags → só tira o link e marca para revisão humana.
    if (linkEndsSentence && (PREPOSITION_END_RE.test(prefix) || CLAUSE_RE.test(prefix) || COORD_RE.test(prefix))) {
      action = 'REVISAR'
    }
    html = html.slice(0, phStart) + anchorInner + html.slice(phEnd)
  }
  // Apara espaços nas bordas e antes de um <br> final (sobra comum de frase removida).
  block.innerHTML = html.replace(/\s+(<br\s*\/?>\s*)$/i, '$1').replace(/^\s+|\s+$/g, '')

  // Bloco que ficou sem texto (ex.: a frase removida era a única) sai também.
  let after = norm(blockForReport.isConnected ? blockForReport.outerHTML : '')
  if (block !== doc.body && !norm(block.textContent || '') && !block.querySelector('img, iframe, video, picture')) {
    after = removeBlockCascade(block)
  }
  return { href, path, anchorText, action, before, after }
}

/**
 * Remove o bloco e sobe removendo contêineres que ficarem vazios (li → ul/ol) e o
 * título "Leia também" que ficar sem lista. Retorna uma descrição do que sobrou.
 */
function removeBlockCascade(block: HTMLElement): string {
  let node: HTMLElement | null = block
  // Se o bloco é o único conteúdo de um <li>, remove o <li>.
  const li = block.closest('li')
  if (li && norm(li.textContent || '') === norm(block.textContent || '')) node = li
  const parent = node.parentElement
  node.remove()
  if (parent && /^(UL|OL)$/.test(parent.tagName) && parent.children.length === 0) {
    const heading = parent.previousElementSibling
    parent.remove()
    if (heading && /^H[2-6]$/.test(heading.tagName) && LINK_LIST_HEADING_RE.test(norm(heading.textContent || ''))) {
      heading.remove()
      return '(item, lista e título "Leia também" removidos)'
    }
    return '(item e lista removidos)'
  }
  return '(removido)'
}
