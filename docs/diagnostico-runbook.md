# Diagnóstico de Growth — Runbook Operacional

**Versão:** 1.0
**Último update:** 2026-05-13
**Spec fonte:** `docs/diagnostico-spec.md` v1.0

Este runbook é a referência para operar, monitorar e ajustar o Diagnóstico de Growth em produção. Tudo que envolve "trocar uma key", "rodar uma ação manual" ou "debugar um caso suspeito" deve estar aqui.

---

## 1. Arquitetura — resumo

```
Cliente (Next.js)  ──► /diagnostico (Etapa 1)
                        │
                        ▼
                   /diagnostico/etapa-2/[token]  ──► API /etapa-2  ──► engine v2  ──► Payload DB
                                                                      │
                                                                      ▼
                                                         afterChange hooks:
                                                          • email V2 (Resend|mock)
                                                          • sync RD Station (mock|real)
                                                          • notify Gabriel (Fit Alto/Médio)
                                                                      │
                                                                      ▼
                                                   /diagnostico/r/[hash]  (URL pública)
```

**Persistência:** Postgres no Supabase via Payload CMS adapter. Local dev usa SQLite (`dev.db`).

**Cron jobs:**
- `/api/cron/tick` — `0 6 * * *` (3h BRT) — tarefas gerais
- `/api/cron/reengajamento-drop-off` — `30 9 * * *` (6:30 BRT) — drop-off da Etapa 2 (Automação 5)
- `/api/cron/nutricao-fit-baixo` — `0 13 * * *` (10h BRT) — leads Fit Baixo/Desfit (Automação 4)

---

## 2. Variáveis de ambiente — referência

Cole isto no `.env.local` (dev) e no painel Vercel (prod):

| Variável | Modo | O que faz |
|---|---|---|
| `DATABASE_URL` | obrigatório em prod | Conexão Postgres do Supabase |
| `PAYLOAD_SECRET` | obrigatório | Hash JWT — gere com `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | obrigatório | URL canônica (`https://unfoldgrowth.com.br`) |
| `RESEND_API_KEY` | opcional | Envia emails de verdade. Vazio = modo mock no console. |
| `EMAIL_MODE` | opcional | `resend` para usar Resend. Default: `mock-console`. |
| `CRM_MODE` | opcional | `rd-station` para sincronizar de verdade. Default: `mock`. |
| `RD_STATION_API_KEY` | opcional | Bearer token RD Station |
| `RD_STATION_WEBHOOK_SECRET` | opcional | HMAC SHA256 |
| `OPENROUTER_API_KEY` | opcional | Texto AI-augmented dos insights. Vazio = usa texto estático. |
| `CALENDLY_WEBHOOK_SIGNING_KEY` | opcional | Validação assinatura webhook |
| `GABRIEL_NOTIFY_EMAIL` | opcional | Email do time comercial (override do SiteSettings) |
| `SLACK_WEBHOOK_GABRIEL` | opcional | Webhook Slack para notificação cross-channel |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | opcional | Cloudflare Turnstile no form |
| `TURNSTILE_SECRET_KEY` | opcional | Validação Turnstile server |
| `SENTRY_DSN` | opcional | Erros server |
| `NEXT_PUBLIC_SENTRY_DSN` | opcional | Erros client |
| `CRON_SECRET` | opcional | Bearer para chamadas externas ao cron (Vercel cron passa header próprio) |

**Calendly URLs** ficam no admin Payload, não no `.env`: `/admin/globals/site-settings` → aba "Calendário".

---

## 3. Checklist de go-live

Antes de mudar `CRM_MODE=rd-station` (ou anunciar publicamente):

- [ ] `RD_STATION_API_KEY`, `RD_STATION_WEBHOOK_SECRET` e `CRM_MODE=rd-station` definidos na Vercel.
- [ ] `OPENROUTER_API_KEY` definido (opcional — sem isso, textos estáticos são usados).
- [ ] `SiteSettings → Calendário` com 3 URLs Calendly preenchidas + `CALENDLY_WEBHOOK_SIGNING_KEY` no `.env`.
- [ ] **10 custom fields criados no RD** (nomes em `lib/crm/rd-station.ts::montarCustomFields`).
- [ ] **Funil "Diagnóstico Concluído"** criado no RD com 4 estágios (Aguardando Briefing, Pronto para Call, Em Negociação, Ganhou/Perdeu).
- [ ] `RESEND_API_KEY` + `EMAIL_MODE=resend` para envio real.
- [ ] Tirar snapshot do Supabase ANTES da migration de produção.
- [ ] Aplicar migration: `npx payload migrate:create && npx payload migrate`.
- [ ] Rodar smoke do caso Roberto: `npm test src/lib/scoring` (verde).
- [ ] Acessar `/diagnostico` em prod, fazer 1 diagnóstico real e validar `/r/[hash]`.
- [ ] Verificar painel `/painel/diagnostico/funil` mostra os contadores.

---

## 4. Como ativar cada integração

### 4.1. RD Station

