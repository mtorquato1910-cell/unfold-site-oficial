# S03 — Editor: texto corrido (etapa 2)

**Itens do doc:** 1.3 etapa 2 · 1.6b (imagem com alt + dimensão)
**Prioridade:** 🔥 P1 · **Risco:** Médio · **Responsável:** Torquato
**Dependências:** S02 (hierarquia e cabeçalho já no lugar)
**Estimativa:** 3–4 dias
**Status:** 🟢 Código implementado (branch `feat/seo-quickwins-s01`) · tsc + build OK · 2026-08-07

---

## Status de execução (2026-08-07)

**Feito no código:**
- ✅ Editor único de texto corrido: `RichTextEditor` ganhou variant **`article`** (1 instância TipTap para o artigo inteiro) — elimina por construção o travamento de N editores.
- ✅ `PostsClient` troca `<BlockEditor>` por `<RichTextEditor variant="article">`; hint atualizado.
- ✅ Barra: **H2–H6** (nomes técnicos "Título N (HN)"), negrito, itálico, sublinhado, lista, lista numerada, citação, link, imagem, tabela, YouTube, **linha divisória**. **H1 não está na barra** (vem do título).
- ✅ Tabela = `<table>` HTML real (extensão TipTap Table); imagem via `setFigure`; vídeo via placeholder `<div data-youtube>` (compatível com sanitize + RichContent).
- ✅ **Imagem exige alt** (prompt obrigatório; sem descrição, não insere) — item 1.6b na origem.
- ✅ **Dimensão automática da imagem** (item 1.8): `imageDimensions()` lê `naturalWidth/Height` no upload; `Figure` grava `width`/`height` no `<img>`; sanitize libera esses atributos; `RichContent` (dangerouslySetInnerHTML) os preserva → reserva espaço e evita CLS. *(corrigido após QA)*
- ✅ Colagem do Word/Docs preservando títulos: comportamento padrão do StarterKit do TipTap.
- ✅ Compatível com o pipeline atual: `getHTML()` → `sanitizeRichHtml` → `conteudo_html`; conteúdo antigo abre no editor único.

**Pendente / notas:**
- ⏳ **Validação no browser**: escrita fluida, colagem preservando níveis, inserção de imagem (alt + dimensão), tabela, e **abrir post legado com H1 no corpo** (o variant `article` não tem H1 nos levels — ao abrir, o TipTap pode rebaixar um H1 herdado; a migração S05 normaliza, mas vale conferir no piloto).
- ℹ️ `BlockEditor.tsx` **não é dead code**: segue usado por `CasesClient.tsx` e `ContribuirClient.tsx` (variant `text` interno). Saiu apenas do fluxo de posts. Não remover.
- ℹ️ Variant `full` (cases/depoimentos) permanece com H1 na barra — fora do escopo (posts usam `article`).

---

## Contexto

Substituir o modelo de blocos por um editor único de texto corrido, onde o artigo é escrito de ponta a ponta como num documento do Word. Entrega produtividade para a redação e melhora a leitura por IA (texto contínuo em vez de fragmentos na UI).

**Base já favorável (validado):** o conteúdo já é salvo como **HTML único** (`conteudo_html`), não como blocos serializados — então isso é troca da experiência de edição, não do formato de dados. E o travamento antigo (N editores TipTap simultâneos, mitigado com `LazyText`) **desaparece** com um editor único.

---

## Acceptance Criteria

- [ ] **AC1** Editor único de texto corrido (um TipTap para o artigo inteiro) substitui a montagem por blocos.
- [ ] **AC2** Barra de formatação com: Parágrafo, Título 2–6 (H2–H6, nomenclatura técnica), negrito, itálico, lista com marcador, lista numerada, citação, link, imagem, tabela, linha divisória.
- [ ] **AC3** H1 **não** está na barra (vem do cabeçalho, S02).
- [ ] **AC4** **Tabela é HTML real** (nunca imagem de tabela) — inserção via botão.
- [ ] **AC5** Inserção de imagem exige **descrição (alt) obrigatória** e preenche **dimensão automaticamente** (width/height) para evitar salto de layout.
- [ ] **AC6** Colar do Word / Google Docs **preserva os níveis de título** (H2→H2 etc.) em vez de virar texto plano.
- [ ] **AC7** O HTML gerado continua passando por `sanitizeRichHtml` e sendo salvo em `conteudo_html` (compatível com o render atual `RichContent`).
- [ ] **AC8** Sem regressão de travamento ao editar artigos longos.

---

## Tarefas técnicas

### T1 — Editor único
- [ ] Refatorar `src/components/painel/BlockEditor.tsx` → editor único TipTap (ou novo `ArticleEditor.tsx`). Reusar a config de `RichTextEditor.tsx`.
- [ ] Extensões TipTap: Heading (2–6), Bold, Italic, BulletList, OrderedList, Blockquote, Link, Image, Table, HorizontalRule.
- [ ] Saída: `getHTML()` → `conteudo_html` (mesmo pipeline de `posts-actions.ts:71` com `sanitizeRichHtml`).

### T2 — Tabela, imagem, colagem
- [ ] Extensão de tabela (`@tiptap/extension-table` + rows/cells) gerando `<table>` real (allowlist já cobre em `html-sanitize.ts:23`).
- [ ] Imagem: modal exige alt; calcular width/height no upload (dimensão automática — resolve item 1.8 "imagens sem dimensão" na origem).
- [ ] Colagem inteligente: garantir que o parser do TipTap preserva headings do HTML colado (Word/Docs). Testar com colagem real.

### T3 — Compatibilidade e migração de leitura
- [ ] Posts com `conteudo_html` abrem no novo editor sem perda.
- [ ] Posts legados só com `conteudo` (Lexical) — definir comportamento de abertura (converter na abertura ou tratar em S05). Preferência: tratar em S05 (migração), aqui só garantir que não quebra.

---

## Definition of Done

- [ ] Redator escreve um artigo de ponta a ponta sem "montar blocos".
- [ ] Tabela inserida sai como `<table>` no `view-source`, não `<img>`.
- [ ] Imagem sem alt não pode ser inserida; imagem inserida tem width/height.
- [ ] Colar do Google Docs preserva H2/H3.
- [ ] Editar um artigo de 2.000+ palavras não trava.
- [ ] Build + lint verdes; validado no browser. Levado a `main`.

---

## Riscos / atenção

- **Paridade de recursos:** o modelo de blocos fazia bem tabela/imagem/vídeo com estrutura própria; garantir que o texto corrido cobre todos (o doc lista tabela, imagem e FAQ como "compensações" — FAQ vai em S04).
- **YouTube facade:** o render atual usa `<div data-youtube="ID">` (`html-sanitize.ts:29`). Manter a inserção de vídeo compatível com esse placeholder.
- **Não usar Editor.js** (é editor de blocos — o modelo que estamos abandonando). Manter TipTap.

---

*— SM · 2026-08-07*
