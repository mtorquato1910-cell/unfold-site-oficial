'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { LeadForm } from './LeadForm'
import type { PerfilEleitoral } from '../_lib/perfil'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string
  onUnlock: (data: { perfil: PerfilEleitoral; emailHash?: string; leadId?: string }) => void
}

/** Modal de cadastro do gate (RF-10..RF-13). Fecha por X ou ESC; não fecha ao clicar fora. */
export function LeadModal({ open, onOpenChange, message, onUnlock }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Identidade do guia (RF-11): navy, cantos suaves, largura 440px / 92% mobile.
        // Altura limitada à viewport (dvh acompanha a barra do navegador mobile) com
        // scroll interno — em telas baixas/celular o formulário inteiro fica acessível.
        className="w-[92vw] max-w-[440px] max-h-[90dvh] overflow-y-auto overscroll-contain gap-4 rounded-[20px] border-0 p-5 sm:gap-5 sm:p-8 motion-reduce:!animate-none motion-reduce:!transition-none"
        style={{ background: '#001E29', color: '#E7E7E7' }}
        // RF-13: só X ou ESC fecham — clicar fora não fecha (frustração controlada).
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="gap-2 text-left">
          <span
            className="text-xs uppercase tracking-[0.18em]"
            style={{ color: '#6DF9C6', fontFamily: 'var(--font-guia-mono)' }}
          >
            Acesso completo
          </span>
          <DialogTitle
            className="text-[26px] font-bold leading-tight"
            style={{ color: '#E7E7E7', fontFamily: 'var(--font-guia-display)' }}
          >
            Continue a leitura
          </DialogTitle>
          <DialogDescription
            className="text-[15px] leading-relaxed"
            style={{ color: 'rgba(231,231,231,0.75)', fontFamily: 'var(--font-guia-body)' }}
          >
            {message}
          </DialogDescription>
        </DialogHeader>

        <LeadForm onUnlock={onUnlock} />

        {/* Marcas Unfold × Feat.Work (RF-12) */}
        <div
          className="flex items-center justify-center gap-3 border-t pt-4 text-sm"
          style={{ borderColor: 'rgba(231,231,231,0.12)', fontFamily: 'var(--font-guia-display)' }}
        >
          <span className="font-semibold tracking-wide" style={{ color: '#E7E7E7' }}>
            UNFOLD
          </span>
          <span style={{ width: 1, height: 16, background: 'rgba(109,249,198,0.5)' }} />
          <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: '#E7E7E7' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00E649' }} />
            Feat.Work
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
