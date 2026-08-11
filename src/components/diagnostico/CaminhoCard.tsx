import { TEXTOS_CAMINHOS } from '@/lib/scoring/textos'
import type { CodigoCaminho } from '@/lib/scoring/types'

const NUMERAIS = ['❶', '❷', '❸']

interface Props {
  codigo: CodigoCaminho
  posicao: 0 | 1 | 2
}

export default function CaminhoCard({ codigo, posicao }: Props) {
  const texto = TEXTOS_CAMINHOS[codigo]
  return (
    <article
      data-testid={`caminho-${codigo}`}
      className="rounded-2xl border border-border bg-card/60 p-7 md:p-8"
    >
      <div className="flex items-baseline gap-4 mb-5">
        <span className="font-display text-2xl text-secondary tabular-nums" aria-hidden>
          {NUMERAIS[posicao]}
        </span>
        <h3 className="font-display font-bold text-xl leading-tight">
          {texto.titulo}
        </h3>
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/70 mb-1.5">
            A alavanca
          </p>
          <p className="text-foreground/80 leading-relaxed">{texto.alavanca}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/70 mb-1.5">
            Por que é prioritário para você
          </p>
          <p className="text-foreground/80 leading-relaxed">{texto.por_que_para_voce}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary/70 mb-1.5">
            Como a Unfold endereça
          </p>
          <p className="text-foreground/80 leading-relaxed">{texto.como_unfold_endereca}</p>
        </div>
      </div>
    </article>
  )
}
