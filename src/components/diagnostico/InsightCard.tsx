import { textoPadrao } from '@/lib/scoring/textos'
import type { CodigoInsight } from '@/lib/scoring/types'

const NUMERAIS = ['❶', '❷', '❸']

interface Props {
  codigo: CodigoInsight
  posicao: 0 | 1 | 2
}

export default function InsightCard({ codigo, posicao }: Props) {
  const texto = textoPadrao(codigo)
  return (
    <article
      data-testid={`insight-${codigo}`}
      className="relative rounded-2xl border border-border bg-card/60 p-7 md:p-8"
    >
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-display text-2xl text-primary tabular-nums" aria-hidden>
          {NUMERAIS[posicao]}
        </span>
        <h3 className="font-display font-bold text-xl leading-tight">
          {texto.titulo}
        </h3>
      </div>
      <p className="text-foreground/85 font-medium mb-3 leading-snug">{texto.resumo}</p>
      <p className="text-foreground/85 text-sm leading-relaxed">{texto.corpo}</p>
    </article>
  )
}
