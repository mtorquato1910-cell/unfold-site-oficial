'use client'

import { useState, useTransition } from 'react'
import { Eye, Trash2, Users, Mail, Building2, MessageCircle } from 'lucide-react'
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field, MintButton } from '@/components/painel/ui'
import { updateLeadStatus, updateLeadNotes, deleteLead } from '@/lib/actions/content-actions'

type Lead = {
  id: string
  nome?: string
  email?: string
  empresa?: string
  cargo?: string
  telefone?: string
  origem?: string
  rd_sync_status?: string
  notes?: string
  createdAt?: string
}

/** Monta o link wa.me a partir do telefone gravado (nacional, com 9). */
function waHref(telefone?: string): string | null {
  if (!telefone) return null
  const digits = telefone.replace(/\D/g, '')
  if (digits.length < 10) return null
  const e164 = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${e164}`
}

/** Exibe o telefone como link de WhatsApp quando presente. */
function PhoneCell({ telefone }: { telefone?: string }) {
  const href = waHref(telefone)
  if (!telefone) return <span style={{ color: 'hsl(0 0% 91% / 0.35)' }}>—</span>
  if (!href) return <span style={{ color: 'hsl(0 0% 91% / 0.7)' }}>{telefone}</span>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 hover:underline"
      style={{ color: 'hsl(158 92% 70%)' }}
      title="Abrir no WhatsApp"
    >
      <MessageCircle className="h-3.5 w-3.5 shrink-0" />
      {telefone}
    </a>
  )
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendente' },
  { value: 'synced', label: 'Sincronizado' },
  { value: 'error', label: 'Erro' },
  { value: 'mock', label: 'Mock' },
]

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Avatar({ nome }: { nome?: string }) {
  const initial = (nome || 'L')[0].toUpperCase()
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold shrink-0"
      style={{ background: 'hsl(158 92% 70% / 0.15)', border: '1px solid hsl(158 92% 70% / 0.25)', color: 'hsl(158 92% 70%)' }}
    >
      {initial}
    </div>
  )
}

export default function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = filterStatus === 'all'
    ? leads
    : leads.filter((l) => l.rd_sync_status === filterStatus)

  function openDetail(lead: Lead) {
    setSelectedLead(lead)
    setNotes(lead.notes || '')
    setSuccessMsg('')
    setErrorMsg('')
  }

  function closeDetail() {
    setSelectedLead(null)
    setSuccessMsg('')
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setErrorMsg('')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function showError(msg: string) {
    setSuccessMsg('')
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(''), 5000)
  }

  function describeError(e: unknown): string {
    const raw = e instanceof Error ? e.message : String(e)
    if (raw.includes('FORBIDDEN')) return 'Você não tem permissão para esta ação.'
    if (raw.includes('UNAUTHENTICATED')) return 'Sessão expirada. Faça login novamente.'
    return 'Não foi possível completar a operação. Tente novamente.'
  }

  function handleStatusChange(id: string, newStatus: string) {
    const prevStatus = leads.find((l) => l.id === id)?.rd_sync_status
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, rd_sync_status: newStatus } : l))
    startTransition(async () => {
      try {
        await updateLeadStatus(id, newStatus)
      } catch (e) {
        setLeads((prev) => prev.map((l) => l.id === id ? { ...l, rd_sync_status: prevStatus } : l))
        showError(describeError(e))
      }
    })
  }

  function handleSaveNotes() {
    if (!selectedLead) return
    startTransition(async () => {
      try {
        await updateLeadNotes(selectedLead.id, notes)
        setLeads((prev) => prev.map((l) => l.id === selectedLead.id ? { ...l, notes } : l))
        setSelectedLead((prev) => prev ? { ...prev, notes } : prev)
        showSuccess('Notas salvas!')
      } catch (e) {
        showError(describeError(e))
      }
    })
  }

  function handleDelete(id: string) {
    if (!window.confirm('Remover este lead?')) return
    startTransition(async () => {
      try {
        await deleteLead(id)
        setLeads((prev) => prev.filter((l) => l.id !== id))
        if (selectedLead?.id === id) closeDetail()
      } catch (e) {
        showError(describeError(e))
      }
    })
  }

  return (
    <>
      <PageHeader
        title="Leads"
        description="Contatos capturados pelo site"
        actions={
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg px-3 py-2 text-[13px] font-medium outline-none"
            style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
          >
            <option value="all">Todos</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        }
      />

      {errorMsg && (
        <div className="mb-4 rounded-lg px-4 py-3 text-[13px]"
             style={{ background: 'hsl(0 70% 50% / 0.12)', border: '1px solid hsl(0 70% 60% / 0.3)', color: 'hsl(0 80% 80%)' }}>
          {errorMsg}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum lead encontrado" description="Leads captados pelo formulário aparecerão aqui." icon={Users} />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                  {['Lead', 'Email', 'Telefone', 'Empresa', 'Cargo', 'Origem', 'Status CRM', 'Data', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: 'hsl(0 0% 91% / 0.42)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr key={lead.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid hsl(158 92% 70% / 0.06)' : undefined }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nome={lead.nome} />
                        <span className="font-medium" style={{ color: 'hsl(0 0% 91%)' }}>{lead.nome || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>{lead.email || '—'}</td>
                    <td className="px-4 py-3 text-[12px]"><PhoneCell telefone={lead.telefone} /></td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>{lead.empresa || '—'}</td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'hsl(0 0% 91% / 0.6)' }}>{lead.cargo || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider"
                            style={{ color: 'hsl(217 93% 78%)' }}>{lead.origem || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.rd_sync_status || 'pending'}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="rounded-md px-2 py-1 text-[11px] font-mono uppercase tracking-wider outline-none"
                        style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'hsl(0 0% 91% / 0.5)' }}>{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetail(lead)} className="rounded-lg p-1.5 transition"
                                style={{ color: 'hsl(158 92% 70% / 0.7)' }} title="Ver detalhes">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} className="rounded-lg p-1.5 transition"
                                style={{ color: 'hsl(0 0% 91% / 0.35)' }} title="Remover">
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

      {/* Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'hsl(194 100% 8% / 0.85)', backdropFilter: 'blur(8px)' }}
             onClick={(e) => e.target === e.currentTarget && closeDetail()}>
          <div className="w-full max-w-lg rounded-2xl p-6"
               style={{ background: 'hsl(197 100% 10%)', border: '1px solid hsl(158 92% 70% / 0.15)' }}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1" style={{ color: 'hsl(158 92% 70% / 0.8)' }}>Lead</p>
                <h3 className="font-display text-[20px] font-semibold" style={{ color: 'hsl(0 0% 91%)' }}>{selectedLead.nome}</h3>
              </div>
              <button onClick={closeDetail} style={{ color: 'hsl(0 0% 91% / 0.5)' }}>✕</button>
            </div>
            <div className="space-y-2 mb-5 text-[13px]">
              {[
                { label: 'Email', value: selectedLead.email },
                { label: 'Empresa', value: selectedLead.empresa },
                { label: 'Cargo', value: selectedLead.cargo },
                { label: 'Origem', value: selectedLead.origem },
                { label: 'Status CRM', value: selectedLead.rd_sync_status },
                { label: 'Data', value: formatDate(selectedLead.createdAt) },
              ].filter(f => f.value).map(({ label, value }) => (
                <div key={label} className="flex gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] w-24 shrink-0 pt-0.5"
                        style={{ color: 'hsl(0 0% 91% / 0.42)' }}>{label}</span>
                  <span style={{ color: 'hsl(0 0% 91% / 0.85)' }}>{value}</span>
                </div>
              ))}
              <div className="flex gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] w-24 shrink-0 pt-0.5"
                      style={{ color: 'hsl(0 0% 91% / 0.42)' }}>Telefone</span>
                <PhoneCell telefone={selectedLead.telefone} />
              </div>
            </div>
            <Field label="Notas internas">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Adicione observações sobre este lead..."
                className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none resize-none"
                style={{ background: 'hsl(194 100% 8%)', border: '1px solid hsl(158 92% 70% / 0.15)', color: 'hsl(0 0% 91%)' }}
              />
            </Field>
            {successMsg && (
              <p className="mt-2 text-[12px]" style={{ color: 'hsl(158 92% 70%)' }}>{successMsg}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeDetail} className="px-4 py-2 rounded-lg text-[13px]"
                      style={{ color: 'hsl(0 0% 91% / 0.6)', background: 'hsl(0 0% 100% / 0.05)' }}>
                Fechar
              </button>
              <MintButton onClick={handleSaveNotes} disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar notas'}
              </MintButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
