import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export type BannerData = {
  id: string | number
  titulo?: string
  tag?: string
  descricao?: string
  cta_label?: string
  link: string
  imagem?: { url?: string } | string | null
}

function imgUrl(imagem: BannerData['imagem']): string | null {
  if (!imagem) return null
  if (typeof imagem === 'string') return null
  return imagem.url || null
}

/**
 * Banner interno clicável (ferramenta / diagnóstico / case).
 * Gerenciado pela aba "Banners" do painel. Leva o leitor para outras páginas
 * do site sem sair para fora — aumenta tempo de permanência e navegação.
 */
export default function ToolBanner({ banner }: { banner: BannerData }) {
  const url = imgUrl(banner.imagem)
  const isInternal = banner.link?.startsWith('/')

  const inner = (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-glow">
      {url && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={banner.titulo || ''}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        {banner.tag && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            {banner.tag}
          </span>
        )}
        {banner.titulo && (
          /* Não é heading: banner é moldura fora do artigo (item 1.3), fora da
             hierarquia de títulos. Visual idêntico. */
          <p className="mt-1.5 font-display text-base font-bold leading-snug text-foreground">
            {banner.titulo}
          </p>
        )}
        {banner.descricao && (
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{banner.descricao}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          {banner.cta_label || 'Saiba mais'}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  )

  if (isInternal) {
    return (
      <Link href={banner.link} className="block">
        {inner}
      </Link>
    )
  }
  return (
    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  )
}
