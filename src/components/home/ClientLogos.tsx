import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { getHomeSettings } from '@/lib/home-settings'
import { getPublicClients } from '@/lib/clients'

export async function ClientLogos() {
  const [settings, clients] = await Promise.all([getHomeSettings(), getPublicClients()])

  if (clients.length === 0) return null

  return (
    <section className="bg-background border-y border-border py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-primary mb-10">
            {settings.client_logos_title}
          </p>
        </Reveal>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-10 items-center justify-items-center">
          {clients.map((client, i) => {
            const inner = client.logoUrl ? (
              <div className="relative h-10 w-32 md:h-12 md:w-40 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition">
                <Image
                  src={client.logoUrl}
                  alt={client.nome}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 128px, 160px"
                />
              </div>
            ) : (
              <span className="font-display font-bold text-sm md:text-base tracking-tight text-center text-foreground/30 hover:text-foreground/60 transition-colors">
                {client.nome}
              </span>
            )
            return (
              <Reveal key={client.id} delay={Math.min(i, 5) * 55}>
                {client.website ? (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                    title={client.nome}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="flex items-center justify-center" title={client.nome}>
                    {inner}
                  </div>
                )}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
