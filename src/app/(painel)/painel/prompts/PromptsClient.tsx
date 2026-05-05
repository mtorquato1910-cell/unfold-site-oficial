'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Bot } from 'lucide-react'
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field, MintButton } from '@/components/painel/ui'
import { createPrompt, updatePrompt, deletePrompt } from '@/lib/actions/prompts-actions'

type Prompt = {
  id: string
  name?: string
  type?: string
  template?: string
  active?: boolean
  createdAt?: string
}

type FormData = {
  name: string
  type: string
  template: string
  active: boolean
}

const EMPTY_FORM: FormData = { name: '', type: '', template: '', active: true }

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PromptsClient({ initialPrompts }: { initialPrompts: Prompt[] }) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Prompt | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(prompt: Prompt) {
    setEditing(prompt)
    setForm({
      name: prompt.name || '',
      type: prompt.type || '',
      template: prompt.template || '',
      active: prompt.active !== false,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleSubmit() {
    const data = { ...form }
    startTransition(async () => {
      if (editing) {
        await updatePrompt(editing.id, data)
        setPrompts((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...data } : p))
        showSuccess('Prompt atualizado!')
      } else {
        await createPrompt(data)
        setPrompts((prev) => [...prev, { id: Date.now().toString(), ...data }])
        showSuccess('Prompt criado!')
      }
      closeModal()
    })
  }

  function handleDelete(id: string) {
    if (!window.confirm('Remover este prompt permanentemente?')) return
    startTransition(async () => {
      await deletePrompt(id)
      setPrompts((prev) => prev.filter((p) => p.id !== id))
    })
  }

  return (
    <>
      <PageHeader
        title="Prompts de IA"
        description="Templates usados nas chamadas de IA"
        actions={
          <MintButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo prompt
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

      {prompts.length === 0 ? (
        <EmptyState
          title="Nenhum prompt cadastrado"
          description="Crie templates de prompts para geração de insights com IA."
          icon={Bot}
          action={<MintButton onClick={openCreate}><Plus className="h-4 w-4" /> Novo Prompt</MintButton>}
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                  {['Nome', 'Tipo', 'Status', 'Data', 'Ações'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: 'hsl(0 0% 91% / 0.42)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prompts.map((prompt, i) => (
                  <tr
                    key={prompt.id}
                    className="transition-colors"
                    style={{ borderBottom: i < prompts.length - 1 ? '1px solid hsl(158 92% 70% / 0.06)' : undefined }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(158 92% 70% / 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'hsl(0 0% 91%)' }}>
                      {prompt.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {prompt.type ? (
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                          style={{ background: 'hsl(217 93% 78% / 0.1)', color: 'hsl(217 93% 78%)', border: '1px solid hsl(217 93% 78% / 0.2)' }}
                        >
                          {prompt.type}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={prompt.active !== false ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.5)' }}>
                      {formatDate(prompt.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(prompt)}
                          className="rounded-lg p-1.5 transition-colors"
                          style={{ color: 'hsl(158 92% 70% / 0.7)' }}
                          title="Editar"
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(158 92% 70%)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(158 92% 70% / 0.7)')}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prompt.id)}
                          className="rounded-lg p-1.5 transition-colors"
                          style={{ color: 'hsl(0 0% 91% / 0.35)' }}
                          title="Remover"
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(0 0% 91% / 0.35)')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 8% / 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{
              background: 'hsl(197 100% 10%)',
              border: '1px solid hsl(158 92% 70% / 0.15)',
              boxShadow: '0 24px 64px hsl(0 0% 0% / 0.5)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-[18px] font-semibold" style={{ color: 'hsl(0 0% 91%)' }}>
                {editing ? 'Editar Prompt' : 'Novo Prompt'}
              </h3>
              <button onClick={closeModal} style={{ color: 'hsl(0 0% 91% / 0.5)' }}>✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Nome do prompt..."
                    className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                    style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                  />
                </Field>
                <Field label="Tipo">
                  <input
                    type="text"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    placeholder="Ex: insight, diagnostico..."
                    className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                    style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                  />
                </Field>
              </div>

              <Field label="Template">
                <textarea
                  value={form.template}
                  onChange={(e) => setForm((f) => ({ ...f, template: e.target.value }))}
                  rows={10}
                  placeholder="Escreva o template do prompt aqui..."
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none resize-none"
                  style={{
                    background: 'hsl(194 100% 8%)',
                    border: '1px solid hsl(158 92% 70% / 0.15)',
                    color: 'hsl(0 0% 91%)',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
                    fontSize: '12px',
                    lineHeight: '1.6',
                  }}
                />
              </Field>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="prompt-active"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: 'hsl(158 92% 70%)' }}
                />
                <label htmlFor="prompt-active" className="text-[13px]" style={{ color: 'hsl(0 0% 91% / 0.8)' }}>
                  Prompt ativo
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-[13px] font-medium"
                style={{ color: 'hsl(0 0% 91% / 0.6)', background: 'hsl(0 0% 100% / 0.05)' }}
              >
                Cancelar
              </button>
              <MintButton onClick={handleSubmit} disabled={isPending || !form.name.trim()}>
                {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar prompt'}
              </MintButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