1. Criar contato técnico com permissão de API.
2. Gerar bearer token em [app.rdstation.com.br](https://app.rdstation.com.br).
3. Criar os 10 custom fields (slugs em `lib/crm/rd-station.ts`).
4. Criar o funil "Diagnóstico Concluído".
5. Configurar webhook apontando para `https://unfoldgrowth.com.br/api/webhooks/rd-station`.
6. Definir `RD_STATION_WEBHOOK_SECRET` e copiar o mesmo valor no painel RD.
7. Setar `CRM_MODE=rd-station` na Vercel → redeploy.

### 4.2. OpenRouter

1. Criar conta em [openrouter.ai](https://openrouter.ai).
2. Gerar API key.
3. Setar `OPENROUTER_API_KEY` na Vercel.
4. (Opcional) Criar prompts no admin Payload (`/admin/collections/ai-prompts`) com slug `diagnostico-insight-v2`.

### 4.3. Calendly

1. Criar 3 event types: 45min (Fit Alto), 30min (Fit Médio), 20min (Fit Baixo/Desfit).
2. Copiar as 3 URLs para `/admin/globals/site-settings` → aba Calendário.
3. Configurar webhook em [calendly.com/integrations/webhooks](https://calendly.com/integrations/webhooks) apontando para `https://unfoldgrowth.com.br/api/webhooks/calendly`.
4. Copiar a signing key para `CALENDLY_WEBHOOK_SIGNING_KEY` no Vercel.

### 4.4. Turnstile (anti-spam)

1. Criar widget em [dash.cloudflare.com → Turnstile](https://dash.cloudflare.com).
2. Adicionar domínio `unfoldgrowth.com.br`.
3. Copiar site key e secret key para as vars do Vercel.

---

## 5. Operações manuais comuns

### 5.1. Reenviar email de um lead específico

`/painel/diagnostico/[id]` → botão **Reenviar email**.

### 5.2. Sincronizar um lead com o RD na hora

Mesmo painel → botão **Sincronizar RD agora**. Útil quando você corrigiu campos do lead manualmente no admin.

### 5.3. Forçar nutrição para um lead que pulou

Botão **Forçar nutrição** → reseta `nutricao_enviada_at`. Cron pega na próxima execução (10h BRT).

### 5.4. Re-seedar as 12 perguntas

`POST /api/seed/diagnostico` (dev only). Em prod, edite as perguntas direto no admin: `/admin/collections/quiz-questions`.

### 5.5. Exclusão LGPD de um lead

1. O lead pede pelo endpoint: `POST /api/diagnostico/lgpd/delete-me` com `{ "email": "..." }`.
2. Sistema envia link assinado por 15 min para o email.
3. Lead clica → POST com `?token=` executa o delete.
4. Apaga: Leads, DiagnosticoResults, DiagnosticoEvents, NewsletterSubscribers.

### 5.6. Export CSV para análise externa

`/painel/diagnostico/funil` → botão **Exportar CSV**. Filtros aplicados são respeitados no export.

---

## 6. Troubleshooting

### Lead não recebeu email

1. Verificar `EMAIL_MODE` na Vercel — se for `mock-console`, está em modo dev.
2. Logs da função `/api/diagnostico/etapa-2` (Vercel logs).
3. No admin: lead → `email_enviado=true`? Se sim, pode ser problema do Resend.
4. Botão "Reenviar email" no painel.

### Lead não apareceu no RD Station

1. `CRM_MODE` na Vercel está `rd-station`?
2. `RD_STATION_API_KEY` válida?
3. Painel: `rd_sync_status` do lead.
4. Logs server da função de afterChange.
5. Manual: botão "Sincronizar RD agora".

### Resultado deu erro/404

1. URL `/diagnostico/r/[hash]` existe? Verificar no admin se o resultado tem `url_resultado_hash`.
2. Em SSR errors aparecem em Sentry.
3. Lead com resultado mas hash vazio: hook `beforeChange` falhou — re-trigger via admin (touch update).

### Cron não disparou

1. Vercel → Cron Jobs → ver execuções.
2. Forçar com `curl https://unfoldgrowth.com.br/api/cron/reengajamento-drop-off -H "Authorization: Bearer $CRON_SECRET"`.

### Migration falhou

1. Reverter para snapshot Supabase (sempre tirar ANTES da migration).
2. Rodar `npx payload migrate:status` para ver o estado atual.
3. Aplicar manualmente o SQL gerado em `src/migrations/`.

---

## 7. Monitoramento

- **Painel funil:** `/painel/diagnostico/funil` — conversão entre etapas, distribuição por Fit, top padrões. Filtros: data, setor, faixa Fit.
- **Sentry:** erros server + client com `result_hash`.
- **Vercel logs:** filtrar por `[diagnostico/`, `[DiagnosticoResults]`, `[cron/`.
- **RD Station:** painel de tags `fit_alto`, `fit_medio`, `fit_baixo`, `desfit`.

---

## 8. Decisões fechadas (não revisitar sem alinhar)

- **A1 (spec §5.4):** Sinal 2 Gestão mantém spec literal (Q12=B = 0.6).
- **A2 (spec §6.3):** Q4=E pontua 0 no Fit de Dor (mesma de A).
- **D1:** Gateway IA = OpenRouter, modelo `anthropic/claude-sonnet-4.5`.
- **Cor faixa Crítica:** substituída de `#001E29` (invisível no bg) por coral `#FF6B5C`.
- **PDF Sprint 4:** HTML print-ready com Ctrl+P. Sprint 7+ pode trocar por `satori`+`@resvg/resvg-js` binário.

---

## 9. Plano de evolução

- **Sprint 7:** PDF binário real via satori/resvg + cache Vercel Blob.
- **Sprint 8:** Migrar `DiagnosticoEvents` para Tinybird se passar de 100k linhas/mês.
- **Sprint 9:** Rate limit distribuído via Upstash Redis (substitui in-memory).
- **Sprint 10:** Property-based tests com `fast-check` no engine (gate G1.9 ampliado).
