# S06 — UX e performance (Tópico 2)

**Itens do doc:** 2.1 (vídeo), 2.2 (scripts), 2.3 (código/cache), 2.4 (contraste)
**Prioridade:** 🔥 P1 (2.1, 2.2) → 🟡 P2 (2.3) → 🟢 P3 (2.4) · **Risco:** Médio · **Responsável:** Torquato
**Dependências:** independente do editor. 2.2 exige acesso ao painel do GTM.
**Estimativa:** 2–3 dias
**Status:** 🟡 PARCIAL — partes de código feitas (branch `feat/seo-quickwins-s01`, tsc+build OK, 2026-08-07); vídeo + GTM + contraste completo pendentes do dono

---

## Status de execução (2026-08-07)

**Feito no código:**
- ✅ **2.2 PostHog** (`PostHogScript.tsx` reescrito): agora é client component com **gating de consentimento** (só dispara após aceite de cookies, padrão RDStation), `strategy="lazyOnload"` (fora do caminho crítico), `autocapture: false` (instrumentar só o que importa), `disable_surveys: true`. Session recording + heatmap nativo mantidos.
- ✅ **2.3 Cache** (`next.config.ts` headers): `Cache-Control: public, max-age=31536000, immutable` para estáticos de `/public` (imagens, vídeo, fontes). `/_next/static` já é imutável na Vercel. **Não tocou `vercel.json`** (histórico de quebra).
- ✅ **2.4 Contraste — prova social (prioridade do doc):** nomes de clientes (`ClientLogos.tsx`, /30→/70) e parceiros (`Partners.tsx`, /50→/75 e /40→/65) elevados para piso legível.

**Pendente / requer o dono ou browser:**
- 🔶 **2.1 Vídeo:** precisa do **arquivo self-host <2MB** (baixar/comprimir/1080p/sem áudio/≤12s) — eu não produzo o asset. Código de render-gating por breakpoint + poster local entra quando o arquivo existir.
- 🔶 **2.2 GTM:** **Clarity/Pixel/GA4** são tags no **painel do GTM** — desligar Clarity, gating do Pixel por consentimento (Consent Mode) e checar GA4/Ads duplicado são feitos lá, não no código.
- 🔶 **2.3 JS não usado / render-blocking:** exige profiling; **re-medir PageSpeed após 2.1/2.2** antes de investir.
- 🔶 **2.4 Contraste restante:** rodapé + rótulos de seção; e **validação exata 4.5:1 no Lighthouse** (método do próprio doc) — os valores acima são conservadores, confirmar no browser.

## Contexto

PageSpeed da home (mobile, 4G, 07/08/2026): Desempenho 71 (único fora do verde). LCP 4,5 s (limite 2,5 s), TBT 510 ms, CLS 0. O trabalho está aqui. **Re-medir depois de 2.1** antes de investir em 2.3 — parte do LCP pode cair só com o vídeo.

---

## 2.1 — Vídeo da home não carrega e trava (P1)

**Estado (validado):** `src/components/home/HeroClient.tsx:76-97` usa MP4 **4K do Pexels** (URL externa), poster do Pexels, `autoPlay/muted/loop/playsInline`, **sem lazy**. URL configurável via `settings.hero_video_url`.

- [ ] **AC2.1a** Vídeo self-hosted: baixar, reduzir para 1920×1080, comprimir, remover áudio, cortar ≤12 s, **alvo <2 MB**. Hospedar no próprio servidor/CDN.
- [ ] **AC2.1b** Imagem estática de capa (poster) **local**, que aparece antes do vídeo — passa a ser o elemento LCP medido.
- [ ] **AC2.1c** No celular, exibir só a imagem (não baixar o vídeo). No mobile ele é decoração cara.
- [ ] **AC2.1d** Vídeo marcado como **decorativo** (`aria-hidden`/sem faixa de legenda) para leitores de tela ignorarem — não adicionar legenda a vídeo mudo decorativo.
- [ ] **AC2.1e** Elimina o erro de console `ERR_CONNECTION_FAILED` do Pexels.

**Tarefas:** editar `HeroClient.tsx`; subir asset local; atualizar `hero_video_url`/`hero_image_url` no banco; guard de mídia por breakpoint.

---

## 2.2 — Scripts de medição (P1)

**Estado (validado):** GTM (`GTMScript.tsx`, `afterInteractive`, **sem consentimento**), PostHog (`PostHogScript.tsx`, `afterInteractive`, só prod, **sem consentimento**), RD Station/heatmap/site-tracker (**já respeitam** consentimento). **Facebook Pixel e Clarity NÃO estão no código** → são tags dentro do GTM. No código não há tag fixa de GA4/Ads (só `gtag('event')`/`gtag('consent')`).

