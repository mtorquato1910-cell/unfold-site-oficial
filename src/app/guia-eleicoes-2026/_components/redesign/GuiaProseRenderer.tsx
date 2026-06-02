import type { GuiaProseSection } from '../../_content/guia-prose-content'
import { Reveal } from './Reveal'

/**
 * Renderiza o conteúdo completo do guia (migrado de guia-prose-content.ts) como
 * seções fluidas dark. O HTML preserva o conteúdo 1:1; o prose-guia-dark.css
 * re-tematiza as classes do material original para o tema dossiê tech.
 */
export function GuiaProseRenderer({ sections }: { sections: GuiaProseSection[] }) {
  return (
    <>
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="r-section" data-surface={s.surface}>
          <div className="r-container guia-prose">
            <Reveal>
              <div dangerouslySetInnerHTML={{ __html: s.html }} />
            </Reveal>
          </div>
        </section>
      ))}
    </>
  )
}
