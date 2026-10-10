# S03 — Remoção dos links quebrados nos 19 posts

**Origem:** Plano de Ação (crítica: "Corrigir os links quebrados nos 19 posts", Anexo C) · Decisões D1 e D2 · Reunião 07/10 ("pode só retirar para ficar mais fácil")
**Prioridade:** 🔥 P1 · **Risco:** Médio (reescreve conteúdo de produção) · **Executor:** @dev · **Revisão:** @qa + aprovação do dono na prévia
**Dependências:** **S01 em produção** (flag `technicalEdit` — sem ela o script volta a "atualizar" 19 posts no sitemap).
**Status:** 🟡 Script pronto + prévia gerada (2026-10-10). **Aguarda:** aprovação da prévia pelo dono (AC3.7) e S01 em produção → então `--apply`

---

## Contexto

O Anexo C lista 19 posts com links internos para URLs que dão 404. Decisão D2: **remover** o link, sem substituir. Precedente de script em massa: `scripts/migrate-articles-headings.ts` (S05 de agosto) e os backups `backups/posts-html-before-*.json`.

Slugs-alvo (links a remover onde aparecerem, com ou sem domínio, com ou sem barra final):
`as-metricas-de-growth-que-importam`, `geracao-de-demanda-x-geracao-de-leads` (slug **exato**, não o longo que começa igual), `receita-previsivel`, `previsibilidade-comercial-na-incorporadora`, `marketing-para-incorporadoras-e-construtoras`, `por-que-incorporadora-gera-leads-e-nao-vende`, `crm-para-incorporadora` (exato), `sales-enablement-incorporadora`, `/calculadora` (exato, não `/ferramentas/calculadora-trafego`).

## Story

**Como** leitor e como Googlebot,
**quero** que nenhum link dentro dos artigos leve a uma página inexistente,
**para que** a experiência e o rastreamento não sejam prejudicados.

---

## Acceptance Criteria

### Script
- [x] **AC3.1** Script `scripts/remove-broken-links.ts`, com modos `--dry-run` (padrão) e `--apply`.
- [x] **AC3.2** Detecção por **match exato do caminho** (após normalizar: remover domínio `unfoldgrowth.com.br`/`www.`, query, hash e barra final). Nunca por prefixo — `crm-para-incorporadora-como-organizar-o-funil-de-lancamento` **não** pode ser tocado.
- [x] **AC3.3** Regra padrão (D2): substituir `<a …>texto</a>` pelo `texto` (mantém formatação interna como `<strong>`).
- [x] **AC3.4** Regra de bloco (D2): remover o **item inteiro** quando o link estiver em:
  - `<li>` cujo texto, sem o link, fica vazio ou só pontuação/conectivos ("Leia também", "Veja", "→", ":"), ou
  - `<p>` que começa com "Leia também", "Veja também", "Saiba mais", "Confira" ou similar e cujo conteúdo útil é só o link.
  - Se a `<ul>`/`<ol>` ficar vazia, remover a lista; se o título imediatamente anterior for "Leia também"/"Artigos relacionados" e ficar sem lista, remover o título também.
- [x] **AC3.5** Casos ambíguos (frase com conteúdo próprio além do link, mas que pode "depender" dele) **não** são removidos automaticamente: entram no relatório como `REVISAR` e por padrão recebem só a regra do AC3.3.
- [x] **AC3.6** O dry-run gera `backups/broken-links-preview-<data>.md` com, por post: slug, cada ocorrência, a regra aplicada (`UNWRAP`/`REMOVE_BLOCK`/`REMOVE_SENTENCE`/`REMOVE_CLAUSE`/`REVISAR`) e o trecho antes → depois.
- [ ] **AC3.7** **Gate humano:** o `--apply` só roda depois que o dono aprovar o relatório do AC3.6 (registrar a aprovação no Change Log desta story).
- [x] **AC3.8** O `--apply` grava backup completo antes (`backups/posts-html-before-brokenlinks-<data>.json`: id, slug, `conteudo_html`, `content_updated_at`, `updated_at`) e atualiza via `payload.update({ …, context: { technicalEdit: true } })`.
- [ ] **AC3.9** **`content_updated_at` não muda** em nenhum dos 19 posts (conferir antes/depois no relatório final).
- [x] **AC3.10** Idempotente: rodar `--apply` de novo não altera nada (0 ocorrências).
- [ ] **AC3.11** Após aplicar: `revalidatePath` de cada post alterado e de `/blog` (ou chamar a rota de revalidação existente).
- [x] **AC3.12** Script de rollback documentado (restaura `conteudo_html` a partir do backup, também com `technicalEdit`).

