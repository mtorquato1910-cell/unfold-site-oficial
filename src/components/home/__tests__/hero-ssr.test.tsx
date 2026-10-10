import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import HeroClient from '../HeroClient'
import type { HomeSettingsData } from '@/lib/home-settings'

/**
 * S05 (épico seo-tecnico-2026-10): o HTML entregue pelo servidor — o que o Google e os
 * rastreadores de IA leem — precisa trazer os valores FINAIS dos contadores (antes
 * saía "+R$ 0MM") e não pode incluir o vídeo (no celular ele nem deve ser baixado).
 */
const settings = {
  hero_eyebrow: 'Growth',
  hero_title: 'Growth para {{primary}}vendas complexas{{/primary}}',
  hero_subtitle: 'Sub',
  hero_cta_primary_label: 'Diagnóstico',
  hero_cta_primary_href: '/diagnostico',
  hero_cta_secondary_label: 'Método',
  hero_cta_secondary_href: '/metodo',
  hero_video_url: null,
  hero_image_url: null,
  stats: [
    { prefix: '+R$ ', value: 75, suffix: 'MM', label: 'gerados em pipeline' },
    { prefix: '+R$ ', value: 850, suffix: 'k', label: 'gerenciados em mídia online' },
    { prefix: '+', value: 25, suffix: 'k', label: 'conteúdos produzidos' },
  ],
  stats_extra_text: 'Parceiros RD Station, Meta, Kommo',
} as unknown as HomeSettingsData

describe('HeroClient — HTML do servidor', () => {
  const html = renderToString(<HeroClient settings={settings} />)
  // React separa nós de texto adjacentes com <!-- --> no SSR.
  const text = html.replace(/<!-- -->/g, '')

  it('traz o valor final dos contadores (não "0")', () => {
    expect(text).toContain('+R$ 75MM')
    expect(text).toContain('+R$ 850k')
    expect(text).toContain('+25k')
    expect(text).not.toContain('+R$ 0MM')
  })

  it('não inclui o vídeo (montado só no cliente, em telas largas)', () => {
    expect(html).not.toContain('<video')
    expect(html).not.toContain('pexels.com')
  })

  it('renderiza a imagem de fundo local com prioridade alta (LCP)', () => {
    expect(html).toContain('poster.webp')
    expect(html).toMatch(/fetchpriority="high"/i)
  })
})
