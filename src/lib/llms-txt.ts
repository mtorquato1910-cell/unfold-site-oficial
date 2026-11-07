import { COMPANY } from './company'
import {
  STATIC_PAGES,
  authorPagePath,
  casePath,
  categoriesWithPosts,
  categoryPagePath,
  postPath,
  type IndexPost,
  type SiteIndex,
} from './site-index'

/**
 * /llms.txt (S09 — épico seo-tecnico-2026-10; Tarefa 7 do relatório de SEO de
 * 06/11/2026). Gerado dos MESMOS dados do sitemap.xml (src/lib/site-index.ts): toda
 * URL do sitemap aparece aqui e vice-versa — o teste em __tests__ confere.
 * Formato: `- [nome](url): descrição`, em seções. Os artigos ficam agrupados por
 * categoria; os marcados como `llms_optional` vão para "Optional".
 */

/**
 * Uma linha, até ~200 caracteres. Remove só a sintaxe markdown que quebraria a lista
 * (links, ênfase, código) — parênteses e demais sinais ficam ("Custo por Lead (CPL)").
 */
export function oneLine(s: string | null | undefined, max = 200): string {
  const t = String(s ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

/** No texto do link, colchetes fechariam o markdown antes da hora → viram parênteses. */
const linkName = (name: string) => oneLine(name, 120).replace(/\[/g, '(').replace(/\]/g, ')')

const link = (name: string, url: string, desc?: string | null) =>
  `- [${linkName(name)}](${url})${desc && oneLine(desc) ? `: ${oneLine(desc)}` : ''}`

const section = (title: string, lines: string[]) => (lines.length ? ['', `## ${title}`, ...lines] : [])

export function buildLlmsTxt({ baseUrl, index }: { baseUrl: string; index: SiteIndex }): string {
  const base = baseUrl.replace(/\/+$/, '')
  const abs = (p: string) => `${base}${p === '/' ? '/' : p}`
  const postLine = (p: IndexPost) => link(p.titulo, abs(postPath(p.slug)), p.descricao)

  const principais = index.posts.filter((p) => !p.llmsOptional)
  const opcionais = index.posts.filter((p) => p.llmsOptional)
  const categorias = categoriesWithPosts(index)
  const comCategoria = new Set(categorias.map((c) => c.id))
  const semCategoria = principais.filter((p) => !p.categoriaId || !comCategoria.has(p.categoriaId))

  const out: string[] = [
    `# ${COMPANY.name}`,
    '',
    `> ${oneLine(COMPANY.description, 900)}`,
    '',
    `A ${COMPANY.name} é sediada em ${COMPANY.locality} (${COMPANY.region}) e atende empresas de todo o Brasil com ciclo de venda longo e decisão complexa: construção civil e incorporação, agronegócio, tecnologia, indústria e serviços B2B. Trabalha com o método próprio UGS (Diagnosticar, Estruturar, Operar, Evoluir). Parceira ${COMPANY.partners.join(', ')}; associada à ${COMPANY.memberOf.join(' e à ')}.`,
    ...section(
      'Sobre a empresa',
      STATIC_PAGES.filter((p) => p.section === 'empresa').map((p) => link(p.name, abs(p.path), p.desc)),
    ),
    ...section(
      'Ferramentas gratuitas',
      STATIC_PAGES.filter((p) => p.section === 'ferramentas').map((p) => link(p.name, abs(p.path), p.desc)),
    ),
    ...section('Autores', index.authors.map((a) => link(a.nome, abs(authorPagePath(a.slug)), a.descricao))),
    ...section('Cases', index.cases.map((c) => link(c.titulo, abs(casePath(c.slug)), c.descricao))),
  ]
  for (const cat of categorias) {
    // A página da categoria sempre entra (está no sitemap), mesmo que todos os
    // artigos dela sejam "Optional".
    out.push(
      ...section(cat.nome, [
        link(cat.nome, abs(categoryPagePath(cat.slug)), cat.intro || `artigos sobre ${cat.nome.toLowerCase()}`),
        ...principais.filter((p) => p.categoriaId === cat.id).map(postLine),
      ]),
    )
  }
  out.push(...section('Outros artigos', semCategoria.map(postLine)))
  out.push(...section('Optional', opcionais.map(postLine)))
  return `${out.join('\n')}\n`
}

/** URLs absolutas citadas num llms.txt (para o teste de paridade com o sitemap). */
export function llmsUrls(txt: string): string[] {
  return Array.from(txt.matchAll(/^- \[[^\]]*\]\(([^)]+)\)/gm), (m) => m[1])
}
