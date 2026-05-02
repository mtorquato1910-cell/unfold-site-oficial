# PRD v2.0 — Site Unfold Growth

**Versão:** 2.0
**Data:** 30 de abril de 2026
**Autor técnico:** Matheus
**Base estratégica:** Brief Estratégico v1.0 — Gabriel Calheiros
**Status:** Aprovado para implementação (com Etapa 2 do Diagnóstico marcada como TBD)

---

## Sobre esta versão

Este PRD substitui integralmente a v1.0. Foi reescrito a partir do **Brief Estratégico de Arquitetura e Conteúdo do Site** produzido por Gabriel Calheiros (Partner & Diretor de Marketing da Unfold Growth). O Brief tem precedência hierárquica em qualquer divergência — esta versão respeita 100% das decisões estratégicas estabelecidas.

**Principais mudanças vs v1.0:**

| Tópico | v1.0 | v2.0 |
|---|---|---|
| Natureza do projeto | Rebrand da Lighthouse | **Nova entidade**, novo CNPJ; Lighthouse encerra em maio/2026 |
| Mapa do site | ~10 páginas + hubs | **6 páginas + Diagnóstico + Calculadora** |
| Página de serviços | /servicos com 4 serviços por canal | **/metodo (UGS)** + **/atuacao (4 verticais)** |
| Iscas digitais | 6 ferramentas (calc, quiz, audit, materiais, newsletter, formulário) | **Diagnóstico de Growth** (CTA único) + Calculadora secundária |
| Multi-idioma | PT-BR + EN | **Só PT-BR** (EN entra na v2 do site) |
| Auditoria de LP | Incluída | **Removida** (vai pra v2) |
| Materiais ricos | Hub completo | **Removido** (vai pra v2) |
| Blog com guest posts | Incluído | **Só posts internos**, autores Unfold |
| CRM | Adapter genérico, provedor TBD | **RD Station CRM + RD Marketing (Pro)** confirmados |
| Roadmap | 11 semanas | **5-7 semanas** |

**Pendências aguardando Gabriel (não bloqueiam o início da implementação):**

- Especificação detalhada da Etapa 2 do Diagnóstico (12 perguntas, scoring matrix, 8-12 variações de insight)
- Diagrama visual do UGS para a página /metodo
- Definição da ferramenta de calendário pós-Diagnóstico
- Lista final de logos com aprovação dos clientes

---

## 1. Visão e Contexto

### 1.1. Visão de Produto

Construir o site institucional da **Unfold Growth**, uma nova entidade comercial que ocupa a categoria de **assessoria de growth especializada em operações com vendas complexas**. O site é uma ferramenta comercial: deve comunicar tese, método (Unfold Growth System) e prova social de forma a converter visitantes qualificados em leads via Diagnóstico de Growth — a única ferramenta primária de captura.

### 1.2. Contexto

A Unfold Growth não é um rebrand da Agência Lighthouse. É uma **nova entidade**, com novo CNPJ, novo posicionamento e nova proposta de valor. A Lighthouse é encerrada formalmente ao longo de maio de 2026. Ativos selecionados (cases reformatados, big numbers, certificações, sistema visual) são transferidos por acordo formal; tudo o mais é descartado.

O site é parte de um projeto de **comunicação institucional de transição** que inclui também: comunicação 1-1 com os 6 clientes ativos, comunicação direta com parceiros estratégicos (Meta, Kommo, RD, ABRADI), lançamento público coordenado em LinkedIn e e-mail, e migração de infraestrutura digital (domínios, e-mails, contas de mídia, CRM).

### 1.3. Objetivos do Projeto

| # | Objetivo | Métrica de Sucesso |
|---|---|---|
| 1 | Lançar a Unfold como nova entidade com posicionamento próprio | Site no ar antes do encerramento do CNPJ Lighthouse (maio/2026) |
| 2 | Converter visitantes qualificados em leads via Diagnóstico | Mínimo de 30 diagnósticos completos/mês a partir do mês 2 |
| 3 | Comunicar transição com sucesso e preservar relacionamentos | Conversão dos 6 clientes ativos para contratos sob CNPJ Unfold |
| 4 | Estabelecer autoridade técnica do método UGS | Engajamento qualitativo (tempo médio na página /metodo > 90s, scroll-depth > 70%) |
| 5 | Tornar a equipe Unfold autônoma na edição do site | 100% das alterações de conteúdo via painel, sem depender de desenvolvedor |

### 1.4. Não-Objetivos (fora do escopo da v1)

- Internacionalização PT-BR + EN (adiada para v2 quando houver tração internacional)
- Hub de Materiais Ricos (e-books, templates, planilhas) com fluxo de captura próprio
- Página dedicada de Podcast (entra em /sobre como bloco se necessário)
- Auditoria de Landing Page com IA
- Páginas individuais por vertical (mantidas como seções na página /atuacao)
- Filtros avançados em Cases e Blog
- Migração automática dos 78 posts da Lighthouse (migração curada, post a post)
- Guest posts de clientes externos
- App mobile, comunidade, e-commerce, gerenciador de campanhas

---

## 2. Posicionamento e Princípios Estratégicos

### 2.1. Posicionamento central

A Unfold é uma **assessoria de growth especializada em operações com vendas complexas**. Estrutura e opera sistemas de crescimento que conectam marketing, vendas, CRM, automação e inteligência comercial em uma lógica integrada, previsível e orientada a resultado comercial.

**Tese central:** *Empresas com vendas complexas não precisam de mais marketing isolado. Precisam de um sistema de crescimento mais integrado.*

**Frase-síntese:** *Growth não é canal. É sistema.*

### 2.2. ICP prioritário

Empresas de médio e grande porte com:
- Ticket alto e ciclo de venda longo ou tecnicamente complexo
- Estrutura mínima de marketing e vendas já existente
- Necessidade real de CRM e automação
- Maturidade intermediária ou avançada
- Dor concreta de integração, previsibilidade ou clareza de funil

**Verticais prioritários (Fase 1 GTM):**
- Construção Civil e Incorporação (tração)
- Agroindústria e negócios agro com vendas complexas (tração)
- Tecnologia e SaaS B2B (expansão seletiva)
- Automotivo e concessionárias (entrada oportunista)

**Não-ICP (o site filtra propositalmente):**
- Empresas que querem apenas tráfego pago como serviço
- Empresas que querem apenas social media
- Empresas que compram por preço
- Empresas sem operação comercial mínima
- Empresas que esperam agência full service

### 2.3. Os 10 princípios não-negociáveis

Toda decisão de arquitetura, conteúdo e UX deve passar pelo teste destes princípios:

1. **O site vende sistema, não pacote de serviços.** A categorização por canal é descartada; a arquitetura é UGS (Diagnosticar → Estruturar → Operar → Evoluir).
2. **Filtra na entrada, não na saída.** Copy, CTAs e formulários afastam o cliente errado em vez de tentar convertê-lo.
3. **Profundidade nas páginas certas, enxutez no resto.** 6 páginas, não 10+. Inflação comunica volume, não autoridade.
4. **Uma única ferramenta de captura primária, profunda.** Diagnóstico de Growth é o CTA principal único. Calculadora é secundária.
5. **Conteúdo do site representa autoridade técnica do método.** Sem dicas genéricas, sem listas, sem hype.
6. **Liderança presente, não protagonista.** Gabriel aparece como autoria do método, não como cara do site.
7. **Cada página tem uma função comercial clara.** Sem páginas decorativas.
8. **Stack proporcional ao problema.** Decisão técnica documentada e justificada.
9. **Internacionalização entra na v2.** Audiência atual é Brasil.
10. **Janela curta, lançamento em 5-7 semanas.** Tudo o que não é essencial entra em v2.

---

## 3. Identidade Visual

Sistema visual aprovado conforme **APR V2 — Identidade Visual da Unfold**. Preservar integralmente.

### 3.1. Paleta de Cores

| Token | Hex | Uso |
|---|---|---|
| `--color-bg-primary` | `#001E29` | Background principal (dark) |
| `--color-bg-secondary` | `#002a38` | Background dark alternado |
| `--color-bg-light` | `#E7E7E7` | Background light, seções alternadas |
| `--color-accent-mint` | `#6DF9C6` | CTAs primários, highlights |
| `--color-accent-blue` | `#93BAFB` | Gradientes, links secundários |
| `--color-accent-purple` | `#2E1A7F` | Acentuação ousada pontual |
| `--color-border-subtle` | `#0a3340` | Bordas em dark mode |
| `--color-text-on-dark` | `#E7E7E7` | Texto sobre fundo escuro |
| `--color-text-on-light` | `#001E29` | Texto sobre fundo claro |
| `--color-text-muted` | `#8aa0a8` | Texto secundário sobre dark |

