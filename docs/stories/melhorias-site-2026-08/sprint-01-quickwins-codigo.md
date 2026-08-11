# S01 — Quick-wins de código (SEO)

**Itens do doc:** 1.1 (canonical), 1.2 (nofollow interno), 1.5a (marca duplicada), 1.6a (alt obrigatório), 1.8 (H1 /contato, âncora de seção, noindex /contribuir)
**Prioridade:** 🔥 P1 · **Risco:** Baixo · **Responsável:** Torquato
**Dependências:** nenhuma — pode ir para `main` isoladamente
**Estimativa:** 1–1,5 dia
**Status:** 🟢 Código implementado (branch `feat/seo-quickwins-s01`) · tsc limpo · lint OK · build OK · 2026-08-07

---

## Status de execução (2026-08-07)

**Feito no código:**
- ✅ 1.1 Canonical — helper `src/lib/seo/canonical.ts` + `alternates.canonical` em home, sobre, metodo, atuacao, diagnostico, blog, cases, contato, ferramentas, calculadora-trafego, termos, politica, lgpd, diagnostico/privacidade, blog/[slug], cases/[slug]. (telas de resultado `[token]/[hash]` e mapa-icp/montar são `noindex` — sem canonical, correto.)
- ✅ 1.2 Sanitização — `html-sanitize.ts`: mesmo-domínio (`*.unfoldgrowth.com.br`, absoluto ou relativo) não recebe mais `nofollow`/`target=_blank`.
- ✅ 1.5a Marca — removida a duplicação `| Unfold Growth` de todas as estáticas + dinâmicas (template do layout é a única fonte da marca agora).
- ✅ 1.6a Alt — `Media.alt` obrigatório só no create (validate).
- ✅ 1.8 — `<h1>` no /contato (ContatoForm), âncora corta em fronteira de hífen + ancora H2–H6 (índice segue H2/H3), `/blog/contribuir` → `noindex`.

**Pendente (operação de dados, não código):**
- ⏳ 1.2b **Varredura dos 31 artigos** (normalizar links internos absolutos → relativos no `conteudo_html`). É operação destrutiva no banco → exige snapshot + dry-run. **Decisão da revisão (C3):** rodar na MESMA passada da normalização de heading de S05, com um único snapshot. Até lá, a correção da sanitização já impede novos casos.
- ℹ️ 1.2c/d Verificado: "leia também"/cards de recirculação **não** passam por `sanitizeRichHtml` (montados de dados), então não são afetados.

---

## Contexto

Correções pontuais de código, cada uma aplicada de uma vez a dezenas de páginas. São de baixo risco e alto alcance — devem sair primeiro e ir direto para `main`. Nenhuma altera aparência.

---

## Acceptance Criteria

### 1.1 — Canonical (endereço oficial)
- [ ] **AC1.1a** Toda rota do site principal emite `<link rel="canonical">` apontando para si mesma, sem query string (remove ruído de `?gclid`, `?fbclid`, `?utm_*`).
- [ ] **AC1.1b** Implementado de forma central/reutilizável (helper), não repetido rota a rota.
- [ ] **AC1.1c** O subdomínio `eleicoes.unfoldgrowth.com.br` (que já tem canonical próprio) não é afetado.

### 1.2 — Links internos com "não siga"
- [ ] **AC1.2a** A sanitização deixa de marcar `nofollow`/`target=_blank` em links do **mesmo domínio**, mesmo quando escritos em formato absoluto (`https://unfoldgrowth.com.br/...`).
- [ ] **AC1.2b** Os 31 artigos salvos são varridos: links internos absolutos normalizados para relativos (`/blog/...`).
- [ ] **AC1.2c** Verificado que o card "Leia também" e demais componentes de recirculação **não** passam por sanitização que adicione `nofollow`.
- [ ] **AC1.2d** Verificado se a mesma sanitização roda em outros campos com HTML (descrição de categoria, páginas institucionais) e se causa o mesmo efeito.

### 1.5a — Marca duplicada no título
- [ ] **AC1.5a** Removida a duplicação `| Unfold Growth | Unfold Growth`. A marca passa a vir **só** do template do layout; cada página informa apenas o próprio nome.
- [ ] **AC1.5b** `/contato` e `/ferramentas` deixam de repassar a marca manualmente; varridas as demais institucionais para o mesmo padrão.
- [ ] **AC1.5c** Posts do blog e cases não duplicam mais a marca (hoje passam string que soma ao template).

### 1.6a — Alt obrigatório (campo)
- [ ] **AC1.6a** `Media.alt` passa a ser **obrigatório só no create** (não retroativo — não trava edição de posts legados sem alt). O barramento efetivo da imagem inserida **no editor** (que grava `<img>` no HTML, não cria doc `media`) é responsabilidade de **S03/T2** (modal de imagem). Aqui é só o campo da collection.

