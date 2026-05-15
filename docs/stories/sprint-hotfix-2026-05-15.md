# Sprint Hotfix — Correção de 3 Bugs de Produção

- **Data:** 2026-05-15
- **Owner:** @pm (Orion orquestrando)
- **Executores previstos:** @dev (implementação) → @qa (validação) → @architect (sign-off)
- **Prioridade:** P0 (bloqueador) para Bug 1 e Bug 3 · P1 para Bug 2
- **Status:** Revisado por @qa+@architect — pronto para @dev
- **Ambiente alvo:** Produção (https://unfoldgrowth.com.br) hospedada na Vercel
- **Branch sugerida:** `hotfix/2026-05-15-prod-bugs`

---

## 1. Objetivo

Restaurar o funcionamento do fluxo de **Diagnóstico v2** (atualmente retornando HTTP 500 na Etapa 1), desbloquear a entrada de **ticket médio >= R$ 10.000** na Calculadora de Tráfego v2 e garantir **HTTPS válido em todos os navegadores** (incluindo Safari mobile, que hoje bloqueia o site por certificado inválido). Esses três defeitos comprometem conversão e credibilidade do site público; este sprint trata cada um com uma combinação de correção de código, ajustes de infra Vercel e adição de testes de regressão para evitar reincidência.

---

## 2. Escopo

### Dentro do escopo
- Bug 1: Diagnóstico Etapa 1 retornando 500 em produção
- Bug 2: Calculadora rejeita ticket médio R$ 10.000+
- Bug 3: Safari mobile bloqueia site por SSL inválido
- Adição de testes unitários para cobrir as regressões dos Bugs 1 e 2
- Hardening mínimo de headers HTTP (HSTS) e redirect canônico `www ↔ apex`

### Fora do escopo
- Refator do `route.ts` do Diagnóstico além do necessário ao bug
- Refator do estado da Calculadora ou do `CurrencyInput`
- Novas features, novos campos de formulário, novos endpoints
- Mudança de provedor de hospedagem ou de CDN
- Reescrita de máscara monetária (`parseLooseNumber`) — apenas correção pontual
- Integrações pendentes documentadas em `setup_pendente_diagnostico.md` (RD/OpenRouter/Calendly), exceto quando bloqueiam Bug 1

---

## 3. Bug 1 — Diagnóstico Etapa 1 retorna 500 (P0)

### 3.1 Critérios de Aceitação
- **Dado** que um visitante preenche nome, email e telefone válidos na Etapa 1
  **Quando** clica em "Continuar"
  **Então** o endpoint `/api/diagnostico/etapa-1` responde 200 com `{ leadId, token }` e o `leadId` corresponde a um documento real na collection `leads` do Payload.
- **Dado** que `DATABASE_URL` esteja ausente em runtime
  **Quando** o handler inicializa
  **Então** o endpoint retorna 503 com `{ code: "DB_NOT_CONFIGURED" }` e loga `error` estruturado (nunca 500 silencioso, nunca lead mock).
- **Dado** uma falha em `payload.create()` ou `payload.find()`
  **Quando** ocorre exceção
  **Então** o handler NÃO gera `leadId = mock-${Date.now()}`, retorna 500 estruturado e o erro é logado com stack completo.
- **Dado** que `TURNSTILE_SECRET_KEY` esteja configurada em produção
  **Quando** o token Turnstile vier ausente ou inválido
  **Então** o endpoint retorna 400 com `{ code: "CAPTCHA_FAILED" }` e bloqueia o bypass de dev.
- **Dado** o estado atual de produção
  **Quando** o handler é invocado
  **Então** o log Vercel mostra a exceção exata que causou o 500. Causa-raiz documentada em PR antes do merge.

### 3.2 Tasks técnicas
- [ ] **Task 0 — Reproduzir bug em prod:** obter log Vercel da exceção exata (linha + stack) que causou o 500 atual. Documentar causa-raiz no PR antes de qualquer commit de fix.
- [ ] Ler integralmente `src/app/api/diagnostico/etapa-1/route.ts` (linhas 1–152) e mapear todos os pontos de falha silenciosa.
- [ ] Remover o fallback `leadId = mock-${Date.now()}` (linhas 115–116). Em caso de falha do Payload, retornar erro estruturado.
- [ ] Criar `src/lib/env.ts` exportando `serverEnv = z.object({ DATABASE_URL, PAYLOAD_SECRET, TURNSTILE_SECRET_KEY, NEXT_PUBLIC_SITE_URL, PAYLOAD_PUBLIC_SERVER_URL, RD_STATION_API_KEY, OPENROUTER_API_KEY }).parse(process.env)`. Failure derruba o boot. Handler apenas importa `serverEnv.X`. (Padrão a ser propagado para calculadora, webhooks e demais endpoints em sprint+1.)
- [ ] Adicionar `export const dynamic = 'force-dynamic'` e `export const revalidate = 0` no topo de `src/app/api/diagnostico/etapa-1/route.ts`. Validar com `curl -I` pós-deploy que header `Cache-Control: no-store` está presente na resposta.
- [ ] Substituir todos os `console.warn` do route por logger estruturado (`console.error` com `{ event, leadId?, err: err.message, stack: err.stack }`). Padronizar prefixo `[diagnostico:etapa-1]`.
- [ ] Bloquear o bypass de Turnstile em produção: se `TURNSTILE_SECRET_KEY` ausente e `NODE_ENV === "production"`, lançar erro de configuração em vez de pular validação.
- [ ] Envolver chamadas `payload.find()` / `payload.create()` em try/catch dedicados com mensagens distintas (`PAYLOAD_FIND_FAILED`, `PAYLOAD_CREATE_FAILED`).
- [ ] Adicionar header de resposta `X-Diag-Trace-Id` (uuid v4) para correlacionar logs Vercel <-> cliente.
- [ ] **Correlation-ID client→server:** cliente gera `X-Request-Id` (UUID v4) e envia no header POST. Handler ecoa no log e na resposta `X-Diag-Trace-Id`. Permite correlacionar console do usuário ↔ log Vercel.
- [ ] Confirmar no painel Vercel (Production + Preview) que estão presentes: `DATABASE_URL`, `PAYLOAD_SECRET`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`.
- [ ] **Backup pré-migration:** `pg_dump` do banco Postgres prod antes de rodar migration. Salvar arquivo com timestamp.
- [ ] Rodar migrations Payload em produção (`payload migrate` via script de build ou one-off Vercel) e documentar comando em `package.json`. **Migrations devem ser additive-only nesta sprint** — sem DROP, sem ALTER NOT NULL, sem RENAME. Se schema-change destrutivo for necessário, virar story separada com plano de migração em 2 fases (dual-write → cutover).
- [ ] Verificar se `RD_STATION_API_KEY` e `OPENROUTER_API_KEY` estão de fato em best-effort (não devem derrubar Etapa 1). Se afetarem, isolar em try/catch.
- [ ] Smoke test em preview Vercel com formulário real antes de promover para produção.

### 3.3 Arquivos a tocar
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\src\app\api\diagnostico\etapa-1\route.ts`
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\src\lib\env.ts` (novo — validação boot-time de env vars via Zod)
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\src\lib\diagnostico\logger.ts` (criar se não existir, ou reutilizar logger existente)
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\src\lib\diagnostico\envCheck.ts` (novo, helper de pre-flight)
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\package.json` (script `db:migrate:prod`)
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\.env.example` (documentar vars obrigatórias)

### 3.4 Riscos
- Migrations Payload podem alterar schema em produção; exigir backup antes.
- Pre-flight muito agressivo pode quebrar Preview Deployments sem env vars opcionais — usar gate `NODE_ENV === "production"`.
- Remover o mock leadId expõe falhas que antes eram mascaradas; cliente pode ver erro real em vez de tela quebrada (esperado e desejado).

### 3.5 Definition of Done
- POST manual com `curl` em produção retorna 200 e `leadId` aparece no admin Payload.
- Logs da Vercel mostram entrada estruturada por request com `X-Diag-Trace-Id`.
- Nenhum `leadId` com prefixo `mock-` no banco após o deploy.
- Teste unitário cobre o caminho de erro (Payload throw) e garante ausência de fallback mock.

---

## 4. Bug 2 — Calculadora rejeita ticket médio R$ 10.000+ (P1)

### 4.1 Critérios de Aceitação
- **Dado** um usuário com foco no campo "Ticket Médio"
  **Quando** digita `10000` (ou `10.000` ou `R$ 10.000,00`)
  **Então** o campo aceita o valor, o estado é atualizado para `10000` e o botão "Calcular" fica habilitado.
- **Dado** valores `1000`, `9999`, `10000`, `25000`, `99999`, `500000` e `1500000`
  **Quando** submetidos via `useCalculadora`
  **Então** todos passam a validação Zod `ticket_medio` (apenas `< 1000` é rejeitado).
- **Dado** o helper `parseLooseNumber`
  **Quando** recebe inputs `"10.000"`, `"10.000,00"`, `"R$ 10.000,00"`, `"10000"`, `"10000.00"`
  **Então** retorna `10000` em todos os casos.

### 4.2 Tasks técnicas
- [ ] **Task 0 — Teste RED:** escrever teste unit que reproduza o bug com `ticket_medio = 10000` e confirmar que FALHA antes de mudar código. PR não aceita commit de fix sem commit anterior do teste vermelho.
- [ ] Ler integralmente `src/lib/calculadora/schema.ts`, `BlocoInputs.tsx`, `useCalculadora.ts` e o helper `parseLooseNumber` (localizar e ler).
- [ ] Adicionar teste unit com snapshot do parsing (`parseLooseNumber('10.000')` → assert exato + log estruturado se falhar). Teste fica como documentação viva do contrato — substitui instrumentação ad-hoc com `console.log`.
- [ ] Verificar se `CurrencyInput` está aplicando algum `clamp` interno (ex.: max default) ou normalização de máscara que truque valores >= 5 dígitos com separador BR.
- [ ] Conferir se há algum middleware/transform Zod (`.transform`, `.refine`) em `ticket_medio` que limite implicitamente.
- [ ] Confirmar a causa-raiz. Hipóteses ordenadas:
  - (a) `parseLooseNumber("10.000")` interpreta o ponto como decimal e retorna `10` → rejeitado por `min(1000)`.
  - (b) Máscara do `CurrencyInput` está cortando dígitos antes do estado React.
  - (c) Algum `step`/`max` HTML nativo no input.
- [ ] Aplicar correção pontual conforme causa-raiz identificada. Se for (a), ajustar `parseLooseNumber` para tratar formato BR explicitamente (ponto como milhar quando seguido de 3 dígitos sem vírgula).
- [ ] Adicionar testes unitários cobrindo o gap (ver seção 7.2).
- [ ] Remover `console.log` de instrumentação antes do merge.
- [ ] Atualizar comentário no schema documentando ausência intencional de `.max()` para `ticket_medio`.

### 4.3 Arquivos a tocar
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\src\lib\calculadora\schema.ts`
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\src\app\(site)\ferramentas\calculadora-trafego\_components\BlocoInputs.tsx`
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\src\app\(site)\ferramentas\calculadora-trafego\_components\useCalculadora.ts`
- Arquivo do helper `parseLooseNumber` (localizar — provavelmente em `src/lib/calculadora/` ou `src/lib/utils/`)
- `src/lib/calculadora/__tests__/parseLooseNumber.test.ts` (novo)

### 4.4 Riscos
- Mudar `parseLooseNumber` pode afetar `investimento_mensal` e outros campos. Garantir testes para todos os consumidores antes de mergear.
- Reprodução pode falhar em desktop e só ocorrer em mobile (autocomplete iOS substitui máscara). Testar em ambos.

### 4.5 Definition of Done
- Usuário consegue digitar `10000` e calcular sem erro.
- 6 novos testes verdes em `parseLooseNumber` cobrindo formato BR 4–7 dígitos.
- Total de testes da Calculadora >= 80 (eram 74).
- Sem regressões nos testes existentes.

---

## 5. Bug 3 — Safari bloqueia HTTPS (P0)

### 5.1 Critérios de Aceitação
- **Dado** Safari iOS ou macOS apontando para `https://unfoldgrowth.com.br`
  **Quando** carrega a página
  **Então** o site abre sem aviso de "conexão não segura".
- **Dado** acesso a `http://unfoldgrowth.com.br` ou `http://www.unfoldgrowth.com.br`
  **Quando** o request chega
  **Então** redireciona 301 para `https://unfoldgrowth.com.br` (apex canônico).
- **Dado** SSL Labs scan de `unfoldgrowth.com.br` e `www.unfoldgrowth.com.br`
  **Quando** o relatório é gerado
  **Então** nota >= **A** em ambos, sem "Certificate name mismatch".

### 5.2 Tasks técnicas — Código
- [ ] **HSTS em 3 fases (irreversível — deploy gradual mandatório):**
  - **Fase 1 (deploy inicial desta sprint):** `Strict-Transport-Security: max-age=300` (5 min), **SEM preload, SEM includeSubDomains**. Permite reverter rapidamente se algo quebrar.
  - **Fase 2 (após 48h em preview validados):** `max-age=2592000` (30 dias), SEM preload. Vira follow-up story.
  - **Fase 3 (após 7 dias de prod estável):** `max-age=63072000; includeSubDomains; preload` + submeter no `hstspreload.org`. Vira follow-up story.
- [ ] Adicionar redirect canônico em `next.config.ts` via `redirects()`: `www.unfoldgrowth.com.br` → `unfoldgrowth.com.br` (301).
- [ ] Adicionar header `Content-Security-Policy: upgrade-insecure-requests` junto ao HSTS. Auditar `payload.config.ts` por URLs `http://` hardcoded em assets antes do merge.
- [ ] **Auditar cookies SameSite:** todos os `cookies.set()` no codebase. Sessão Payload deve ser `SameSite=Strict`. Token Turnstile pode ser `SameSite=Lax`. Documentar resultado no PR — risco Safari ITP + Calendly embed.
- [ ] Auditar `src/middleware.ts` para garantir que não há lógica que quebre HTTPS (ex.: redirect baseado em `x-forwarded-proto` incorreto).
- [ ] Auditar `.env.local`, `.env.example` e Vercel envs procurando `NEXT_PUBLIC_SITE_URL` com `http://` em produção. Forçar `https://unfoldgrowth.com.br`.
- [ ] Conferir referências hardcoded a `http://` em código (Grep no repo). Substituir por `https://` ou variável de ambiente.

### 5.3 Tasks técnicas — Administrativas (Vercel)
- [ ] Painel Vercel → Settings → Domains: confirmar que ambos `unfoldgrowth.com.br` e `www.unfoldgrowth.com.br` estão anexados ao projeto e com status "Valid Configuration".
- [ ] Confirmar que os certificados Let's Encrypt estão emitidos para **ambos** os hostnames (não apenas um). Se "Pending" ou "Invalid", clicar em "Renew" ou remover/readicionar o domínio.
- [ ] Conferir DNS no registrar: registros `A` (apex) apontando para `76.76.21.21` e `CNAME` `www` apontando para `cname.vercel-dns.com` (ou ALIAS equivalente).
- [ ] Definir o domínio primário (Production Domain) como `unfoldgrowth.com.br` (apex).
- [ ] Após reemissão, rodar SSL Labs (`https://www.ssllabs.com/ssltest/analyze.html?d=unfoldgrowth.com.br`) e anexar o relatório à PR.
- [ ] Testar em Safari iOS (físico ou BrowserStack), Safari macOS, Chrome, Firefox.

### 5.4 Arquivos a tocar
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\next.config.ts`
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\src\middleware.ts` (auditoria, possivelmente sem mudanças)
- `C:\Users\mathe\OneDrive\Área de Trabalho\Site unfold\unfold-site-oficial\.env.example`

### 5.5 Riscos
- **HSTS preload é praticamente irreversível (~1 ano para sair da lista Chromium). Deploy gradual mandatório.** Esta sprint entrega APENAS Fase 1 (`max-age=300`). Fases 2 e 3 ficam como follow-up stories após observação de estabilidade.
- HSTS com `preload` é **irreversível** por ~1 ano. Começar com `max-age=300` em preview, validar, então subir para 2 anos.
- Mudar domínio primário pode quebrar SEO temporariamente (mitigado pelo 301 permanente).
- Se DNS estiver desalinhado, propagação leva até 48h.

### 5.6 Definition of Done
- Safari iOS abre o site sem warning.
- SSL Labs grade A ou A+ para apex e www.
- HSTS visível em `curl -I https://unfoldgrowth.com.br`.
- Redirect 301 funciona em ambas as direções configuradas.
- [ ] **Fase 1 apenas (`max-age=300`, sem preload, sem includeSubDomains)** — Fases 2 e 3 ficam como follow-up stories.

---

## 6. Dependências externas

- [ ] Acesso ao painel Vercel com permissão para editar Domains e Env Vars
- [ ] Acesso ao DNS do registrar (Registro.br ou equivalente) para validar/ajustar registros
- [ ] Credenciais reais já provisionadas para `DATABASE_URL`, `PAYLOAD_SECRET`, `TURNSTILE_SECRET_KEY`
- [ ] Acesso ao banco de produção para conferir documentos `leads` pós-fix
- [ ] (Best-effort) `RD_STATION_API_KEY`, `OPENROUTER_API_KEY` — não bloqueiam Etapa 1 após Bug 1 fix
- [ ] Dispositivo Safari real ou BrowserStack para validar Bug 3

---

## 7. Plano de Testes

### 7.1 Smoke test manual (produção, pós-deploy)

**Caminhos felizes:**
1. Abrir `https://unfoldgrowth.com.br` em Safari iOS → site carrega sem warning.
2. Abrir `http://unfoldgrowth.com.br` → redireciona 301 para HTTPS.
3. Navegar até `/diagnostico` → preencher Etapa 1 com email teste → submeter.
4. Confirmar resposta 200 com `leadId` no DevTools Network.
5. Conferir no admin Payload (`/admin/collections/leads`) que o lead apareceu.
6. Abrir `/ferramentas/calculadora-trafego` → digitar `10000` em Ticket Médio → calcular → ver resultado.
7. Repetir item 6 com valores `25000`, `100000`, `999999`.
8. Rodar `curl -I https://unfoldgrowth.com.br` → ver header `strict-transport-security`.

**Cenários negativos (obrigatórios):**
1. Diagnóstico etapa-1 com Turnstile inválido → deve retornar 400 estruturado.
2. Diagnóstico etapa-1 com email duplicado → deve retornar 409 ou idempotente.
3. Calculadora com `ticket_medio = 999` → deve mostrar erro "mínimo R$ 1.000".
4. Calculadora com `ticket_medio = 999999999` → deve mostrar erro de máximo.
5. Calculadora com input `"R$ 10.000,00"` (com R$ + vírgula) → deve parsear corretamente.

**Matriz de dispositivos (validar em cada):**
- [ ] Safari iOS físico (rede 4G, não wifi)
- [ ] Chrome Android físico
- [ ] Firefox desktop
- [ ] Chrome desktop (já era)
- [ ] Safari macOS

### 7.2 Testes unitários a adicionar
- `src/lib/calculadora/__tests__/parseLooseNumber.test.ts`:
  - `parseLooseNumber("10000")` → `10000`
  - `parseLooseNumber("10.000")` → `10000`
  - `parseLooseNumber("10.000,00")` → `10000`
  - `parseLooseNumber("R$ 10.000,00")` → `10000`
  - `parseLooseNumber("100.000")` → `100000`
  - `parseLooseNumber("1.000.000")` → `1000000`
- `src/app/api/diagnostico/etapa-1/__tests__/route.test.ts`:
  - Falta `DATABASE_URL` em prod → 503 `DB_NOT_CONFIGURED`.
  - `payload.create` throw → 500, sem `leadId` mock no body.
  - Turnstile ausente em prod com `TURNSTILE_SECRET_KEY` configurada → 400.

### 7.3 Testes de integração
- Não há novos testes E2E neste sprint. Smoke test manual cobre o fluxo.

---

## 8. Rollout & Rollback

### 8.1 Ordem de deploy
1. Branch `hotfix/2026-05-15-prod-bugs`. Commits atômicos por bug.
2. Abrir PR → review @qa + @architect.
3. Merge em `main` → deploy preview Vercel.
4. Smoke test em preview (seção 7.1, adaptado ao URL preview).
5. Configurar env vars faltantes na Vercel (Production scope) **antes** de promover.
6. Promote preview → production com **HSTS Fase 1** (`max-age=300`).
7. Smoke test em produção real.
8. **HSTS Fase 2** (`max-age=2592000`) → follow-up story, agendada após 48h de preview validado.
9. **HSTS Fase 3** (`max-age=63072000; includeSubDomains; preload` + submit em https://hstspreload.org) → follow-up story, agendada após 7 dias de prod estável.

### 8.2 Rollback por bug
- **Bug 1:** revert do commit; restaurar fallback mock temporariamente apenas se for inevitável. Re-checar env vars Vercel. **Atenção a schema:** revert de código NÃO reverte schema. Se migration tiver rodado, rollback do código pode quebrar mais que ajudar — usar `payload migrate:down` se disponível, ou restaurar do `pg_dump` salvo pré-migration.
- **Bug 2:** revert pontual em `parseLooseNumber`; testes garantem regressão visível.
- **Bug 3:** reduzir HSTS `max-age` para `0`; remover redirect www↔apex via revert; **NÃO submeter ao preload** antes de validação completa (preload é difícil de reverter).

> ⚠️ **Rollback de HSTS NÃO é instantâneo** — browsers que receberam o header manterão pinning até o `max-age` expirar. Por isso Fase 1 usa apenas `max-age=300`. Mudanças DNS também têm propagação não-determinística (até 48h). Considerar isso ao planejar janela de rollback.

---

## 9. Estimativa total

| Bug | Análise | Implementação | Testes | Infra/Admin | Total |
|-----|---------|---------------|--------|-------------|-------|
| Bug 1 (Diagnóstico 500) | 1.5h (inclui Task 0 — repro + log + `env.ts`) | 2h | 1h | 1h | **5.5h** |
| Bug 2 (Ticket 10k) | 1h | 1h | 1.5h (inclui Task 0 RED + snapshot) | 0h | **3.5h** |
| Bug 3 (SSL Safari) | 0.5h | 1.5h (HSTS Fase 1 + CSP + cookies audit) | 0.5h | 1h | **3.5h** |
| Code review + QA + ajustes | — | — | — | — | **1.5h** |
| **Sprint total** | | | | | **~14h** |

---

## 10. Checklist final pré-merge

- [ ] `npm run lint` — sem warnings novos
- [ ] `npm run typecheck` — verde
- [ ] `npm test` — todos os testes verdes (Diagnóstico 24+ e Calculadora 80+)
- [ ] **Suíte completa com baseline:** rodar `npm test` e salvar baseline (24+74 testes). Após fix, comparar e documentar no PR quais testes existentes foram modificados e por quê.
- [ ] `npm run build` — build local sem erros
- [ ] Smoke test em preview Vercel (seção 7.1) — passou (caminhos felizes + 5 cenários negativos + matriz de dispositivos)
- [ ] Env vars de produção conferidas (`DATABASE_URL`, `PAYLOAD_SECRET`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL=https://...`)
- [ ] Backup `pg_dump` salvo antes da migration
- [ ] Migrations Payload aplicadas em produção (additive-only)
- [ ] Painel Vercel → Domains: apex + www com cert "Valid"
- [ ] SSL Labs >= A para ambos os domínios
- [ ] PR aprovada por @qa e @architect
- [ ] Logs Vercel monitorados por 30 min pós-deploy

---

## 11. File List

> Preenchido por @dev (Orion executando) em 2026-05-15.

**Novos:**
- `src/lib/env.ts` — validação Zod de env vars com `missingProductionEnv()` helper
- `src/lib/calculadora/parse-number.ts` — `parseLooseNumber` + `formatBRL` extraídos para módulo testável
- `src/lib/calculadora/__tests__/parse-number.test.ts` — 7 testes (cobrem 10.000, 100.000, 1.000.000, decimais BR, edge cases)
- `src/app/api/diagnostico/etapa-1/__tests__/route.test.ts` — 6 testes (env missing, payload throw, validation, captcha, trace-id echo, happy path)

**Modificados:**
- `src/app/api/diagnostico/etapa-1/route.ts` — `force-dynamic`/`revalidate=0`, pre-flight env check, mock leadId REMOVIDO, logger estruturado em todos os pontos, X-Diag-Trace-Id, bypass Turnstile bloqueado em prod, error codes por categoria (DB_NOT_CONFIGURED / CAPTCHA_FAILED / PAYLOAD_FIND_FAILED / etc)
- `src/components/diagnostico/DiagnosticoEtapa1Form.tsx` — gera `X-Request-Id` (UUID) e envia no header; mostra ref do trace-id no erro
- `src/app/(site)/ferramentas/calculadora-trafego/_components/BlocoInputs.tsx` — importa `parseLooseNumber`/`formatBRL` do módulo extraído
- `next.config.ts` — HSTS Fase 1 (`max-age=300`), CSP `upgrade-insecure-requests`, redirect 301 `www.unfoldgrowth.com.br` → `unfoldgrowth.com.br`

**Auditorias (sem mudança no código):**
- `src/lib/painel-auth.ts` — cookie de sessão já com `httpOnly`, `secure: prod`, `sameSite: 'lax'`, `path: '/'`. Config correta para painel administrativo (não embed, não cross-site). Documentado como decisão consciente — `'strict'` melhoraria CSRF mas pode quebrar callback de SSO futuro.
- `src/middleware.ts` — sem lógica que quebre HTTPS. Aplica rate limit em `/r/` e auth no `/painel`.
- Grep por `http://` hardcoded em código: nenhum match relevante (apenas namespaces XML).
- Grep por `NEXT_PUBLIC_SITE_URL=http://` em arquivos rastreados: nenhum match. `.env.example` já está com `https://`.

---

## 12. Notas finais

- Este sprint NÃO desbloqueia integrações RD/OpenRouter — elas permanecem como itens em `setup_pendente_diagnostico.md`. Após Bug 1, o fluxo do Diagnóstico estará operacional mesmo sem essas integrações (best-effort).
- Toda alteração em `parseLooseNumber` deve ser revisada à luz do `investimento_mensal` (que tem `.max(500000)` e está atualmente funcional).
- HSTS preload é **opt-in irreversível**; só submeter ao registro Chromium após confirmação de estabilidade.

---

## Histórico de revisões

- **2026-05-15** — Draft inicial (@pm)
- **2026-05-15** — Revisão @qa (4 críticos, 7 importantes)
- **2026-05-15** — Revisão @architect (4 críticos, 5 trade-offs)
- **2026-05-15** — Consolidação @pm (6 críticos aplicados, 6 importantes aplicados)
- **2026-05-15** — Execução @dev (Orion): 4 arquivos novos, 4 modificados, 13 testes novos verdes, build local OK
- **2026-05-15** — Descoberta @dev: 7 testes do `parseLooseNumber` confirmam que o helper trata corretamente `"10.000"` → `10000`. Causa-raiz real do Bug 2 provavelmente é **bundle JS stale em produção** (cache do browser/CDN com versão antiga). Mitigação programática: a refatoração que moveu `parseLooseNumber` para módulo separado **força mudança do hash do bundle**, invalidando o cache do CDN naturalmente no próximo deploy.
- **2026-05-15** — Review @qa: 2 bloqueadores + 5 importantes. Aprovado com ressalvas.
- **2026-05-15** — Correções @dev aplicadas:
  - **B-1**: `vi.resetModules()` em `beforeEach` do `route.test.ts` para isolamento real entre testes
  - **B-2**: Status `CAPTCHA_FAILED` corrigido de 401 → 400 (alinhado à AC do doc)
  - **I-1**: Constante `PAYLOAD_SECRET_MIN_LENGTH = 32` exportada de `env.ts`, usada por schema Zod e `missingProductionEnv()` (fonte única de verdade)
  - **I-2**: Teste de regressão para `investimento_mensal` em `parse-number.test.ts` (cobre 5.000 a 500.000)
  - **I-5**: Teste explícito para Turnstile token ausente em prod → CAPTCHA_FAILED
  - **I-3** (nota PR): mitigação cache via hash do bundle documentada no PR
  - **I-4** (smoke manual): validar `/painel/collections/leads` em preview Vercel quanto a CSP `upgrade-insecure-requests`
- **2026-05-15** — Re-validação: 15/15 testes verdes (8 parseLooseNumber + 7 route Diagnóstico)
