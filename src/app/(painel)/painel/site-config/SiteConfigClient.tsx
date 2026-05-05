'use client'

import { useState, useTransition } from 'react'
import { Save, Mail, Phone, MapPin, Share2, Building2 } from 'lucide-react'
import { PageHeader, GlassCard, Field, MintButton } from '@/components/painel/ui'
import { updateSiteContact, type SiteContactInput } from '@/lib/actions/site-settings-actions'

export default function SiteConfigClient({ initial }: { initial: SiteContactInput }) {
  const [form, setForm] = useState<SiteContactInput>(initial)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        await updateSiteContact(form)
        setSuccess('Configurações salvas e aplicadas no site!')
        setTimeout(() => setSuccess(null), 3000)
      } catch (err: any) {
        setError(err?.message || 'Falha ao salvar')
      }
    })
  }

  function update<K extends keyof SiteContactInput>(key: K, value: SiteContactInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <>
      <PageHeader
        title="Configurações do Site"
        description="Endereço, contato e redes sociais do site público"
        actions={
          <MintButton onClick={handleSave} disabled={isPending}>
            <Save className="h-4 w-4" /> {isPending ? 'Salvando...' : 'Salvar alterações'}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contato */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <Mail className="h-4 w-4 text-mint" />
            <h3 className="font-display text-[17px] font-medium text-fg">Contato</h3>
          </div>
          <div className="space-y-4">
            <Field label="Email de contato visível">
              <input
                type="email"
                className="input-mint"
                value={form.email_contato || ''}
                onChange={(e) => update('email_contato', e.target.value)}
                placeholder="contato@unfoldgrowth.com.br"
              />
            </Field>
            <Field label="Email para notificações internas" hint="Recebe cópias de leads e diagnósticos">
              <input
                type="email"
                className="input-mint"
                value={form.email_notificacoes || ''}
                onChange={(e) => update('email_notificacoes', e.target.value)}
                placeholder="tecnologia@unfoldgrowth.com.br"
              />
            </Field>
            <Field label="Email DPO (LGPD)">
              <input
                type="email"
                className="input-mint"
                value={form.email_dpo || ''}
                onChange={(e) => update('email_dpo', e.target.value)}
                placeholder="dpo@unfoldgrowth.com.br"
              />
            </Field>
          </div>
        </GlassCard>

        {/* Telefone */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <Phone className="h-4 w-4 text-mint" />
            <h3 className="font-display text-[17px] font-medium text-fg">Telefone & WhatsApp</h3>
          </div>
          <div className="space-y-4">
            <Field label="Telefone">
              <input
                className="input-mint"
                value={form.telefone || ''}
                onChange={(e) => update('telefone', e.target.value)}
                placeholder="+55 (11) 99999-9999"
              />
            </Field>
            <Field label="WhatsApp" hint="Com DDI, sem espaços. Ex: +5511999999999">
              <input
                className="input-mint"
                value={form.whatsapp || ''}
                onChange={(e) => update('whatsapp', e.target.value)}
                placeholder="+5511999999999"
              />
            </Field>
          </div>
        </GlassCard>

        {/* Endereço */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="h-4 w-4 text-mint" />
            <h3 className="font-display text-[17px] font-medium text-fg">Endereço & CNPJ</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="CNPJ">
              <input
                className="input-mint"
                value={form.cnpj || ''}
                onChange={(e) => update('cnpj', e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </Field>
            <Field label="Endereço completo" hint="Exibido no rodapé">
              <input
                className="input-mint"
                value={form.endereco || ''}
                onChange={(e) => update('endereco', e.target.value)}
                placeholder="Av. Paulista, 1000 — São Paulo, SP"
              />
            </Field>
          </div>
        </GlassCard>

        {/* Redes Sociais */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Share2 className="h-4 w-4 text-mint" />
            <h3 className="font-display text-[17px] font-medium text-fg">Redes sociais</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="LinkedIn">
              <input
                className="input-mint"
                value={form.linkedin || ''}
                onChange={(e) => update('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/unfold-growth"
              />
            </Field>
            <Field label="Instagram">
              <input
                className="input-mint"
                value={form.instagram || ''}
                onChange={(e) => update('instagram', e.target.value)}
                placeholder="https://instagram.com/unfoldgrowth"
              />
            </Field>
            <Field label="YouTube">
              <input
                className="input-mint"
                value={form.youtube || ''}
                onChange={(e) => update('youtube', e.target.value)}
                placeholder="https://youtube.com/@unfoldgrowth"
              />
            </Field>
            <Field label="Facebook">
              <input
                className="input-mint"
                value={form.facebook || ''}
                onChange={(e) => update('facebook', e.target.value)}
                placeholder="https://facebook.com/unfoldgrowth"
              />
            </Field>
            <Field label="Twitter / X">
              <input
                className="input-mint"
                value={form.twitter || ''}
                onChange={(e) => update('twitter', e.target.value)}
                placeholder="https://x.com/unfoldgrowth"
              />
            </Field>
          </div>
        </GlassCard>
      </div>
    </>
  )
}
