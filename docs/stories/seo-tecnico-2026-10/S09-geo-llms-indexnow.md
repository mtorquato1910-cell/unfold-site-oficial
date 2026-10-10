# S09 — GEO: `/llms.txt` gerado pelo CMS e IndexNow

**Origem:** Plano de Ação (importante: "Criar o /llms.txt com método, serviços, cases e posts pilares") · Checklist M07 (llms.txt P3; IndexNow P2)
**Prioridade:** 🟢 P3 (llms.txt) / 🟡 P2 (IndexNow) · **Risco:** Baixo · **Executor:** @dev · **Revisão:** @qa
**Dependências:** S04 (lista de páginas noindex), S06 (descrição da empresa). Funciona antes de S07, mas fica melhor depois.
**Status:** 🟢 Implementado (2026-10-10). Falta: `INDEXNOW_KEY` em produção (OPS) e AC9.3 após o deploy

---

## Contexto

O Checklist M07 é claro: o Google **não** usa o llms.txt (AI Overviews usam a busca normal), mas outros agentes leem e o Lighthouse 13.3 audita. Custo baixo. O que mais pesa para ChatGPT/Copilot é estar no índice do Bing → IndexNow avisa o Bing a cada publicação.

---

## Acceptance Criteria

### 9.1 `/llms.txt`
- [x] **AC9.1a** Rota `src/app/llms.txt/route.ts` respondendo **200**, `Content-Type: text/plain; charset=utf-8`, com cache/ISR (`revalidate` + `revalidatePath('/llms.txt')` nas actions de post e case).
- [x] **AC9.1b** Gerado do CMS, seguindo o modelo do Checklist M07:
  ```
  # Unfold Growth
  > <descrição curta de src/lib/company.ts (S06)>

  <parágrafo: sede em Maceió (AL), atende todo o Brasil, empresas B2B de ciclo longo; método UGS (Diagnosticar, Estruturar, Operar, Evoluir); parceiros RD Station, Meta Business, Kommo; Assespro e Abradi AL>

  ## Sobre a empresa
  - [Home](https://unfoldgrowth.com.br/): …
  - [Sobre](…/sobre): …  - [Método UGS](…/metodo): …  - [Atuação](…/atuacao): …  - [Cases](…/cases): …  - [Contato](…/contato): …

  ## Ferramentas
  - [Diagnóstico de Growth](…/diagnostico): …  - [Calculadora de Tráfego](…/ferramentas/calculadora-trafego): …  - [Radar de Comitê de Compra](…/ferramentas/mapa-icp): …

  ## Cases
  - [<título>](…/cases/<slug>): <resumo>

  ## Guias e artigos principais
  - [<título>](…/blog/<slug>): <meta_description || excerpt>

  ## Optional
  - [Blog](…/blog): índice de todos os artigos
  - [<demais artigos>](…): …
  ```
- [x] **AC9.1c** "Artigos principais" = posts marcados como pilar. Se não houver flag, usar os posts com `destacar_na_home` (ou equivalente) e registrar a regra; os demais vão para `Optional`.
- [x] **AC9.1d** **Só URLs indexáveis com status 200**: fora as páginas legais, noindex (S04), rascunhos, URLs de resultado (`/diagnostico/r/*`, `/calculadora-trafego/r/*`) e qualquer origem de redirect (S02).
- [x] **AC9.1e** Formato `[nome](url): descrição` — descrições de uma linha, sem quebras nem markdown dentro.
- [x] **AC9.1f** Teste: snapshot do gerador com fixtures (post publicado entra, rascunho não entra, página legal não entra).

### 9.2 IndexNow (Bing / Copilot)
- [x] **AC9.2a** Chave IndexNow em env (`INDEXNOW_KEY`) e arquivo de verificação servido em `/<key>.txt` (rota dinâmica que lê a env — não commitar a chave).
- [x] **AC9.2b** Ao publicar, atualizar (mudança de `content_updated_at`) ou despublicar/excluir post ou case: `POST https://api.indexnow.org/indexnow` com a URL afetada (e `/blog`), **fora do caminho crítico** (não bloquear o save; erro só vai para log).
- [x] **AC9.2c** Só em produção (`VERCEL_ENV === 'production'`).
- [x] **AC9.2d** Teste unitário do cliente IndexNow com `fetch` mockado (payload correto, não dispara fora de produção, não lança erro em falha de rede).

