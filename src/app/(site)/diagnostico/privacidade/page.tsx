import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacidade do Diagnóstico | Unfold Growth',
  description:
    'Como tratamos os dados que você compartilha ao fazer o Diagnóstico de Growth — finalidades, base legal, retenção e como exercer seus direitos.',
}

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen pt-28 pb-24">
      <article className="max-w-3xl mx-auto px-6 prose prose-invert prose-headings:font-display">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-2">
          Diagnóstico de Growth
        </p>
        <h1>Privacidade & uso de dados</h1>

        <p>
          Quando você inicia o Diagnóstico de Growth, a Unfold Growth coleta os dados que você
          informa (nome, e-mail corporativo, empresa, cargo, setor, faixa de faturamento, urgência)
          e as 12 respostas que você dá ao questionário. Esta página explica como esses dados são
          tratados.
        </p>

        <h2>O que fazemos com os dados</h2>
        <ul>
          <li>
            <strong>Calcular o seu diagnóstico</strong> — score consolidado, eixos do método UGS,
            Fit Comercial e padrões cruzados. O cálculo acontece no nosso servidor e o resultado
            fica salvo em um link único e privado.
          </li>
          <li>
            <strong>Enviar o resultado por e-mail</strong> — você recebe o link do seu diagnóstico
            no endereço informado.
          </li>
          <li>
            <strong>Acompanhar comercialmente</strong> — se você informou ter urgência ou se o seu
            perfil é compatível com nosso método, podemos entrar em contato para uma conversa
            estratégica. Você pode dizer não a qualquer momento.
          </li>
          <li>
            <strong>Inteligência de mercado</strong> — agregamos respostas anônimas para
            entender tendências de maturidade B2B no Brasil. Nenhuma resposta individual é
            exibida em estudos públicos.
          </li>
        </ul>

        <h2>Base legal</h2>
        <p>
          O tratamento dos seus dados acontece com base no <strong>seu consentimento</strong>{' '}
          (Art. 7º, I da LGPD), no <strong>cumprimento de obrigações legais e regulatórias</strong>{' '}
          e no <strong>legítimo interesse</strong> para o contato comercial subsequente.
        </p>

        <h2>Com quem compartilhamos</h2>
        <p>
          Para operar o serviço, usamos provedores terceirizados que processam os dados em nosso
          nome (controladores conjuntos): plataforma de hospedagem (Vercel), banco de dados
          (Supabase), envio de e-mail transacional (Resend), CRM (RD Station). Esses provedores
          recebem apenas o que é estritamente necessário para a operação contratada.
        </p>

        <h2>Quanto tempo guardamos</h2>
        <p>
          Mantemos seus dados enquanto fizer sentido para o relacionamento comercial e dentro dos
          prazos legais de retenção. Você pode pedir a exclusão antes desse prazo pelo endereço
          abaixo.
        </p>

        <h2>Seus direitos</h2>
        <ul>
          <li>Acessar, corrigir ou atualizar seus dados</li>
          <li>Pedir a portabilidade para outro fornecedor</li>
          <li>Revogar o consentimento a qualquer momento</li>
          <li>
            Solicitar a exclusão pelo endpoint{' '}
            <code>/api/diagnostico/lgpd/delete-me</code> ou enviando um e-mail para o DPO
          </li>
          <li>Reclamar à Autoridade Nacional de Proteção de Dados (ANPD)</li>
        </ul>

        <h2>Como exercer seus direitos</h2>
        <p>
          Envie um e-mail para o DPO informando seu pedido. O endereço fica disponível na nossa{' '}
          <a href="/politica-de-privacidade">Política de Privacidade completa</a>. Respondemos em
          até 15 dias úteis.
        </p>

        <p className="text-sm text-foreground/55 border-t border-border pt-6 mt-12">
          Última atualização: maio de 2026. Esta página complementa nossa{' '}
          <a href="/politica-de-privacidade">Política de Privacidade</a> aplicada a todo o site.
        </p>
      </article>
    </main>
  )
}