### 3.2. Tipografia

| Família | Uso | Substituta web |
|---|---|---|
| Relicus | Display tech (logos, ativações específicas) | Space Mono / JetBrains Mono |
| Carbon | Labels técnicas (uso pontual) | IBM Plex Mono |
| Chambers Sans | Corpo de texto | Inter (recomendada como padrão até licenciamento web da proprietária) |

**Regra de aplicação:**
- Headlines, subtítulos, body: **Inter** (sans, weight 400-800)
- Eyebrows, tags, números pequenos (≤14px): **IBM Plex Mono**
- Wordmark "UNFOLD": pode usar Inter bold com tracking apertado se Relicus web não estiver disponível

### 3.3. Elementos gráficos

- Símbolo da marca (forma redonda com losango interno)
- Padrões de camadas/dobras com gradiente verde-menta → azul-claro → roxo
- Estética: techwear meets B2B sério; densidade > vazio; consultiva, não SaaS

### 3.4. Princípios de UI

- Contraste alto, hierarquia tipográfica forte
- Alternância proposital entre fundo dark `#001E29` e light `#E7E7E7` para criar ritmo
- Microinteracções discretas (hovers que elevam, setas que se deslocam)
- Animações sutis, sempre com `prefers-reduced-motion` respeitado
- Mobile-first

---

## 4. Stack Técnica

### 4.1. Justificativa

A stack escolhida foi avaliada à luz do **Princípio 8** do Brief ("Stack proporcional ao problema") e mantida como **Next.js 15 + Payload CMS + PostgreSQL** pelas seguintes razões:

1. **Painel admin nativo:** o Brief mantém o painel administrativo no escopo (com collections reduzidas). Payload entrega isso de forma nativa, sem custo adicional.
2. **Capacidade de expansão para v2 sem refatoração total:** quando vier multi-idioma, blog completo, materiais ricos, o ecossistema Next.js + Payload absorve sem troca de stack.
3. **SEO institucional:** SSR/ISR do Next.js entrega Core Web Vitals consistentemente fortes para SEO orgânico do blog (mesmo enxuto na v1).
4. **Integração com IA:** Calculadora e (futuramente) outras ferramentas com IA pedem backend confiável; a alternativa "site estático + Make/Zapier" é frágil para fluxos com web search e prompts versionados.
5. **Custo total projetado v1 + v2 < alternativa Webflow + Tally + Make + outros:** Webflow começa a custar caro acima do plano básico, Make tem rate limits restritivos, e adicionar painel admin customizado depois é mais caro que ter o Payload desde o início.
6. **Domínio técnico já estabelecido:** o time técnico (Matheus) tem fluência em Cursor + Claude Code, o que reduz drasticamente o custo de implementação dessa stack.

### 4.2. Tecnologias

| Camada | Tecnologia | Notas |
|---|---|---|
| Frontend | Next.js 15 (App Router) | SSR/ISR, server components |
| Linguagem | TypeScript (strict) | Type safety, melhor DX no Cursor |
| Estilização | Tailwind CSS + shadcn/ui | Velocidade, consistência |
| CMS / Admin | **Payload CMS 3** | Roda no mesmo Next.js, painel admin nativo |
| Banco de dados | **PostgreSQL** | Hospedável em Neon, Supabase ou Railway |
| Storage de mídia | DigitalOcean Spaces ou S3 | Imagens, PDFs |
| Hospedagem | Vercel (frontend) + Railway (Payload + Postgres) | DX e custo bons |
| IA (Calculadora) | Anthropic Claude API (claude-sonnet-4) | Já validado, qualidade em PT-BR |
| Web search (IA) | Tavily API | Benchmarks reais para a Calculadora |
| **CRM** | **RD Station CRM + RD Station Marketing (ambos Pro)** | Decidido. Adapter pattern preservado para flexibilidade futura |
| Email transacional | Resend | DX, integra bem com Next.js |
| Anti-spam | Cloudflare Turnstile | Privacy-friendly |
| Auth | Payload Auth nativo | Sessões + JWT |
| Analytics | Vercel Analytics + Google Analytics 4 | Performance + comportamento |
| Observabilidade | Sentry (free tier inicialmente) | Erros frontend e backend |
| Calendário pós-Diagnóstico | **TBD** (Calendly, Cal.com, ou agenda RD) | Aguardando definição. Recomendação técnica: Cal.com (free, embed simples) |

### 4.3. Estrutura de diretórios

```
unfold-growth/
├── src/
│   ├── app/
│   │   ├── (frontend)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Home
│   │   │   ├── metodo/page.tsx
│   │   │   ├── atuacao/page.tsx
│   │   │   ├── cases/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── sobre/page.tsx
│   │   │   ├── diagnostico/
│   │   │   │   ├── page.tsx                # Etapa 1 + entrada
│   │   │   │   ├── [token]/page.tsx        # Etapa 2 (12 perguntas)
│   │   │   │   └── [token]/resultado/page.tsx
│   │   │   └── ferramentas/
│   │   │       └── calculadora-trafego/page.tsx
│   │   ├── (payload)/admin/
│   │   └── api/
│   │       ├── diagnostico/
│   │       │   ├── etapa-1/route.ts
│   │       │   ├── etapa-2/route.ts
│   │       │   └── resultado/route.ts
│   │       ├── calc-trafego/route.ts
│   │       └── webhooks/rd/route.ts
│   ├── collections/                        # Definições do Payload
│   ├── components/
│   │   ├── ui/                             # shadcn primitivos
│   │   ├── blocks/                         # Blocos editáveis
│   │   └── diagnostico/                    # Componentes específicos
│   ├── lib/
│   │   ├── ai/
│   │   ├── crm/
│   │   │   ├── adapter.ts
│   │   │   ├── rdstation.adapter.ts        # Implementação principal
│   │   │   └── webhook.adapter.ts          # Fallback genérico
│   │   ├── scoring/                        # Lógica do scoring matrix
│   │   └── utils/
│   ├── payload.config.ts
│   └── middleware.ts
├── docs/
│   ├── PRD.md
│   └── BRIEF.md
└── package.json
```

---

## 5. Mapa de Páginas

### 5.1. Estrutura final

| URL | Página | Objetivo principal |
|---|---|---|
| `/` | Home | Comunicar tese, posicionamento, prova social e direcionar ao Diagnóstico |
| `/metodo` | Método (UGS) | Aprofundar o método e diferenciar de agências/consultorias genéricas |
| `/atuacao` | Atuação | Mostrar profundidade vertical (Construção, Agro, Tech, Automotivo) |
| `/cases` | Cases | Provar resultado real através de cases reescritos sob o framework UGS |
| `/sobre` | Sobre | Dar rosto institucional à marca, com presença discreta da liderança |
| `/diagnostico` | Diagnóstico de Growth | CTA principal — converter intenção em lead qualificado |
| `/ferramentas/calculadora-trafego` | Calculadora | Ferramenta secundária — captura lead com perfil tático |

Páginas utilitárias: `/politica-de-privacidade`, `/termos`, `/lgpd`, `/404`.

### 5.2. Detalhamento por página

#### 5.2.1. Home (`/`)

**Objetivo único:** converter visitante qualificado para o Diagnóstico de Growth depois de comunicar tese, método e prova social em menos de 90 segundos.

**Sequência de blocos:**

| # | Bloco | Conteúdo |
|---|---|---|
| 1 | Header fixo | Logo, navegação (Método · Atuação · Cases · Sobre), CTA secundário "Solicite um Diagnóstico" no canto direito |
| 2 | Hero | Headline carregando a tese, subheadline explicando o quê e como, CTA primário Diagnóstico |
| 3 | Big numbers | R$ 75MM, R$ 850k, 25k conteúdos — prova quantitativa |
| 4 | Logos de clientes | 11 logos selecionados (condicionais à aprovação), monocromia |
| 5 | Tese e problema do mercado | 5 dores em afirmações curtas + transição para o método |
| 6 | UGS em destaque | Bloco visual com 4 pilares + CTA "Conheça o método completo" |
| 7 | Verticais de atuação | 4 cards (Construção, Agro, Tech, Automotivo) com micro-ângulo |
| 8 | Cases destaque | 3 cases em grid com resultado quantitativo + CTA "Ver todos" |
| 9 | Certificações | Meta, Kommo, RD, ABRADI em discreto |
| 10 | CTA final forte | Headline de transição + CTA Diagnóstico |
| 11 | Footer | Contato, endereço, redes sociais, link LinkedIn da liderança |

