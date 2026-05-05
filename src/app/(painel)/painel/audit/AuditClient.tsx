'use client'

import { useState } from 'react'
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader, GlassCard, EmptyState } from '@/components/painel/ui'

type AuditLog = {
  id: string
  action?: string
  userEmail?: string
  user?: { email?: string }
  collection?: string
  docId?: string
  documentId?: string
  createdAt?: string
}

const PAGE_SIZE = 20

function formatDateTime(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ActionBadge({ action }: { action?: string }) {
  const a = (action || '').toLowerCase()
  let style: React.CSSProperties = { background: 'hsl(0 0% 91% / 0.08)', color: 'hsl(0 0% 91% / 0.6)', border: '1px solid hsl(0 0% 91% / 0.12)' }
  if (a.includes('create') || a.includes('creat')) {
    style = { background: 'hsl(158 92% 70% / 0.12)', color: 'hsl(158 92% 70%)', border: '1px solid hsl(158 92% 70% / 0.25)' }
  } else if (a.includes('update') || a.includes('edit')) {
    style = { background: 'hsl(217 93% 78% / 0.12)', color: 'hsl(217 93% 78%)', border: '1px solid hsl(217 93% 78% / 0.25)' }
  } else if (a.includes('delete') || a.includes('remov')) {
    style = { background: 'hsl(0 84% 60% / 0.1)', color: '#f87171', border: '1px solid hsl(0 84% 60% / 0.2)' }
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
      style={style}
    >
      {action || '—'}
    </span>
  )
}

export default function AuditClient({ initialLogs }: { initialLogs: AuditLog[] }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(initialLogs.length / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const paginated = initialLogs.slice(start, start + PAGE_SIZE)

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Log de Auditoria"
        description={`${initialLogs.length} registro${initialLogs.length !== 1 ? 's' : ''} de atividade`}
      />

      {initialLogs.length === 0 ? (
        <EmptyState
          title="Nenhum log de auditoria"
          description="Ações realizadas no painel serão registradas aqui."
          icon={Activity}
        />
      ) : (
        <>
          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid hsl(158 92% 70% / 0.1)' }}>
                    {['Ação', 'Usuário', 'Collection', 'Doc ID', 'Data / Hora'].map((h) => (
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
                  {paginated.map((log, i) => {
                    const email = log.userEmail || log.user?.email || '—'
                    const docId = log.docId || log.documentId || '—'
                    return (
                      <tr
                        key={log.id}
                        className="transition-colors"
                        style={{ borderBottom: i < paginated.length - 1 ? '1px solid hsl(158 92% 70% / 0.06)' : undefined }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(158 92% 70% / 0.03)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        <td className="px-4 py-3">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.7)' }}>
                          {email}
                        </td>
                        <td className="px-4 py-3">
                          {log.collection ? (
                            <span
                              className="font-mono text-[11px]"
                              style={{ color: 'hsl(217 93% 78%)' }}
                            >
                              {log.collection}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="font-mono text-[11px] truncate max-w-[120px] block"
                            style={{ color: 'hsl(0 0% 91% / 0.5)' }}
                            title={docId}
                          >
                            {docId !== '—' && docId.length > 12 ? docId.slice(0, 12) + '…' : docId}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'hsl(0 0% 91% / 0.5)' }}>
                          {formatDateTime(log.createdAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[12px]" style={{ color: 'hsl(0 0% 91% / 0.5)' }}>
                Página {page} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition disabled:opacity-40"
                  style={{
                    background: 'hsl(197 100% 10%)',
                    border: '1px solid hsl(158 92% 70% / 0.15)',
                    color: 'hsl(0 0% 91% / 0.8)',
                  }}
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition disabled:opacity-40"
                  style={{
                    background: 'hsl(197 100% 10%)',
                    border: '1px solid hsl(158 92% 70% / 0.15)',
                    color: 'hsl(0 0% 91% / 0.8)',
                  }}
                >
                  Próximo <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
