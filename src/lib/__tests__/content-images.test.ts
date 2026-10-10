import { describe, it, expect } from 'vitest'
import { auditContentImages, lazyContentImages } from '../content-images'

describe('lazyContentImages', () => {
  it('acrescenta loading="lazy" e decoding="async" em todas as imagens', () => {
    expect(lazyContentImages('<p>x</p><img src="/a.webp" alt="A"><img src="/b.webp" />')).toBe(
      '<p>x</p><img src="/a.webp" alt="A" loading="lazy" decoding="async"><img src="/b.webp" loading="lazy" decoding="async" />',
    )
  })
  it('respeita loading já definido e eagerFirst', () => {
    expect(lazyContentImages('<img src="/a" loading="eager">')).toBe('<img src="/a" loading="eager">')
    expect(lazyContentImages('<img src="/a"><img src="/b">', { eagerFirst: true })).toBe(
      '<img src="/a" decoding="async"><img src="/b" loading="lazy" decoding="async">',
    )
  })
})

describe('auditContentImages', () => {
  it('aponta alt vazio/ausente e falta de width/height', () => {
    const issues = auditContentImages(
      '<img src="/ok" alt="Diagrama" width="10" height="5"><img src="/sem-alt" alt="" width="1" height="1"><img src="/sem-tam" alt="x">',
    )
    expect(issues).toEqual([
      { src: '/sem-alt', missingAlt: true, missingSize: false },
      { src: '/sem-tam', missingAlt: false, missingSize: true },
    ])
  })
})
