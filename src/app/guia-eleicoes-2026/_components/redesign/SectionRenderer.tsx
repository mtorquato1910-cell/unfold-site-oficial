import type { GuiaSection, GuiaBlock } from '../../_content/guia-data'
import { Reveal } from './Reveal'
import { StatCounter } from './StatCounter'
import { DataChart } from './DataChart'
import { Timeline, Funnel, ComparisonTable, SeverityTable, QuoteBlock } from './StaticBlocks'

/**
 * Renderiza uma seção do guia a partir do modelo estruturado (guia-data.ts).
 * Substitui a "folha A4" por uma seção fluida dark com SectionDivider,
 * scroll reveal e os blocos de dado (stats, highlights, callouts, prosa).
 */
export function SectionRenderer({ sections }: { sections: GuiaSection[] }) {
  return (
    <>
      {sections.map((s) => (
        <section
          key={s.id}
          id={s.id}
          className={`r-section${s.intro ? ' r-intro' : ''}`}
          data-surface={s.surface ?? 'base'}
        >
          <div className="r-container">
            <Reveal>
              <SectionDivider section={s} />
            </Reveal>
            {s.blocks.map((b, i) => (
              <BlockRenderer key={i} block={b} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

function SectionDivider({ section }: { section: GuiaSection }) {
  return (
    <header className="r-divider">
      {section.numeral && (
        <span className="r-numeral" aria-hidden="true">
          {section.numeral}
        </span>
      )}
      {(section.overline || section.parte) && (
        <p className="r-overline">{section.overline ?? section.parte}</p>
      )}
      <h2 className="r-title">{section.titulo}</h2>
      {section.subtitulo && <p className="r-subtitle">{section.subtitulo}</p>}
    </header>
  )
}

function BlockRenderer({ block }: { block: GuiaBlock }) {
  switch (block.kind) {
    case 'stats':
      return (
        <Reveal stagger className="r-stat-grid">
          {block.items.map((it, i) => (
            <article key={i} className="r-stat-card">
              <StatCounter value={it.value} />
              <p className="r-stat-label" dangerouslySetInnerHTML={{ __html: it.label }} />
              <p className="r-stat-fonte">{it.fonte}</p>
            </article>
          ))}
        </Reveal>
      )

    case 'highlight':
      return (
        <div>
          {block.items.map((it, i) => (
            <Reveal key={i} as="article" className="r-highlight">
              <StatCounter value={it.value} className="r-highlight-num" />
              <div>
                <p className="r-highlight-texto" dangerouslySetInnerHTML={{ __html: it.texto }} />
                <p className="r-highlight-fonte">{it.fonte}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )

    case 'callout':
      return (
        <Reveal as="aside" className="r-callout">
          <p dangerouslySetInnerHTML={{ __html: block.html }} />
        </Reveal>
      )

    case 'prose':
      return (
        <Reveal className="r-prose">
          <div dangerouslySetInnerHTML={{ __html: block.html }} />
        </Reveal>
      )

    case 'chart':
      return <DataChart titulo={block.titulo} data={block.data} fonte={block.fonte} />

    case 'timeline':
      return <Timeline nodes={block.nodes} fonte={block.fonte} />

    case 'funnel':
      return <Funnel steps={block.steps} />

    case 'compare':
      return (
        <ComparisonTable
          variante={block.variante}
          rotulo={block.rotulo}
          itens={block.itens}
          fonte={block.fonte}
        />
      )

    case 'severity':
      return <SeverityTable itens={block.itens} fonte={block.fonte} />

    case 'quote':
      return <QuoteBlock texto={block.texto} fonte={block.fonte} />

    default:
      return null
  }
}
