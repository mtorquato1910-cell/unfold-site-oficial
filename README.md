# Unfold Growth — Site Oficial

Site institucional e plataforma de geração de demanda B2B da Unfold Growth.
Construído com Next.js 15 + Payload CMS 3 + Tailwind CSS 4.

## Stack

- **Framework:** Next.js 15 (App Router)
- **CMS:** Payload CMS 3
- **DB Dev:** SQLite (libsql) — `file:./dev.db`
- **DB Prod:** PostgreSQL (Neon via `DATABASE_URL`)
- **Estilo:** Tailwind CSS 4 + shadcn/ui
- **Auth email:** Resend (mock em dev)
- **CRM:** RD Station CRM Pro (mock em dev)
- **IA:** OpenRouter `anthropic/claude-sonnet-4-5` (mock em dev)
- **Anti-spam:** Cloudflare Turnstile (mock em dev)

## Desenvolvimento

```bash
npm install --legacy-peer-deps
npm run dev
```

Acesse `http://localhost:3000`.

### Seed de dados de desenvolvimento

```bash
# Cases fictícios
curl -X POST http://localhost:3000/api/seed/cases

# Perguntas do diagnóstico (12 exemplos)
curl -X POST http://localhost:3000/api/seed/diagnostico

# Posts do blog (3 exemplos)
curl -X POST http://localhost:3000/api/seed/blog
```

## Variáveis de ambiente

Crie `.env.local` com:

```env
# Obrigatório
PAYLOAD_SECRET=seu-secret-aqui

# DB (opcional em dev — usa SQLite por padrão)
DATABASE_URL=file:./dev.db
# Para produção: DATABASE_URL=postgres://...

# Site
NEXT_PUBLIC_SITE_URL=https://unfoldgrowth.com.br

# IA (opcional — usa mock por padrão)
AI_MODE=mock                      # mock | openrouter | anthropic-direct
OPENROUTER_API_KEY=               # quando AI_MODE=openrouter

# Email (opcional — usa mock-console por padrão)
EMAIL_MODE=mock-console           # mock-console | resend
RESEND_API_KEY=                   # quando EMAIL_MODE=resend

# CRM (opcional — usa mock por padrão)
CRM_MODE=mock                     # mock | rd-station
RD_STATION_API_KEY=               # quando CRM_MODE=rd-station
RD_STATION_WEBHOOK_SECRET=        # validação HMAC webhook

# Anti-spam (opcional — mock automático sem key)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=   # Cloudflare Turnstile

# Agendamento (calendário pós-diagnóstico)
NEXT_PUBLIC_CALENDAR_EMBED_URL=https://example.com/agendamento
```

## Páginas

| URL | Descrição |
|-----|-----------|
| `/` | Home |
| `/sobre` | Sobre a Unfold Growth |
| `/metodo` | Método UGS |
| `/atuacao` | Atuação e verticais |
| `/cases` | Grid de cases |
| `/cases/[slug]` | Detalhe do case |
| `/blog` | Blog |
| `/blog/[slug]` | Post individual |
| `/diagnostico` | Diagnóstico Etapa 1 |
| `/diagnostico/etapa-2/[token]` | Quiz |
| `/diagnostico/resultado/[token]` | Resultado |
| `/ferramentas/calculadora-trafego` | Calculadora de tráfego |
| `/politica-de-privacidade` | Política de privacidade |
| `/termos` | Termos de uso |
| `/lgpd` | Direitos LGPD |
| `/admin` | Painel Payload CMS |

## CI/CD

GitHub Actions em `.github/workflows/ci.yml`:
- Lint → Typecheck → Build em cada push

## Credenciais pendentes

- [ ] `OPENROUTER_API_KEY` — para Calculadora de Tráfego com IA real
- [ ] `RESEND_API_KEY` — para envio de emails transacionais
- [ ] `RD_STATION_API_KEY` e `RD_STATION_WEBHOOK_SECRET` — para CRM
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — para anti-spam Cloudflare
- [ ] `NEXT_PUBLIC_CALENDAR_EMBED_URL` — URL real do calendário de agendamento
- [ ] `DATABASE_URL` (postgres) — para produção Neon
- [ ] `PAYLOAD_SECRET` — secret real para produção
