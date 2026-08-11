/**
 * Seções de conteúdo (H2 + parágrafos + listas) abaixo dos formulários das
 * páginas de conversão (item 1.7/4 da auditoria de SEO — dar corpo de texto e
 * hierarquia de títulos às páginas /diagnostico, /ferramentas, /calculadora,
 * /contato). Renderiza no servidor (bom para SEO). Conteúdo do Ferraz.
 */

export type ConversaoBloco =
  | { tipo: 'p'; texto: string }
  | { tipo: 'lista'; itens: string[] }

export type ConversaoSecao = { titulo: string; blocos: ConversaoBloco[] }

export default function ConversaoContent({ secoes }: { secoes: ConversaoSecao[] }) {
  if (!secoes?.length) return null
  return (
    <section className="pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-10">
        {secoes.map((s, i) => (
          <div key={i}>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-4">{s.titulo}</h2>
            <div className="space-y-4">
              {s.blocos.map((b, j) =>
                b.tipo === 'p' ? (
                  <p key={j} className="text-foreground/70 leading-relaxed">
                    {b.texto}
                  </p>
                ) : (
                  <ul key={j} className="space-y-2.5">
                    {b.itens.map((it, k) => (
                      <li key={k} className="flex gap-3 text-foreground/70 leading-relaxed">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
