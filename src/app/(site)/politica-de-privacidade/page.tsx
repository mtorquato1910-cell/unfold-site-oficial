import type { Metadata } from 'next'
import { getLegalContent } from '@/lib/legal-pages'
import RichTextRenderer from '@/components/RichTextRenderer'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Como a Unfold Growth coleta, usa, armazena e protege seus dados pessoais, quais cookies utilizamos e como exercer seus direitos a qualquer momento.',
  alternates: { canonical: '/politica-de-privacidade' },
}

export const revalidate = 60

export default async function PoliticaPrivacidadePage() {
  const legal = await getLegalContent()
  const dpo = legal.email_dpo || 'privacidade@unfoldgrowth.com.br'

  return (
    <main className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-24 md:pt-40">
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-8">
        Política de Privacidade
      </h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/70">
        <p className="text-sm text-foreground/40">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        {legal.politica_privacidade ? (
          <RichTextRenderer data={legal.politica_privacidade} />
        ) : (
          <>
            <section>
              <h2 className="font-display font-bold text-xl text-foreground mb-3">1. Quem somos</h2>
              <p>
                A Unfold Growth é uma empresa especializada em geração de demanda B2B. Este documento
                descreve como coletamos e tratamos dados pessoais em conformidade com a Lei Geral de
                Proteção de Dados (LGPD — Lei nº 13.709/2018).
              </p>
            </section>
            <section>
              <h2 className="font-display font-bold text-xl text-foreground mb-3">
                2. Dados coletados
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nome, e-mail e dados da empresa (formulários de contato e diagnóstico)</li>
                <li>Dados de comportamento no site (analytics — anonimizado)</li>
                <li>Cookies estritamente necessários e analíticos (mediante consentimento)</li>
              </ul>
            </section>
            <section>
              <h2 className="font-display font-bold text-xl text-foreground mb-3">
                3. Seus direitos (LGPD)
              </h2>
              <p>
                Acesso, correção, exclusão, exportação e revogação. Contato:{' '}
                <a href={`mailto:${dpo}`} className="text-primary hover:underline">
                  {dpo}
                </a>
              </p>
            </section>
            <section>
              <h2 className="font-display font-bold text-xl text-foreground mb-3">4. DPO</h2>
              <p>
                Encarregado de Proteção de Dados:{' '}
                <a href={`mailto:${dpo}`} className="text-primary hover:underline">
                  {dpo}
                </a>
              </p>
            </section>
            <p className="text-xs text-foreground/40 italic">
              Você pode editar este texto pelo painel admin em{' '}
              <strong>Configurações &gt; Configurações avançadas (Payload)</strong>, campo{' '}
              <strong>Política de Privacidade</strong>.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