**Princípio de copy:** cada seção deve poder ser lida isoladamente e ainda assim gerar vontade de clicar no CTA. Visitantes B2B sérios escaneiam.

**Direcionais de copy:**

- **Headline (Hero):** "Estruturamos sistemas de crescimento para empresas de vendas complexas." (ou variação que carregue a tese)
- **Subheadline:** "Assessoria de growth que conecta marketing, vendas, CRM e automação em um sistema integrado, previsível e orientado a resultado comercial."
- **CTA Hero:** "Solicite um Diagnóstico de Growth"
- **Bloco de problema:** afirmações curtas, não perguntas. Não "Seu CRM está mal utilizado?", e sim "CRM mal utilizado".
- **CTA final:** "Você já tem marketing e vendas. Falta o sistema que conecta tudo."

#### 5.2.2. Método (`/metodo`)

**Objetivo:** transformar curiosidade em convicção. É a página que um prospect vai ler inteira quando estiver avaliando seriamente contratar.

**Sequência de blocos:**

1. Hero — título "Unfold Growth System®", subtítulo posicional
2. Tese do método — texto curto e afiado, formato de manifesto
3. **Os 4 pilares em profundidade** (uma seção por pilar):
   - Diagnosticar — pergunta central, função, o que acontece dentro, output
   - Estruturar — idem
   - Operar — idem
   - Evoluir — idem
4. **Diagrama integrador do UGS** — visual mostrando como os 4 pilares se conectam *(asset visual em produção, fornecido pelo Gabriel)*
5. O que o UGS não é — bloco de diferenciação
6. Como o UGS conecta marketing, vendas, CRM e automação — diagrama das 4 camadas
7. Quando faz sentido aplicar o UGS — bloco de qualificação
8. CTA de Diagnóstico

**Direcional de copy (tese):**

> "Crescimento não é a soma de ações isoladas de marketing. É o resultado da organização de um sistema. O Unfold Growth System organiza esse sistema em quatro movimentos integrados — diagnosticar, estruturar, operar e evoluir — conectando marketing, vendas, CRM e automação em uma lógica única."

**Direcional de copy (o que o UGS não é):**

> "UGS não é growth hacks. Não é tráfego com outro nome. Não é metodologia genérica de marketing. É um método que organiza a operação comercial em sistema, voltado especificamente para empresas com vendas complexas."

#### 5.2.3. Atuação (`/atuacao`)

**Objetivo:** mostrar profundidade vertical sem criar 4 páginas separadas. Uma única página com 4 seções âncoradas (ou tabs).

**Sequência de blocos:**

1. Hero — título e parágrafo institucional
2. Seletor de vertical — tabs ou cards clicáveis com destaque para Construção e Agro
3. **Seção por vertical** (4 vezes, mesma estrutura):
   - Ângulo específico
   - Principais dores
   - Como a Unfold aborda
   - Mini-cases ou logos
   - CTA contextualizado
4. Nota de rodapé sobre verticais não listados (Indústria e outros B2B)

**Direcionais de copy por vertical:**

- **Construção:** "O gargalo não está apenas em gerar contatos, mas em reduzir atrito entre captação, validação técnica e avanço comercial." Foco: funil, CRM, sales enablement, comitê de compra.
- **Agro:** "Crescimento não pode depender apenas de relação presencial, memória comercial e esforço de campo desorganizado." Foco: CRM, inteligência comercial, organização da captação.
- **Tecnologia:** "O problema não é apenas gerar pipeline, mas evitar que dados, CRM, marketing e revenue motions operem em silos." Foco: dados, integração, automação.
- **Automotivo:** "O problema não é só captar lead rápido, mas transformar captação em atendimento estruturado." Foco: CRM, esteiras de resposta, qualidade do lead.

#### 5.2.4. Cases (`/cases`)

**Objetivo:** provar que o método gera resultado.

**Listagem (`/cases`):**
1. Hero — título com tese implícita ("Resultados gerados por sistema, não por sorte.")
2. Subtítulo com big numbers
3. Grid de cases — 4 a 6 cards com logo, vertical, headline de resultado quantitativo
4. Filtro por vertical — *opcional v1*

**Detalhe (`/cases/[slug]`):**
1. Identificação — cliente, vertical, período de trabalho
2. Contexto inicial — onde a operação estava (1-2 parágrafos descritivos)
3. **O que foi estruturado** — quais pilares do UGS, quais ações concretas (mapeamento explícito ao método)
4. Resultados — números reais com contexto (taxa, ticket, pipeline, conversão)
5. Depoimento — opcional, somente quando autêntico
6. CTA — sempre Diagnóstico

**Princípios de redação:**
- Sempre mapear ações ao UGS
- Números com contexto (volume base e período)
- Descrever o problema do cliente em vocabulário do cliente, e a solução em vocabulário Unfold

**Cases na v1:** 4 a 6 cases prioritários, reescritos no framework UGS, com aprovação formal de cada cliente. Resto fica para v2. Esforço estimado: ~12-18h de trabalho de conteúdo (paralelo ao desenvolvimento técnico).

#### 5.2.5. Sobre (`/sobre`)

**Objetivo:** dar rosto institucional sem virar showcase pessoal.

**Sequência de blocos:**
1. Hero — título institucional ("Uma assessoria de growth para empresas que levam crescimento a sério.")
2. Por que a Unfold existe — 2-3 parágrafos
3. No que acreditamos — 5-6 princípios
4. **Liderança** — bloco discreto: foto profissional, nome, cargo (Partner & Diretor de Marketing), 2-3 linhas factuais, link sutil para LinkedIn
5. Time — opcional, formato de cargos sem fotos individuais
6. Certificações e parcerias
7. Onde estamos — Maceió, atuação nacional
8. CTA discreto de Diagnóstico

**Direcional de copy (Por que a Unfold existe):**

> "A Unfold existe porque muitas empresas já investem em marketing e vendas, mas ainda operam crescimento de forma fragmentada. Marketing isolado não resolve. Tráfego isolado não resolve. Mais ferramentas, sem método, não resolvem. O nosso papel é organizar a operação com clareza, integração e estrutura — transformando esforço disperso em sistema."

**Direcional de copy (Liderança):**

> "Gabriel Calheiros — Partner & Diretor de Marketing. [X] anos estruturando operações de growth e vendas complexas para empresas em [verticais relevantes]. Liderança técnica do Unfold Growth System."

#### 5.2.6. Diagnóstico de Growth (`/diagnostico`)

Detalhado integralmente na seção 6 deste PRD.

#### 5.2.7. Calculadora de Tráfego (`/ferramentas/calculadora-trafego`)

Detalhada integralmente na seção 7 deste PRD.

---

## 6. Diagnóstico de Growth

### 6.1. O que é

Experiência guiada em **duas etapas** que entrega ao prospect um panorama estruturado da própria operação, classificada nos 4 pilares do UGS. É o **CTA único principal** do site para captura de leads qualificados.

### 6.2. Por que é estratégico

Três funções simultâneas que um formulário simples não cumpre:

1. **Entrega valor antes de vender.** O prospect que termina recebe um espelho estruturado da própria operação. Sente o método antes de contratar.
2. **Qualifica por profundidade, não só por dados.** Quem responde 12 perguntas está comprometido. Afasta curiosos automaticamente.
3. **Gera inteligência de mercado.** Cada diagnóstico preenchido é dado sobre o estado do mercado B2B em vendas complexas.

### 6.3. Etapa 1 — Qualificação rápida (~60 segundos)

**6 campos confirmados:**

| Campo | Tipo | Validação |
|---|---|---|
| Nome completo | Texto | Obrigatório, mín 3 caracteres |
| Telefone | Telefone (mascarado BR) | Obrigatório, formato `(XX) XXXXX-XXXX` |
| E-mail | Email corporativo | Obrigatório, **validação automática** bloqueando domínios pessoais (gmail.com, outlook.com, hotmail.com, yahoo.com, icloud.com, etc.) |
| Quantidade de funcionários | Single-select com faixas | Obrigatório. Faixas: `1–10`, `11–50`, `51–200`, `201–500`, `501–1000`, `1000+` |
| Segmento de mercado | Single-select | Obrigatório. Opções: `Construção`, `Agro`, `Tech/SaaS`, `Indústria`, `Automotivo`, `Serviços B2B`, `Outro` |
| Já possui CRM e/ou ferramenta de automação de marketing? | Single-select | Obrigatório. Opções: `Sim, ambos`, `Apenas CRM`, `Apenas automação`, `Não tenho nenhum`, `Não sei` |

**Comportamento ao submeter:**

