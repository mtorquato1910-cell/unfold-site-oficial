'use client'

import { useState, useTransition } from 'react'
import { Save, Sparkles, BarChart3, Building2, Plus, Trash2 } from 'lucide-react'
import { PageHeader, GlassCard, Field, MintButton } from '@/components/painel/ui'
import {
  updateHomeSettings,
  type HomeSettingsInput,
  type HomeStatInput,
  type HomeLogoInput,
} from '@/lib/actions/home-settings-actions'

type FormState = {
  hero_eyebrow: string
  hero_title: string
  hero_subtitle: string
  hero_cta_primary_label: string
  hero_cta_primary_href: string
  hero_cta_secondary_label: string
  hero_cta_secondary_href: string
  hero_video_url: string
  stats: HomeStatInput[]
  stats_extra_text: string
  client_logos_title: string
  client_logos: HomeLogoInput[]
}

export default function HomeConfigClient({ initial }: { initial: FormState }) {
  const [form, setForm] = useState<FormState>(initial)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addStat() {
    if (form.stats.length >= 6) return
    update('stats', [...form.stats, { prefix: '+', value: 0, suffix: '', label: '' }])
  }

  function updateStat(i: number, field: keyof HomeStatInput, value: any) {
    update(
      'stats',
      form.stats.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    )
  }

  function removeStat(i: number) {
    update(
      'stats',
      form.stats.filter((_, idx) => idx !== i),
    )
  }

  function addLogo() {
    if (form.client_logos.length >= 24) return
    update('client_logos', [...form.client_logos, { name: '', website: '' }])
  }

  function updateLogo(i: number, field: keyof HomeLogoInput, value: any) {
    update(
      'client_logos',
      form.client_logos.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)),
    )
  }

  function removeLogo(i: number) {
    update(
      'client_logos',
      form.client_logos.filter((_, idx) => idx !== i),
    )
  }

  function handleSave() {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        await updateHomeSettings(form as HomeSettingsInput)
        setSuccess('Salvo. Mudanças refletem na home em até 1 minuto.')
        setTimeout(() => setSuccess(null), 4000)
      } catch (err: any) {
        setError(err?.message || 'Falha ao salvar')
      }
    })
  }

  return (
    <>
      <PageHeader
        title="Home — Hero, Stats & Logos"
        description="Edite o que aparece na página inicial sem mexer em código"
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
        {/* Hero */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4 text-mint" />
            <h3 className="font-display text-[17px] font-medium text-fg">Hero (topo da home)</h3>
          </div>
          <div className="space-y-4">
            <Field label="Tagline pequena (mono uppercase)">
              <input
                className="input-mint"
                value={form.hero_eyebrow}
                onChange={(e) => update('hero_eyebrow', e.target.value)}
                placeholder="Growth Intelligence · Geração de demanda"
              />
            </Field>
            <Field
              label="Título principal"
              hint="Use {{primary}}texto{{/primary}} para destacar trecho em mint"
            >
              <textarea
                className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                rows={2}
                style={{ height: 'auto' }}
                value={form.hero_title}
                onChange={(e) => update('hero_title', e.target.value)}
                placeholder="Organizamos crescimento digital em operações com {{primary}}vendas complexas.{{/primary}}"
              />
            </Field>
            <Field label="Subtítulo">
              <textarea
                className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
                rows={3}
                style={{ height: 'auto' }}
                value={form.hero_subtitle}
                onChange={(e) => update('hero_subtitle', e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="CTA primário · texto">
                <input
                  className="input-mint"
                  value={form.hero_cta_primary_label}
                  onChange={(e) => update('hero_cta_primary_label', e.target.value)}
                />
              </Field>
              <Field label="CTA primário · link">
                <input
                  className="input-mint"
                  value={form.hero_cta_primary_href}
                  onChange={(e) => update('hero_cta_primary_href', e.target.value)}
                />
              </Field>
              <Field label="CTA secundário · texto">
                <input
                  className="input-mint"
                  value={form.hero_cta_secondary_label}
                  onChange={(e) => update('hero_cta_secondary_label', e.target.value)}
                />
              </Field>
              <Field label="CTA secundário · link">
                <input
                  className="input-mint"
                  value={form.hero_cta_secondary_href}
                  onChange={(e) => update('hero_cta_secondary_href', e.target.value)}
                />
              </Field>
            </div>
            <Field label="URL do vídeo de fundo (mp4)" hint="Deixe vazio para usar o padrão">
              <input
                className="input-mint"
                value={form.hero_video_url}
                onChange={(e) => update('hero_video_url', e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>
        </GlassCard>

        {/* Stats */}
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-mint" />
              <h3 className="font-display text-[17px] font-medium text-fg">
                Stats do hero ({form.stats.length}/6)
              </h3>
            </div>
            <button
              onClick={addStat}
              disabled={form.stats.length >= 6}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium disabled:opacity-50"
              style={{
                background: 'hsl(158 92% 70% / 0.10)',
                color: 'hsl(158 92% 70%)',
                border: '1px solid hsl(158 92% 70% / 0.25)',
              }}
            >
              <Plus className="h-3 w-3" /> Adicionar stat
            </button>
          </div>
          {form.stats.length === 0 ? (
            <p className="text-[13px] text-dim text-center py-4">Nenhuma stat. Clique em &quot;Adicionar stat&quot;.</p>
          ) : (
            <div className="space-y-3">
              {form.stats.map((stat, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg"
                  style={{ background: 'hsl(0 0% 100% / 0.02)', border: '1px solid hsl(158 92% 70% / 0.10)' }}
                >
                  <input
                    className="input-mint col-span-2"
                    value={stat.prefix || ''}
                    onChange={(e) => updateStat(i, 'prefix', e.target.value)}
                    placeholder="+R$ "
                  />
                  <input
                    type="number"
                    className="input-mint col-span-2"
                    value={stat.value}
                    onChange={(e) => updateStat(i, 'value', parseInt(e.target.value) || 0)}
                  />
                  <input
                    className="input-mint col-span-2"
                    value={stat.suffix || ''}
                    onChange={(e) => updateStat(i, 'suffix', e.target.value)}
                    placeholder="MM"
                  />
                  <input
                    className="input-mint col-span-5"
                    value={stat.label}
                    onChange={(e) => updateStat(i, 'label', e.target.value)}
                    placeholder="Descrição da stat"
                  />
                  <button
                    onClick={() => removeStat(i)}
                    className="icon-btn p-1.5 rounded-md justify-self-end"
                    title="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Field label="Texto extra após os stats" hint="Aparece no final da linha">
              <input
                className="input-mint"
                value={form.stats_extra_text}
                onChange={(e) => update('stats_extra_text', e.target.value)}
                placeholder="Parceiros RD Station, Meta, Kommo"
              />
            </Field>
          </div>
        </GlassCard>

        {/* Client Logos */}
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-mint" />
              <h3 className="font-display text-[17px] font-medium text-fg">
                Logos de clientes ({form.client_logos.length}/24)
              </h3>
            </div>
            <button
              onClick={addLogo}
              disabled={form.client_logos.length >= 24}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium disabled:opacity-50"
              style={{
                background: 'hsl(158 92% 70% / 0.10)',
                color: 'hsl(158 92% 70%)',
                border: '1px solid hsl(158 92% 70% / 0.25)',
              }}
            >
              <Plus className="h-3 w-3" /> Adicionar cliente
            </button>
          </div>

          <div className="mb-4">
            <Field label="Título da seção">
              <input
                className="input-mint"
                value={form.client_logos_title}
                onChange={(e) => update('client_logos_title', e.target.value)}
                placeholder="Empresas que confiam na Unfold"
              />
            </Field>
          </div>

          <p className="text-[12px] text-dim-2 mb-3">
            Para fazer upload de imagem do logo, vá em <strong className="text-fg">Mídia</strong> no menu, faça upload, e cole o ID aqui depois (próxima versão terá seletor visual).
          </p>

          {form.client_logos.length === 0 ? (
            <p className="text-[13px] text-dim text-center py-4">
              Nenhum cliente. Clique em &quot;Adicionar cliente&quot;.
            </p>
          ) : (
            <div className="space-y-2">
              {form.client_logos.map((logo, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg"
                  style={{ background: 'hsl(0 0% 100% / 0.02)', border: '1px solid hsl(158 92% 70% / 0.10)' }}
                >
                  <input
                    className="input-mint col-span-5"
                    value={logo.name}
                    onChange={(e) => updateLogo(i, 'name', e.target.value)}
                    placeholder="Nome do cliente"
                  />
                  <input
                    className="input-mint col-span-6"
                    value={logo.website || ''}
                    onChange={(e) => updateLogo(i, 'website', e.target.value)}
                    placeholder="https://site-do-cliente.com (opcional)"
                  />
                  <button
                    onClick={() => removeLogo(i)}
                    className="icon-btn p-1.5 rounded-md justify-self-end"
                    title="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </>
  )
}
