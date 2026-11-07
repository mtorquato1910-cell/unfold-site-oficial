/**
 * Confere no site NO AR que o /llms.txt e o /sitemap.xml listam as mesmas URLs
 * (Tarefa 7 do relatório técnico de SEO de 06/11/2026). Sai com código 1 se houver
 * diferença — dá para usar após cada deploy ou num monitor.
 *   node scripts/check-llms-sitemap.mjs [https://unfoldgrowth.com.br]
 */
const base = (process.argv[2] || 'https://unfoldgrowth.com.br').replace(/\/+$/, '')
const norm = (u) => u.trim().replace(/\/+$/, '')
const get = async (p) => {
  const res = await fetch(`${base}${p}?check=${Date.now()}`, { headers: { 'cache-control': 'no-cache' } })
  if (!res.ok) throw new Error(`${p} respondeu ${res.status}`)
  return res.text()
}
const [xml, txt] = await Promise.all([get('/sitemap.xml'), get('/llms.txt')])
const sitemap = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => norm(m[1])))
const llms = new Set([...txt.matchAll(/^- \[[^\]]*\]\(([^)]+)\)/gm)].map((m) => norm(m[1])))
const soSitemap = [...sitemap].filter((u) => !llms.has(u))
const soLlms = [...llms].filter((u) => !sitemap.has(u))
console.log(`sitemap.xml: ${sitemap.size} URLs · llms.txt: ${llms.size} URLs`)
if (soSitemap.length) console.error(`Só no sitemap:\n  ${soSitemap.join('\n  ')}`)
if (soLlms.length) console.error(`Só no llms.txt:\n  ${soLlms.join('\n  ')}`)
if (soSitemap.length || soLlms.length) process.exit(1)
console.log('OK — as mesmas URLs nos dois arquivos.')
