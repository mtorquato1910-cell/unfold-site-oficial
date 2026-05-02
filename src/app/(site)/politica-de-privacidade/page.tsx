import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Unfold Growth',
  description: 'Como a Unfold Growth coleta, usa e protege seus dados pessoais.',
}

export default function PoliticaPrivacidadePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-24 md:pt-40">
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-8">Política de Privacidade</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-foreground/70">
        <p className="text-sm text-foreground/40">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">1. Quem somos</h2>
          <p>A Unfold Growth é uma empresa especializada em geração de demanda B2B. Este documento descreve como coletamos e tratamos dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">2. Dados coletados</h2>
          <p>Coletamos os seguintes dados quando você utiliza nossos serviços:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nome, e-mail e dados da empresa (formulários de contato e diagnóstico)</li>
            <li>Dados de comportamento no site (analytics — anonimizado)</li>
            <li>Cookies estritamente necessários e analíticos (mediante consentimento)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">3. Finalidade do tratamento</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Prestação dos serviços solicitados</li>
            <li>Envio de diagnósticos e resultados personalizados</li>
            <li>Contato comercial (mediante consentimento explícito)</li>
            <li>Melhoria contínua dos serviços e do site</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">4. Seus direitos (LGPD)</h2>
          <p>Você tem direito a: acessar, corrigir, excluir, exportar e revogar o consentimento sobre seus dados. Entre em contato através de <a href="mailto:privacidade@unfoldgrowth.com.br" className="text-primary hover:underline">privacidade@unfoldgrowth.com.br</a>.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">5. Retenção de dados</h2>
          <p>Mantemos seus dados pelo tempo necessário para as finalidades declaradas ou conforme exigido por lei. Dados de diagnóstico são retidos por 24 meses.</p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground mb-3">6. Contato</h2>
          <p>Encarregado de Proteção de Dados (DPO): <a href="mailto:privacidade@unfoldgrowth.com.br" className="text-primary hover:underline">privacidade@unfoldgrowth.com.br</a></p>
        </section>
      </div>
    </main>
  )
}
