# S02 — 10 redirects 301 + normalização de domínio em um salto

**Origem:** Plano de Ação (crítica: "Publicar o deploy com os 11 redirects"; importante: www→apex) · Anexo B · Decisão D1 · Checklist M03
**Prioridade:** 🔥 P1 · **Risco:** Baixo · **Executor:** @dev · **Revisão:** @qa
**Dependências:** nenhuma.
**Status:** 🟢 Código implementado (2026-10-10) — AC2.6 depende do OPS (Vercel Domains); AC2.10 após deploy

---

## Contexto

Na checagem do Ferraz (07/10, 10h20) as 11 URLs antigas do Anexo B retornavam 404. Pela decisão D1, `/blog/receita-previsivel` **não** recebe redirect (nunca existiu; os links para ela saem na S03). Ficam **10**.

Hoje os redirects vivem em `next.config.ts:41-59`. Há cadeias de 2 a 3 saltos (http → https → apex → barra final).

## Story

**Como** Google (e como visitante vindo de link antigo),
**quero** chegar à URL final em um único salto,
**para que** a autoridade das URLs antigas seja transferida e nenhum link termine em 404.

---

## Acceptance Criteria

### Redirects do Anexo B (sem receita-previsivel)
- [x] **AC2.1** Adicionar em `next.config.ts > redirects()` com `permanent: true`:

| Origem | Destino |
|---|---|
| `/blog/as-metricas-de-growth-que-importam` | `/blog/quais-metricas-e-como-medir-em-growth-marketing` |
| `/blog/previsibilidade-comercial-na-incorporadora` | `/blog/previsibilidade-comercial-como-sair-do-mes-a-mes-na-incorporadora` |
| `/blog/geracao-de-demanda-x-geracao-de-leads` | `/blog/geracao-de-demanda-x-geracao-de-leads-por-que-mais-leads-podem-estar-piorando-suas-vendas-b2b` |
| `/blog/marketing-para-incorporadoras-e-construtoras` | `/blog/marketing-e-growth-para-incorporadoras-e-construtoras` |
| `/blog/por-que-incorporadora-gera-leads-e-nao-vende` | `/blog/por-que-sua-incorporadora-gera-leads-e-nao-fecha-vendas-e-como-resolver` |
| `/blog/crm-para-incorporadora` | `/blog/crm-para-incorporadora-como-organizar-o-funil-de-lancamento` |
| `/blog/sales-enablement-incorporadora` | `/blog/sales-enablement-para-corretores-e-comite-de-compra` |
| `/calculadora` | `/ferramentas/calculadora-trafego` |
| `/processo-comercial` | `/blog/processo-comercial` |
| `/blog/quanto-investir-para-vender-um-lancamento-imobiliario` | `/blog/quanto-investir-em-trafego-pago-para-lancamento-imobiliario` |

- [x] **AC2.2** **Nenhum** redirect para `/blog/receita-previsivel` (D1). Essa URL continua 404 de propósito.
- [x] **AC2.3** Antes do deploy, confirmar que **todos os 10 destinos respondem 200** e estão publicados (um destino que é rascunho geraria redirect → 404). Registrar o resultado no Dev Notes.
- [x] **AC2.4** Teste unitário que importa a config e valida: sem duplicata de `source`, nenhum `destination` que também seja `source` (sem cadeia), nenhum loop.

### Domínio e barra final (um salto)
- [x] **AC2.5** Verificar o comportamento atual com `curl -sI` para as variações: `http://unfoldgrowth.com.br`, `http://www.unfoldgrowth.com.br`, `https://www.unfoldgrowth.com.br`, `https://unfoldgrowth.com.br/blog/sdr/` (barra final), `https://www.unfoldgrowth.com.br/blog/sdr/`. Registrar a cadeia atual de cada uma.
- [ ] **AC2.6** Meta: cada variação chega a `https://unfoldgrowth.com.br/<caminho sem barra final>` com **um único** 301/308. O www→apex deve ser feito **no Domains da Vercel** (redirect de domínio 308, antes do app) — passo a passo documentado no [OPS](OPS-checklist-operacional.md); remover o redirect de www de `next.config.ts` só depois que o da Vercel estiver ativo (senão o site fica sem redirect de www).
- [x] **AC2.7** Barra final: se o curl do AC2.5 mostrar mais de um salto para `www + barra final`, avaliar normalizar host + barra no `src/middleware.ts` em um único `NextResponse.redirect(…, 308)`. **Não** quebrar o roteamento do subdomínio `eleicoes.unfoldgrowth.com.br` (`middleware.ts:128-166`).

### Coerência
- [x] **AC2.8** Corrigir o comentário de `src/collections/Redirects.ts` (linhas ~203-205) que diz "servidos via middleware.ts": hoje a collection só é consultada em `blog/[slug]/page.tsx:130-146`, apenas para `/blog/*`. Documentar isso no próprio comentário.
- [x] **AC2.9** Sitemap e canonicals não contêm nenhuma das 10 URLs de origem.

