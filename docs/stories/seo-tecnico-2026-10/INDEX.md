# Épico — SEO Técnico (Plano de Ação Ferraz + Checklist Novo Site) + Cases no padrão dos posts

**Origem:**
- `Plano_Acao_SEO_Tecnico_unfoldgrowth (1).docx` (Ferraz, 07/10/2026) — 23 tarefas (12 críticas, 11 importantes) + anexos A–D
- `Checklist_SEO_Tecnico_Novo_Site (1).docx` (Ferraz, 08/10/2026) — 9 módulos (usado como régua de qualidade)
- Reunião "SEO Sementes: passos iniciais" (`out. 7, 2026.txt`) — prioridade: **lastmod** e **links quebrados**
- `Autores_Artigos_Blog_Unfold.xlsx` (09/10/2026) — mapa de autoria (Gabriel 36, Davi 6; 42 artigos)
- Pedido do cliente via WhatsApp (10/10/2026): publicar cases "da mesma forma dos posts"
- Referência de arquitetura: artigo da Conversion "Payload CMS: o que é, vantagens e quando usar" — lição central: *SEO no Payload não é automático; cada campo precisa de um consumidor no frontend, hooks revalidam, metadados precisam ser renderizados.*

**Planejamento:** Orion (aios-master) · 2026-10-10
**Base de código:** Next.js 15 (App Router) · Payload CMS 3 (Postgres/Supabase, schema `site`, `push: false`) · Vercel
**Deploy:** ⚠️ produção sai de `main` (feature branch só gera preview). Migrations rodam no build (`scripts/vercel-build.sh`).

---

## Decisões fechadas (cliente/Ferraz, 08/10/2026)