1. Validação client-side com Zod
2. Anti-spam (Cloudflare Turnstile)
3. Cria lead no banco (collection `leads`) com origem `diagnostico-etapa-1`
4. Sincroniza com **RD Station CRM** com tags `origem:diagnostico` e `setor:{segmento}`
5. Sincroniza com **RD Station Marketing** (lista de nutrição genérica)
6. Gera token assinado (JWT, validade 30 dias) com `lead_id`
7. Redireciona para `/diagnostico/{token}` (Etapa 2)
8. Envia email de confirmação ao lead com link da Etapa 2 (caso ele saia e queira voltar)

**Fluxo de erro:** se RD Station falhar, lead é salvo localmente com flag `crm_sync_failed=true`; sincronização entra em fila de retry com backoff exponencial (3 tentativas em 24h).

### 6.4. Etapa 2 — Diagnóstico guiado (~5-7 minutos)

**Status: TBD — aguardando especificação detalhada do Gabriel.**

A spec definitiva (12 perguntas, opções de resposta, pesos, scoring matrix, tela final) está em material separado de produto, ainda a ser enviada. **Esta seção será atualizada em PRD v2.1 quando o material chegar.**

**Estrutura geral confirmada (do Brief):**

- 12 perguntas agrupadas em 4 pilares do UGS (3 perguntas por pilar)
- Formato gamificado tipo Typeform — uma pergunta por tela com progresso visível
- Pilares e temas:
  - **Diagnosticar (3 perguntas):** ticket médio, ciclo de vendas, gargalo principal percebido
  - **Estruturar (3 perguntas):** relação marketing-vendas, qualificação de leads, uso de CRM
  - **Operar (3 perguntas):** canais ativos, proporção marketing vs. relacionamento, rotina de análise
  - **Evoluir (3 perguntas):** estágio, prioridade dos próximos 6 meses, avaliação de assessoria
- Cada resposta tem peso pré-definido (0 a 3) que alimenta nota de 0 a 10 por pilar
- Faixas: `0–3.9 = Em construção`, `4.0–6.9 = Em operação`, `7.0–10 = Em otimização`

**Implementação técnica preparada (independente do conteúdo):**

A collection `quiz-questions` no Payload já é modelada para acomodar:
- Pilar (enum: diagnosticar, estruturar, operar, evoluir)
- Texto da pergunta
- Ordem dentro do pilar
- Array de alternativas com `texto` e `peso`
- Texto de ajuda opcional

Quando a spec do Gabriel chegar, o admin Unfold cadastra as 12 perguntas pelo painel sem necessidade de deploy.

### 6.5. Tela final — Resultado personalizado

**Status: parcialmente TBD — estrutura definida, conteúdo das variações de insight aguarda Gabriel.**

**Estrutura confirmada:**

1. **Panorama visual** — gráfico radar com classificação nos 4 pilares (Em construção / Em operação / Em otimização)
2. **Insight curto e personalizado** — 3-5 linhas que variam conforme combinação de respostas (8-12 variações pré-escritas, lógica condicional simples, **não IA em tempo real**)
3. **CTAs:**
   - Calendário integrado para agendar conversa (apresentação variável conforme score de fit)
   - Botão "Receber diagnóstico completo por e-mail" (envia PDF formatado)

**Score de fit comercial:**
- Calculado combinando: quantidade de funcionários, segmento, prontidão (Pilar 4) e gap de estrutura (Pilar 2)
- Define qual versão da tela final o usuário vê:
  - **Fit alto:** calendário em destaque (botão grande, chamada forte)
  - **Fit médio:** calendário disponível em botão padrão
  - **Fit baixo:** calendário disponível mas sem destaque; ênfase no PDF + nutrição

**Calendário:**
- Ferramenta TBD (Calendly, Cal.com, ou agenda RD)
- Implementação inicial via embed (independente da escolha)
- Recomendação técnica: **Cal.com** — gratuito, embed leve, sem dependência de conta paga, fácil migração futura

**Lógica de exibição:**
- Componente `<DiagnosticoResultado>` recebe `scoring_result` e renderiza condicionalmente o variant correto
- Variants são collection `insights-variations` no Payload (admin cadastra)

### 6.6. Especificação técnica

**Endpoints:**

| Endpoint | Método | Descrição |
|---|---|---|
| `/api/diagnostico/etapa-1` | POST | Cria lead, sincroniza com RD, gera token, retorna URL da Etapa 2 |
| `/api/diagnostico/etapa-2` | POST | Recebe respostas das 12 perguntas, calcula score, salva resultado |
| `/api/diagnostico/resultado/{token}` | GET | Retorna resultado processado para renderização |
| `/api/diagnostico/pdf/{token}` | GET | Gera PDF do resultado (envia por email se requisitado) |

**Side-effects do `/etapa-2`:**
1. Calcula scoring por pilar e fit comercial (lib `scoring`)
2. Atualiza lead em RD Station com:
   - Tags adicionais: `nivel:{em_construcao|em_operacao|em_otimizacao}`, `fit:{alto|medio|baixo}`
   - Campos customizados com scores numéricos por pilar
3. Move lead para etapa apropriada do funil em RD CRM:
   - Fit alto → "Lead Qualificado / SQL"
   - Fit médio → "Lead Engajado / MQL"
   - Fit baixo → "Lead Inicial / Nutrição"
4. Dispara workflow de nutrição em RD Marketing apropriado ao fit
5. Envia email com PDF do resultado para o lead
6. Notifica equipe Unfold via email apenas se fit alto

**Rate limiting:** 3 submissões de Etapa 1 por IP por hora.

**Privacidade e LGPD:**
- Checkbox de consentimento explícito antes da Etapa 1
- Política de privacidade linkada
- Endpoint `/api/lgpd/request` para solicitação de dados ou exclusão
- Logs de consentimento (data, IP, versão da política aceita)

### 6.7. UX da experiência

**Etapa 1:** formulário em uma tela só (não multi-step), 6 campos visíveis, submissão com loading state.

**Etapa 2:** uma pergunta por tela com:
- Barra de progresso no topo (`Pergunta X de 12 · Pilar {nome}`)
- Pergunta em destaque (font-size grande, peso semibold)
- Alternativas como cards clicáveis (não radio buttons tradicionais)
- Botão "Voltar" para revisar resposta anterior
- Texto de ajuda opcional abaixo (se cadastrado)
- Animação suave entre perguntas (slide horizontal, respeita `prefers-reduced-motion`)

**Tela final:**
- Hero com headline personalizada conforme fit ("Sua operação está em construção em 2 dos 4 pilares...")
- Gráfico radar centralizado (recharts)
- Cards por pilar com score numérico e label
- Insight personalizado em destaque
- CTAs conforme score de fit

---

## 7. Calculadora de Investimento × Retorno em Tráfego

### 7.1. Posicionamento

**Ferramenta secundária**, não primária. Captura leads com perfil de operação tática (já investem em mídia, querem dimensionamento). Não compete com o Diagnóstico no fluxo principal de conversão.

**Hierarquia clara dentro do site:**
- Diagnóstico: aparece no Hero, no menu fixo, no fim das páginas estruturantes
- Calculadora: aparece em URL própria; pode ser mencionada em /atuacao por vertical, **não** aparece como CTA no Hero da Home nem na navegação principal

### 7.2. Fluxo

Multi-step (4 etapas) com progresso visível:

1. **Identificação:** nome, email, telefone, empresa, cargo
2. **Contexto:** segmento, região, modelo (B2B/B2C/B2B2C), site (opcional)
3. **Metas:** faturamento atual, meta, ticket médio, ciclo de vendas em dias
4. **Operação:** investimento atual em tráfego, canais usados, taxa de conversão atual (opcional)

Ao submeter:
- Loading state com mensagem "Analisando seu cenário com IA..."
- Resultado renderizado:
  - Investimento mensal recomendado
  - Volume de leads esperado
  - Clientes estimados/mês
  - Faturamento projetado
  - Payback estimado
  - Diagnóstico textual (4-6 parágrafos)
  - Fontes consultadas (lista de URLs)
- CTAs:
  - **Primário e em destaque:** "Quer entender o sistema completo? Faça o Diagnóstico de Growth →"
  - Secundário: "Falar com especialista"
  - Secundário: "Receber relatório por email"

### 7.3. Lógica de IA

**Modelo:** claude-sonnet-4 com web search habilitado (Tavily).

**Prompt versionado** na collection `ai-prompts` (admin pode editar com histórico de versões).

**Comportamento da IA:**
1. Busca benchmarks atuais (últimos 12 meses) para o segmento informado: CPL médio, taxa de conversão lead→cliente, CAC.
2. Calcula projeções com os dados do lead.
3. Retorna JSON estruturado com campos numéricos + diagnóstico em markdown.

