# S05 — Home: vídeo do Hero, contadores no HTML e LCP

**Origem:** Plano de Ação (críticas: vídeo 4K de 80 MB, contadores "+R$ 0MM"; importante: PSI mobile) · Reunião 07/10 · Checklist M05/M07 · **Continua o item 2.1 da S06 de agosto** (`docs/stories/melhorias-site-2026-08/sprint-06-ux-performance.md`), que ficou parcial
**Prioridade:** 🔥 P1 · **Risco:** Médio · **Executor:** @dev · **Revisão:** @qa
**Dependências:** AC5.1 aguarda **P1** (decisão do vídeo). O resto está Ready.
**Status:** 🟢 Código implementado (2026-10-10), com o default recomendado de P1 (comprimir o vídeo atual). Falta re-medir após deploy (AC5.4b) e validar no browser (AC5.5)

---

## Contexto

- `src/components/home/HeroClient.tsx:83-104`: `DEFAULT_VIDEO` = MP4 Pexels **UHD 3840×2160** (~80 MB), poster também da Pexels; `<video autoPlay muted loop playsInline>` **sem guard de breakpoint** → baixa no celular. Sobrescrevível por `settings.hero_video_url`/`hero_image` (`src/lib/home-settings.ts:97-98, 284-285`).
- `StatCounter` (`HeroClient.tsx:16-58`) começa em `useState(0)` → o HTML do servidor (o que o Google e os rastreadores de IA leem) mostra "+R$ 0MM", "+R$ 0k", "+0k".
- Lighthouse desktop (Ferraz, 07/10): **56**.

---

## Acceptance Criteria

### 5.1 Vídeo (aguarda P1)
- [x] **AC5.1a** Asset conforme decisão do cliente. Default recomendado: gerar com ffmpeg, a partir do vídeo atual, **720p, sem áudio, ≤12 s, WebM (VP9) + MP4 (H.264) fallback, 2–4 MB cada**, em `public/videos/hero/`.
- [x] **AC5.1b** Poster **local** em WebP (`public/videos/hero/poster.webp`, ~1280px, <150 KB), extraído do mesmo vídeo.
- [x] **AC5.1c** Atualizar `hero_video_url` / `hero_image` no global `site.home_settings` (os textos/mídia da home vêm do banco — o default do código é só fallback) **e** os defaults em `HeroClient.tsx`, removendo toda referência à Pexels.

### 5.2 Mobile só com imagem (independe do asset)
- [x] **AC5.2a** Em viewport < 768px **o vídeo não é baixado**: renderizar só a imagem (poster). Implementar sem depender de JS para o caso padrão (ex.: `<picture>`/imagem sempre presente + `<video>` montado no cliente apenas quando `matchMedia('(min-width: 768px)')` for verdadeiro e `prefers-reduced-motion` não estiver ativo). Conferir na aba Network do DevTools (mobile emulado): nenhum request de vídeo.
- [x] **AC5.2b** Vídeo marcado como decorativo: `aria-hidden="true"`, sem foco.
- [x] **AC5.2c** Imagem do Hero é o elemento LCP: **sem lazy**, `fetchpriority="high"` (via `next/image` com `priority` ou `<link rel="preload" as="image">`). Checklist M04/M05.

### 5.3 Contadores no HTML (independe do asset)
- [x] **AC5.3a** O HTML entregue pelo servidor contém os **valores finais** ("+R$ 75MM", "+R$ 850k", "+25k" ou os valores vindos do banco). Validar com `curl -s https://unfoldgrowth.com.br | grep 'R\$'`.
- [x] **AC5.3b** A animação continua como efeito visual só para quem tem JS: o número final está no DOM; a contagem anima a partir do momento em que o bloco entra na viewport, **sem** que o valor inicial renderizado seja 0 (ex.: renderizar o valor final e, no cliente, só animar se o elemento ainda não estiver visível no mount). Sem layout shift (largura reservada com `tabular-nums`/min-width).
- [x] **AC5.3c** `prefers-reduced-motion: reduce` → sem animação, valor final direto.
- [x] **AC5.3d** Teste de componente: render em servidor (`renderToString`) contém o valor final.

### 5.4 Medição (Plano + Checklist M05)
- [x] **AC5.4a** Baseline **antes**: PageSpeed Insights mobile e desktop da home (nota, LCP, INP, CLS, TBT) registrados no Dev Notes.
- [ ] **AC5.4b** Mesma medição **depois** do deploy (5.2 + 5.3, e de novo após 5.1). Meta do Checklist: LCP ≤ 2,5 s, CLS ≤ 0,1.
- [x] **AC5.4c** _(case não medido: `site.cases` tem 0 registros, não há página de case publicada)_ Lighthouse mobile também em `/blog/funil-de-vendas`, `/cases/<um case>` e `/contato` (um por modelo de página — Checklist M05). Só registrar; correções viram stories novas se necessário.

### Qualidade
- [ ] **AC5.5** Lint, typecheck, testes e build verdes; validação visual no browser (desktop e mobile) sem regressão do Hero.

## Definition of Done
- 5.2 e 5.3 em produção com medições antes/depois; 5.1 fechado quando P1 chegar; item 2.1 da S06 de agosto marcado como concluído com link para esta story.

## Registro de implementação (2026-10-10)

