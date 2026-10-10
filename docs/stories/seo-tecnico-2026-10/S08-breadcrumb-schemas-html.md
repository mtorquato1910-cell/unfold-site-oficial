# S08 — Breadcrumb visível, ajustes de schema e de HTML

**Origem:** Plano de Ação (críticas: SearchAction, Article image, breadcrumb visível; importantes: Service/CollectionPage, H3 da newsletter, alt + lazy nos diagramas) · Checklist M04, M06
**Prioridade:** 🔥 P1 (8.1–8.3) / 🟡 P2 (8.4–8.6) · **Risco:** Baixo · **Executor:** @dev · **Revisão:** @qa
**Dependências:** nenhuma (S06 e S07 complementam o mesmo `SchemaOrg.tsx`; coordenar merges).
**Status:** 🟢 Implementado (2026-10-10). AC8.7 (validador do Google) após o deploy

---

## Acceptance Criteria

### 8.1 Breadcrumb visível (Plano + Checklist M06)
- [x] **AC8.1a** Componente de breadcrumb visível (reaproveitar `src/components/ui/breadcrumb.tsx`, hoje sem uso) **acima do H1** em: posts (Início › Blog › Título), cases (Início › Cases › Título) e, quando existir, autor (Início › Autores › Nome).
- [x] **AC8.1b** Cada nível é `<a href>` rastreável; o **último item sem link** (`aria-current="page"`).
- [x] **AC8.1c** O caminho é **gerado da mesma fonte** que o JSON-LD `BreadcrumbList` (um único array alimenta os dois), garantindo identidade. Cases passam a ter BreadcrumbList (hoje só posts têm).
- [x] **AC8.1d** O "Voltar ao blog" atual (`blog/[slug]/page.tsx:185-190`) é substituído pelo breadcrumb.

### 8.2 SearchAction do WebSite (Plano)
- [x] **AC8.2** **Default (enquanto P2 não for respondida): remover** o `potentialAction`/SearchAction de `SchemaOrg.tsx:24-38`, conforme o Plano (aponta para `/blog?q=`, que não existe). Se o cliente optar por criar a busca, a story da busca o recoloca.

### 8.3 Article (Plano)
- [x] **AC8.3a** `image` no Article = capa do post (URL absoluta, `ImageObject` com width/height quando disponíveis); fallback para a og:image padrão (S04 AC4.2b).
- [x] **AC8.3b** Usar `BlogPosting` (subtipo de Article) — opcional, registrar a escolha.
- [ ] **AC8.3c** (Autor Person → S07; publisher @id → S06; dateModified → S01.)

### 8.4 Service e CollectionPage (Plano)
- [x] **AC8.4a** `/atuacao`: um `Service` por serviço exibido na página (name, description, `provider: {"@id": ".../#organization"}`, `areaServed: Brasil`). Os serviços do texto "Versão para o site" são Consultoria de Growth, Geração de Demanda, CRM e Automação, Conteúdo e Presença Digital — **usar os nomes que estiverem visíveis na página** (o schema precisa ser igual ao conteúdo visível — Checklist M06).
- [x] **AC8.4b** `/metodo`: `Service` (ou `HowTo` se a página descrever as 4 etapas do UGS — Diagnosticar, Estruturar, Operar, Evoluir — como passos; escolher o tipo que bate com o conteúdo e registrar).
- [x] **AC8.4c** `/blog`: `CollectionPage` com `mainEntity` `ItemList` dos posts listados (url + name + position).

### 8.5 Hierarquia de headings (Plano + Checklist M06)
- [x] **AC8.5a** Rodapé: o `<h3>` da newsletter (`Footer.tsx:60-62`) vira `<p>` com as mesmas classes visuais.
- [x] **AC8.5b** Varredura rápida em componentes reutilizáveis (cards de post/case, sidebars, CTA) por headings fixos que quebram a hierarquia; corrigir os que estiverem fora de H2→H3 e listar no Dev Notes.

### 8.6 Imagens dentro dos posts (Plano + Checklist M04)
- [x] **AC8.6a** No render do `conteudo_html` (`src/components/RichContent.tsx` / pipeline de `addHeadingIds`), acrescentar `loading="lazy"` e `decoding="async"` em todas as `<img>`, **exceto a primeira imagem se ela estiver acima da dobra** (manter eager). Fazer no render (o sanitizer `html-sanitize.ts:28` remove `loading` do HTML salvo — não mexer no conteúdo gravado).
- [x] **AC8.6b** Garantir `width`/`height` em todas as `<img>` renderizadas (as que não tiverem → listar).
- [x] **AC8.6c** Relatório (script ou query) das imagens de conteúdo com `alt=""` ou sem alt, por post, para o Ferraz preencher (o diagrama `diagrama-ugs-ciclo.webp` é o exemplo citado). Escrever alt é tarefa de conteúdo, não de código; o painel já exige alt em novos uploads (S01 de agosto, AC1.6a).

