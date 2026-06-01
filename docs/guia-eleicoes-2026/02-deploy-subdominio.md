# Deploy do Hotsite — Subdomínio `eleicoes.unfoldgrowth.com.br/featwork`

Passo a passo para colocar o Guia Eleições no ar. **Domínio no Cloudflare, hospedagem na Vercel.** O código (rewrite/redirect, envs, Navbar) já está pronto; aqui é a parte de infraestrutura + validação.

> **Arquitetura:** o conteúdo vive na rota interna `/guia-eleicoes-2026`. O `src/middleware.ts` detecta o host `eleicoes.unfoldgrowth.com.br` e: reescreve `/featwork` → rota interna (a URL na barra continua `/featwork`); redireciona a raiz do subdomínio → `/featwork`; e redireciona o apex `/guia-eleicoes-2026` → subdomínio (canonical). O apex (`unfoldgrowth.com.br`) **não é afetado** (testado).

---

## A. Vercel — adicionar o domínio

1. Painel Vercel → projeto **`unfold-site-oficial`** → **Settings → Domains**.
2. **Add Domain** → digite `eleicoes.unfoldgrowth.com.br` → **Add**.
3. A Vercel mostrará a instrução de DNS. Para subdomínio ela pede um **CNAME** apontando para `cname.vercel-dns.com` (anote o valor exato exibido — pode variar).

## B. Cloudflare — criar o registro DNS

4. Cloudflare → zona **`unfoldgrowth.com.br`** → **DNS → Records → Add record**.
5. Preencha:
   - **Type:** `CNAME`
   - **Name:** `eleicoes`
   - **Target:** `cname.vercel-dns.com` (o que a Vercel indicou)
6. **Proxy status: `DNS only` (nuvem CINZA, proxy OFF).**
   > ⚠️ Importante: com o proxy laranja da Cloudflare ligado, a emissão do SSL da Vercel e o roteamento podem conflitar — e o proxy reescreve o header `Host`, o que quebraria a guarda de host do middleware. Mantenha **DNS only**. (Se o time exigir o proxy, use SSL/TLS "Full (strict)" e valide com cuidado — fora do padrão.)
7. **Save**.

## C. Verificação na Vercel

