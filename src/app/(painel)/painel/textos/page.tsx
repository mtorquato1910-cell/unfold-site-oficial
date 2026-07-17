import { redirect } from 'next/navigation'
import { getSession } from '@/lib/painel-auth'
import { getSiteTextsRaw } from '@/lib/actions/site-texts-actions'
import { getHomeSettingsRaw } from '@/lib/actions/home-settings-actions'
import { SITE_TEXTS_DEFAULTS } from '@/lib/site-texts'
import PainelLayout from '@/components/painel/PainelLayout'
import TextosClient, { type TextosForm } from './TextosClient'

export default async function TextosPage() {
  const user = await getSession()
  if (!user) redirect('/admin/login')

  const [texts, home]: [any, any] = await Promise.all([
    getSiteTextsRaw().catch(() => null),
    getHomeSettingsRaw().catch(() => null),
  ])

  const pick = (key: keyof typeof SITE_TEXTS_DEFAULTS) => {
    const def = SITE_TEXTS_DEFAULTS[key]
    return {
      eyebrow: texts?.[`${key}_eyebrow`] ?? def.eyebrow,
      title: texts?.[`${key}_title`] ?? def.title,
      subtitle: texts?.[`${key}_subtitle`] ?? def.subtitle,
    }
  }

  const initial: TextosForm = {
    home: {
      hero_eyebrow: home?.hero_eyebrow ?? 'Growth Intelligence · Geração de demanda',
      hero_title:
        home?.hero_title ??
        'Organizamos crescimento digital em operações com vendas complexas.',
      hero_subtitle:
        home?.hero_subtitle ??
        'Estruturamos sistemas de crescimento que conectam marketing, vendas, CRM e automação em uma lógica integrada, previsível e orientada a resultado comercial.',
    },
    metodo: pick('metodo'),
    atuacao: pick('atuacao'),
    cases: pick('cases'),
    ferramentas: pick('ferramentas'),
    sobre: pick('sobre'),
    blog: pick('blog'),
    guia: pick('guia'),
  }

  return (
    <PainelLayout user={user}>
      <TextosClient initial={initial} />
    </PainelLayout>
  )
}
