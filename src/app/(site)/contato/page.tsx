import type { Metadata } from 'next'
import Image from 'next/image'
import ContatoForm from '@/components/contato/ContatoForm'

export const metadata: Metadata = {
  title: 'Contato | Unfold Growth',
  description:
    'Fale com a Unfold Growth. Estruturamos sistemas de crescimento que conectam marketing, vendas, CRM e automação. Deixe seus dados e nosso time entra em contato.',
}

/** Lockup da marca (ícone + wordmark UNF[o]LD) — mesmo padrão da navbar, centralizado. */
function BrandLockup() {
  return (
    <div className="flex items-center justify-center gap-3" aria-label="Unfold Growth">
      <Image
        src="/icone-c.png"
        alt=""
        width={56}
        height={56}
        priority
        className="h-11 w-auto shrink-0"
      />
      <span className="flex items-baseline text-white font-display font-extrabold uppercase leading-none tracking-tight text-2xl md:text-3xl select-none">
        <span>UNF</span>
        <Image
          src="/icone-c.png"
          alt=""
          width={28}
          height={28}
          priority
          className="inline-block h-[0.85em] w-[0.85em] mx-[0.04em] translate-y-[0.06em]"
        />
        <span>LD</span>
      </span>
    </div>
  )
}

export default function ContatoPage() {
  return (
    <main className="min-h-screen">
      <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-36 md:pb-28">
        {/* Halos mint/azul no fundo — identidade Unfold */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_85%_-10%,hsl(158_92%_70%/0.10),transparent_60%),radial-gradient(700px_500px_at_0%_110%,hsl(218_94%_78%/0.07),transparent_55%)]" />
        <div className="max-w-lg mx-auto px-6">
          <div className="mb-10">
            <BrandLockup />
          </div>
          <ContatoForm />
        </div>
      </section>
    </main>
  )
}