### 7.4. Copy ajustado conforme princípio do Brief

Para evitar conflito com o posicionamento *"Growth não é canal — é sistema"*:

- **Headline da página** evita promessas como "descubra como crescer com tráfego"
- **Subheadline** posiciona como ponto de partida tático, não plano completo:
  > "Dimensione o investimento em tráfego para sustentar uma meta comercial. É um cálculo inicial — sua estratégia completa pede mais que isso."
- **Bloco final do resultado** explicita o limite e oferece ponte:
  > "Esse cálculo te dá um número. Mas tráfego é só uma das engrenagens. Para entender o sistema completo de crescimento da sua operação, faça o Diagnóstico de Growth."
- Linguagem técnica ("calcule", "dimensione", "projete"), não milagrosa ("descubra agora", "em 2 minutos")

### 7.5. Especificação técnica

**Endpoint:** `POST /api/calc-trafego`

**Side-effects:**
1. Cria lead com origem `calculadora-trafego`
2. Sincroniza com RD Station CRM com tag `origem:calculadora`
3. Coloca em workflow de nutrição RD Marketing diferente do Diagnóstico (mais longo, mais educativo sobre o sistema)
4. Envia email com link para PDF
5. Notifica equipe Unfold se faturamento_meta > R$ 500k/mês (lead potencialmente alto)

**Rate limiting:** 5 requisições por IP por hora. Cache de benchmarks por segmento por 24h.

### 7.6. Pontos de monitoramento pós-lançamento

- Volume de leads Calculadora vs Diagnóstico — se Calculadora ultrapassar, hierarquia precisa revisão
- Taxa de conversão lead Calculadora → cliente — confirma se perfil é menos qualificado
- Custo médio de IA por lead capturado — ajustar prompts e rate limits

---

## 8. Integração com RD Station

### 8.1. Decisão

**RD Station CRM + RD Station Marketing**, ambos plano Pro, são as ferramentas confirmadas. O adapter pattern proposto na v1 do PRD é **mantido para flexibilidade futura**, mas a implementação concreta da v1 é específica para RD Station.

### 8.2. Arquitetura

```
src/lib/crm/
├── types.ts                          # Interface CRMAdapter genérica
├── index.ts                          # Factory baseado em config
├── rdstation.adapter.ts              # Implementação principal (v1)
└── webhook.adapter.ts                # Fallback genérico (caso RD esteja indisponível)
```

**Interface `CRMAdapter`:**

```typescript
interface CRMAdapter {
  createLead(lead: LeadInput): Promise<CRMLeadResult>;
  updateLead(externalId: string, lead: Partial<LeadInput>): Promise<void>;
  addTags(externalId: string, tags: string[]): Promise<void>;
  setCustomFields(externalId: string, fields: Record<string, any>): Promise<void>;
  moveToFunnelStage(externalId: string, stageId: string): Promise<void>;
  triggerWorkflow(externalId: string, workflowId: string): Promise<void>;
  testConnection(): Promise<boolean>;
}
```

### 8.3. Configuração no painel

Global `CRMConfig` (collection do Payload):

- Provedor ativo: `rd-station` (default), `webhook` (fallback)
- Credenciais: API key RD CRM, API key RD Marketing (criptografadas com libsodium)
- Mapeamento de campos: campo Unfold → campo RD
- Mapeamento de pipeline:
  - Estágio "Lead Inicial / Nutrição" → ID em RD CRM
  - Estágio "Lead Engajado / MQL" → ID em RD CRM
  - Estágio "Lead Qualificado / SQL" → ID em RD CRM
- Mapeamento de workflows RD Marketing por origem (Diagnóstico fit alto/médio/baixo, Calculadora, Newsletter, etc.)
- Botão "Testar conexão" com status visual
- Log das últimas 100 sincronizações com status (sucesso/erro/retry)

### 8.4. Resiliência

- **Fila de sincronização** (Payload Jobs nativo ou BullMQ no Railway)
- **Retry com backoff exponencial** em falhas (3 tentativas: 1min, 10min, 1h)
- **Falha persistente** após retries: lead permanece com flag `crm_sync_failed=true`; alerta no painel admin (badge vermelho na lista de leads); botão manual "Tentar sincronizar de novo"
- **Rate limit RD Station respeitado:** ~120 req/min — fila enfileira automaticamente

### 8.5. Webhooks RD → Unfold

Endpoint `POST /api/webhooks/rd` recebe callbacks do RD Station para:
- Atualização de status do lead (engajamento, conversão)
- Resposta a workflows
- Sincronização bidirecional opcional (lead vira cliente em RD → atualiza no Unfold)

Assinatura validada via header `X-RD-Signature`.

---

## 9. Modelo de Dados (Collections do Payload)

### 9.1. Collections principais

| Collection | Propósito |
|---|---|
| `users` | Usuários do admin |
| `pages` | Páginas estáticas com blocos |
| `posts` | Artigos do blog (autores internos apenas) |
| `cases` | Cases reescritos sob framework UGS |
| `leads` | Todos os leads capturados |
| `quiz-questions` | 12 perguntas do Diagnóstico |
| `diagnostico-results` | Resultados do Diagnóstico arquivados |
| `insights-variations` | 8-12 variações de insight personalizado |
| `ai-prompts` | Prompts versionados da Calculadora |
| `categories` | Categorias do blog (4 pilares + verticais) |
| `media` | Biblioteca de mídia |
| `audit-log` | Log de ações no admin |

### 9.2. Globals

- `header` — menu, logo, CTA
- `footer` — colunas, redes sociais, créditos
- `site-settings` — scripts (GA4), redirects, robots.txt
- `crm-config` — config RD Station (detalhada em 8.3)
- `homepage` — estrutura de blocos da Home

### 9.3. Schemas críticos

#### 9.3.1. `users`

```typescript
{
  email: string;                            // unique, login
  name: string;
  role: 'super-admin' | 'editor';           // sem 'cliente-autor' (guest posts removidos)
  avatar?: Media;
  ativo: boolean;
  createdAt: Date;
}
```

**Roles na v1:** Super Admin (Unfold) e Editor (Unfold). Sem cliente-autor.

#### 9.3.2. `posts`

```typescript
{
  titulo: string;
  slug: string;                             // unique
  resumo: string;
  conteudo: RichText;                       // Lexical
  imagem_destaque: Media;
  categoria: Category;                      // 4 pilares UGS ou vertical
  autor: User;                              // só usuários internos Unfold
  tempo_leitura_min?: number;
  tags?: string[];
  status: 'rascunho' | 'em_revisao' | 'publicado' | 'arquivado';
  feedback_revisor?: string;
  publishedAt?: Date;
  seo: { metaTitulo, metaDescricao, ogImage };
  createdAt: Date;
}
```

**Workflow editorial mantido apenas para uso interno:** rascunho → em_revisao (revisão de liderança) → publicado.

#### 9.3.3. `cases`

```typescript
{
  cliente_nome: string;
  cliente_logo: Media;
  cliente_aprovou_uso: boolean;             // controle de visibilidade
  vertical: 'construcao' | 'agro' | 'tech' | 'automotivo' | 'industria' | 'outros';
  slug: string;
  periodo_trabalho: string;                 // ex: "2024-2025"
  headline_resultado: string;               // ex: "+R$6mi em pipeline em 12 meses"
  contexto_inicial: RichText;
  pilares_trabalhados: Array<'diagnosticar' | 'estruturar' | 'operar' | 'evoluir'>;
  acoes_executadas: RichText;               // mapeamento explícito ao UGS
  resultados: RichText;                     // números reais com contexto
  metricas_destaque: Array<{ label, valor, sufixo }>;
  depoimento?: { texto, autor_nome, autor_cargo };
  destacar_na_home: boolean;
  ordem: number;
  status: 'rascunho' | 'aguardando_aprovacao_cliente' | 'publicado' | 'arquivado';
  publishedAt?: Date;
  seo: { metaTitulo, metaDescricao, ogImage };
}
```

**Filtragem na Home e listagem:** apenas cases com `cliente_aprovou_uso=true` E `status=publicado` aparecem no frontend.

#### 9.3.4. `leads`

