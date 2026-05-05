import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

export type LegalContent = {
  politica_privacidade: any | null
  termos_de_uso: any | null
  email_dpo: string | null
}

async function fetchLegal(): Promise<LegalContent> {
  try {
    const payload = await getPayload({ config })
    const s: any = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    const hasContent = (rt: any) =>
      rt && rt.root && Array.isArray(rt.root.children) && rt.root.children.length > 0
    return {
      politica_privacidade: hasContent(s?.politica_privacidade) ? s.politica_privacidade : null,
      termos_de_uso: hasContent(s?.termos_de_uso) ? s.termos_de_uso : null,
      email_dpo: s?.email_dpo || null,
    }
  } catch {
    return { politica_privacidade: null, termos_de_uso: null, email_dpo: null }
  }
}

export const getLegalContent = unstable_cache(fetchLegal, ['legal-content'], {
  tags: ['site-settings'],
  revalidate: 60,
})
