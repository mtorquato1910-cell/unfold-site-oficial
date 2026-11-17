/**
 * Redirect 301 automático quando o slug de um conteúdo PUBLICADO muda (item 1.3 +
 * edição rápida de 17/11/2026). Usado por posts (/blog) e cases (/cases), tanto no
 * editor completo quanto na edição rápida.
 *
 * overrideAccess porque a collection `redirects` exige super-admin no create e o
 * editor não tem esse papel. Falha aqui (loop/duplicado) não bloqueia o save:
 * devolve `false` e o chamador segue.
 */
export async function createSlugRedirect(
  payload: any,
  opts: { base: '/blog' | '/cases'; oldSlug?: string | null; newSlug?: string | null; wasPublished: boolean; id: string | number },
): Promise<boolean> {
  const { base, oldSlug, newSlug, wasPublished, id } = opts
  if (!oldSlug || !newSlug || oldSlug === newSlug || !wasPublished) return false
  try {
    await payload.create({
      collection: 'redirects',
      data: {
        fromPath: `${base}/${oldSlug}`,
        toPath: `${base}/${newSlug}`,
        type: '301',
        enabled: true,
        note: `Automático: slug de ${base === '/blog' ? 'post' : 'case'} ${id} alterado`,
      },
      overrideAccess: true,
    })
    return true
  } catch (e: any) {
    console.warn(`[createSlugRedirect] ${base}/${oldSlug} → ${base}/${newSlug} não criado:`, e?.message)
    return false
  }
}

/** Destino do redirect cadastrado para um caminho antigo (ou undefined). */
export async function findRedirect(payload: any, fromPath: string): Promise<string | undefined> {
  try {
    const { docs } = await payload.find({
      collection: 'redirects',
      where: { and: [{ fromPath: { equals: fromPath } }, { enabled: { equals: true } }] },
      limit: 1,
    })
    return (docs[0]?.toPath as string) || undefined
  } catch {
    return undefined
  }
}