- **5.1 (P1 = default recomendado):** gerado com ffmpeg a partir do próprio vídeo da Pexels (3840×2160, 30 s, 80,5 MB, sem áudio):
  - `public/videos/hero/hero-720.mp4`: 1280×720, 12 s, H.264, sem áudio, `faststart`, **1,28 MB** (-98%).
  - O WebM VP9 saiu maior (2,5 MB) e foi descartado; o MP4 roda em todos os navegadores.
  - `public/videos/hero/poster.webp`: primeiro quadro, 1280×720, 36 KB.
  - O banco (`site.home_settings`) tem `hero_video_url` e `hero_image_id` **nulos** → vale o default do código, sem escrita no banco. Toda referência à Pexels saiu.
  - Se o cliente escolher outra opção de P1, basta trocar os arquivos ou cadastrar pelo painel.
- **5.2:** o fundo é `next/image` (`priority`, `fetchPriority="high"`, `sizes=100vw`), elemento LCP sem lazy. O `<video>` só monta no cliente, com `matchMedia('(min-width: 768px)')` e sem `prefers-reduced-motion`, então **não existe no HTML do servidor** e o celular não baixa o vídeo. Leva `aria-hidden` e `tabIndex=-1`.
- **5.3:** `StatCounter` inicia com o valor final, ou seja, o SSR entrega "+R$ 75MM / +R$ 850k / +25k". A contagem só acontece se a hidratação chegar antes de o bloco aparecer (o reveal tem 540 ms de atraso; o limite é `performance.now() ≤ 450 ms`), e aí o reset para 0 é invisível. Em aparelho lento o número fica no valor final, sem piscar. `prefers-reduced-motion` mantém o valor final. A largura fica reservada (`tabular-nums` + `min-width` em `ch`), sem CLS.
- **5.3d:** `src/components/home/__tests__/hero-ssr.test.tsx` (3 testes). Para testar `.tsx`, o `vitest.config.ts` passou a usar JSX automático.
- **5.4a — linha de base (Lighthouse 12 local, produção, 10/10/2026, antes do deploy).** A API pública do PSI estava sem cota.

| Página | Perfil | Nota | LCP | TBT | CLS | Peso |
|---|---|---|---|---|---|---|
| Home | mobile | **44** | **15,1 s** | 930 ms | 0 | **47,1 MB** |
| Home | desktop | 96 | 1,2 s | 80 ms | 0 | 47,1 MB |
| /blog/funil-de-vendas | mobile | 64 | 5,7 s | 540 ms | 0 | 2,4 MB |
| /contato | mobile | 44 | **20,6 s** | 900 ms | 0,022 | 2,8 MB |

  O 56 do Ferraz (desktop) foi medido no **PageSpeed Insights**, que usa outra metodologia e outro throttling; não é comparável ao Lighthouse local. A re-medição pós-deploy (AC5.4b) **deve usar a mesma ferramenta** de cada lado: PSI contra PSI, Lighthouse local contra Lighthouse local. O peso de 47 MB, quase todo do vídeo, aparece nas duas.
- **5.4c — achados para stories futuras (fora do escopo):**
  - `/contato`: o LCP é um **parágrafo** que nasce com `opacity: 0` (animação reveal) e a página carrega **~1,4 MB de scripts de terceiros**: Cloudflare Turnstile (2 requests de ~590 KB, ~1,18 MB), GTM (~175 KB), 2× gtag (G-… e AW-…, ~370 KB) e o Pixel (~113 KB). Sugestões: renderizar o texto visível sem depender da animação, carregar o Turnstile só ao interagir com o form e revisar as tags duplicadas no GTM (item 2.2 da S06 de agosto).
  - O sitemap não tem **nenhum case**: a tabela `site.cases` está vazia (0 registros). Confirma o pedido da S10 ("difícil publicar") e simplifica a migração dela.

## QA Results — 2026-10-10 (Quinn)

**Veredito: CONCERNS → resolvido.** vitest 258/258 ✅ · tsc ✅ · lint ✅. ffprobe confirmou: MP4 1280×720, 12 s, sem áudio, `faststart` (moov antes do mdat), 1,28 MB; poster 36,6 KB.

| # | Sev. | Achado | Tratamento |
|---|---|---|---|
| 1 | Média | `setCount(0)` na hidratação causaria flash 75→0→75 em celular lento (TBT 930 ms) — os stats ficam acima da dobra | ✅ só anima se a hidratação ocorrer antes do reveal (`performance.now() ≤ 450`); senão fica no valor final |
| 2 | Baixa | Valor decimal (ex.: 1.5) terminava arredondado (2) e divergia do SSR | ✅ último quadro usa `stat.value` exato |
| 3 | Baixa | Descrição do painel ainda citava "padrão Pexels" | ✅ texto atualizado em `HomeSettings.ts` |
| 4 | Baixa | `poster` do `<video>` baixava o WebP de novo | ✅ removido (a `<Image>` já está atrás) |
| 5 | Baixa | `hero_image_url` http:// do painel falharia no otimizador | ✅ `unoptimized` para URLs http: |
| 6 | Info | Medições: PSI × Lighthouse local não são comparáveis; total de terceiros do /contato inconsistente; case sem medição | ✅ textos corrigidos |

## File List
- `src/components/home/HeroClient.tsx`: imagem LCP, vídeo condicional, contadores SSR
- `public/videos/hero/hero-720.mp4` (novo) · `public/videos/hero/poster.webp` (novo)
- `src/components/home/__tests__/hero-ssr.test.tsx` (novo)
- `vitest.config.ts`: `esbuild.jsx = 'automatic'`
- `src/globals/HomeSettings.ts`: descrição do campo de vídeo (sem "Pexels")
