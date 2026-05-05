'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react'
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field, MintButton } from '@/components/painel/ui'
import { createQuizQuestion, updateQuizQuestion, deleteQuizQuestion } from '@/lib/actions/content-actions'

type QuizQuestion = {
  id: string
  text?: string
  dimension?: string
  type?: string
  weight?: number
  order?: number
  active?: boolean
  createdAt?: string
}

type FormData = {
  text: string
  dimension: string
  type: string
  weight: string
  order: string
  active: boolean
}

const EMPTY_FORM: FormData = {
  text: '',
  dimension: '',
  type: 'scale',
  weight: '1',
  order: '1',
  active: true,
}

function truncate(str?: string, max = 60) {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

export default function QuizClient({ initialQuestions }: { initialQuestions: QuizQuestion[] }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<QuizQuestion | null>(null)
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

  function openEdit(q: QuizQuestion) {
    setEditing(q)
    setForm({
      text: q.text || '',
      dimension: q.dimension || '',
      type: q.type || 'scale',
      weight: String(q.weight ?? 1),
      order: String(q.order ?? 1),
      active: q.active !== false,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleSubmit() {
    const data = {
      text: form.text,
      dimension: form.dimension,
      type: form.type,
      weight: parseFloat(form.weight) || 1,
      order: parseInt(form.order) || 1,
      active: form.active,
    }

    startTransition(async () => {
      if (editing) {
        await updateQuizQuestion(editing.id, data)
        setQuestions((prev) => prev.map((q) => q.id === editing.id ? { ...q, ...data } : q))
        showSuccess('Questão atualizada!')
      } else {
        await createQuizQuestion(data)
        setQuestions((prev) => [...prev, { id: Date.now().toString(), ...data }])
        showSuccess('Questão criada!')
      }
      closeModal()
    })
  }

  function handleDelete(id: string) {
    if (!window.confirm('Remover esta questão permanentemente?')) return
    startTransition(async () => {
      await deleteQuizQuestion(id)
      setQuestions((prev) => prev.filter((q) => q.id !== id))
    })
  }

  return (
    <>
      <PageHeader
        eyebrow="IA & Quiz"
        title="Questões do Quiz"
        description={`${questions.length} questão${questions.length !== 1 ? 'ões' : ''} cadastradas`}
        actions={
          <MintButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nova Questão
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

      {questions.length === 0 ? (
        <EmptyState
          title="Nenhuma questão cadastrada"
          description="Crie questões para o quiz de diagnóstico de maturidade."
          icon={HelpCircle}
          action={<MintButton onClick={openCreate}><Plus className="h-4 w-4" /> Nova Questão</MintButton>}
        />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                  {['Texto', 'Dimensão', 'Tipo', 'Peso', 'Ordem', 'Status', 'Ações'].map((h) => (
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
                {questions.map((q, i) => (
                  <tr
                    key={q.id}
                    className="transition-colors"
                    style={{ borderBottom: i < questions.length - 1 ? '1px solid hsl(158 92% 70% / 0.06)' : undefined }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(158 92% 70% / 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3 max-w-[240px]" style={{ color: 'hsl(0 0% 91%)' }}>
                      {truncate(q.text)}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                      {q.dimension || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                        style={{ background: 'hsl(217 93% 78% / 0.1)', color: 'hsl(217 93% 78%)', border: '1px solid hsl(217 93% 78% / 0.2)' }}
                      >
                        {q.type || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                      {q.weight ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                      {q.order ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={q.active !== false ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(q)}
                          className="rounded-lg p-1.5 transition-colors"
                          style={{ color: 'hsl(158 92% 70% / 0.7)' }}
                          title="Editar"
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(158 92% 70%)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(158 92% 70% / 0.7)')}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
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
            className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{
              background: 'hsl(197 100% 10%)',
              border: '1px solid hsl(158 92% 70% / 0.15)',
              boxShadow: '0 24px 64px hsl(0 0% 0% / 0.5)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-[18px] font-semibold" style={{ color: 'hsl(0 0% 91%)' }}>
                {editing ? 'Editar Questão' : 'Nova Questão'}
              </h3>
              <button onClick={closeModal} style={{ color: 'hsl(0 0% 91% / 0.5)' }}>✕</button>
            </div>

            <div className="space-y-4">
              <Field label="Texto da Questão">
                <textarea
                  value={form.text}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  rows={3}
                  placeholder="Digite a questão..."
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none resize-none"
                  style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                />
              </Field>

              <Field label="Dimensão">
                <input
                  type="text"
                  value={form.dimension}
                  onChange={(e) => setForm((f) => ({ ...f, dimension: e.target.value }))}
                  placeholder="Ex: Estratégia, Dados, Tecnologia..."
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                  style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Tipo">
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                    style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                  >
                    <option value="scale">Scale</option>
                    <option value="multiple">Multiple</option>
                  </select>
                </Field>
                <Field label="Peso">
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                    min={1}
                    max={10}
                    className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                    style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                  />
                </Field>
                <Field label="Ordem">
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                    min={1}
                    className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
                    style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="quiz-active"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: 'hsl(158 92% 70%)' }}
                />
                <label htmlFor="quiz-active" className="text-[13px]" style={{ color: 'hsl(0 0% 91% / 0.8)' }}>
                  Questão ativa
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
              <MintButton onClick={handleSubmit} disabled={isPending || !form.text.trim()}>
                {isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar questão'}
              </MintButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
