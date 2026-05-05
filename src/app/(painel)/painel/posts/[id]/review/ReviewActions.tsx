'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'
import { approvePost, rejectPost } from '@/lib/actions/blog-submit-actions'

export default function ReviewActions({ postId }: { postId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    if (!window.confirm('Aprovar e publicar este post?')) return
    setError(null)
    startTransition(async () => {
      try {
        await approvePost(postId)
        router.push('/admin/posts')
      } catch (err: any) {
        setError(err?.message || 'Falha ao aprovar')
      }
    })
  }

  function handleReject() {
    if (!reason.trim()) return
    setError(null)
    startTransition(async () => {
      try {
        await rejectPost(postId, reason)
        router.push('/admin/posts')
      } catch (err: any) {
        setError(err?.message || 'Falha ao rejeitar')
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium disabled:opacity-50"
          style={{
            background: 'hsl(158 92% 70%)',
            color: 'hsl(194 100% 8%)',
          }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aprovar e publicar
        </button>
        <button
          onClick={() => setRejectOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium"
          style={{
            background: 'hsl(0 70% 60% / 0.10)',
            color: 'hsl(0 70% 80%)',
            border: '1px solid hsl(0 70% 60% / 0.25)',
          }}
        >
          <XCircle className="h-3.5 w-3.5" />
          Rejeitar
        </button>
      </div>

      {error && (
        <div
          className="mt-2 rounded-lg px-3 py-2 text-[12px]"
          style={{
            background: 'hsl(0 70% 60% / 0.10)',
            color: 'hsl(0 70% 80%)',
            border: '1px solid hsl(0 70% 60% / 0.25)',
          }}
        >
          {error}
        </div>
      )}

      {rejectOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(194 100% 4% / 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectOpen(false)
          }}
        >
          <div
            className="glass rounded-2xl p-6 w-full max-w-md"
            style={{ borderColor: 'hsl(158 92% 70% / 0.15)' }}
          >
            <h3 className="font-display text-[18px] font-semibold mb-3 text-fg">Rejeitar submissão</h3>
            <p className="text-[13px] text-dim-2 mb-4">
              O autor receberá um email com o motivo. Seja específico.
            </p>
            <textarea
              rows={5}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Conteúdo com viés comercial; reescreva focando no método."
              className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none input-mint"
              style={{ height: 'auto' }}
            />
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-dim-2 hover:bg-white/[0.04]"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={isPending || !reason.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[13px] disabled:opacity-50"
                style={{ background: 'hsl(0 70% 60%)', color: 'white' }}
              >
                <XCircle className="h-4 w-4" />
                {isPending ? 'Enviando...' : 'Rejeitar e notificar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