### Verificação ("rastrear de novo")
- [x] **AC3.13** Script `scripts/check-internal-links.ts`: lê **todos** os posts publicados (não só os 19), extrai todo `href` interno e faz `HEAD`/`GET` em produção. Saída: tabela post → link → status. **Critério: zero 4xx.** Links que redirecionam (301/308) são listados como aviso (Checklist M03: links internos devem apontar para a URL final).
- [x] **AC3.14** Rodar também nos cases e nas páginas institucionais (links fixos no código) — ao menos um `grep` pelos slugs-alvo em `src/`.
- [ ] **AC3.15** Resultado do AC3.13 anexado ao Dev Notes e enviado ao Ferraz com a lista dos 19 posts para "Solicitar indexação" no GSC.

### Qualidade
- [x] **AC3.16** Testes unitários do transformador de HTML cobrindo: unwrap simples; link com `<strong>` dentro; `<li>` "Leia também"; parágrafo "Veja também"; slug longo parecido que **não** deve ser tocado; URL absoluta com www e barra final; lista que fica vazia.
- [x] **AC3.17** Lint, typecheck, testes verdes.

## Dev Notes

- Usar parser de HTML (o projeto já usa `sanitize-html`; para transformação, preferir `node-html-parser` ou `cheerio` se já estiver nas dependências — verificar antes de adicionar pacote).
- O HTML gravado precisa continuar passando por `src/lib/html-sanitize.ts`.
- Lista de posts do Anexo C (para conferência, não para filtrar — o script varre todos): como-escolher-o-funil-de-vendas-certo, como-estruturar-um-time-de-growth, dashboard-comercial, funil-de-marketing-x-funil-de-vendas, pipeline-de-vendas, sdr, geracao-de-demanda-x-…-b2b, funil-de-vendas, marketing-b2b, ltv, vendas-b2b, playbook-de-vendas, processo-comercial, agencia-de-trafego-ou-assessoria-de-growth, funil-de-vendas-para-construcao-civil, permuta-vgv-e-funil-estrutura-financeira-e-vendas, conversao-de-leads-em-2026-…, por-que-sua-incorporadora-gera-leads-…, marketing-e-growth-para-incorporadoras-e-construtoras.

## Definition of Done
- Prévia aprovada, aplicado em produção, AC3.9 e AC3.13 (zero 4xx) comprovados, Ferraz notificado.

## Registro de implementação (2026-10-10)

- **Prévia gerada:** `backups/broken-links-preview-2026-10-10.md`. São **34 ocorrências em 19 posts**: REMOVE_BLOCK 17 (itens de "Leia também"), REMOVE_SENTENCE 8, REMOVE_CLAUSE 4, UNWRAP 4, REVISAR 1.
- O conjunto bate com o Anexo C: os mesmos 19 posts. A varredura lê **todos** os posts, não uma lista fixa.
- **Regras afinadas lendo os casos reais:**
  - Frases de referência removidas: "Esse é o tema de X.", "Aprofundamos isso em X.", "É exatamente o que detalhamos em X.", "É a tese que sustenta X.", "Essa é a lógica que detalhamos em X.".
  - Orações removidas: ", assunto de X.", ", tema que detalhamos em X.".
  - Coordenação: "detalhados em A **e em X**." vira "detalhados em A.".
  - O `<u>` que o editor põe dentro dos links sai junto no UNWRAP, para o texto não continuar parecendo clicável.
