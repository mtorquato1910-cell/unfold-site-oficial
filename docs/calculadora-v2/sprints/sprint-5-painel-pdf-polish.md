# Sprint 5 — Painel Admin (dashboard de funil) + PDF + Share + Polish

**Sprint owner (PM):** @pm
**Status:** PROPOSTO — aguardando validação @qa + @architect
**Duração estimada:** 3 dias úteis (~16-20h)
**Bloqueada por:** Sprints 1, 2, 3, 4
**Bloqueia:** Nenhuma (sprint final)

## Objetivo

Fechar o produto: (1) dashboard de funil no painel `/painel/calculadora`, (2) detalhe v2 com campos nominados, (3) geração e download de PDF do resultado, (4) compartilhamento por e-mail, (5) polish de UX/perf/SEO/a11y.

## Backlog

### Story S5.1 — Dashboard de funil
**Executor:** @dev
**Arquivos:**
- `src/app/(painel)/painel/calculadora/page.tsx` (reescrever)
- `src/app/(painel)/painel/calculadora/DashboardFunil.tsx` (novo)
- `src/app/(painel)/painel/calculadora/CalculadoraClient.tsx` (estender filtros)

Topo da página = dashboard com 5 widgets:

1. **Funil completo:** Visitas página (eventos `calculadora_iniciada`) → Etapa 1 concluída → Resultado visualizado → CTA clicado → Diagnóstico iniciado (cruzar com `diagnostico_started` por email).
2. **Distribuição de insights** (donut I-A/B/C/D + barra com override I-E).
3. **Distribuição de setores** (barra horizontal).
4. **% de leads que editaram premissas** (KPI + tendência semanal).
5. **ROI médio calculado por setor** (tabela).

Filtros de período: 7d, 30d, 90d, custom.

**Critério de aceitação:**
- Consulta usa `calculadora-events` para os passos do funil e `calculadora-results` para distribuições.
- Cacheada com `revalidate: 300s`.
- Performance: render < 1s com até 10.000 registros (paginação no SQL).

### Story S5.2 — Detalhe v2
**Executor:** @dev
**Arquivo:** `src/app/(painel)/painel/calculadora/[id]/page.tsx` (reescrever)

Exibe registros v2 com os 30+ campos organizados em 4 cards:
1. Identificação + Lead.
2. Inputs (6) + Premissas (4 com confiança) + flag "premissas editadas".
3. Resultado (ROI, receita, pipeline, clientes, MQLs, leads) + Insight + override.
4. LGPD (mantém o card atual).

Registros v1 (legacy): branch separado renderiza o JSON antigo com banner "Submissão v1 — antes da spec v2".

**Critério de aceitação:**
- Toggle no cabeçalho: "Ver no /r/{token}" abre versão pública em nova aba.
- Botão "Baixar PDF" usa a mesma rota da S5.3.

### Story S5.3 — Geração de PDF
**Executor:** @dev
**Arquivos:**
- `src/app/api/calculadora/pdf/route.ts`
- `src/lib/calculadora/pdf-template.tsx`

Avaliar entre `@react-pdf/renderer` e `pdf-lib` na primeira hora da sprint (decisão registrada em comentário no código). Render reproduz:
- Header com logo Unfold.
- Inputs + premissas em tabela.
- Cards de ROI.
- Funil resumido (texto, não SVG complexo).
- Texto do insight.
- Fontes.

Endpoint: `GET /api/calculadora/pdf?token={token}` retorna `application/pdf` com `Content-Disposition: attachment`.

**Critério de aceitação:**
- PDF < 200kb.
- Cache headers `public, max-age=3600`.
- Botão "Baixar resultado em PDF" no Bloco F (Sprint 3 deixou stub) dispara `pdf_baixado`.

### Story S5.4 — Share por e-mail
**Executor:** @dev
**Arquivo:** `src/app/api/calculadora/share/route.ts`

POST `{ token, destinatario_email }`. Envia e-mail com link `/r/{token}` + PDF anexo. Reaproveitar provedor SMTP do projeto (mesmo do Diagnóstico). Rate limit 3/hora/IP.

Botão na UI ao lado de "Baixar PDF". Modal pequeno pedindo o e-mail destinatário.

**Critério de aceitação:**
- E-mail entregue em < 30s (verificar via `EmailLogs`).
- Dispara `resultado_compartilhado`.
- Não vaza dados de outros leads.

### Story S5.5 — Fluxo de nutrição pós-Calculadora
**Executor:** @data-engineer + @dev
**Arquivo:** `src/lib/jobs/calc-nutricao.ts`

Cron diário: para cada `calculadora-results` onde `calc_avancou_para_diagnostico === false`:

- D+1: e-mail "seu resultado ainda está disponível" (link + PDF).
- D+3: e-mail educativo (4 variações conforme insight exibido — usar collection `email-templates` ou hardcoded).
- D+7: convite Diagnóstico.
- D+14: conteúdo autoridade.
- D+21: última oportunidade.
- Após D+21: lead vai para base passiva.

**Critério de aceitação:**
- Job idempotente (campo `nutricao_step_atual` na collection).
- Pausa se lead avançou para Diagnóstico.
- Documentado em `runbook-calc-nutricao.md`.

### Story S5.6 — Polish (a11y, SEO, perf, copy)
**Executor:** @dev + @ux-design-expert + @qa

- a11y: 100% labels com `for`, navegação por teclado completa, contraste WCAG AA.
- SEO: metadata Open Graph, JSON-LD `WebApplication`, sitemap atualizado.
- Performance: LCP < 2.5s mobile, CLS < 0.1.
- Copy: passada final do time estratégico Unfold (validar microcopies do §5.4 e §4.2).

## Critérios de aceitação da Sprint

1. Dashboard funcional com dados reais (após pelo menos 20 submissões de teste).
2. Detalhe v2 substitui o atual sem regressão para registros legados.
3. PDF baixável reproduz a tela (visual approval Matheus).
4. Share por e-mail funcional com rate limit.
5. Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO 100.
6. Cron de nutrição habilitado em prod com primeira variação ativa (D+1).

## Riscos

- **R1** — `@react-pdf/renderer` adiciona bundle pesado. Mitigação: route handler usa import dinâmico (não impacta client).
- **R2** — Cron de nutrição pode mandar e-mail duplicado em redeploy. Mitigação: `nutricao_step_atual` + lock por `runId`.
- **R3** — Dashboard pode ficar lento com muitos registros. Mitigação: queries agregadas SQL puras (não fetch + reduce em JS).

## Dependências

- Sprints 1-4 mergeadas.
- Provedor SMTP configurado (já em uso pelo Diagnóstico).
- Templates de e-mail criados ou collection `email-templates`.

## Definition of Done

- [ ] 6 stories entregues
- [ ] @qa: regressão completa (suite E2E)
- [ ] @ux-design-expert: aprovação final UX + acessibilidade
- [ ] @architect: revisão de performance do dashboard
- [ ] @devops: cron + SMTP em prod
- [ ] PR `feat(calc-v2): painel-pdf-share-polish` mergeado
- [ ] @pm: release notes publicadas
- [ ] @pm: GO/NO-GO meeting com Matheus
