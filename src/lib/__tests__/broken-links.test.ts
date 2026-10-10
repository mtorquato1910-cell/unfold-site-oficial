import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { internalPath, removeBrokenLinks } from '../broken-links'

const TARGETS = new Set([
  '/blog/as-metricas-de-growth-que-importam',
  '/blog/crm-para-incorporadora',
  '/blog/receita-previsivel',
  '/calculadora',
])

function run(html: string) {
  const doc = new JSDOM(`<body>${html}</body>`).window.document
  const changes = removeBrokenLinks(doc, TARGETS)
  return { html: doc.body.innerHTML, changes }
}

describe('internalPath', () => {
  it('normaliza domínio, www, query, hash e barra final', () => {
    expect(internalPath('https://www.unfoldgrowth.com.br/blog/x/?a=1#h')).toBe('/blog/x')
    expect(internalPath('/calculadora/')).toBe('/calculadora')
    expect(internalPath('https://outro.com/blog/x')).toBeNull()
    expect(internalPath('#secao')).toBeNull()
    expect(internalPath('mailto:a@b.com')).toBeNull()
  })
})

describe('removeBrokenLinks', () => {
  it('UNWRAP simples mantém o texto da âncora e tira o sublinhado de link', () => {
    const { html, changes } = run('<p>A estrutura alimenta a <a href="/calculadora"><u>calculadora</u></a> de mídia.</p>')
    expect(html).toBe('<p>A estrutura alimenta a calculadora de mídia.</p>')
    expect(changes[0].action).toBe('UNWRAP')
  })

  it('remove "É exatamente o que detalhamos em X." no meio do parágrafo', () => {
    const { html, changes } = run(
      '<p>O lead esfria. É exatamente o que detalhamos em <a href="/calculadora"><u>x</u></a>. O dado confirma.</p>',
    )
    expect(html).toBe('<p>O lead esfria. O dado confirma.</p>')
    expect(changes[0].action).toBe('REMOVE_SENTENCE')
  })

  it('remove "É a tese que sustenta X." e "Essa é a lógica que detalhamos em X."', () => {
    expect(run('<p>Resolve é estrutura. É a tese que sustenta <a href="/calculadora">x</a>.</p>').html).toBe(
      '<p>Resolve é estrutura.</p>',
    )
    expect(run('<p>O dashboard revela. Essa é a lógica que detalhamos em <a href="/calculadora">x</a>.</p>').html).toBe(
      '<p>O dashboard revela.</p>',
    )
  })

  it('remove " e em X" quando coordenado com outro link válido', () => {
    const { html, changes } = run(
      '<p>Sintomas detalhados em <a href="/blog/ok"><u>A</u></a> e em <a href="/calculadora"><u>B</u></a>.</p>',
    )
    expect(html).toBe('<p>Sintomas detalhados em <a href="/blog/ok"><u>A</u></a>.</p>')
    expect(changes[0].action).toBe('REMOVE_CLAUSE')
  })

  it('preserva formatação interna (<strong>) no unwrap', () => {
    const { html } = run('<p>Veja o <a href="/calculadora"><strong>simulador</strong></a> agora.</p>')
    expect(html).toBe('<p>Veja o <strong>simulador</strong> agora.</p>')
  })

  it('remove item de "Leia também" e, se a lista esvaziar, o título', () => {
    const { html, changes } = run(
      '<p>Fim.</p><h2>Leia também</h2><ul><li><p><a href="/blog/receita-previsivel"><u>Receita previsível</u></a></p></li></ul><h2>Fontes</h2>',
    )
    expect(html).toBe('<p>Fim.</p><h2>Fontes</h2>')
    expect(changes[0].action).toBe('REMOVE_BLOCK')
  })

  it('remove só o item quando a lista tem outros links', () => {
    const { html } = run(
      '<h3>Leia também</h3><ul><li><p><a href="/blog/ok">OK</a></p></li><li><p><a href="/blog/as-metricas-de-growth-que-importam">As métricas</a></p></li></ul>',
    )
    expect(html).toBe('<h3>Leia também</h3><ul><li><p><a href="/blog/ok">OK</a></p></li></ul>')
  })

  it('remove a frase que só existe para o link ("Esse é o tema de X.")', () => {
    const { html, changes } = run(
      '<p>A leitura em cadeia transforma o pipeline em decisão. Esse é o tema de <a href="/blog/as-metricas-de-growth-que-importam"><u>as métricas de growth que importam</u></a>.</p>',
    )
    expect(html).toBe('<p>A leitura em cadeia transforma o pipeline em decisão.</p>')
    expect(changes[0].action).toBe('REMOVE_SENTENCE')
  })

  it('remove "Aprofundamos isso em X." no fim do parágrafo', () => {
    const { html, changes } = run(
      '<p>A disputa já foi decidida. Aprofundamos isso em <a href="/blog/as-metricas-de-growth-que-importam">métricas</a>.</p>',
    )
    expect(html).toBe('<p>A disputa já foi decidida.</p>')
    expect(changes[0].action).toBe('REMOVE_SENTENCE')
  })

  it('remove só a oração final de referência (", assunto de X.")', () => {
    const { html, changes } = run(
      '<p>É o que revela onde o dinheiro vaza, assunto de <a href="/blog/as-metricas-de-growth-que-importam">as métricas</a>.</p>',
    )
    expect(html).toBe('<p>É o que revela onde o dinheiro vaza.</p>')
    expect(changes[0].action).toBe('REMOVE_CLAUSE')
  })

  it('remove ", tema que detalhamos em X."', () => {
    const { html } = run(
      '<p>Sem essa função, a operação vira atividade sem direção, tema que detalhamos em <a href="/blog/as-metricas-de-growth-que-importam">as métricas</a>.</p>',
    )
    expect(html).toBe('<p>Sem essa função, a operação vira atividade sem direção.</p>')
  })

  it('marca REVISAR (e faz unwrap) quando o link fecha a frase depois de preposição', () => {
    const { html, changes } = run(
      '<p>Prepare o corretor. É o papel do <a href="/blog/as-metricas-de-growth-que-importam">sales enablement</a>.</p>',
    )
    expect(changes[0].action).toBe('REVISAR')
    expect(html).toBe('<p>Prepare o corretor. É o papel do sales enablement.</p>')
  })

  it('NÃO toca slug longo que começa igual a um alvo', () => {
    const src = '<p>Leia o <a href="/blog/crm-para-incorporadora-como-organizar-o-funil-de-lancamento">guia</a>.</p>'
    const { html, changes } = run(src)
    expect(changes).toHaveLength(0)
    expect(html).toBe(src)
  })

  it('reconhece URL absoluta com www e barra final', () => {
    const { changes } = run('<p>Use a <a href="https://www.unfoldgrowth.com.br/calculadora/">ferramenta</a> hoje.</p>')
    expect(changes).toHaveLength(1)
  })

  it('trata vários links no mesmo bloco e é idempotente', () => {
    const doc = new JSDOM(
      '<body><p>A <a href="/calculadora">calc</a> e o <a href="/blog/crm-para-incorporadora">CRM</a> resolvem.</p></body>',
    ).window.document
    expect(removeBrokenLinks(doc, TARGETS)).toHaveLength(2)
    expect(doc.body.innerHTML).toBe('<p>A calc e o CRM resolvem.</p>')
    expect(removeBrokenLinks(doc, TARGETS)).toHaveLength(0)
  })

  // ── Regressões do QA (2026-10-10) ──────────────────────────────────────────
  it('não apaga imagem: bloco com <img> + link só perde o link', () => {
    const { html } = run('<p><img src="/a.webp" alt="x"><a href="/calculadora">Calc</a></p>')
    expect(html).toBe('<p><img src="/a.webp" alt="x">Calc</p>')
  })

  it('não remove célula de tabela nem título que são só o link', () => {
    expect(run('<table><tbody><tr><td><a href="/calculadora">Calc</a></td><td>2</td></tr></tbody></table>').html).toBe(
      '<table><tbody><tr><td>Calc</td><td>2</td></tr></tbody></table>',
    )
    expect(run('<h2><a href="/calculadora">Calculadora</a></h2><p>x</p>').html).toBe('<h2>Calculadora</h2><p>x</p>')
  })

  it('"e em X" sem outro link antes NÃO corta conteúdo (vira REVISAR)', () => {
    const { html, changes } = run('<p>Invista em mídia e em <a href="/calculadora">CRM</a>.</p>')
    expect(html).toBe('<p>Invista em mídia e em CRM.</p>')
    expect(changes[0].action).toBe('REVISAR')
  })

  it('frase "é a ideia ..." com conteúdo próprio NÃO é removida', () => {
    const { html } = run('<p>Essa é a ideia central do método: medir tudo, do lead ao <a href="/calculadora">CAC</a>.</p>')
    expect(html).toBe('<p>Essa é a ideia central do método: medir tudo, do lead ao CAC.</p>')
  })

  it('não corta quando o trecho removido desbalancearia tags (formatação vazaria)', () => {
    const { html, changes } = run(
      '<p><em>Fim. Esse é o tema de</em> <a href="/calculadora">X</a>. Outra frase.</p>',
    )
    expect(changes[0].action).not.toBe('REMOVE_SENTENCE')
    expect(html).toBe('<p><em>Fim. Esse é o tema de</em> X. Outra frase.</p>')
  })

  it('apara o espaço antes de um <br> final', () => {
    const { html } = run('<p>Revela o elo. Esse é o tema de <a href="/calculadora">X</a>. <br></p>')
    expect(html).toBe('<p>Revela o elo.<br></p>')
  })

  it('link solto direto no <body> não derruba o documento', () => {
    const doc = new JSDOM('<body><a href="/calculadora">Calc</a></body>').window.document
    expect(() => removeBrokenLinks(doc, TARGETS)).not.toThrow()
    expect(doc.body.innerHTML).toBe('Calc')
  })

  it('escapa corretamente texto com caracteres especiais', () => {
    const { html } = run('<p>Custo &lt; receita na <a href="/calculadora">calc &amp; cia</a> hoje.</p>')
    expect(html).toBe('<p>Custo &lt; receita na calc &amp; cia hoje.</p>')
  })
})
