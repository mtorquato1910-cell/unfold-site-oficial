'use client'

import { useState, useTransition } from 'react'
import { Settings } from 'lucide-react'
import { PageHeader, GlassCard, Field, MintButton, SectionDivider } from '@/components/painel/ui'
import { updateSiteSettings } from '@/lib/actions/content-actions'

type SettingsForm = {
  siteTitle: string
  metaDescription: string
  contactEmail: string
  whatsapp: string
  address: string
  linkedin: string
  instagram: string
}

function inputStyle(focused?: boolean): React.CSSProperties {
  return {
    background: 'hsl(194 100% 8%)',
    border: `1px solid ${focused ? 'hsl(158 92% 70% / 0.4)' : 'hsl(158 92% 70% / 0.15)'}`,
    color: 'hsl(0 0% 91%)',
    outline: 'none',
    transition: 'border-color 0.15s',
  }
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-lg px-3 py-2.5 text-[13px]"
        style={inputStyle(focused)}
      />
    </Field>
  )
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  rows?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <Field label={label} hint={hint}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-lg px-3 py-2.5 text-[13px] resize-none"
        style={inputStyle(focused)}
      />
    </Field>
  )
}

export default function SettingsClient({ initialData }: { initialData: Record<string, any> }) {
  const [form, setForm] = useState<SettingsForm>({
    siteTitle: initialData.siteTitle || '',
    metaDescription: initialData.metaDescription || '',
    contactEmail: initialData.contactEmail || '',
    whatsapp: initialData.whatsapp || '',
    address: initialData.address || '',
    linkedin: initialData.linkedin || '',
    instagram: initialData.instagram || '',
  })
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function set(key: keyof SettingsForm) {
    return (value: string) => setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave() {
    setErrorMsg('')
    startTransition(async () => {
      try {
        await updateSiteSettings(form)
        setSuccessMsg('Configurações salvas com sucesso!')
        setTimeout(() => setSuccessMsg(''), 3000)
      } catch (err: any) {
        setErrorMsg(err?.message || 'Erro ao salvar configurações.')
        setTimeout(() => setErrorMsg(''), 4000)
      }
    })
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Configurações do Site"
        description="Gerencie as configurações globais, SEO e redes sociais."
        actions={
          <MintButton onClick={handleSave} disabled={isPending}>
            <Settings className="h-4 w-4" />
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </MintButton>
        }
      />

      {successMsg && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-[13px] font-medium"
          style={{ background: 'hsl(158 92% 70% / 0.1)', color: 'hsl(158 92% 70%)', border: '1px solid hsl(158 92% 70% / 0.2)' }}
        >
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          className="mb-4 rounded-lg px-4 py-2.5 text-[13px] font-medium"
          style={{ background: 'hsl(0 84% 60% / 0.1)', color: '#f87171', border: '1px solid hsl(0 84% 60% / 0.2)' }}
        >
          {errorMsg}
        </div>
      )}

      <div className="max-w-2xl space-y-0">
        {/* SEO */}
        <GlassCard>
          <SectionDivider label="SEO" />
          <div className="space-y-4">
            <TextField
              label="Título do Site"
              value={form.siteTitle}
              onChange={set('siteTitle')}
              placeholder="Unfold Growth — Growth Intelligence"
              hint="Exibido na aba do navegador e resultados de busca"
            />
            <TextareaField
              label="Meta Description"
              value={form.metaDescription}
              onChange={set('metaDescription')}
              placeholder="Descrição resumida do site para mecanismos de busca..."
              hint="Máximo 160 caracteres recomendado"
              rows={3}
            />
          </div>
        </GlassCard>

        {/* Contato */}
        <GlassCard className="mt-4">
          <SectionDivider label="Contato" />
          <div className="space-y-4">
            <TextField
              label="Email de Contato"
              value={form.contactEmail}
              onChange={set('contactEmail')}
              placeholder="contato@unfoldgrowth.com"
            />
            <TextField
              label="WhatsApp"
              value={form.whatsapp}
              onChange={set('whatsapp')}
              placeholder="+55 11 99999-9999"
              hint="Número com DDI e DDD"
            />
            <TextField
              label="Endereço"
              value={form.address}
              onChange={set('address')}
              placeholder="São Paulo, SP — Brasil"
            />
          </div>
        </GlassCard>

        {/* Redes Sociais */}
        <GlassCard className="mt-4">
          <SectionDivider label="Redes Sociais" />
          <div className="space-y-4">
            <TextField
              label="LinkedIn"
              value={form.linkedin}
              onChange={set('linkedin')}
              placeholder="https://linkedin.com/company/unfoldgrowth"
            />
            <TextField
              label="Instagram"
              value={form.instagram}
              onChange={set('instagram')}
              placeholder="https://instagram.com/unfoldgrowth"
            />
          </div>
        </GlassCard>

        <div className="mt-6 flex justify-end">
          <MintButton onClick={handleSave} disabled={isPending}>
            <Settings className="h-4 w-4" />
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </MintButton>
        </div>
      </div>
    </>
  )
}