```typescript
{
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  funcionarios_faixa?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  segmento?: 'construcao' | 'agro' | 'tech-saas' | 'industria' | 'automotivo' | 'servicos-b2b' | 'outro';
  uso_crm_automacao?: 'ambos' | 'apenas-crm' | 'apenas-automacao' | 'nenhum' | 'nao-sei';
  origem: 'diagnostico-etapa-1' | 'diagnostico-completo' | 'calculadora-trafego' | 'formulario-contato' | 'outro';
  metadados: Record<string, any>;           // scores do diagnóstico, resultado da calc etc.
  utm: { source, medium, campaign, term, content };
  consentimento_lgpd: boolean;
  consentimento_marketing: boolean;
  ip: string;
  user_agent: string;
  rd_lead_id?: string;
  rd_sync_status: 'pendente' | 'enviado' | 'erro';
  rd_sync_error?: string;
  rd_last_sync?: Date;
  notes?: RichText;
  createdAt: Date;
}
```

#### 9.3.5. `quiz-questions`

```typescript
{
  pilar: 'diagnosticar' | 'estruturar' | 'operar' | 'evoluir';
  ordem: number;                            // 1, 2 ou 3 dentro do pilar
  texto: string;
  texto_ajuda?: string;
  alternativas: Array<{
    id: string;
    texto: string;
    peso: number;                           // 0 a 3
  }>;
  ativo: boolean;
}
```

Total de registros esperados na v1: **12** (3 por pilar × 4 pilares).

#### 9.3.6. `insights-variations`

```typescript
{
  identifier: string;                       // ex: "fit-alto-gap-estruturar"
  condicoes: {
    fit_min?: number;                       // ex: 70 (score 7.0+)
    fit_max?: number;
    pilar_critico?: 'diagnosticar' | 'estruturar' | 'operar' | 'evoluir';
    pilar_critico_min_score?: number;
    pilar_critico_max_score?: number;
    funcionarios_faixa?: string[];
    segmento?: string[];
  };
  prioridade: number;                       // ordem de avaliação (maior = avaliado primeiro)
  texto_insight: string;                    // 3-5 linhas, markdown
  cta_calendario_destaque: 'alto' | 'medio' | 'baixo';
}
```

Total esperado: 8-12 variações cadastradas pelo Gabriel.

#### 9.3.7. `diagnostico-results`

```typescript
{
  lead: Lead;
  token: string;                            // JWT
  respostas: Array<{
    quiz_question_id: string;
    alternativa_id: string;
    peso: number;
  }>;
  scores: {
    diagnosticar: number;                   // 0-10
    estruturar: number;
    operar: number;
    evoluir: number;
  };
  classificacoes: {
    diagnosticar: 'em_construcao' | 'em_operacao' | 'em_otimizacao';
    estruturar: 'em_construcao' | 'em_operacao' | 'em_otimizacao';
    operar: 'em_construcao' | 'em_operacao' | 'em_otimizacao';
    evoluir: 'em_construcao' | 'em_operacao' | 'em_otimizacao';
  };
  fit_comercial: {
    score: number;                          // 0-100
    nivel: 'alto' | 'medio' | 'baixo';
  };
  insight_aplicado: InsightVariation;
  pdf_url?: string;
  completedAt: Date;
}
```

#### 9.3.8. `ai-prompts`

```typescript
{
  identifier: 'calculadora-trafego';        // só Calculadora na v1
  versao_atual: number;
  versao_em_producao: number;
  versoes: Array<{
    versao: number;
    prompt: string;
    modelo: string;
    temperatura: number;
    max_tokens: number;
    criada_em: Date;
    criada_por: User;
    notas: string;
  }>;
}
```

#### 9.3.9. `categories` (do blog)

```typescript
{
  nome: string;
  slug: string;
  tipo: 'pilar-ugs' | 'vertical';
  descricao?: string;
  ordem: number;
}
```

**Categorias v1 (cadastradas inicialmente):**

Pilares UGS:
- Diagnosticar
- Estruturar
- Operar
- Evoluir

Verticais (opcional, só ativadas se houver volume de conteúdo):
- Construção
- Agro
- Tech
- Automotivo

---

## 10. APIs

| Endpoint | Método | Descrição | Auth |
|---|---|---|---|
| `/api/diagnostico/etapa-1` | POST | Cria lead, sincroniza RD, gera token | Pública (rate-limit) |
| `/api/diagnostico/etapa-2` | POST | Recebe respostas, calcula score, salva | Pública (token) |
| `/api/diagnostico/resultado/:token` | GET | Retorna resultado processado | Pública (token) |
| `/api/diagnostico/pdf/:token` | GET | Gera PDF (download ou email) | Pública (token) |
| `/api/calc-trafego` | POST | Submete calculadora, retorna resultado IA | Pública (rate-limit) |
| `/api/webhooks/rd` | POST | Callbacks do RD Station | Assinado |
| `/api/lgpd/request` | POST | Solicitação de dados ou exclusão | Pública |
| `/api/admin/leads/export` | GET | Exporta leads em CSV | Admin |
| `/api/crm/test` | POST | Testa conexão RD Station | Admin |

**Padrões:**
- Validação com Zod
- Rate limiting via Upstash Redis
- Logs estruturados em JSON
- Erros padronizados: `{ error: { code, message, details? } }`

---

## 11. Painel Admin (escopo reduzido v1)

Conforme **Princípio 7** do Brief, o painel admin tem escopo reduzido às collections que fazem sentido na v1:

| Categoria | Capacidades |
|---|---|
| **Páginas** | Editar Home, Método, Atuação, Cases, Sobre via blocos. Adicionar/remover/reordenar blocos. |
| **Cases** | CRUD de cases. Marcar `cliente_aprovou_uso`. Reordenar destaques. |
| **Blog (interno)** | CRUD de posts (autores Unfold apenas). Workflow rascunho → em_revisao → publicado. |
| **Diagnóstico** | Cadastrar/editar 12 perguntas e variações de insight. Ver resultados arquivados. |
| **Calculadora** | Editar prompt da IA com histórico de versões. Testar com inputs mock. |
| **Leads** | Listar, filtrar por origem/segmento/fit, exportar CSV, ver metadados completos. Status de sync RD. |
| **Mídia** | Upload, organização em pastas, busca, alt text. |
| **Globais** | Header, Footer, Site Settings, CRM Config (RD Station). |
| **Usuários** | CRUD, atribuir roles. |
| **Auditoria** | Log de ações. |

**Removidos da v1 (entram em v2):**
- Materiais ricos
- Quiz/diagnóstico de maturidade genérico
- Auditoria de LP
- Multi-idioma / traduções
- Form builder genérico
- Guest posts / cliente-autor

### 11.1. Block Builder (páginas)

Blocos disponíveis na v1:

- `HeroBlock` (com variantes: hero-home, hero-pagina-interna)
- `BigNumbersBlock` (3-4 cards numéricos)
- `LogosCarouselBlock`
- `TeseProblemaBlock` (5 dores)
- `UGSDestaqueBlock` (4 pilares)
- `VerticaisBlock` (4 verticais)
- `CasesShowcaseBlock`
- `CertificacoesBlock`
- `CTABannerBlock`
- `RichTextBlock`
- `ImageBlock`
- `VideoBlock`
- `Pilares4Block` (4 seções de pilar com pergunta/função/atividades/output — para /metodo)
- `DiagramaUGSBlock` (renderiza o asset visual do UGS)
- `VerticalDetalheBlock` (para /atuacao, com tabs)
- `LiderancaBlock` (foto, nome, cargo, bio curta — para /sobre)
- `FAQBlock`

---

## 12. Requisitos Não-Funcionais

### 12.1. Performance

- LCP ≤ 2.5s (P75)
- INP ≤ 200ms
- CLS ≤ 0.1
- Lighthouse Performance ≥ 90 em mobile
- ISR no blog (revalidate 60s) e cases (revalidate 300s)

### 12.2. SEO

- Sitemap automático
- Robots.txt configurável
- Meta tags + Open Graph + Twitter Cards
- Schema.org (`Organization`, `Article`, `FAQPage`)
- Slugs amigáveis
- **Redirects 301 pontuais** apenas dos URLs preservados (cases aprovados, posts curados). URLs antigas que correspondem a categorias descartadas redirecionam para `/blog` ou `/404` amigável.
- Domínio `agencialighthouse.com` mantido ativo por 6-12 meses pós-lançamento, com redirect 301 global para `unfoldgrowth.com.br` (ou para uma página de transição).

### 12.3. Acessibilidade

- WCAG 2.1 nível AA
- Contraste mínimo 4.5:1
- Navegação por teclado completa
- ARIA labels
- `prefers-reduced-motion` respeitado

### 12.4. Segurança

- HTTPS obrigatório
- CSP configurada
- HSTS, X-Frame-Options, X-Content-Type-Options
- Sanitização de HTML em rich text
- Validação de upload (10MB imagens, 50MB PDFs)
- Secrets em `.env`
- API keys do RD criptografadas (libsodium)
- Audit log de ações sensíveis

