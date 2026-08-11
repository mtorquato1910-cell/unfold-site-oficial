import type { Metadata } from 'next'
import { getLegalContent } from '@/lib/legal-pages'
import RichTextRenderer from '@/components/RichTextRenderer'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos e condições de uso dos serviços e plataformas da Unfold Growth.',
  alternates: { canonical: '/termos' },
}

export const revalidate = 60

export default async function TermosPage() {
  const legal = await getLegalContent()

  return (
    <main className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-24 md:pt-40">
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-8">Termos de Uso</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/70">
        <p className="text-sm text-foreground/40">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        {legal.termos_de_uso ? (
          <RichTextRenderer data={legal.termos_de_uso} />
        ) : (
          <FallbackTermos />
        )}
      </div>
    </main>
  )
}

function FallbackTermos() {
  return (
    <>
        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">1. Aceitação dos termos</h2>
          <p>Ao utilizar os serviços da Unfold Growth, você concorda com estes termos de uso. Se não concordar, não utilize os serviços.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">2. Serviços oferecidos</h2>
          <p>A Unfold Growth oferece diagnóstico de maturidade comercial, ferramentas de análise e conteúdo educacional sobre geração de demanda B2B. As ferramentas gratuitas têm caráter informativo e não constituem consultoria formal.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">3. Uso responsável</h2>
          <p>Você concorda em utilizar os serviços apenas para fins lícitos e compatíveis com estes termos. É proibido reproduzir, distribuir ou modificar o conteúdo sem autorização prévia.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">4. Limitação de responsabilidade</h2>
          <p>Os resultados das ferramentas (Diagnóstico, Calculadora) são projeções baseadas nos dados fornecidos e não constituem garantia de resultados. A Unfold Growth não se responsabiliza por decisões tomadas com base nestas projeções.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">5. Propriedade intelectual</h2>
          <p>Todo o conteúdo, metodologia UGS, marca e software são de propriedade exclusiva da Unfold Growth. Reprodução não autorizada sujeita a medidas legais.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">6. Foro</h2>
          <p>Fica eleito o foro da Comarca de São Paulo/SP para dirimir controvérsias oriundas destes termos.</p>
        </section>
        <p className="text-xs text-foreground/40 italic">
          Você pode editar este texto pelo painel admin (Configurações avançadas Payload &gt; Site Settings &gt; aba Legal).
        </p>
    </>
  )
}