### 1.8 — Correções pontuais
- [ ] **AC1.8a** `/contato` passa a ter um `<h1>` real (hoje o título é `<h2>` no formulário).
- [ ] **AC1.8b** O gerador de âncora de seção corta em **palavra inteira**, não no meio (ex.: `.../confus` → `.../confusao`).
- [ ] **AC1.8c** `/blog/contribuir` marcado com `noindex` (é página operacional).

---

## Tarefas técnicas (com localização real)

### T1 — Canonical central
- [ ] Criar helper (ex.: `src/lib/seo/canonical.ts`) que, dado o pathname, retorna `alternates: { canonical }` absoluto sem query.
- [ ] Aplicar no `generateMetadata` das rotas (ou centralizar no layout raiz `src/app/(site)/layout.tsx` + por-rota nas dinâmicas `blog/[slug]`, `cases/[slug]`).
- [ ] `metadataBase` já existe em `layout.tsx:44` — reaproveitar.
- [ ] Nota: reaproveitar o que a Sprint 10 (SEO Manager) já previa (`canonicalUrl` em `seoFields()`), se for seguir aquela factory.

### T2 — Sanitização de links (item 1.2)
- [ ] Em `src/lib/html-sanitize.ts:41-49`, trocar a heurística "externo = começa com http(s)" por "externo = domínio ≠ unfoldgrowth.com.br". Links do próprio domínio (absolutos ou relativos) não recebem `nofollow`/`target=_blank`.
- [ ] Script de varredura única sobre os posts (campo `conteudo_html`): reescrever `https://unfoldgrowth.com.br/x` → `/x`. Rodar em piloto (3 posts) antes dos 31.
- [ ] Conferir componentes de recirculação (`blog/[slug]/page.tsx` "leia também", cards) — não passam por `sanitizeRichHtml`, confirmar.

### T3 — Marca no título (item 1.5a)
- [ ] `src/app/(site)/layout.tsx:38` já tem `template: '%s | Unfold Growth'`. Manter.
- [ ] `src/app/(site)/blog/[slug]/page.tsx:66` — trocar `title: \`${titulo} | Blog | Unfold Growth\`` por `title: \`${titulo} | Blog\`` (deixa o template somar a marca uma vez). Repetir em `cases/[slug]/page.tsx:59`.
- [ ] `src/app/(site)/contato/page.tsx:6` e `ferramentas/page.tsx:8` — remover `| Unfold Growth` do title.
- [ ] Grep por `Unfold Growth` em todos os `title:` de `generateMetadata`/`metadata` para pegar institucionais restantes.

### T4 — Alt obrigatório (item 1.6a)
- [ ] `src/collections/Media.ts` — tornar `alt` `required: true` **apenas no create** (validação condicional, não bloquear update de docs legados). Não exige migration (coluna já existe).
- [ ] Barramento no editor fica em S03/T2 — aqui não.

### T5 — Pontuais (item 1.8)
- [ ] `src/components/contato/ContatoForm.tsx:83` — o `<h2>` "Vamos conversar..." vira `<h1>` (ou adicionar `<h1>` na page).
- [ ] `src/lib/article-toc.ts` — **(a)** `slugify` (`:20`) corta no `.slice(0,60)` e o mesmo id alimenta a âncora do heading **e** o link do TOC → cortar na **última fronteira de hífen** antes de 60 (resolve nos dois lugares). **(b)** `addHeadingIds` (`:34`) usa regex `h[23]` e `TocItem.level: 2|3` → **ampliar para `h[2-6]`** e o tipo, para o TOC refletir H4–H6 que S02 introduz.
- [ ] `/blog/contribuir` — adicionar `robots: { index: false, follow: true }` no `generateMetadata`/`metadata` da página (`blog/contribuir/page.tsx:8`, hoje `index:true`).

---

## Definition of Done

- [ ] `view-source` de qualquer página mostra 1 canonical self-referencing sem query.
- [ ] Título do blog no Google preview aparece 1× "Unfold Growth", não 2×.
- [ ] Um link interno escrito como URL absoluta dentro de um artigo **não** sai com `rel="nofollow"`.
- [ ] `/contato` tem exatamente um `<h1>`.
- [ ] Upload sem alt é bloqueado com mensagem.
- [ ] `/blog/contribuir` responde com `noindex`.
- [ ] `npm run build` + `npm run lint` verdes. Levado a `main`.

---

## Riscos / atenção

- **Alt obrigatório:** resolvido — required só no create (AC1.6a). Não bloqueia posts legados.
- **Canonical em rotas com paginação/filtro** (ex.: `/blog?page=2`): regra fixada — canonical = self com o **path**, sem query. Se a paginação usar query, cada página canoniza para si sem a query (revisar se houver paginação por segmento).
- **Ordem vs S05:** a varredura de links (T2, item 1.2) e a normalização de heading (S05) escrevem no mesmo `conteudo_html`. **S01 roda primeiro**; S05 assume esse estado. Usar **snapshot único** e dry-run antes de gravar (não rodar as duas passadas sem backup).

---

*— SM · 2026-08-07*
