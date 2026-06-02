import type { CSSProperties } from 'react'
import type {
  TimelineNode,
  FunnelStep,
  CompareItem,
  SeverityItem,
  SeverityLevel,
} from '../../_content/guia-data'
import { Reveal } from './Reveal'

/* ---- Timeline (calendário) ----------------------------------------------- */
export function Timeline({ nodes, fonte }: { nodes: TimelineNode[]; fonte?: string }) {
  return (
    <div className="r-timeline">
      <ol className="r-timeline-track">
        {nodes.map((n, i) => (
          <Reveal as="li" key={i} className={`r-tl-item${n.destaque ? ' is-destaque' : ''}`}>
            <span className="r-tl-dot" aria-hidden="true" />
            <span className="r-tl-data">{n.data}</span>
            <span className="r-tl-body">
              <span className="r-tl-evento">{n.evento}</span>
              {n.obs && <span className="r-tl-obs">{n.obs}</span>}
            </span>
          </Reveal>
        ))}
      </ol>
      {fonte && <p className="r-block-fonte">{fonte}</p>}
    </div>
  )
}

/* ---- Funnel (6 etapas) --------------------------------------------------- */
export function Funnel({ steps }: { steps: FunnelStep[] }) {
  return (
    <div className="r-funnel">
      {steps.map((s, i) => (
        <Reveal as="article" key={i} className="r-funnel-step" style={{ '--fn-i': i } as CSSProperties}>
          <span className="r-funnel-tag">{s.tag}</span>
          <div className="r-funnel-main">
            <h3 className="r-funnel-nome">{s.nome}</h3>
            <p className="r-funnel-desc">{s.desc}</p>
          </div>
          <div className="r-funnel-canal">
            <span className="r-funnel-canal-label">Canal · conteúdo</span>
            <p>{s.canal}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

/* ---- ComparisonTable (permitido / vedado) -------------------------------- */
export function ComparisonTable({
  variante,
  rotulo,
  itens,
  fonte,
}: {
  variante: 'permitido' | 'vedado'
  rotulo: string
  itens: CompareItem[]
  fonte?: string
}) {
  const icon = variante === 'permitido' ? '✓' : '✕'
  return (
    <div className={`r-compare is-${variante}`}>
      <Reveal stagger className="r-compare-list">
        {itens.map((it, i) => (
          <article key={i} className="r-compare-row">
            <span className="r-compare-badge" aria-hidden="true">
              {icon}
            </span>
            <div>
              <h3 className="r-compare-termo">
                <span className="sr-only">{rotulo}: </span>
                {it.termo}
              </h3>
              <p className="r-compare-detalhe">{it.detalhe}</p>
            </div>
          </article>
        ))}
      </Reveal>
      {fonte && <p className="r-block-fonte">{fonte}</p>}
    </div>
  )
}

/* ---- SeverityTable (escala MULTA < CASSAÇÃO < CRIME) --------------------- */
const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  multa: 'Multa',
  cassacao: 'Multa + Cassação',
  crime: 'Cassação + Crime',
}

export function SeverityTable({ itens, fonte }: { itens: SeverityItem[]; fonte?: string }) {
  return (
    <div className="r-severity">
      <Reveal stagger className="r-severity-list">
        {itens.map((it, i) => (
          <article key={i} className={`r-sev-row is-${it.nivel}`}>
            <div className="r-sev-head">
              <h3 className="r-sev-pratica">{it.pratica}</h3>
              <span className={`r-sev-tag is-${it.nivel}`}>{SEVERITY_LABEL[it.nivel]}</span>
            </div>
            <p className="r-sev-consequencia">{it.consequencia}</p>
          </article>
        ))}
      </Reveal>
      {fonte && <p className="r-block-fonte">{fonte}</p>}
    </div>
  )
}

/* ---- QuoteBlock (citação de lei / autor) --------------------------------- */
export function QuoteBlock({ texto, fonte }: { texto: string; fonte: string }) {
  return (
    <Reveal as="figure" className="r-quote">
      <blockquote className="r-quote-texto">{texto}</blockquote>
      <figcaption className="r-quote-fonte">{fonte}</figcaption>
    </Reveal>
  )
}