| # | Decisão |
|---|---------|
| D1 | **Sem redirect** para `/blog/receita-previsivel` (URL nunca existiu). Remover o link dos 3 posts (ltv, playbook-de-vendas, processo-comercial). Os outros **10** redirects do Anexo B valem. |
| D2 | Links quebrados nos 19 posts: **remover**, sem substituir. Tirar só o `<a>` e manter o texto; se for item de "Leia também" ou frase que só existe para o link, remover o item/frase inteira. Backup antes. **Não altera a data de atualização.** Rastrear de novo depois: zero links internos 404. |
| D3 | Criar `content_updated_at`: só muda quando **título ou corpo** são editados de verdade (remoção de link/ajuste técnico não conta). Usado no `lastmod` do sitemap e no `dateModified` do Article; `datePublished` continua com a publicação. ISO 8601 com fuso (`2026-10-01T00:00:00-03:00`). Valores: **01/10/2026** para sdr, funil-de-vendas, processo-comercial, growth-marketing, vendas-b2b; **demais = data de publicação**. **10 páginas institucionais: remover o lastmod.** |
| D4 | Autoria: Gabriel Calheiros (36 artigos) e Davi Brito (6, mídia paga) — planilha `Autores_Artigos_Blog_Unfold.xlsx`. Fotos tratadas em `assets/` (Davi sem a marca d'água do Gemini). |
| D5 | Organization (não LocalBusiness): sede em Maceió (AL), atendimento nacional. Dados parciais do texto "Versão para o site" (ver S06). |

## Pendências do cliente (bloqueiam partes específicas)

| # | Pergunta | Bloqueia |
|---|----------|----------|
| P1 | Vídeo do Hero: comprimir o atual (720p, 2–4 MB) / imagem estática / novo vídeo? | S05 AC5.1 (asset) |
| P2 | Busca no blog: criar `/blog?q=` ou remover SearchAction e 404 sem busca? | S04 AC4.6c, S08 AC8.2 |
| P3 | Bots de treinamento (GPTBot, ClaudeBot, Google-Extended): liberar (padrão) ou bloquear? | S04 AC4.1 (default = liberar) |
| P4 | `/diagnostico/privacidade` também noindex? | S04 AC4.3 |
| P5 | Ficha da empresa: endereço/CEP, fundadores, ano de fundação, redes (sameAs), logo oficial | S06 |
| P6 | Fichas dos autores: cargo, bio curta, bio completa, LinkedIn, formação, experiência. Confirmar que a foto do WhatsApp é do Davi | S07 |
| P7 | Cases: números de destaque como campo separado (cartões) ou tudo texto corrido? | S10 AC10.2 |
| P8 | "Versão para o site" substitui textos visíveis (Hero/Sobre/Atuação) ou só alimenta schema/llms.txt/rodapé? | S06 AC6.5, S09 |
| P9 | Quem tem acesso à Vercel de produção (Domains + Firewall)? | OPS |

---

## Roadmap

| Story | Nome | Status (2026-10-10) | QA |
|-------|------|--------|----|
| [S01](S01-content-updated-at-lastmod.md) | `content_updated_at` → lastmod + dateModified + "Atualizado em" | 🟢 Código pronto · migration testada (rollback) | CONCERNS → resolvido |
| [S02](S02-redirects-e-dominio.md) | 10 redirects 301 + domínio | 🟢 Código pronto · www→apex depende do OPS (Vercel) | PASS |
| [S03](S03-remocao-links-quebrados.md) | Remoção dos links quebrados (34 em 19 posts) | 🟡 Script + prévia prontos · **aguarda aprovação da prévia** e S01 em produção para o `--apply` | CONCERNS → resolvido |
| [S04](S04-indexacao-robots-404.md) | robots, noindex legais, og:url/og:image, HSTS, 404 PT-BR | 🟢 Código pronto · `includeSubDomains` depende do OPS (zona DNS) | CONCERNS → resolvido |
| [S05](S05-home-performance-hero.md) | Vídeo 720p (1,3 MB), mobile só imagem, contadores no HTML | 🟢 Código pronto (default de P1) · medir após deploy | CONCERNS → resolvido |
| [S06](S06-schema-organization-empresa.md) | Organization @id + dados da empresa | 🟢 Pronto com os dados disponíveis · faltam endereço/fundadores/redes (P5) | CONCERNS → resolvido |
| [S07](S07-autores-person-profilepage.md) | Autores reais, /autor/[slug], Person, ProfilePage | 🟢 Código pronto · 42 posts com autor · faltam bios (P6) | FAIL (tsc) → corrigido → PASS c/ concerns |
| [S08](S08-breadcrumb-schemas-html.md) | Breadcrumb, Service/CollectionPage, imagens lazy, H3 rodapé | 🟢 Código pronto · 73 alts para o Ferraz | CONCERNS → resolvido |
| [S09](S09-geo-llms-indexnow.md) | `/llms.txt` + IndexNow | 🟢 Código pronto · falta `INDEXNOW_KEY` na Vercel | CONCERNS → resolvido |
| [S10](S10-cases-editor-padrao-posts.md) | Cases no padrão dos posts | 🟢 Código pronto (default de P7) | CONCERNS → resolvido |
| [OPS](OPS-checklist-operacional.md) | Ações fora do código | ⬜ Ferraz/dono | — |

**🚀 Em produção desde 2026-10-10 (main `d572b03`).** Primeiro deploy falhou no lint da Vercel (6 `<a>` internos → `<Link>`; ver commit d572b03). Conferido em produção: sitemap com `2026-10-01T00:00:00-03:00`, 10 redirects (1 salto, 200), 404 em PT-BR, robots novo, HSTS 1 ano, `/llms.txt` 200, post com autor/Atualizado em/breadcrumb/Person, `/autor/gabriel-calheiros` 200, contadores no HTML, sem Pexels, og:image padrão.

**Verificação global (2026-10-10):** `tsc --noEmit` ✅ · `vitest` 288/288 ✅ · `next lint` (arquivos alterados) ✅. `next build` não roda localmente (SWC nativo bloqueado pelo Windows; o script de build aplica migrations no banco), então é validado no preview da Vercel. As 3 migrations novas foram testadas contra o banco real em transação com ROLLBACK.
---

## Sequenciamento

```
Onda 1 (prioridade do Ferraz — pode ir junto para main):
  S01 (content_updated_at) ──► main ──► S03 (links, roda o script em prod com flag técnica)
  S02 (redirects)          ──► main
  S04 (robots/noindex/404) ──► main

Onda 2:
  S08 (breadcrumb/schemas/html) ── S05 (contadores agora; vídeo quando P1 chegar)
  S10 (cases) — independente, pedido direto do cliente

Onda 3 (dados do cliente):
  S06 (empresa) ──► S07 (autores: worksFor usa o @id da S06) ──► S09 (llms.txt usa autores/empresa)

Fechamento: OPS (reindexação GSC dos posts editados, Bing, Vercel Domains, re-medição PSI)
```

**Por que S01 antes de S03:** o script de links reescreve `conteudo_html`. Sem o `content_updated_at` (e a flag de edição técnica), o `updated_at` dos 19 posts muda e o sitemap volta a mentir — exatamente o problema que o Ferraz apontou (25 posts "atualizados" em 07/08 por um script).

---

## Estado do código × plano (validado em 07/10/2026)

| Item do plano | Estado real |
|---|---|
| Sitemap lastmod | `src/app/sitemap.ts:322-333` usa `updatedAt` (muda em todo `payload.update`, inclusive scripts). Institucionais fixas em `STATIC_LASTMOD = 2026-07-01` (`:286`). |
| `content_updated_at` | Não existe. Datas em `site.posts`: `publicado_em`, `reviewed_at`, `updated_at`, `created_at`. |
| Redirects | `next.config.ts:41-59` (www→apex, /agencia, /servicos, /portfolio, /blog/trafego-pago). Nenhum dos 10 do Anexo B. Collection `redirects` só é consultada em `blog/[slug]/page.tsx:130-146` (comentário em `Redirects.ts` diz "via middleware" — **falso**). |
| robots | **Dois**: `src/app/robots.ts` (emite `Host:`) e `public/robots.txt` (allow-all, sem sitemap). Conflito. |
| 404 | Sem `not-found.tsx` no site → página padrão do Next em inglês. |
| Hero | `HeroClient.tsx:83-104` — MP4 Pexels UHD 3840×2160, carrega no mobile, sem `aria-hidden`. |
| Contadores | `HeroClient.tsx:16-58` — `useState(0)` → HTML do servidor mostra "+R$ 0MM". |
| Organization | `SchemaOrg.tsx:3-22` — sem address/telephone/founder; `sameAs` só LinkedIn; **logo aponta para `/logo.svg` inexistente**. |
| WebSite | SearchAction para `/blog?q=` que não existe. |
| Article | Sem `image`; `author` = Organization com texto livre ("Equipe Unfold Growth"). |
| Breadcrumb | JSON-LD existe nos posts; **nada visível** (só "Voltar ao blog"). `src/components/ui/breadcrumb.tsx` existe e não é usado. |
| og | Layout sem `images`/`url`; home sem og:image; nenhuma página com `openGraph.url`. |
| Imagens dos posts | `<img>` cru do Supabase, diagramas com `alt=""`; sanitizer (`html-sanitize.ts:28`) remove `loading`. |
| HSTS | `max-age=2592000`, sem includeSubDomains. |
| llms.txt | Não existe. |
| Legais | `/termos`, `/lgpd`, `/politica-de-privacidade` indexáveis. |
| Autores | Campo texto livre `autor`; sem tabela/página. |
| Posts fora da listagem | Planilha: `como-anunciar-minha-empresa-no-google` e `crm-para-whatsapp` **fora do sitemap e do /blog** em 09/10 (investigar em S01). |

---

## Change Log

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-10-10 | Orion | Criação do épico (S01–S10 + OPS) a partir do plano, checklist, reunião, planilha e pedido de cases |