### Validação
- [ ] **AC8.7** Teste de Resultados Avançados: post (Article + BreadcrumbList + FAQ), case (BreadcrumbList), `/atuacao` (Service), `/blog` (CollectionPage), home (sem SearchAction) — sem erros.
- [x] **AC8.8** Lint, typecheck, testes e build verdes; validação visual do breadcrumb (desktop e mobile).

## Registro de implementação (2026-10-10)

- **8.1:** `src/components/site/Breadcrumbs.tsx` renderiza a trilha visível (`<nav><ol>`, `<a href>` por nível, último item sem link com `aria-current="page"`) **e** o `BreadcrumbList` a partir do **mesmo array**.
  - Usado em: posts (Início › Blog › Título; substitui o "Voltar ao blog"), cases (Início › Cases › Título; substitui o "Todos os cases" do topo) e páginas de autor (Início › Blog › Nome).
- **8.2:** SearchAction removido do WebSite (feito junto com a S06). Se P2 = criar busca, volta com a busca.
- **8.3:** `image` (capa, URL absoluta) no Article. **8.3b:** tipo `BlogPosting` (subtipo de Article, mais específico para blog) + `mainEntityOfPage` (feito junto com a S07).
- **8.4a — /atuacao:** um `Service` para cada um dos 3 **modelos de engajamento visíveis** (Estrutura de Crescimento, Assessoria Contínua, Projetos Personalizados). A lista virou a constante `ENGAGEMENT_MODELS`, que alimenta a seção e o schema. `provider` → Organization, `areaServed` Brasil.
  - Os nomes da "Versão para o site" (Consultoria de Growth, Geração de Demanda…) **não** estão visíveis na página, por isso não entraram no schema (regra: schema = conteúdo visível).
- **8.4b — /metodo:** `Service` "Método UGS — Unfold Growth System" com `hasOfferCatalog` dos 4 pilares visíveis (Diagnosticar, Estruturar, Operar, Evoluir), a partir da constante `PILLARS` que já existia. Escolhido Service e não HowTo: a página descreve uma oferta, não um passo a passo para o leitor executar.
- **8.4c — /blog:** `CollectionPage` + `ItemList` dos artigos listados (`isPartOf` → WebSite).
- **8.5a:** o H3 da newsletter virou `<p>` (feito junto com a S06). **8.5b:** a varredura em `components/layout`, `site` e `blog` não achou outros headings fixos fora da hierarquia. O `ConversaoContent` usa H2 de seção, o que é legítimo.
- **8.6a:** `lazyContentImages()` aplicado no `RichContent`, ou seja, no render, porque o sanitizer remove `loading` do HTML salvo. Todas as imagens do corpo recebem `loading="lazy"` e `decoding="async"`: a capa vem antes do corpo, então as do corpo ficam abaixo da dobra.
- **8.6b/c — relatório** `scripts/report-content-images.ts` → `backups/imagens-conteudo-2026-10-10.md`: **73 imagens sem alt** (diagramas) e **0 sem width/height** em 42 posts. O alt é tarefa de conteúdo (Ferraz), entra no OPS.

## QA Results — 2026-10-10 (Quinn)

**Veredito: CONCERNS → resolvido.** vitest ✅ · lint ✅. Breadcrumbs acessível e idêntico ao JSON-LD; `ServiceSchema` e `CollectionPage` válidos e iguais ao conteúdo visível; lazy load correto (o RichContent só aparece abaixo da dobra).

| Sev. | Achado | Tratamento |
|---|---|---|
| Média | Typecheck vermelho (teste da S07) | ✅ corrigido |
| Média | AC8.3a parcial: `image` sem `ImageObject` e sem fallback | ✅ `ImageObject` com width/height da mídia; sem capa → og:image padrão |
| Baixa | `serviceType` fixo e descrição do Método não visíveis | ✅ `serviceType` removido; a descrição usa `metodo.subtitle` (texto visível) |
| Baixa | `JsonLd` sem escapar `<` (título com `</script>` quebraria a página) | ✅ `<` → `<`; teste de regressão |
| Info | `ArrowRight` sem uso em `/atuacao` (anterior) | Registrado |

## File List
- `src/components/site/Breadcrumbs.tsx` (novo)
- `src/components/SchemaOrg.tsx`: `ServiceSchema`, `CollectionPageSchema` (e BlogPosting/image na S07)
- `src/app/(site)/atuacao/page.tsx` (`ENGAGEMENT_MODELS` + Service), `src/app/(site)/metodo/page.tsx` (Service UGS), `src/app/(site)/blog/page.tsx` (CollectionPage)
- `src/app/(site)/blog/[slug]/page.tsx`, `src/app/(site)/cases/[slug]/page.tsx`: breadcrumb visível
- `src/lib/content-images.ts` (novo) + `src/lib/__tests__/content-images.test.ts` (novo) · `src/components/RichContent.tsx`
- `scripts/report-content-images.ts` (novo) · `backups/imagens-conteudo-2026-10-10.md` (gerado)
