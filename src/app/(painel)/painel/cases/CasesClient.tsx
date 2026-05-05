'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Briefcase } from 'lucide-react'
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field } from '@/components/painel/ui'
import { createCase, updateCase, deleteCase } from '@/lib/actions/content-actions'

type Case = Record<string, any>

const EMPTY_FORM = {
  title: '',
  company: '',
  sector: '',
  challenge: '',
  solution: '',
  result: '',
  metrics: '',
  status: 'draft',
}

export default function CasesClient({ initialCases }: { initialCases: Case[] }) {
  const [cases, setCases] = useState<Case[]>(initialCases)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Case | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(c: Case) {
    setEditing(c)
    setForm({
      title: c.title ?? '',
      company: c.company ?? '',
      sector: c.sector ?? '',
      challenge: c.challenge ?? '',
      solution: c.solution ?? '',
      result: c.result ?? '',
      metrics: c.metrics ?? '',
      status: c.status ?? 'draft',
    })
    setOpen(true)
  }

  function handleSubmit() {
    startTransition(async () => {
      if (editing) {
        await updateCase(editing.id, form)
        setCases(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c))
      } else {
        await createCase(form)
        setCases(prev => [{ id: Date.now().toString(), ...form, createdAt: new Date().toISOString() }, ...prev])
      }
      setOpen(false)
    })
  }

  function handleDelete(c: Case) {
    if (!window.confirm(`Deletar case "${c.title}"?`)) return
    startTransition(async () => {
      await deleteCase(c.id)
      setCases(prev => prev.filter(x => x.id !== c.id))
    })
  }

  return (
    <>
      <PageHeader
        eyebrow="Conteúdo"
        title="Cases de Sucesso"
        description="Gerencie os casos de sucesso e resultados dos clientes."
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px]"
            style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
          >
            <Plus className="h-4 w-4" /> Novo Case
          </button>
        }
      />

      {cases.length === 0 ? (
        <EmptyState
          title="Nenhum case ainda"
          description="Adicione o primeiro case de sucesso."
          icon={Briefcase}
          action={
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px]"
              style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
            >
              <Plus className="h-4 w-4" /> Criar Case
            </button>
          }
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Título</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim hidden md:table-cell">Empresa</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim hidden lg:table-cell">Setor</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Status</th>
                  <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim hidden lg:table-cell">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {cases.map(c => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid hsl(0 0% 100% / 0.04)' }}
                    className="hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-[13px] font-medium max-w-[200px] truncate" style={{ color: 'hsl(0 0% 91%)' }}>
                      {c.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-[13px] hidden md:table-cell" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                      {c.company || '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-dim hidden lg:table-cell">
                      {c.sector || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status ?? 'draft'} />
                    </td>
                    <td className="px-4 py-3 text-[12px] text-dim hidden lg:table-cell">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-md transition hover:bg-white/[0.06]"
                          style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 rounded-md transition hover:bg-red-500/10"
                          style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                          title="Deletar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 4% / 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="glass rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ borderColor: 'hsl(158 92% 70% / 0.15)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-[20px] font-semibold" style={{ color: 'hsl(0 0% 91%)', letterSpacing: '-0.02em' }}>
                {editing ? 'Editar Case' : 'Novo Case'}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md transition hover:bg-white/[0.06]"
                style={{ color: 'hsl(0 0% 91% / 0.5)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Título do Case">
                <input
                  className="w-full h-10 px-3 rounded-lg text-[13px]"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Como a Acme cresceu 3x em 6 meses"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Empresa">
                  <input
                    className="w-full h-10 px-3 rounded-lg text-[13px]"
                    style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Nome da empresa"
                  />
                </Field>

                <Field label="Setor">
                  <input
                    className="w-full h-10 px-3 rounded-lg text-[13px]"
                    style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                    value={form.sector}
                    onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                    placeholder="SaaS, E-commerce..."
                  />
                </Field>
              </div>

              <Field label="Desafio">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.challenge}
                  onChange={e => setForm(f => ({ ...f, challenge: e.target.value }))}
                  placeholder="Qual era o problema do cliente..."
                />
              </Field>

              <Field label="Solução">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.solution}
                  onChange={e => setForm(f => ({ ...f, solution: e.target.value }))}
                  placeholder="O que foi implementado..."
                />
              </Field>

              <Field label="Resultado">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.result}
                  onChange={e => setForm(f => ({ ...f, result: e.target.value }))}
                  placeholder="Quais foram os resultados obtidos..."
                />
              </Field>

              <Field label="Métricas" hint="Ex: +180% de leads, 3x ROI, etc.">
                <input
                  className="w-full h-10 px-3 rounded-lg text-[13px]"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.metrics}
                  onChange={e => setForm(f => ({ ...f, metrics: e.target.value }))}
                  placeholder="+180% leads, 3x ROI"
                />
              </Field>

              <Field label="Status">
                <select
                  className="w-full h-10 px-3 rounded-lg text-[13px]"
                  style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.12)', color: 'hsl(0 0% 91%)', outline: 'none' }}
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium"
                style={{ color: 'hsl(0 0% 91% / 0.6)', background: 'hsl(0 0% 100% / 0.04)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !form.title}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] disabled:opacity-50"
                style={{ background: 'hsl(158 92% 70%)', color: 'hsl(194 100% 8%)' }}
              >
                {isPending ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Criar Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
