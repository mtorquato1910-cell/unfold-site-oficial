# OPS — Ações operacionais (fora do código)

**Responsáveis:** Ferraz (GSC, Bing, conteúdo) · dono da conta Vercel de produção (**P9**) · autores
**Status:** ⬜

Itens do Plano de Ação ("Acompanhamento e pendências de verificação") e do Checklist que não são código. Marcar com data e quem fez.

## Após cada deploy da Onda 1
- [ ] Reenviar `/sitemap.xml` no GSC após S01 (lastmod novo).
- [ ] Atualizar o robots no GSC (Configurações → robots.txt → solicitar novo rastreamento) após S04.
- [ ] Reverificar as 10 URLs do Anexo B após S02 (`curl -sI`, ou pedir nova checagem).
- [ ] Solicitar indexação no GSC: `/blog/sdr`, `/blog/funil-de-vendas`, `/blog/processo-comercial`, `/blog/growth-marketing`, `/blog/vendas-b2b` (Plano + D3).
- [ ] Solicitar indexação dos 19 posts editados na S03 (lista no relatório da S03).

## Vercel (P9 — quem tem acesso à conta de produção)
- [ ] **Settings → Domains:** `www.unfoldgrowth.com.br` → *Redirect to* `unfoldgrowth.com.br`, **308**. Depois avisar o @dev para remover o redirect de www do `next.config.ts` (S02 AC2.6).
- [ ] **Firewall:** conferir que não há regra de bloqueio/desafio para bots de IA (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Bingbot) nem "Bot Protection"/Attack Mode desafiando rastreadores (Checklist M07). A OpenAI pede liberar os IPs de `openai.com/searchbot.json`.
- [ ] Variável `INDEXNOW_KEY` em produção (S09).

## HSTS — fase 3b (S04)
- [ ] Exportar a zona DNS completa de `unfoldgrowth.com.br` (registrador ou Cloudflare) e conferir que **todo** registro web (A/CNAME) responde em HTTPS com certificado válido: CNAMEs de clique e rastreio de e-mail (RD Station, Google), landing pages do RD e qualquer sistema antigo.
- [ ] Se estiver tudo OK, avisar o @dev para trocar o HSTS em `next.config.ts` para `max-age=31536000; includeSubDomains`. (`preload` continua fora.)

## Ferramentas
- [ ] Bing Webmaster Tools: verificar a propriedade (importar do GSC), enviar o sitemap, revisar erros de rastreamento e o relatório AI Performance.
- [ ] GSC: revisar as abas Experiência e Segurança e o relatório completo de indexação (Plano).
- [ ] GA4: grupo de canais personalizado "IA" com origem `chatgpt.com|chat.openai.com|perplexity.ai|claude.ai|copilot.microsoft.com|gemini.google.com` (Checklist M07).
- [ ] Monitoramento de uptime com alerta (UptimeRobot ou Better Stack) — Checklist M03.
- [ ] PageSpeed Insights mobile da home antes/depois (registrado na S05).

## Acompanhamento com data
- [ ] **28/10/2026:** se algum dos 7 posts do Anexo D continuar "Rastreada, mas não indexada", decidir consolidação/enriquecimento (tabela do Anexo D) — vira story de conteúdo.
- [ ] **Fim de out–início de nov (2–3 semanas após a Onda 1):** conferir se os 12 posts sem rastreamento desde jun/jul voltaram a ser visitados (dashboard-comercial, pipeline-de-vendas, funil-de-marketing-x-funil-de-vendas, quais-metricas, funil-de-vendas-para-construcao-civil, como-calcular-o-cac, agencia-de-trafego, sales-enablement, marketing-de-lancamento, glossario, quanto-investir-em-trafego-pago, conversao-de-leads).
- [ ] Mensal: lista de 20–30 perguntas do público testadas no ChatGPT, Gemini/AI Mode, Perplexity, Copilot e Claude — a marca é citada? quem aparece no lugar? (Checklist M07).

## Conteúdo (Ferraz)
- [ ] Preencher o **alt** das 73 imagens listadas em `backups/imagens-conteudo-2026-10-10.md` (S08). Preencher só o alt **não** altera a data de atualização do post (a assinatura de conteúdo da S01 ignora atributos, só considera texto, estrutura e `src`).
- [ ] Revisar a prévia `backups/broken-links-preview-2026-10-10.md` e aprovar o `--apply` (S03).

## Regra permanente
- Sempre que atualizar um post importante: "Solicitar indexação" no GSC (o IndexNow da S09 cobre o Bing automaticamente).
- Todo script que reescrever HTML de posts/cases usa `context: { technicalEdit: true }` (S01) — senão o lastmod volta a mentir.

## Autores (Checklist M08)
- [ ] Gabriel e Davi: LinkedIn com o cargo na Unfold e link para o site (para fontes externas confirmarem a página de autor).