### 12.5. LGPD

- Banner de consentimento configurável
- Política de privacidade publicada
- Checkbox de consentimento explícito em todos os formulários
- Endpoint `/api/lgpd/request` para titular
- Logs de consentimento

### 12.6. Observabilidade

- Sentry (free tier inicialmente — escalonável conforme tráfego)
- Logs estruturados (Logtail ou Better Stack — free tier)
- Alertas:
  - Latência alta da IA (P95 > 30s)
  - Falhas de sync com RD > 5% em 1h
  - Erro 5xx > 1% em 15min
- Dashboard de KPIs no admin

### 12.7. Compatibilidade

- Browsers: últimas 2 versões de Chrome, Edge, Firefox, Safari
- Mobile: iOS 15+, Android 10+
- Resoluções: 360px a 2560px

---

## 13. User Stories e Critérios de Aceite

### 13.1. Visitante

#### US-001 — Visitante navega pela Home

**Critérios:**
- Home carrega em < 2.5s no 4G
- Hero mostra headline com a tese, CTA primário Diagnóstico
- 11 blocos da Home renderizam corretamente em mobile e desktop
- Big numbers (R$ 75MM, R$ 850k, 25k) visíveis
- Apenas logos com `cliente_aprovou_uso=true` aparecem

#### US-002 — Visitante completa o Diagnóstico

**Critérios:**
- Etapa 1: 6 campos obrigatórios validados client-side
- Email corporativo: domínios pessoais (gmail, outlook etc.) bloqueados
- Submit cria lead, sincroniza com RD, redireciona para Etapa 2
- Etapa 2: 12 perguntas em 4 pilares, uma por tela, com progresso
- Possível voltar para revisar resposta
- Tela final renderiza score por pilar (radar), insight personalizado e CTAs conforme fit
- Calendário visível conforme score de fit
- Email com PDF chega em até 2 minutos
- Lead tem status atualizado em RD CRM (estágio do funil) e RD Marketing (workflow)

#### US-003 — Visitante usa a Calculadora

**Critérios:**
- 4 etapas com validação por etapa
- Loading durante chamada da IA
- Resultado renderiza com todos os campos esperados
- CTA principal do resultado leva ao Diagnóstico de Growth
- Lead salvo com origem `calculadora-trafego` e tag em RD
- Em caso de erro da IA, lead é salvo e mensagem amigável é exibida

#### US-004 — Visitante lê um case

**Critérios:**
- Page renderiza só se `cliente_aprovou_uso=true` e status=publicado
- Estrutura: identificação, contexto, pilares trabalhados, ações UGS, resultados, depoimento opcional, CTA Diagnóstico
- TOC sticky em desktop
- Cases relacionados na base

### 13.2. Editor / Super Admin

#### US-005 — Editor cadastra perguntas do Diagnóstico

**Critérios:**
- Acesso a `/admin/quiz-questions`
- Cria pergunta com pilar, ordem, texto, alternativas (texto + peso)
- Validação: 3 perguntas por pilar, total 12
- Pergunta inativa não aparece no frontend
- Mudança reflete no Diagnóstico após salvar

#### US-006 — Editor cadastra variação de insight

**Critérios:**
- Acesso a `/admin/insights-variations`
- Define condições (faixas de fit, pilar crítico, segmento etc.)
- Define texto do insight (markdown) e nível de destaque do calendário
- Sistema usa a variação de maior prioridade que matchar as condições

#### US-007 — Super Admin edita prompt da Calculadora

**Critérios:**
- Acesso a `/admin/ai-prompts/calculadora-trafego`
- Histórico de versões disponível
- Editar e salvar cria nova versão
- Botão "Promover para produção" troca a versão ativa
- Botão "Testar" permite executar com inputs mock sem afetar produção

#### US-008 — Editor exporta leads

**Critérios:**
- Filtros: período, origem, segmento, fit, status RD
- Export CSV em < 5s para até 10k leads
- CSV inclui scores do Diagnóstico quando aplicável

#### US-009 — Editor reordena blocos da Home

**Critérios:**
- Edição da Home com drag-and-drop de blocos
- Adicionar bloco da paleta disponível
- Remover bloco com confirmação
- Mudança reflete no site após salvar (revalidação ISR)

---

## 14. Migração e Conteúdo

### 14.1. Migração da Lighthouse

**Não há migração automática.** Cada item é avaliado individualmente:

| Ativo | Tratamento |
|---|---|
| Cases (8-10) | Aprovação formal do cliente + reescrita UGS + curadoria final (4-6 prioritários para v1) |
| Big numbers (R$ 75MM, R$ 850k, 25k conteúdos) | Preservados, reposicionados como prova de operação madura |
| Logos de clientes | Apenas aqueles com aprovação formal de uso sob marca Unfold |
| Certificações | Preservadas (Meta, Kommo, RD, ABRADI) |
| 78 posts do blog | **Não migrados em massa.** Blog estreia com 5-10 posts novos da Unfold sob nova narrativa. Posts antigos relevantes podem ser reescritos individualmente em ciclo posterior. |
| Episódios de podcast | Avaliação caso a caso. Podcast vira bloco em /sobre se necessário. |

### 14.2. Conteúdo a produzir antes do go-live

| Item | Estimativa | Responsável |
|---|---|---|
| Reescrita de 4-6 cases no framework UGS | 12-18h | Conteúdo + Liderança |
| Copy refinada de Home, Método, Atuação, Sobre | 8-12h | Liderança + Conteúdo |
| 5-10 posts iniciais do blog (categorias UGS) | 20-30h | Conteúdo |
| Diagrama do UGS (asset visual) | TBD | Designer (em produção) |
| Foto profissional do Gabriel (se ainda não houver) | 1 sessão | Fotógrafo |
| Manifesto da nova marca | 4h | Liderança |
| Política de privacidade, termos, LGPD atualizados para CNPJ Unfold | 4h | Liderança + Legal |

### 14.3. Comunicação institucional da transição

Parte do escopo do projeto:

1. **Clientes ativos (6 contas):** comunicação 1-1 antes do soft launch, com nova proposta de contrato sob CNPJ Unfold
2. **Parceiros estratégicos** (Meta, Kommo, RD, ABRADI): comunicação direta antes do lançamento, garantindo migração de credenciais
3. **Mercado e prospects em pipeline:** lançamento público coordenado (LinkedIn da liderança + email para base + comunicado formal)
4. **Imprensa setorial** (se aplicável): release com tese da nova marca

### 14.4. Migração de infraestrutura digital

| Item | Ação |
|---|---|
| Domínio `agencialighthouse.com` | Manter ativo 6-12 meses, redirect 301 para `unfoldgrowth.com.br` |
| Domínio `unfoldgrowth.com.br` | Ativar como principal |
| E-mails | Migração de @agencialighthouse para @unfoldgrowth, forward por 6 meses |
| LinkedIn da Lighthouse | Conversão para Unfold (preserva seguidores) |
| Instagram | Avaliação caso a caso |
| Google Business Profile | Atualizar nome, endereço, categoria |
| Diretórios setoriais | Atualizar |
| Contas de mídia (Meta Business, Google Ads, LinkedIn Ads) | Migrar BMs ou criar novas conforme estratégia |
| RD Station (CRM + Marketing) | Renovação de contrato sob CNPJ Unfold |

---

## 15. Roadmap (5-7 semanas)

### Fase 1 — Setup técnico (Semana 1)

- Setup Next.js 15 + Payload CMS + PostgreSQL no Railway
- Design tokens implementados (cores, tipografia, componentes base)
- Decisão final de stack confirmada e documentada
- Setup RD Station: API keys, mapeamento de pipeline, workflows
- Setup Vercel (frontend) + Railway (backend)
- Domínio `unfoldgrowth.com.br` apontado
- **Em paralelo:** copy draft de Home, Sobre, Método (Liderança + Conteúdo)

### Fase 2 — Páginas estáticas (Semana 2)

- Home implementada com blocos editáveis
- /metodo implementada
- /atuacao implementada (4 verticais com tabs)
- /sobre implementada (com bloco Liderança)
- Copy refinada e integrada
- Identidade visual aplicada (paleta, tipografia, símbolos)
- Mobile responsivo validado em todas

### Fase 3 — Cases (Semana 3)

- Página /cases (listagem)
- Página /cases/[slug] (detalhe)
- 4-6 cases reescritos no framework UGS
- Aprovação formal dos clientes coletada (paralelo)
- Cases publicados conforme aprovações chegam