### Qualidade
- [ ] **AC9.3** `curl https://unfoldgrowth.com.br/llms.txt` → 200, texto puro, sem URL quebrada (rodar o `check-internal-links` da S03 sobre os links do arquivo). Lint, typecheck, testes e build verdes.

## Registro de implementação (2026-10-10)

- **9.1:** `buildLlmsTxt()` (`src/lib/llms-txt.ts`, puro e testado) + rota `src/app/llms.txt/route.ts` (ISR 1h).
  - O cabeçalho usa `COMPANY` (S06): descrição, Maceió/AL, atendimento nacional, método UGS, parceiros e associações.
  - Seções: Sobre a empresa, Ferramentas gratuitas, Cases (só se houver publicados; hoje 0), Guias e artigos principais, Optional.
  - **AC9.1c — regra registrada:** "principais" = posts com `destaque_home` (os mesmos dos Insights da home); os demais publicados vão para `Optional`.
  - Ficam de fora: páginas legais (noindex), rascunhos, `/diagnostico/r/*`, origens de redirect e páginas de autor sem bio.
  - Descrições numa linha, sem markdown (`oneLine`).
  - `revalidatePath('/llms.txt')` nas actions de post (create/update/delete/approve) e case.
- **9.2:** `src/lib/indexnow.ts`.
  - Payload do protocolo com `keyLocation` = `/indexnow-key.txt`, servido por `src/app/indexnow-key.txt/route.ts` a partir da env `INDEXNOW_KEY` (não commitada; 404 sem chave). Foi preferido a `/<chave>.txt` porque uma rota dinâmica de um segmento na raiz roubaria a 404 do site.
  - Dispara via `after()` do Next (depois da resposta: não atrasa o save e não é cortado na serverless).
  - Só em `VERCEL_ENV=production`, com chave válida (8–128 `[a-zA-Z0-9-]`).
  - Avisa quando um post/case é criado publicado, publicado/despublicado, muda de slug (envia a URL nova e a antiga) ou muda de `content_updated_at`, além de exclusão e aprovação.
  - Falha de rede só gera log.
- **Testes:** `src/lib/__tests__/llms-indexnow.test.ts` (7).

## QA Results — 2026-10-10 (Quinn)

**Veredito: CONCERNS → resolvido.** tsc ✅ · 7/7 ✅ · lint ✅. O formato segue llmstxt.org; todas as rotas do arquivo existem e são indexáveis. A pasta com ponto no nome é rota válida e tem prioridade sobre o catch-all. `after()` com import dinâmico funciona em server action. `AbortSignal.timeout` existe no Node da Vercel.

| # | Sev. | Achado | Tratamento |
|---|---|---|---|
| 1 | Média | Delete avisava o Bing mas não revalidava a página do item (case excluído seguiria 200 no cache) | ✅ `revalidatePath` do post e do case excluídos |
| 2 | Baixa | `findByID` duplicado no `updatePost` | ✅ lido uma vez (redirect de slug + IndexNow) |
| 3 | Baixa | `oneLine` removia parênteses e outros sinais ("Custo por Lead CPL") | ✅ remove só sintaxe de link, ênfase e código; colchetes no nome viram parênteses |
| 4 | Baixa | Falha no CMS gerava `llms.txt` vazio em cache por 1h | ✅ fora do build relança o erro (o ISR mantém a última versão boa) |
| 5 | Baixa | Cases sem `select` | ✅ `select` com os campos usados (inclui os da S10) |
| 6 | Baixa | `updateCase` avisava em todo save | ✅ só com mudança de publicação, slug ou `content_updated_at` (S10 trouxe a data editorial aos cases) |
| 7 | Baixa | Barra final em `NEXT_PUBLIC_SITE_URL` gerava `//` | ✅ normalizado |
| 8–9 | Info | Filtro de origens de redirect; `res.ok` já cobre 202 | Registrado / ✅ simplificado |

## File List
- `src/lib/llms-txt.ts` (novo) · `src/app/llms.txt/route.ts` (novo)
- `src/lib/indexnow.ts` (novo) · `src/app/indexnow-key.txt/route.ts` (novo)
- `src/lib/__tests__/llms-indexnow.test.ts` (novo)
- `src/lib/actions/posts-actions.ts`, `src/lib/actions/cases-actions.ts`, `src/lib/actions/blog-submit-actions.ts`: revalidação do llms.txt + IndexNow