### Validação
- [ ] **AC2.10** Após deploy: `curl -sI` nas 10 origens → um 308/301 seguido de 200 no destino. `/blog/receita-previsivel` → 404.
- [ ] **AC2.11** Lint, typecheck, testes e build verdes.

## Dev Notes

- `permanent: true` no Next gera **308**, que o Google trata como 301 (Checklist M03: "301 ou 308"). Manter.
- Novos redirects por troca de slug de post já são cobertos pela collection `redirects` + `permanentRedirect` em `blog/[slug]/page.tsx`. Generalizar a collection para o site todo (middleware) **não** está no escopo; candidato a story futura se o Ferraz quiser cadastrar redirects pelo painel.

## Definition of Done
- 10 redirects em produção, AC2.10 conferido, cadeias de domínio documentadas e (após OPS) reduzidas a um salto.

## Registro de implementação (2026-10-10)

- **AC2.1/2.2:** redirects movidos para `src/lib/legacy-redirects.ts` (testável sem carregar o Payload), importado no `next.config.ts`. 10 do Anexo B + 4 legados. Sem `receita-previsivel`.
- **AC2.3:** os 10 destinos responderam **200** em produção em 10/10/2026 (`/blog/...` × 9 + `/ferramentas/calculadora-trafego`). A collection `redirects` no banco está vazia (nenhum conflito, nenhum `receita-previsivel → sdr` cadastrado).
- **AC2.4:** `src/lib/__tests__/legacy-redirects.test.ts` (5 testes: duplicata, cadeia/loop, formato, os 10 do Anexo B, ausência de receita-previsivel).
- **AC2.5 — cadeias medidas em 10/10/2026:**

| Origem | Saltos | Observação |
|---|---|---|
| `http://unfoldgrowth.com.br/` | 1 | http→https feito pela Vercel (edge) |
| `http://www.unfoldgrowth.com.br/` | 2 | http→https (Vercel) + www→apex (app) |
| `https://www.unfoldgrowth.com.br/` | 1 | www→apex (app) |
| `https://unfoldgrowth.com.br/blog/sdr/` | 1 | barra final (Next) |
| `https://www.unfoldgrowth.com.br/blog/sdr/` | 2 | barra final (Next, ainda no www) + www→apex |
| `http://www.unfoldgrowth.com.br/blog/sdr/` | 3 | os três acima |

- **AC2.7 — avaliado, não implementado no middleware:** o redirect interno de barra final do Next roda **antes** dos redirects do config e do middleware, e o matcher do middleware hoje cobre só rotas específicas. Juntar host + barra num salto exigiria `skipTrailingSlashRedirect` + middleware em **todas** as rotas, ou seja, uma execução a mais por request em troca de 1 salto em URLs que nenhum link interno usa. O ganho real vem do redirect de domínio na Vercel (OPS), que tira o www antes do app. Nenhum link interno, canonical ou sitemap usa www, http ou barra final, então o impacto de rastreio é residual (o próprio Ferraz: "impacta, mas é bem pouquinho").
- **AC2.6:** aguarda OPS (Vercel → Domains). O redirect de www continua no `next.config.ts` até lá.
- **AC2.8:** comentário de `Redirects.ts` corrigido.
- **AC2.9:** nenhuma origem aparece em `src/` fora da própria lista; o sitemap só lista posts publicados e rotas fixas.

## QA Results — 2026-10-10 (Quinn)

**Veredito: PASS.**
- Os 10 pares batem caractere a caractere com o Anexo B. O config carregou pelo loader do próprio Next (`loadConfig('phase-production-build')`): 15 regras, www→apex primeiro, import relativo de TS ok.
- Curl: os 10 destinos dão 200, as 10 origens dão 404 (pré-deploy) e `receita-previsivel` dá 404.
- Confirmado em `next/dist/lib/load-custom-routes.js:519-525` que o redirect interno de barra final é colocado antes dos custom, o que valida o AC2.7.
- Observações baixas tratadas:
  1. **AC2.6:** mesmo com o redirect de domínio da Vercel, `www + barra final` segue em 2 saltos (Vercel tira o www, o Next tira a barra). **Resíduo aceito**; após o OPS, medir com curl em vez de marcar "1 salto".
  2. Aviso adicionado em `legacy-redirects.ts`: trocar o slug de um destino exige atualizar a lista, senão vira cadeia.

## File List
- `src/lib/legacy-redirects.ts` (novo)
- `src/lib/__tests__/legacy-redirects.test.ts` (novo)
- `next.config.ts` — usa `LEGACY_REDIRECTS`
- `src/collections/Redirects.ts` — comentário corrigido