### Fase 4 — Diagnóstico de Growth (Semana 4)

- /diagnostico (Etapa 1)
- /diagnostico/[token] (Etapa 2 — 12 perguntas)
- /diagnostico/[token]/resultado (tela final)
- Lógica de scoring matrix
- Variações de insight cadastradas
- Calendário integrado
- PDF do resultado
- **Dependência:** spec detalhada do Gabriel deve estar em mãos no início desta fase

### Fase 5 — Calculadora + Integrações (Semana 5)

- /ferramentas/calculadora-trafego implementada
- Prompt da IA versionado e integrado
- Integração RD Station finalizada (CRM + Marketing)
- Fluxos de email transacional (Resend)
- Workflows de nutrição RD Marketing configurados
- LGPD: cookie banner, política, endpoint de solicitação
- Analytics: GA4 + Vercel Analytics

### Fase 6 — QA e soft launch (Semana 6)

- QA completo: testes E2E (Playwright) das jornadas críticas
- Lighthouse audit (todas as páginas-chave)
- Redirects 301 configurados
- Sitemap + schema.org validados
- Soft launch privado: liderança, parceiros estratégicos, clientes ativos
- Coleta de feedback estruturada
- Ajustes pós-soft-launch

### Fase 7 — Lançamento público (Semana 7)

- Ajustes finais
- Lançamento público coordenado:
  - Post da liderança no LinkedIn
  - Email para base
  - Comunicado formal aos parceiros
  - Release para imprensa setorial (se aplicável)
- Migração de domínio Lighthouse → Unfold
- Monitoramento intensivo nos primeiros dias

### Marcos críticos não-negociáveis

- Soft launch deve acontecer **antes do encerramento formal do CNPJ Lighthouse** (maio/2026)
- Comunicação 1-1 com os 6 clientes ativos deve acontecer **antes do soft launch**
- Reescrita dos cases concluída **antes do go-live público** (não pode ir ao ar com cases incompletos)
- Diagnóstico com **pelo menos 10 testes end-to-end de QA antes do go-live**

---

## 16. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Spec do Diagnóstico atrasar | Alto (bloqueia Fase 4) | Implementação técnica do framework feita em paralelo (collections, fluxo, lógica de scoring vazia). Quando a spec chegar, é só popular dados via painel. |
| Aprovação dos clientes para logos/cases atrasar | Médio | Estrutura no painel permite ativar/desativar individualmente. Soft launch pode ir ao ar com subset aprovado. |
| Custo de IA (Calculadora) escalar | Médio | Rate limiting + cache 24h por segmento + monitoramento de custo no dashboard |
| Sync com RD Station falhar em volume | Médio | Fila com retry + flag `crm_sync_failed` + alerta no admin |
| Diagrama do UGS não pronto a tempo | Médio | Página /metodo entra ao ar com placeholder textual; substitui assim que asset chegar |
| Janela de 5-7 semanas apertar | Alto | Escopo da v1 é deliberadamente reduzido; tudo o que não é essencial vai pra v2. Sem flexibilização de escopo. |
| Conflito narrativo entre Calculadora e Diagnóstico | Médio | Copy ajustado da Calculadora (ver 7.4) explicita o limite e oferece ponte para o Diagnóstico |
| Perda de SEO na transição | Alto | Domínio antigo mantido + redirect 301 + curadoria de URLs preservadas |

---

## 17. Métricas e KPIs Pós-Lançamento

### 17.1. KPIs estratégicos (do Brief)

- Conversão dos 6 clientes ativos para contratos sob CNPJ Unfold
- Soft launch realizado antes do encerramento da Lighthouse
- Diagnósticos completos/mês (meta: 30 a partir do mês 2)
- Taxa de fit alto entre diagnósticos completos (proxy de qualidade do tráfego)

### 17.2. KPIs de produto

- Taxa de conclusão do Diagnóstico (Etapa 1 → Etapa 2 completa)
- Taxa de agendamento de calendário pós-Diagnóstico (por nível de fit)
- Volume de leads Calculadora vs Diagnóstico (alerta se Calculadora ultrapassar)
- Tempo médio de aprovação editorial de posts
- NPS interno do painel admin (com a equipe Unfold)

### 17.3. KPIs técnicos

- Uptime ≥ 99.9%
- Core Web Vitals verde em páginas críticas
- Custo médio mensal de IA / lead capturado
- Taxa de erro de sync com RD Station
- Tempo médio de resposta da Calculadora (P95 ≤ 30s)

---

## 18. Glossário

| Termo | Definição |
|---|---|
| **UGS** | Unfold Growth System — método proprietário em 4 pilares (Diagnosticar, Estruturar, Operar, Evoluir) |
| **Diagnóstico de Growth** | Ferramenta de captura principal: 2 etapas, 12 perguntas mapeadas no UGS |
| **Vendas complexas** | B2B com ticket alto, ciclo longo (60+ dias), múltiplos decisores, processo consultivo |
| **Sistema de growth** | Estrutura integrada conectando marketing, vendas, CRM, automação e inteligência comercial |
| **ICP** | Ideal Customer Profile — perfil de cliente ideal |
| **Fit comercial** | Score combinando faturamento, ticket, prontidão e gap de estrutura |
| **CMS Headless** | CMS que provê API mas não dita o frontend |
| **ISR** | Incremental Static Regeneration (Next.js) |
| **LGPD** | Lei Geral de Proteção de Dados |

---

## 19. Apêndices

### 19.1. Pendências aguardando Gabriel

| # | Item | Bloqueia? |
|---|---|---|
| 1 | Spec detalhada da Etapa 2 do Diagnóstico (12 perguntas, opções, pesos) | Bloqueia Fase 4 |
| 2 | Scoring matrix completa (fórmulas, pesos, faixas exatas) | Bloqueia Fase 4 |
| 3 | 8-12 variações de insight personalizado | Bloqueia Fase 4 |
| 4 | Diagrama visual do UGS | Não bloqueia (placeholder textual) |
| 5 | Definição da ferramenta de calendário | Não bloqueia (abordagem por embed) |
| 6 | Lista de logos com aprovação dos clientes | Não bloqueia (estrutura condicional) |
| 7 | Cases reescritos (4-6 prioritários) | Bloqueia Fase 3 (paralelo) |
| 8 | Foto do Gabriel + bio refinada | Não bloqueia (placeholder) |
| 9 | Copy refinada das páginas estáticas | Não bloqueia (drafts) |

### 19.2. Variáveis de ambiente

```bash
# Database
DATABASE_URL=postgres://...

# Payload
PAYLOAD_SECRET=
PAYLOAD_PUBLIC_SERVER_URL=https://unfoldgrowth.com.br

# Storage
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_ENDPOINT=

# IA
ANTHROPIC_API_KEY=
TAVILY_API_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM="Unfold Growth <oi@unfoldgrowth.com.br>"

# Anti-spam
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Rate limiting
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Observabilidade
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Analytics
NEXT_PUBLIC_GA4_ID=

# RD Station
RD_CRM_API_KEY=
RD_MARKETING_API_KEY=
RD_WEBHOOK_SECRET=

# Criptografia (campos sensíveis no DB)
CRM_ENCRYPTION_KEY=

# Calendário (TBD: Calendly | Cal.com)
CALENDAR_EMBED_URL=
```

### 19.3. Comandos esperados

```bash
pnpm dev              # Frontend + Payload em dev
pnpm build
pnpm start
pnpm payload migrate  # Migrações
pnpm test             # Vitest
pnpm test:e2e         # Playwright
pnpm lint
pnpm typecheck
```

### 19.4. Documentos relacionados

- **Brief Estratégico de Arquitetura e Conteúdo do Site** — Gabriel Calheiros, v1.0
- **Plataforma Estratégica e Comercial Consolidada da Unfold** — documento mestre
- **Pitch e Portfólio Comercial da Unfold**
- **APR V2 — Identidade Visual da Unfold**
- **Especificação detalhada do Diagnóstico de Growth** — material de produto separado *(pendente)*

---

## 20. Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| 1.0 | 29/abr/2026 | Versão inicial, baseada em conversa breve sobre o projeto |
| **2.0** | **30/abr/2026** | **Reescrita completa baseada no Brief Estratégico v1.0 do Gabriel. Decisões: stack mantida (Next.js + Payload + Postgres), CRM definido (RD Station Pro), Diagnóstico de Growth substitui Quiz genérico, escopo reduzido (6 páginas), roadmap revisado para 7 semanas.** |
| 2.1 | TBD | Atualização com spec completa da Etapa 2 do Diagnóstico (aguardando Gabriel) |

---

**FIM DO PRD v2.0**
