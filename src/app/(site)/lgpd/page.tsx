import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'LGPD — Seus Direitos | Unfold Growth',
  description: 'Exercite seus direitos de proteção de dados conforme a LGPD.',
}

export default function LGPDPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 lg:px-8 pt-32 pb-24 md:pt-40">
      <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">LGPD</p>
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-6">Seus direitos de proteção de dados</h1>
      <p className="text-foreground/70 leading-relaxed mb-10">
        A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) garante a você os direitos abaixo sobre seus dados pessoais tratados pela Unfold Growth.
      </p>

      <div className="space-y-4 mb-12">
        {[
          { titulo: 'Acesso', desc: 'Confirmar se tratamos seus dados e obter uma cópia.' },
          { titulo: 'Correção', desc: 'Corrigir dados incompletos, inexatos ou desatualizados.' },
          { titulo: 'Exclusão', desc: 'Solicitar a eliminação dos dados quando desnecessários.' },
          { titulo: 'Portabilidade', desc: 'Receber seus dados em formato estruturado.' },
          { titulo: 'Revogação do consentimento', desc: 'Revogar a qualquer momento o consentimento dado.' },
          { titulo: 'Oposição', desc: 'Opor-se ao tratamento realizado com fundamento diverso.' },
        ].map((d) => (
          <div key={d.titulo} className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-medium text-foreground mb-1">{d.titulo}</h3>
            <p className="text-sm text-foreground/60">{d.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h2 className="font-display font-bold text-xl mb-3">Exercer um direito</h2>
        <p className="text-foreground/60 text-sm mb-6">
          Envie sua solicitação para nosso DPO. Responderemos em até 15 dias úteis.
        </p>
        <Button asChild>
          <Link href="mailto:privacidade@unfoldgrowth.com.br">
            Enviar solicitação
          </Link>
        </Button>
      </div>

      <p className="text-xs text-foreground/40 mt-8 text-center">
        Leia também nossa{' '}
        <Link href="/politica-de-privacidade" className="text-primary hover:underline">
          Política de Privacidade completa
        </Link>
      </p>
    </main>
  )
}