- [ ] **AC2.2a** PostHog e Pixel do Facebook carregam **depois do conteúdo** (lazyOnload) e o **Pixel só após aceite de cookies** (o banner já existe: `CookieBanner.tsx` dispara `unfold-consent-updated`; RD Station já usa esse padrão em `RDStationScript.tsx` — replicar para PostHog/GTM-marketing).
- [ ] **AC2.2b** **Desligar o Clarity** no GTM (redundante com PostHog; corta ~93 KiB). *(Confirmar antes: análise de funil é usada no PostHog? Se ninguém usa funil, inverte — mantém Clarity, desliga PostHog. Decisão do dono.)*
- [ ] **AC2.2c** Enxugar PostHog: desligar módulo de **surveys** (~33 KiB); trocar **autocapture** por eventos instrumentados; manter session recording a 100% por ora (tráfego baixo); heatmap nativo do PostHog fica (vem no core).
- [ ] **AC2.2d** **Verificar no painel do GTM** se há tag GA4 **e** Google Ads duplicadas / dupla implementação (código só tem `gtag('event')`, então a duplicidade, se existir, é dentro do GTM). Corrigir para gtag único compartilhado — evita contagem dobrada de conversão. Economia potencial 150–185 KiB.

**Nota:** itens de GTM (2.2b, 2.2d, e o gating de marketing tags) são **configuração no painel do GTM**, não código. O que é código: gating do PostHog por consentimento + lazyOnload (`PostHogScript.tsx`), e mover o disparo do Pixel para pós-consentimento.

---

## 2.3 — Código não utilizado e cache (P2)

**Estado (validado):** sem `Cache-Control` custom, mas a Vercel já serve `/_next/static` imutável. Ganho real em `/public` (vídeo/imagens). `revalidate = 60` (ISR) em várias páginas.

- [ ] **AC2.3a** Cache dos estáticos de `/public` (vídeo, imagens, fontes) com `Cache-Control` longo/imutável (headers no `next.config.ts` ou `vercel.json`).
- [ ] **AC2.3b** JavaScript não utilizado (366 KiB): verificar bibliotecas inteiras onde bastaria uma função; usar code-splitting/`dynamic()` do Next por página.
- [ ] **AC2.3c** Recursos que bloqueiam render (630 ms): identificar e adiar o que não precisa antes da primeira pintura.
- [ ] **AC2.3d** Re-medir PageSpeed **após 2.1 e 2.2** — parte pode já ter sumido. Rodar também em `/blog/funil-de-vendas` (a home não representa as páginas com imagens de conteúdo).

---

## 2.4 — Contraste de cor (P3)

**Estado (validado):** uso sistemático de opacidade baixa em texto — `text-foreground/30` (clientes `ClientLogos.tsx:32`), `/50` (parceiros `Partners.tsx:34`), `/40`/`/45`/`/50` em `FeaturedCase.tsx`, `Footer.tsx`, `Insights.tsx`. É o único motivo de a acessibilidade ser 97, não 100.

- [ ] **AC2.4a** Trocar opacidade reduzida por **cor sólida** calculada para contraste mínimo (4,5:1 texto normal, 3:1 texto grande). Mantém o efeito de recuo visual, recupera legibilidade.
- [ ] **AC2.4b** Prioridade interna: **nomes de clientes e parceiros primeiro** (prova social ilegível = problema comercial), depois rodapé/links legais.

**Tarefas:** `ClientLogos.tsx:32`, `Partners.tsx:34,59`, `Insights.tsx:76-77`, `FeaturedCase.tsx:43,52`, `Footer.tsx:72,73,114,124,145`, `HeroClient.tsx:116,154`. Considerar tokens de cor no design system em vez de `/opacity` para texto secundário.

---

## Definition of Done (S06)

- [ ] Home sem erro de console; vídeo <2 MB self-hosted com poster local; mobile sem baixar vídeo.
- [ ] PostHog pós-consentimento e lazyOnload; Pixel só após aceite; Clarity desligado no GTM (ou decisão inversa registrada).
- [ ] GTM auditado: sem GA4/Ads duplicado.
- [ ] Estáticos de `/public` com cache longo.
- [ ] Nenhum texto de cliente/parceiro/rodapé abaixo do contraste mínimo.
- [ ] PageSpeed re-medido (home + 1 artigo) e registrado.
- [ ] Build + lint verdes; levado a `main`.

---

## Riscos / atenção

- **Gating de GTM por consentimento** pode afetar medição de Ads (janela de atribuição). Alinhar com quem opera mídia antes de bloquear o GTM inteiro — pode ser Consent Mode em vez de bloquear.
- **2.2b/2.2d dependem de acesso ao GTM** — sem isso, ficam pendentes.
- **Contraste é design system** — mudar tokens pode propagar além da home; revisar globalmente.

---

*— SM · 2026-08-07*
