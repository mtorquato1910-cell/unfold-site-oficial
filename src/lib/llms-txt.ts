import { COMPANY } from './company'

/**
 * /llms.txt (S09 — épico seo-tecnico-2026-10; Checklist SEO M07, modelo do Ferraz).
 *
 * O Google não usa o arquivo; outros agentes de IA podem ler e o Lighthouse 13.3
 * audita. Gerado do CMS: só URLs indexáveis com status 200 — ficam de fora páginas
 * legais (noindex), rascunhos, URLs de resultado (/diagnostico/r/*) e origens de
 * redirect. Formato: `- [nome](url): descrição`, em seções; o secundário em "Optional".
 */
export type LlmsPost = { slug: string; titulo: string; descricao?: string | null; pilar?: boolean }
export type LlmsCase = { slug: string; titulo: string; descricao?: string | null }

const PAGES: { path: string; name: string; desc: string; section: 'empresa' | 'ferramentas' }[] = [
  { path: '/', name: 'Home', desc: 'visão geral da Unfold Growth e do que ela faz para empresas B2B com venda complexa', section: 'empresa' },
  { path: '/sobre', name: 'Sobre', desc: 'quem é a Unfold, posicionamento e forma de trabalho', section: 'empresa' },
  { path: '/metodo', name: 'Método UGS', desc: 'o Unfold Growth System e seus quatro pilares: Diagnosticar, Estruturar, Operar e Evoluir', section: 'empresa' },
  { path: '/atuacao', name: 'Atuação', desc: 'setores atendidos e modelos de engajamento (estrutura, assessoria contínua, projetos)', section: 'empresa' },
  { path: '/cases', name: 'Cases', desc: 'resultados de clientes em operações de venda complexa', section: 'empresa' },
  { path: '/contato', name: 'Contato', desc: 'canais de atendimento: e-mail, telefone e WhatsApp', section: 'empresa' },
  { path: '/diagnostico', name: 'Diagnóstico de Growth', desc: 'avaliação gratuita da maturidade da operação comercial, em cerca de 5 minutos', section: 'ferramentas' },
  { path: '/ferramentas/calculadora-trafego', name: 'Calculadora de Performance', desc: 'quanto o investimento em mídia paga precisa retornar em receita, com premissas para vendas complexas', section: 'ferramentas' },
  { path: '/ferramentas/mapa-icp', name: 'Radar de Comitê de Compra', desc: 'monta o ICP e o mapa de quem decide no comitê de compra', section: 'ferramentas' },
]

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

export function buildLlmsTxt({
  baseUrl,
  posts,
  cases,
}: {
  baseUrl: string
  posts: LlmsPost[]
  cases: LlmsCase[]
}): string {
  const base = baseUrl.replace(/\/+$/, '')
  const abs = (p: string) => `${base}${p === '/' ? '/' : p}`
  const pilares = posts.filter((p) => p.pilar)
  const outros = posts.filter((p) => !p.pilar)

  const out: string[] = [
    `# ${COMPANY.name}`,
    '',
    `> ${oneLine(COMPANY.description, 400)}`,
    '',
    `A ${COMPANY.name} é sediada em ${COMPANY.locality} (${COMPANY.region}) e atende empresas de todo o Brasil com ciclo de venda longo e decisão complexa: construção civil e incorporação, agronegócio, tecnologia, indústria e serviços B2B. Trabalha com o método próprio UGS (Diagnosticar, Estruturar, Operar, Evoluir). Parceira ${COMPANY.partners.join(', ')}; associada à ${COMPANY.memberOf.join(' e à ')}.`,
    '',
    '## Sobre a empresa',
    ...PAGES.filter((p) => p.section === 'empresa').map((p) => link(p.name, abs(p.path), p.desc)),
    '',
    '## Ferramentas gratuitas',
    ...PAGES.filter((p) => p.section === 'ferramentas').map((p) => link(p.name, abs(p.path), p.desc)),
  ]
  if (cases.length) {
    out.push('', '## Cases', ...cases.map((c) => link(c.titulo, abs(`/cases/${c.slug}`), c.descricao)))
  }
  if (pilares.length) {
    out.push('', '## Guias e artigos principais', ...pilares.map((p) => link(p.titulo, abs(`/blog/${p.slug}`), p.descricao)))
  }
  out.push('', '## Optional', link('Blog', abs('/blog'), 'índice de todos os artigos'))
  out.push(...outros.map((p) => link(p.titulo, abs(`/blog/${p.slug}`), p.descricao)))
  return `${out.join('\n')}\n`
}