8. Volte em Vercel → Domains: aguarde o status **Valid Configuration** (propagação de minutos a ~1h).
9. A Vercel emite o **certificado SSL automaticamente** (Let's Encrypt) assim que o DNS valida — HTTPS ativo sem ação manual.

## D. Variáveis de ambiente (Vercel → Settings → Environment Variables → Production)

Adicione/conf­irme (depois **Redeploy**):

| Variável | Valor | Observação |
|----------|-------|------------|
| `NEXT_PUBLIC_GUIA_URL` | `https://eleicoes.unfoldgrowth.com.br/featwork` | Alimenta OG/canonical/sitemap, UTMs de share e o link da Navbar |
| `CRM_MODE` | `rd-station` | Para o lead ir ao RD de verdade |
| `RD_STATION_PUBLIC_TOKEN` | *(já existe)* | Token legacy do RD |
| `RD_GUIA_CONVERSION_ID` | `guia-eleicoes-2026` | Deve bater com o painel RD (ver §F) |
| `GUIA_ALLOWED_ORIGINS` | `https://eleicoes.unfoldgrowth.com.br,https://unfoldgrowth.com.br` | Allowlist CSRF do endpoint |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | *(já existem)* | Captcha |
| `EMAIL_MODE` | `resend` | Para o alerta de fallback sair de verdade |
| `RESEND_API_KEY` | *(sua key)* | Idem |
| `ALERT_EMAIL_TO` | *(e-mail do time)* | Recebe alerta se o RD falhar |
| `NEXT_PUBLIC_DPO_EMAIL` | *(e-mail do DPO)* | Rodapé LGPD (opcional; default `privacidade@unfoldgrowth.com.br`) |

## E. Deploy do código

10. Faça merge/deploy da branch com o middleware estendido, a Navbar e o conteúdo do hotsite.
11. Confirme no ar:
    - `https://eleicoes.unfoldgrowth.com.br/featwork` → mostra o guia (URL permanece `/featwork`).
    - `https://eleicoes.unfoldgrowth.com.br/` → redireciona para `/featwork`.
    - `https://unfoldgrowth.com.br/guia-eleicoes-2026` → redireciona para o subdomínio.
    - `/static/Guia-Eleicoes-2026-Unfold-FeatWork.pdf` baixa o PDF.
    - **Não-regressão:** `unfoldgrowth.com.br/`, `/diagnostico`, `/painel` carregam normais e **não** redirecionam.
    - Cadeado SSL válido.

## F. Pós-deploy (go-live)

12. **Painel RD (bloqueia o tracking real):** confirme que existem, com texto exato:
    - Campo `cf_perfil_eleitoral_2026` com as 4 opções: `Sim, sou candidato ou pré-candidato` · `Sou parte de equipe de campanha` · `Não, mas atuo no setor` · `Outro`.
    - Campos `cf_origem_hotsite`, `cf_caminho_do_lead`, `cf_utm_source/medium/campaign/content/term`, `cf_lead_referrer`, `cf_lead_data_cadastro`.
    - O identificador de conversão **`guia-eleicoes-2026`** como gatilho da automação que cria a negociação.
    > A API legacy descarta silenciosamente qualquer valor que não bata 100% (acento/hífen/caixa).
13. Faça **um cadastro de teste real** → confirme a conversão `guia-eleicoes-2026` no painel RD em ≤60s (T-01).
14. Valide o **Open Graph** colando a URL do subdomínio no debugger do WhatsApp/LinkedIn (deve mostrar a imagem `og-guia-eleicoes.png`).
15. **Investigue a Calculadora:** confira se ela disparava dupla conversão no RD (a guarda nova corrige) — ver §Avisos.

---

## Checklist de validação manual (não automatizável)

- [ ] T-01/02/03 — cadastro em Chrome desktop, iPhone Safari, Android Chrome → lead no RD ≤60s
- [ ] T-12 — download do PDF em desktop e mobile
- [ ] T-13/14 — share WhatsApp (app/web) e e-mail (cliente padrão) abrem com texto+UTM
- [ ] T-22 — Lighthouse Mobile: Performance ≥ 85, Accessibility ≥ 90
  - Nota: o **conteúdo do guia** (mockup editorial) tem textos auxiliares com contraste abaixo de AA — preservados por decisão (RF-02). Os componentes do gate/modal/header/rodapé estão 100% AA. Se o score de a11y exigir, avalie com o dono ajustar o contraste dos textos auxiliares do conteúdo.
- [ ] T-24 — responsivo e legível em 320px, 768px, 1280px
- [ ] CLS Mobile ≤ 0,1 (medir; se o scaling JS gerar shift, setar `--guia-scale` inicial no SSR)
- [ ] Cross-browser: Chrome/Edge, Safari (+iOS), Firefox, Samsung Internet

## Avisos importantes

1. **Conteúdo a preencher:** a contracapa do guia tem `[PLACEHOLDER]` nos contatos institucionais (e-mail, site, redes, cidade-sede de Unfold e Feat.Work). Enviar os dados para preencher antes do go-live.
2. **PDF/OG provisórios:** o PDF (`public/static/...`) e a imagem OG (`public/guia/og-guia-eleicoes.png`) foram gerados a partir do HTML. Para a versão final do design, basta substituir os arquivos (sem deploy de código). Regenerar: `python scripts/gen-guia-pdf.py` / `python scripts/gen-og.py`.
3. **Política de Privacidade / DPO (D-02/D-04):** o link aponta para `unfoldgrowth.com.br/politica-de-privacidade` e o DPO para `privacidade@unfoldgrowth.com.br` por padrão — ajuste via env se necessário.
4. **LGPD do dado de perfil (DEC-3):** está como legítimo interesse + aviso. Se o jurídico/DPO classificar "intenção de candidatura" como dado sensível, trocar o aviso por checkbox de consentimento explícito no formulário (mudança pequena, gancho já previsto).