- **REVISAR (1):** "É o papel do sales enablement na incorporação." fica sem link. A frase continua fazendo sentido.
- ⚠️ **Para o dono decidir na aprovação:** 2 das 4 UNWRAP são a menção à **"Calculadora de Tráfego x Receita da Unfold"** (posts marketing-e-growth-para-incorporadoras-e-construtoras e por-que-sua-incorporadora-gera-leads…). A decisão D2 manda remover sem substituir, então o texto fica sem link para a calculadora, que existe em `/ferramentas/calculadora-trafego`. Para manter esse link de conversão, basta religá-lo no painel depois; editar o link não altera a data.
- **AC3.13 — linha de base (10/10, antes do apply):** `check-internal-links.ts` encontrou **9 caminhos com 404**, exatamente os alvos do script, e **0 redirecionamentos**. Nenhum outro link interno quebrado. Após o apply, a expectativa é zero.
- **AC3.14:** nenhum dos alvos aparece em código fixo em `src/` (busca feita na S02).
- **AC3.11:** o script roda fora do Next (sem `revalidatePath`); as páginas de post têm `revalidate = 60`, então o site reflete a mudança em até 1 min. O sitemap não muda (a data é técnica).
- O dry-run lê direto do Postgres em modo somente leitura e funciona antes da S01 em produção. O `--apply` usa o Payload, que exige a coluna `content_updated_at`.

## QA Results — 2026-10-10 (Quinn)

**Veredito: CONCERNS → resolvido.** Os 34 casos do relatório estão em português correto, sem texto solto, e a prévia está liberada para aprovação. Achados:

| Sev. | Achado | Tratamento |
|---|---|---|
| Alta | `tsc`: erro de tipo em `check-internal-links.ts:75` | ✅ `doc: Document`; `tsc --noEmit` limpo |
| Média | Backup sem `content_updated_at`/`updated_at` (AC3.8/3.9) | ✅ backup traz as datas; ao final o script **confere** que `content_updated_at` não mudou e sai com 1 se mudou |
| Média | Backup sobrescrito num 2º apply no mesmo dia; sem try/catch por post | ✅ nome com data+hora + `flag: 'wx'`; erro por post não para os demais, lista quem falhou e sai com 1 |
| Média | REMOVE_BLOCK apagava imagem e removia `<td>`/`<h*>` | ✅ só `<p>`/`<li>` sem mídia; em célula/título faz UNWRAP |
| Média | "e em X" cortava sem outro link antes | ✅ exige `</a>` antes; senão REVISAR |
| Média | Regex "é a ideia/tese…" sem âncora final | ✅ ancorado (≤ 5 palavras + preposição/"sustenta") |
| Baixa | Corte podia desbalancear `<em>`/`<strong>` | ✅ checagem de tags balanceadas; se não, REVISAR |
| Baixa | Espaço antes de `<br>` final; link direto no `<body>` | ✅ aparado; guarda para `body` |
| Baixa | 2 alvos fora da story (`/processo-comercial`, `quanto-investir-…`) | Mantidos e documentados no script (eram 404 em 07/10; 0 ocorrências) |
| Baixa | Nomes de regras no AC3.6 | ✅ texto do AC atualizado |
| Baixa | `getPayload` a cada update | ✅ instância única |

7 testes de regressão novos (24 no total). A prévia regenerada saiu **idêntica** (34 ocorrências, mesma distribuição), ou seja, o reforço não alterou nenhum caso real.

## File List
- `src/lib/broken-links.ts` (novo): regras de transformação, `internalPath`
- `src/lib/__tests__/broken-links.test.ts` (novo): 17 testes
- `scripts/remove-broken-links.ts` (novo): dry-run, `--apply`, `--rollback`
- `scripts/check-internal-links.ts` (novo): verificação de links internos (posts e cases) contra produção ou preview
- `backups/broken-links-preview-2026-10-10.md` (gerado): relatório para aprovação
