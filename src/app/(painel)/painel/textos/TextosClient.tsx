'use client'

import { useState, useTransition } from 'react'
import { Save, Type } from 'lucide-react'
import { PageHeader, GlassCard, Field, MintButton } from '@/components/painel/ui'
import { updateSiteTexts, type SiteTextsInput } from '@/lib/actions/site-texts-actions'

type Hero = { eyebrow: string; title: string; subtitle: string }

export type TextosForm = {
  home: { hero_eyebrow: string; hero_title: string; hero_subtitle: string }
  metodo: Hero
  atuacao: Hero
  cases: Hero
  ferramentas: Hero
  sobre: Hero
  blog: Hero
  guia: Hero
}

type PageKey = 'metodo' | 'atuacao' | 'cases' | 'ferramentas' | 'sobre' | 'blog' | 'guia'

const PAGES: { key: PageKey; label: string; hint: string }[] = [
  { key: 'metodo', label: 'Método', hint: 'Página /metodo' },
  { key: 'atuacao', label: 'Atuação', hint: 'Página /atuacao' },
  { key: 'cases', label: 'Cases', hint: 'Página /cases' },
  { key: 'ferramentas', label: 'Ferramentas', hint: 'Página /ferramentas' },
  { key: 'sobre', label: 'Sobre', hint: 'Página /sobre' },
  { key: 'blog', label: 'Blog', hint: 'Página /blog' },
  { key: 'guia', label: 'Guia de Eleições', hint: 'Página /guia-eleicoes-2026' },
]

const HIGHLIGHT_HINT =
  'Destaque um trecho com {{primary}}texto{{/primary}} (mint) ou {{secondary}}texto{{/secondary}}.'

export default function TextosClient({ initial }: { initial: TextosForm }) {
  const [form, setForm] = useState<TextosForm>(initial)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateHero(key: PageKey, field: keyof Hero, value: string) {
    setForm((f) => ({ ...f, [key]: { ...f[key], [field]: value } }))
  }

  function updateHome(field: keyof TextosForm['home'], value: string) {
    setForm((f) => ({ ...f, home: { ...f.home, [field]: value } }))
  }

  function handleSave() {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        await updateSiteTexts(form as SiteTextsInput)
        setSuccess('Salvo. As mudanças aparecem no site em até 1 minuto.')
        setTimeout(() => setSuccess(null), 4000)
      } catch (err: any) {
        setError(err?.message || 'Falha ao salvar')
      }
    })
  }

  return (
    <>
      <PageHeader
        title="Textos das páginas"
        description="Edite os títulos e descrições dos cabeçalhos de cada página do site sem mexer em código."
        actions={
          <MintButton onClick={handleSave} disabled={isPending}>
            <Save className="h-4 w-4" /> {isPending ? 'Salvando...' : 'Salvar tudo'}
          </MintButton>
        }
      />

      {success && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-[13px] font-medium"
          style={{
            background: 'hsl(158 92% 70% / 0.10)',
            color: 'hsl(158 92% 70%)',
            border: '1px solid hsl(158 92% 70% / 0.25)',
          }}
        >
          {success}
        </div>
      )}
      {error && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-[13px]"
          style={{
            background: 'hsl(0 70% 60% / 0.10)',
            color: 'hsl(0 70% 80%)',
            border: '1px solid hsl(0 70% 60% / 0.25)',
          }}
        >
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Home */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-1.5">
            <Type className="h-4 w-4 text-mint" />
            <h3 className="font-display text-[17px] font-medium text-fg">Home</h3>
          </div>
          <p className="text-[12px] text-dim mb-5">Página inicial (/)</p>
          <div className="space-y-4">
            <Field label="Tagline pequena (mono uppercase)">
              <input
                className="input-mint"
                value={form.home.hero_eyebrow}
                onChange={(e) => updateHome('hero_eyebrow', e.target.value)}
              />
            </Field>
            <Field label="Título principal" hint={HIGHLIGHT_HINT}>
              <textarea
                className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                rows={2}
                value={form.home.hero_title}
                onChange={(e) => updateHome('hero_title', e.target.value)}
              />
            </Field>
            <Field label="Subtítulo / descrição">
              <textarea
                className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                rows={3}
                value={form.home.hero_subtitle}
                onChange={(e) => updateHome('hero_subtitle', e.target.value)}
              />
            </Field>
          </div>
        </GlassCard>

        {/* Demais páginas */}
        {PAGES.map(({ key, label, hint }) => (
          <GlassCard key={key}>
            <div className="flex items-center gap-2 mb-1.5">
              <Type className="h-4 w-4 text-mint" />
              <h3 className="font-display text-[17px] font-medium text-fg">{label}</h3>
            </div>
            <p className="text-[12px] text-dim mb-5">{hint}</p>
            <div className="space-y-4">
              <Field label="Tagline pequena (mono uppercase)">
                <input
                  className="input-mint"
                  value={form[key].eyebrow}
                  onChange={(e) => updateHero(key, 'eyebrow', e.target.value)}
                />
              </Field>
              <Field label="Título principal" hint={HIGHLIGHT_HINT}>
                <textarea
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                  rows={2}
                  value={form[key].title}
                  onChange={(e) => updateHero(key, 'title', e.target.value)}
                />
              </Field>
              <Field label="Subtítulo / descrição">
                <textarea
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                  rows={3}
                  value={form[key].subtitle}
                  onChange={(e) => updateHero(key, 'subtitle', e.target.value)}
                />
              </Field>
            </div>
          </GlassCard>
        ))}
      </div>
    </>
  )
}
