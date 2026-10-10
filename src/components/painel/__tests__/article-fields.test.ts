import { describe, it, expect } from 'vitest'
import { validateArticle } from '../article-fields'

describe('validateArticle', () => {
  it('avisa título sem texto abaixo (roteiro do case não preenchido)', () => {
    const w = validateArticle('<h2>Desafio</h2><p></p><h2>Solução</h2><p>Fizemos X.</p><h2>Resultados</h2><p></p>', [], 'case')
    expect(w.some((x) => x.includes('Desafio') && x.includes('Resultados') && !x.includes('Solução'))).toBe(true)
  })
  it('não avisa quando todas as seções têm texto', () => {
    expect(validateArticle('<h2>A</h2><p>texto</p><h3>B</h3><ul><li>x</li></ul>', []).some((x) => x.includes('sem texto'))).toBe(false)
  })
  it('usa o tipo de conteúdo no aviso de H1', () => {
    expect(validateArticle('<h1>x</h1><p>y</p>', [], 'case').some((x) => x.includes('título do case'))).toBe(true)
  })
})
