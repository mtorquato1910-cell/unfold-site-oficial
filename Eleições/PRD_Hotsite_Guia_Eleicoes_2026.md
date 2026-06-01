# PRD — Hotsite "Guia de Anúncios Digitais para as Eleições de 2026"

**Produto:** Hotsite com gate de cadastro para distribuição do guia eleitoral 2026
**Cliente interno:** Unfold × Feat.Work
**Responsável de produto:** Gabriel Calheiros (Unfold)
**Responsável de implementação:** Matheus (analista de sistemas e desenvolvedor sênior, Unfold)
**Status:** Aprovado para desenvolvimento
**Versão:** 1.0 — primeira release
**Data:** maio de 2026

---

## 1. Resumo executivo

A Unfold e a Feat.Work produziram, em parceria, um estudo de 37 páginas sobre a operação de anúncios digitais nas eleições de 2026 (regras do TSE, plataformas, IA/deepfake, LGPD, prestação de contas, checklists, etc.). O documento foi diagramado em HTML autossuficiente, com identidade visual aprovada e tipografia substituta via Google Fonts.

Este PRD descreve a transformação desse estudo num **hotsite com gate de cadastro**: o conteúdo do guia fica visível ao usuário com **blur/desfoque** no fundo até que ele preencha um **formulário pop-up** (nome, e-mail, telefone, status de candidatura). Após o cadastro, o conteúdo é desbloqueado, o usuário pode **baixar o PDF estático**, **compartilhar o link** do hotsite por WhatsApp e e-mail, e o lead é registrado no **RD Station Marketing e CRM**.

A peça funciona como isca digital de topo de funil para Unfold (executivos / empresas) e Feat.Work (candidatos / partidos / equipes de campanha), com objetivo de gerar volume qualificado de cadastros no ciclo eleitoral 2026.

## 2. Objetivos e métricas de sucesso

### 2.1. Objetivos de negócio

1. **Geração de leads qualificados** para Unfold e Feat.Work via cadastro gate
2. **Posicionamento de marca conjunta** Unfold × Feat.Work no ciclo eleitoral 2026
3. **Mecanismo de viralização orgânica** via compartilhamento — cada destinatário passa pelo cadastro
4. **Base de remarketing** segmentada por perfil (candidato vs. não-candidato) para nutrição posterior

### 2.2. Métricas de sucesso (a acompanhar pelo time de growth)

- **Taxa de conversão de visitante → cadastro completo** (objetivo: ≥ 25% como benchmark inicial)
- **Volume absoluto de leads** segmentados por perfil
- **Taxa de cliques em compartilhamento** (objetivo: ≥ 10% dos cadastrados compartilham)
- **Taxa de novos cadastros vindos de compartilhamento** (medida via UTM de origem)
- **Tempo médio de permanência na página** (objetivo: ≥ 3 minutos)
- **Taxa de download do PDF** entre cadastrados

Essas métricas devem estar disponíveis via Google Analytics 4 e dashboard interno simples (descrito em §10).

## 3. Escopo

### 3.1. Dentro do escopo desta release

- Hotsite single-page responsivo com renderização do conteúdo HTML existente do guia
- Sistema de blur/desfoque sobre o conteúdo
- Modal de cadastro pop-up centralizado, com formulário de 4 campos
- Integração com RD Station Marketing + RD Station CRM (via API oficial)
- Botão de download do PDF estático
- Botões de compartilhamento via WhatsApp e e-mail (com link do hotsite)
- Captura de UTM e parâmetros de origem
- Persistência local da sessão autenticada (uma vez cadastrado, não pede de novo)
- Disclaimer de privacidade e conformidade LGPD
- Página de agradecimento pós-cadastro
- Tracking de eventos no Google Analytics 4

### 3.2. Fora do escopo desta release

- Painel administrativo customizado para visualizar leads dentro do hotsite (o RD Station já cumpre essa função)
- Sistema de login com autenticação real / senhas (apenas gate por cadastro único)
- Múltiplos idiomas (apenas pt-BR)
- Geração dinâmica de PDF a partir do HTML (o PDF é estático e hospedado)
- Versão app nativo
- A/B testing de variações do formulário (fica para fase 2 se relevante)
- Integração com WhatsApp Business API para envio direto (apenas link `wa.me`)

### 3.3. Considerações importantes

- O PDF estático **ainda precisa ser gerado** a partir do HTML diagramado. Recomendação: o time de design da Unfold gera a versão final em InDesign/Figma com as fontes proprietárias (Relicus, Carbon, Chambers Sans) antes do go-live. Como fallback, é possível gerar o PDF direto do HTML via navegador, ciente da qualidade tipográfica inferior.
- O hotsite deve ir ao ar **antes** de a Feat.Work começar a divulgação pública da peça.
- Toda a comunicação do hotsite assume que o leitor já está vendo a peça pelo link compartilhado — não há jornada de descoberta interna.

## 4. Personas e cenários de uso

### 4.1. Personas-alvo

**P1 — Pré-candidato ou candidato.** Pessoa em processo de articulação para concorrer em 2026, geralmente nível municipal/estadual. Já tem alguma operação digital mas com lacunas. Acessa pelo celular na maioria das vezes. Preocupação central: regras do TSE, riscos jurídicos, custos. Status no formulário: "sou candidato ou pré-candidato".

**P2 — Coordenador / equipe de campanha.** Profissional que opera (ou vai operar) uma campanha eleitoral. Marqueteiro, gestor político, chefe de gabinete, assessor parlamentar. Já entende parte do conteúdo, busca consolidação e checklist. Status: "trabalho com campanhas / sou parte de equipe".

**P3 — Executivo / empresa / interessado geral.** Diretor de marketing, consultor, advogado eleitoral, jornalista, acadêmico. Não está em uma campanha mas se interessa pelo tema. Status: "outro".

### 4.2. Cenários de uso esperados

**Cenário 1: lead vindo de mídia paga.**
Usuário clica num anúncio (LinkedIn Ads / Meta Ads / parceria editorial) → cai no hotsite → vê o guia desfocado → vê o pop-up no topo → cadastra → desbloqueia → lê / baixa / compartilha.

**Cenário 2: lead vindo de compartilhamento.**
Pessoa recebe link no WhatsApp ou e-mail de alguém que já leu → abre o hotsite no celular → vê parte do guia desfocado → cadastra pelo mesmo motivo → desbloqueia → tem chance de compartilhar com outros pares.

**Cenário 3: lead retornando.**
Usuário já se cadastrou em uma visita anterior → o hotsite reconhece via sessão local (cookie/localStorage) → não mostra pop-up → conteúdo já desbloqueado → pode rebaixar e recompartilhar à vontade.

**Cenário 4: usuário fecha o pop-up sem cadastrar.**
Conteúdo continua desfocado, com botão fixo no canto inferior que reabre o formulário. Sem cadastro, sem desbloqueio. A frustração controlada é parte do mecanismo de conversão.

## 5. Requisitos funcionais

### 5.1. Estrutura geral da página

**RF-01.** O hotsite é uma página única (single-page) que renderiza o conteúdo HTML completo do estudo (37 páginas A4 verticais empilhadas), conforme o arquivo `guia_eleicoes_2026_diagramado.html` fornecido neste PRD (anexo A).

**RF-02.** O conteúdo do estudo deve ser preservado integralmente — texto, hierarquia tipográfica, paleta de cores, layout das páginas, identidade Unfold × Feat.Work. Sem alterações no conteúdo.

**RF-03.** O hotsite deve ser totalmente responsivo:
- Desktop (1280px+): renderização das páginas A4 em escala ajustada, centralizada, com possibilidade de leitura natural
- Tablet (768–1279px): redimensionamento proporcional das páginas com 100% da largura útil
- Mobile (320–767px): escala adaptada para leitura vertical confortável; usuário rola naturalmente entre páginas

**RF-04.** O fundo do site (fora das páginas do guia) usa o cinza escuro `#2a2a2a` definido no HTML original, mantendo a estética de "documento sobre superfície escura" do mockup.

**RF-05.** Header fixo opcional no topo (a definir com design): logos Unfold + Feat.Work à esquerda, título compacto do guia ao centro, botões "Baixar PDF" + "Compartilhar" à direita. Visível apenas após desbloqueio. Em mobile, vira hamburger menu.

### 5.2. Sistema de blur / desfoque

**RF-06.** Enquanto o usuário não estiver autenticado (cadastro completo), todo o conteúdo do estudo deve aparecer com efeito de desfoque visual (CSS `filter: blur(8px)` como referência, ajustável). O blur deve ser forte o suficiente para tornar o texto ilegível, mas leve o suficiente para que o usuário perceba que há conteúdo real ali e queira ver.

**RF-07.** As primeiras páginas (capa, folha de rosto, primeira página da Parte 00) podem ter blur **gradual** — começando sem blur na capa e aumentando progressivamente — como teaser de qualidade. Decisão final fica com Gabriel + design. Sugestão técnica:
- Página 1 (capa): sem blur, totalmente visível
- Página 2 (folha de rosto): sem blur
- Página 3 (carta de abertura): blur leve (`blur(2px)`)
- Página 4 em diante: blur pleno (`blur(8px)`)

**RF-08.** Sobre o conteúdo desfocado, deve haver um overlay com leve degradê escurecido (gradient overlay) para reforçar a sensação de "bloqueio". Não deve impedir a leitura geral do layout, apenas dos textos.

**RF-09.** O blur deve ser removido instantaneamente após o cadastro bem-sucedido, com transição suave (CSS `transition` de 600ms aproximadamente).

### 5.3. Modal de cadastro

**RF-10.** Pop-up modal centralizado na tela, visível sobre o conteúdo desfocado. Deve aparecer:
- Automaticamente no primeiro carregamento da página, após delay de **3 segundos** (tempo para o usuário perceber que há um documento real desfocado atrás)
- Manualmente, ao clicar em qualquer botão CTA presente na página ("Desbloqueie agora", "Continue lendo", etc.)
- Quando o usuário tenta interagir com áreas restritas (ex: clicar no botão de download)

**RF-11.** Visualmente, o modal deve seguir a identidade do guia:
- Fundo do modal: navy `#001E29`
- Texto: cream `#E7E7E7`
- Botão principal: mint Unfold `#6DF9C6`, com texto navy
- Bordas suaves (`border-radius: 8mm`)
- Largura: ~440px em desktop, 92% em mobile
- Padding interno generoso (~30mm)
- Tipografia idêntica ao guia (Space Grotesk para títulos, Inter para corpo, JetBrains Mono para labels técnicas)

**RF-12.** Estrutura do conteúdo do modal:

```
[Tag superior em mono uppercase: "ACESSO COMPLETO"]
[Título display: "Continue a leitura"]
[Subtítulo body: "Preencha seus dados para desbloquear o estudo completo, baixar o PDF e compartilhar com sua equipe."]

[Formulário com 4 campos]
[Botão principal: "Desbloquear estudo"]

[Texto rodapé pequeno em mono: "Seus dados são tratados conforme nossa Política de Privacidade e a LGPD. Não enviamos spam."]

[Marcas Unfold × Feat.Work no rodapé do modal]
```

**RF-13.** O modal pode ser **fechado** clicando no X superior direito ou pressionando ESC. Ao fechar sem cadastrar:
- Conteúdo permanece desfocado
- Um botão CTA fixo aparece no canto inferior direito da tela, sempre visível, com texto "Desbloquear estudo" — clicar reabre o modal
- Após 30 segundos de uso da página sem cadastro, o modal pode reaparecer automaticamente (uma única vez por sessão)

### 5.4. Formulário de cadastro

**RF-14.** O formulário tem exatamente 4 campos, na seguinte ordem:

| # | Campo | Tipo | Validação | Obrigatório | Placeholder |
|---|-------|------|-----------|-------------|-------------|
| 1 | Nome completo | text | mínimo 2 palavras, máx 80 caracteres | sim | "Seu nome completo" |
| 2 | E-mail | email | RFC 5322, validação no submit | sim | "voce@exemplo.com" |
| 3 | Telefone (WhatsApp) | tel | formato brasileiro com DDD (10 ou 11 dígitos numéricos), com máscara visual `(00) 00000-0000` | sim | "(00) 00000-0000" |
| 4 | Você é candidato ou pré-candidato em 2026? | radio | obrigatório selecionar | sim | — |

**RF-15.** Opções do campo 4 (radio buttons):
- "Sim, sou candidato ou pré-candidato"
- "Sou parte de equipe de campanha"
- "Não, mas atuo no setor"
- "Outro"

**RF-16.** Validações em tempo real (com feedback visual sutil) e bloqueio do botão de envio até todos os campos estarem válidos. Mensagens de erro embaixo do campo, em vermelho `#E24B4A`.

**RF-17.** Máscara automática do telefone via JavaScript, aceitando apenas dígitos do usuário. Formato armazenado: apenas dígitos com DDD (11 dígitos: `11999998888`). Formato exibido: `(11) 99999-8888`.

**RF-18.** Estado de loading do botão durante o envio (texto muda para "Desbloqueando..." e fica desabilitado), para evitar duplo clique.

**RF-19.** Em caso de erro de envio (rede, API RD Station fora do ar, etc.), exibir mensagem de erro amigável no modal: "Tivemos um problema ao processar seu cadastro. Tente novamente em alguns instantes ou recarregue a página." Logar o erro (descrito em §9).

### 5.5. Integração com RD Station

**RF-20.** Após o submit válido do formulário:

1. **Envio principal:** chamada à API do RD Station Marketing para criar/atualizar contato
2. **Envio paralelo:** chamada à API do RD Station CRM para criar oportunidade (se aplicável conforme regra de negócio definida com Gabriel)
3. **Tracking:** disparar evento `lead_capturado` no Google Analytics 4
4. **Persistência local:** salvar flag de autenticação em localStorage (`hotsite_unlocked: true`) + timestamp + ID interno do lead
5. **Liberação:** remover blur, fechar modal, exibir toast de sucesso ("Pronto! Boa leitura.")

**RF-21.** Dados enviados para o RD Station Marketing (endpoint de eventos de conversão):

```json
{
  "event_type": "CONVERSION",
  "event_family": "CDP",
  "payload": {
    "conversion_identifier": "hotsite-guia-eleicoes-2026",
    "name": "[nome completo informado]",
    "email": "[email informado]",
    "mobile_phone": "+55[telefone com DDD]",
    "personal_phone": "+55[telefone com DDD]",
    "cf_perfil_eleitoral_2026": "[opção selecionada]",
    "cf_origem_hotsite": "hotsite-guia-eleicoes-2026",
    "cf_utm_source": "[utm_source da URL]",
    "cf_utm_medium": "[utm_medium da URL]",
    "cf_utm_campaign": "[utm_campaign da URL]",
    "cf_utm_content": "[utm_content da URL]",
    "cf_utm_term": "[utm_term da URL]",
    "cf_lead_referrer": "[document.referrer]",
    "cf_lead_data_cadastro": "[ISO datetime]",
    "tags": ["guia-eleicoes-2026", "[tag derivada do perfil]"]
  }
}
```

**RF-22.** Tag derivada do perfil (campo `tags`):
- "Sim, sou candidato ou pré-candidato" → tag `perfil-candidato`
- "Sou parte de equipe de campanha" → tag `perfil-equipe-campanha`
- "Não, mas atuo no setor" → tag `perfil-setor`
- "Outro" → tag `perfil-outro`

**RF-23.** Endpoints a usar:
- **Marketing:** `POST https://api.rd.services/platform/conversions` (autenticação via OAuth 2.0 com refresh token)
- **CRM:** `POST https://crm.rdstation.com/api/v1/deals?token=[INSTANCE_TOKEN]` (autenticação via instance token)

Documentação oficial:
- RD Station Marketing API: https://developers.rdstation.com/reference/post_platform-conversions
- RD Station CRM API: https://crmsupport.rdstation.com/hc/pt-br/articles/360010797352

**RF-24.** Criação de oportunidade no CRM (a confirmar com Gabriel se isso deve ocorrer no momento do cadastro ou apenas após qualificação adicional). Sugestão padrão para esta release: **criar oportunidade apenas para leads com perfil "candidato" ou "equipe de campanha"**, com:

```json
{
  "deal": {
    "name": "Lead Guia 2026 — [nome]",
    "deal_stage_id": "[ID do estágio inicial do funil, a configurar]",
    "user_id": "[ID do responsável padrão, a configurar]",
    "deal_source_id": "[ID da fonte 'Hotsite Guia 2026']",
    "rating": 1
  },
  "contacts": [{
    "name": "[nome]",
    "emails": [{"email": "[email]"}],
    "phones": [{"phone": "+55[telefone]", "type": "cellphone"}]
  }]
}
```

**RF-25.** Em caso de falha na integração com o RD Station (timeout, erro 5xx, credenciais inválidas), o cadastro ainda deve ser considerado **bem-sucedido para o usuário** (desbloquear o conteúdo normalmente), mas o lead deve ser:
- Logado em sistema de fallback (banco SQLite local, Supabase, ou planilha Google via webhook — escolha do Matheus)
- Alertado por e-mail para `[ENDEREÇO A DEFINIR]` para reprocessamento manual

Isso evita perda de leads por instabilidade da plataforma externa.

### 5.6. Download do PDF

**RF-26.** Botão "Baixar PDF" deve estar visível em pelo menos 3 locais:
- No header fixo (após desbloqueio)
- Após a página 7 (final da Parte 00), como CTA contextual no meio da leitura
- Na página 36 (convite final), como CTA conclusivo

**RF-27.** Ao clicar no botão de download:
- Se o usuário estiver autenticado: download direto do arquivo PDF estático
- Se não estiver: abre o modal de cadastro com mensagem contextual: "Cadastre-se para baixar o estudo completo em PDF"

**RF-28.** O PDF estático deve ficar hospedado no próprio servidor do hotsite, em rota previsível como `/static/guia-eleicoes-2026.pdf`, com nome de arquivo amigável para download: `Guia-Eleicoes-2026-Unfold-FeatWork.pdf`.

**RF-29.** Disparar evento `pdf_baixado` no Google Analytics 4 a cada download, com properties:
- `lead_email` (se disponível em localStorage)
- `origem_botao` ("header" | "meio_pagina" | "convite_final")

### 5.7. Compartilhamento

**RF-30.** Botões de compartilhamento devem estar visíveis junto ao botão de download:
- "Compartilhar via WhatsApp"
- "Compartilhar por e-mail"

**RF-31.** Compartilhamento via WhatsApp:
- Abre URL `https://wa.me/?text=[mensagem URL-encoded]`
- Mensagem padrão: `Acabei de ler o "Guia de Anúncios Digitais para as Eleições de 2026" da Unfold × Feat.Work. Vale a leitura para quem está pensando em 2026. Acessa aqui: [URL do hotsite com UTM]`
- URL deve conter UTMs específicos para rastrear origem viral: `?utm_source=share&utm_medium=whatsapp&utm_campaign=guia-eleicoes-2026&utm_content=[email-hash-do-compartilhador]`

**RF-32.** Compartilhamento via e-mail:
- Abre cliente de e-mail padrão via `mailto:?subject=[assunto]&body=[corpo]`
- Assunto: `Guia de Anúncios Digitais para as Eleições de 2026 — Unfold × Feat.Work`
- Corpo: mensagem similar à do WhatsApp, com URL do hotsite + UTMs (`utm_medium=email`)

**RF-33.** O `[email-hash-do-compartilhador]` no UTM `utm_content` deve ser um hash anonimizado (SHA-256 dos primeiros 8 caracteres) do e-mail do usuário que compartilhou, para que o time consiga atribuir conversões secundárias a quem espalhou o conteúdo, sem expor dados pessoais publicamente.

**RF-34.** Disparar evento `link_compartilhado` no Google Analytics 4 a cada clique, com properties:
- `canal` ("whatsapp" | "email")
- `lead_email_hash`

### 5.8. Sessão e persistência local

**RF-35.** Após o cadastro bem-sucedido, gravar em `localStorage`:

```json
{
  "hotsite_unlocked": true,
  "lead_id": "[UUID gerado]",
  "lead_email_hash": "[hash SHA-256 truncado]",
  "lead_perfil": "[opção selecionada]",
  "cadastro_timestamp": "[ISO datetime]"
}
```

**RF-36.** Ao carregar a página, verificar se `hotsite_unlocked === true`:
- Se sim: pular o modal automático, conteúdo já desbloqueado, todos os CTAs ativos
- Se não: comportamento padrão de gate

**RF-37.** Não usar cookies de terceiros. Apenas localStorage e cookies de primeira parte (próprio domínio) para tracking analítico.

**RF-38.** Botão discreto no rodapé "Limpar meu cadastro deste dispositivo" para usuários que queiram resetar a sessão (boa prática LGPD).

### 5.9. UTM e captura de origem

**RF-39.** Ao carregar a página, capturar e armazenar em `sessionStorage` (válido só pela sessão atual):
- Todos os parâmetros UTM presentes na URL (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`)
- `document.referrer` (URL de origem do clique)
- `landing_page` (URL exata do primeiro acesso, sem parâmetros)
- `device_type` (mobile / tablet / desktop)
- `user_agent` (resumido)

**RF-40.** Esses dados são enviados ao RD Station no momento do cadastro como campos personalizados (`cf_*`), permitindo análise posterior por canal de origem.

### 5.10. Página de agradecimento / toast pós-cadastro

**RF-41.** Após o cadastro, ao invés de redirecionar para outra página, mostrar um **toast notification** discreto no canto superior da tela:

```
[Ícone ✓ em mint]
Pronto! Boa leitura.
Você também pode baixar o PDF e compartilhar com sua equipe.
[X para fechar]
```

Duração: 6 segundos com auto-dismiss, ou clique no X. Estilo visual coerente com o modal de cadastro.

**RF-42.** Em paralelo ao toast, **destacar visualmente os botões de download e compartilhamento** por alguns segundos (pulsação suave ou highlight) para chamar atenção a esses CTAs.

## 6. Requisitos não-funcionais

### 6.1. Performance

**RNF-01.** Tempo de carregamento da página (LCP) ≤ 2,5 segundos em conexão 4G simulada
**RNF-02.** First Contentful Paint (FCP) ≤ 1,5 segundos
**RNF-03.** Cumulative Layout Shift (CLS) ≤ 0,1
**RNF-04.** Time to Interactive (TTI) ≤ 3,5 segundos

**RNF-05.** Lazy loading do conteúdo das páginas mais distantes (a partir da página 20+) para acelerar o load inicial. As primeiras páginas devem renderizar imediatamente.

**RNF-06.** Otimização de fontes: usar `font-display: swap` no carregamento do Google Fonts, com fontes fallback definidas (sans-serif, monospace) para evitar FOUT pesado.

### 6.2. Acessibilidade

**RNF-07.** Conformidade com WCAG 2.1 nível AA mínimo:
- Contraste de cores adequado (testar mint sobre navy e vice-versa)
- Navegação por teclado completa (tab order coerente)
- Labels semânticos em todos os campos do formulário
- ARIA attributes onde necessário (modal com `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`)
- Foco visível em elementos interativos
- Texto alternativo em todas as imagens / SVGs

**RNF-08.** Suporte a leitores de tela: o conteúdo desfocado deve continuar acessível via leitor de tela (o blur é visual apenas), mas com aviso semântico de que "o conteúdo está bloqueado, cadastre-se para liberar". Discutir com Gabriel se isso é desejável ou se o conteúdo deve ficar realmente oculto para leitores até o cadastro — recomendação: deixar oculto via `aria-hidden="true"` no conteúdo bloqueado, para coerência com a intenção comercial.

### 6.3. Segurança e privacidade

**RNF-09.** Toda comunicação via HTTPS. Certificado SSL configurado.

**RNF-10.** Sanitização de inputs no front-end e re-validação no back-end (caso haja back-end próprio para fallback).

**RNF-11.** Proteção CSRF nas chamadas de API (se houver back-end intermediário).

**RNF-12.** Rate limiting nas submissões do formulário: máximo 3 tentativas por IP em 60 segundos, para evitar bots e spam.

**RNF-13.** CAPTCHA invisível (Google reCAPTCHA v3 ou Cloudflare Turnstile) na submissão do formulário, com threshold a ajustar conforme volume de spam observado.

**RNF-14.** Conformidade LGPD:
- Aviso claro de tratamento de dados pessoais antes do submit
- Link visível para a Política de Privacidade (a definir URL com Gabriel)
- Mecanismo de exclusão via solicitação ao DPO (e-mail no rodapé)
- Não armazenar dados sensíveis (CPF, dados de saúde, opinião política específica — observar que "candidato sim/não" pode ser interpretado como opinião política e exige cuidado adicional; recomendação: incluir na Política de Privacidade o tratamento desse dado e a base legal usada — provavelmente legítimo interesse para qualificação comercial)

**RNF-15.** Credenciais de API (RD Station tokens, reCAPTCHA secrets, etc.) **nunca** expostas no front-end. Devem ficar em variáveis de ambiente do servidor, acessadas via endpoint próprio do back-end.

### 6.4. Compatibilidade

**RNF-16.** Compatibilidade com os seguintes navegadores (últimas 2 versões major):
- Chrome / Edge (Chromium)
- Safari (incluindo iOS Safari)
- Firefox
- Samsung Internet (importante no mercado brasileiro)

**RNF-17.** Funcionalidade básica garantida em dispositivos com 320px de largura mínima.

### 6.5. SEO e meta

**RNF-18.** Meta tags configuradas:
- `<title>`: "Guia de Anúncios Digitais para as Eleições de 2026 — Unfold × Feat.Work"
- `<meta name="description">`: descrição em 150–160 caracteres
- Open Graph completo (og:title, og:description, og:image, og:url, og:type)
- Twitter Card (summary_large_image)
- Imagem OG: capa do guia em proporção 1200×630, com identidade Unfold × Feat.Work

**RNF-19.** Sitemap.xml + robots.txt configurados.

**RNF-20.** Schema.org structured data (Article ou similar) para indexação rica em buscadores.

## 7. Arquitetura técnica recomendada

### 7.1. Stack sugerida (decisão final com Matheus)

**Opção A — recomendada para velocidade:**
- **Frontend:** Next.js (React) com TypeScript, deploy na Vercel
- **Back-end mínimo:** API Routes do Next.js para intermediar chamadas ao RD Station (proteger tokens)
- **Storage de fallback:** Supabase (PostgreSQL gerenciado) para log de leads em caso de falha do RD Station
- **Analytics:** Google Analytics 4 + Vercel Analytics
- **Captcha:** Cloudflare Turnstile (gratuito, sem rastreamento)

**Opção B — mais simples, sem framework:**
- HTML/CSS/JS vanilla (mantém o HTML diagramado atual quase intacto)
- Back-end mínimo em Node.js/Express ou Cloudflare Workers
- Hospedagem: Cloudflare Pages ou Netlify

**Recomendação:** opção A se houver tempo para setup mínimo (1–2 dias adicionais), com benefício de manutenção futura. Opção B se a urgência for crítica e a peça for descartada depois do ciclo eleitoral 2026.

### 7.2. Estrutura de pastas sugerida (opção A)

```
hotsite-guia-2026/
├── pages/
│   ├── index.tsx              # página principal do hotsite
│   ├── api/
│   │   ├── lead.ts            # endpoint do cadastro (proxy para RD Station)
│   │   └── fallback.ts        # endpoint de fallback
│   └── _app.tsx
├── components/
│   ├── GuiaContent.tsx        # render do HTML do guia
│   ├── BlurOverlay.tsx        # camada de blur
│   ├── LeadModal.tsx          # modal de cadastro
│   ├── LeadForm.tsx           # formulário com validações
│   ├── ShareButtons.tsx       # botões de compartilhamento
│   ├── DownloadButton.tsx     # botão de download PDF
│   ├── Header.tsx             # header fixo
│   └── Toast.tsx              # notificação pós-cadastro
├── lib/
│   ├── rdstation.ts           # cliente da API RD Station
│   ├── analytics.ts           # wrapper para GA4
│   ├── validation.ts          # validação de formulário
│   ├── utm.ts                 # captura e gestão de UTMs
│   └── session.ts             # gestão de localStorage
├── public/
│   ├── static/
│   │   └── guia-eleicoes-2026.pdf  # PDF estático
│   ├── fonts/                 # fontes (se hospedadas localmente)
│   └── og-image.png           # imagem para compartilhamento
├── styles/
│   ├── globals.css
│   └── guia.css               # estilos do conteúdo do guia (extraídos do HTML original)
├── .env.local                 # variáveis de ambiente
├── .env.example
└── README.md
```

### 7.3. Variáveis de ambiente necessárias

```bash
# RD Station Marketing (OAuth 2.0)
RD_MARKETING_CLIENT_ID=
RD_MARKETING_CLIENT_SECRET=
RD_MARKETING_REFRESH_TOKEN=

# RD Station CRM
RD_CRM_INSTANCE_TOKEN=
RD_CRM_DEAL_STAGE_ID=
RD_CRM_DEAL_SOURCE_ID=
RD_CRM_DEFAULT_USER_ID=

# Captcha
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID=

# Fallback
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Alertas
ALERT_EMAIL_TO=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

## 8. Fluxos de tela (user journey)

### 8.1. Fluxo principal — primeira visita

```
1. Usuário clica em link / anúncio com UTM
   ↓
2. Página carrega com:
   - Conteúdo do guia (todas as 37 páginas) renderizado
   - Blur aplicado a partir da página 4
   - UTMs capturados em sessionStorage
   - Evento GA4 "pagina_carregada" disparado
   ↓
3. Após 3 segundos, modal de cadastro aparece automaticamente
   ↓
4. Usuário preenche os 4 campos
   ↓
5. Validações em tempo real / submit
   ↓
6. POST para /api/lead (proxy interno)
   ↓
7. /api/lead chama RD Station Marketing API (e CRM se aplicável)
   ↓
8. Sucesso:
   - localStorage atualizado
   - Modal fecha
   - Blur removido (transição 600ms)
   - Toast de sucesso aparece
   - Botões de download/compartilhamento destacados
   - Evento GA4 "lead_capturado" disparado
   ↓
9. Usuário navega livremente, baixa o PDF, compartilha
```

### 8.2. Fluxo alternativo — fechar modal sem cadastrar

```
1. Modal aparece automaticamente
   ↓
2. Usuário clica em X / pressiona ESC
   ↓
3. Modal fecha, conteúdo permanece desfocado
   ↓
4. Botão CTA fixo aparece no canto inferior direito
   ↓
5. Após 30s, modal reaparece uma vez automaticamente
   ↓
6. Se usuário clica em qualquer botão (download, share), modal reaparece com mensagem contextual
```

### 8.3. Fluxo de retorno — visita subsequente

```
1. Usuário acessa a URL (com ou sem UTM)
   ↓
2. Página verifica localStorage.hotsite_unlocked
   ↓
3. Se true:
   - Modal não aparece
   - Conteúdo já desbloqueado
   - Todos os CTAs ativos
   - Tracking de "visita_retorno" disparado
   ↓
4. Se false / inexistente: fluxo principal
```

### 8.4. Fluxo de erro — falha na API RD Station

```
1. Submit do formulário
   ↓
2. POST para /api/lead
   ↓
3. /api/lead tenta RD Station, recebe erro 5xx ou timeout
   ↓
4. /api/lead salva em Supabase (fallback)
   ↓
5. /api/lead dispara e-mail de alerta para [ALERT_EMAIL_TO]
   ↓
6. /api/lead retorna sucesso para o front-end
   ↓
7. Usuário tem conteúdo desbloqueado normalmente
   ↓
8. Time reprocessa o lead manualmente depois
```

## 9. Logging e observabilidade

**LOG-01.** Toda submissão de formulário deve gerar log estruturado em JSON com:
- timestamp ISO 8601
- IP (anonimizado, apenas /24 do IPv4)
- user_agent
- resultado (sucesso / erro)
- duração da chamada à API
- error message (se aplicável, sem dados pessoais)

**LOG-02.** Logs centralizados em serviço a definir (Vercel Logs, Sentry, ou stdout do servidor com retenção mínima de 30 dias).

**LOG-03.** Alertas configurados para:
- Taxa de erro nas submissões > 5% em janela de 10 minutos
- API do RD Station retornando 5xx por mais de 5 minutos consecutivos
- Volume anormalmente alto de submissões (> 100/min — provável ataque)

## 10. Dashboard interno simples (fora do escopo, mas recomendado)

Após a release inicial, vale considerar (fase 2):

- Página interna `/admin` protegida por senha, mostrando:
  - Volume de leads por dia
  - Distribuição por perfil (candidato / equipe / setor / outro)
  - Top UTMs de origem
  - Taxa de conversão
- Acessível apenas via senha compartilhada com Gabriel e equipe Unfold/Feat.Work

Não é prioridade para o MVP, mas o Matheus pode planejar a estrutura de dados pensando nessa extensão futura.

## 11. Testes de aceitação

Antes do go-live, os seguintes cenários devem ser testados manualmente e marcados como aprovados:

**T-01.** Cadastro completo em desktop Chrome → lead aparece no RD Station Marketing em até 60 segundos
**T-02.** Cadastro completo em iPhone Safari → idem
**T-03.** Cadastro completo em Android Chrome → idem
**T-04.** Validação: e-mail inválido bloqueia submit
**T-05.** Validação: telefone com menos de 10 dígitos bloqueia submit
**T-06.** Validação: campo perfil obrigatório bloqueia submit
**T-07.** Submit duplo (rage-click no botão) não cria 2 leads
**T-08.** Fechar modal e abrir de novo via CTA fixo funciona corretamente
**T-09.** ESC fecha o modal
**T-10.** Após cadastro, recarregar a página mantém o conteúdo desbloqueado
**T-11.** Limpar cookies/localStorage faz o modal voltar
**T-12.** Download do PDF funciona em desktop e mobile
**T-13.** Compartilhamento WhatsApp abre o app corretamente em mobile e Web WhatsApp em desktop
**T-14.** Compartilhamento e-mail abre cliente padrão com texto preenchido
**T-15.** Link compartilhado contém UTMs corretos
**T-16.** UTMs da URL de entrada chegam corretos ao RD Station
**T-17.** Lead com perfil "candidato" cria oportunidade no CRM
**T-18.** Lead com perfil "outro" NÃO cria oportunidade no CRM
**T-19.** Falha simulada da API do RD Station ainda permite ao usuário desbloquear o conteúdo
**T-20.** Lead em fallback aparece no Supabase após falha
**T-21.** E-mail de alerta é disparado em caso de fallback
**T-22.** Performance: Lighthouse Mobile score ≥ 85 em Performance e ≥ 90 em Accessibility
**T-23.** Captcha bloqueia bot detectado (testar com user-agent suspeito)
**T-24.** Conteúdo é responsivo e legível em telas de 320px, 768px e 1280px
**T-25.** Todas as 37 páginas do guia carregam corretamente
**T-26.** Política de Privacidade está acessível e funcional
**T-27.** Botão de "limpar cadastro deste dispositivo" funciona

## 12. Cronograma sugerido

Estimativa para um desenvolvedor sênior trabalhando em dedicação parcial. Matheus pode ajustar conforme sua carga real.

| Etapa | Atividades | Duração |
|-------|-----------|---------|
| **Sprint 0 — Setup** | Setup do projeto, ambiente, repositório, credenciais RD Station, primeiros deploys | 2 dias |
| **Sprint 1 — Conteúdo + estrutura** | Integração do HTML do guia ao projeto, renderização, estilos, responsividade | 3 dias |
| **Sprint 2 — Gate e modal** | Sistema de blur, modal de cadastro, formulário com validações, máscaras, captcha | 3 dias |
| **Sprint 3 — Integrações** | RD Station Marketing + CRM, fallback Supabase, alertas, captura de UTMs | 3 dias |
| **Sprint 4 — CTAs e funcionalidades** | Download de PDF, compartilhamento, toast, persistência local, GA4 | 2 dias |
| **Sprint 5 — Polimento + testes** | Acessibilidade, performance, testes de aceitação, ajustes de design | 3 dias |
| **Sprint 6 — Deploy + handover** | Deploy de produção, DNS, configuração final, documentação para o time | 1 dia |
| **Total estimado** | | **17 dias úteis** |

Margem de segurança recomendada: +30%. Estimativa final realista: **22 dias úteis (~1 mês corrido)**.

## 13. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Demora na geração do PDF final pela equipe de design | Alto (bloqueia o release) | Média | Fallback: usar export de PDF do navegador a partir do HTML diagramado como versão MVP, substituir depois |
| Credenciais do RD Station não disponíveis a tempo | Alto | Baixa | Solicitar antecipadamente; usar conta de sandbox no desenvolvimento |
| Volume de spam / bots no formulário | Médio | Alta | Captcha invisível + rate limiting + monitoramento das primeiras 48h |
| Mudança no conteúdo do guia após início do desenvolvimento | Médio | Média | Garantir que a estrutura HTML seja drop-in: trocar conteúdo sem refazer arquitetura |
| Falha do RD Station no dia do lançamento | Alto | Baixa | Fallback robusto + monitoramento + alertas |
| Performance ruim por causa do peso das 37 páginas | Médio | Média | Lazy loading + otimização de fontes + medições contínuas |
| Conflito de identidade visual entre o estudo e o hotsite | Baixo | Baixa | PRD especifica fidelidade ao mockup; revisão visual antes do go-live |
| Domínio / DNS não pronto a tempo | Médio | Baixa | Definir o domínio com 1 semana de antecedência mínima |

## 14. Definições pendentes (a fechar antes do desenvolvimento)

Os seguintes pontos precisam ser definidos por Gabriel antes de o Matheus começar:

**D-01.** Domínio do hotsite (ex: `guia2026.unfold.com.br`, `eleicoes2026.featwork.com.br`, ou domínio próprio)
**D-02.** Texto exato da Política de Privacidade (geral da Unfold ou específica do hotsite?)
**D-03.** Endereço de e-mail para alertas de fallback
**D-04.** Endereço do DPO para solicitações LGPD
**D-05.** Imagem Open Graph (cover de 1200×630 para compartilhamento)
**D-06.** ID do estágio inicial do funil no RD CRM e ID do responsável padrão
**D-07.** Decisão final sobre criação de oportunidade no CRM (todos os leads ou apenas candidatos/equipes?)
**D-08.** Confirmação se o PDF estático será produzido em InDesign/Figma pelo design ou se vamos com a versão do HTML
**D-09.** Texto exato dos botões de compartilhamento (validar redação proposta com Gabriel/Bruno)
**D-10.** Cores exatas de fallback (caso o verde feat.work `#00E649` precise ser ajustado pelo time da Feat.Work)

## 15. Anexos

### Anexo A — Conteúdo HTML do guia

O conteúdo HTML completo e diagramado do estudo está no arquivo:

**`guia_eleicoes_2026_diagramado.html`** (entregue separadamente neste pacote)

Esse arquivo é um HTML standalone, contém todos os estilos inline em `<style>`, carrega fontes do Google Fonts e renderiza as 37 páginas A4 verticais sequenciais. **Não modificar o conteúdo, apenas a estrutura de containers para integrar ao framework escolhido.**

Estrutura geral do arquivo:
- Bloco `<style>` no `<head>`: ~250 linhas, contém todas as variáveis CSS (`--navy`, `--mint`, `--feat-green`, etc.) e estilos de página
- Cada página é um `<div class="page navy">` ou `<div class="page cream">` de 210mm × 297mm
- A primeira página é a capa, a última é a contracapa
- As páginas 5, 8, 15, 24 e 31 são aberturas de parte (numeração grande)
- As páginas 6 e 7 são o panorama de dados (Parte 00)

Para integração ao Next.js (opção A): extrair o `<style>` para `styles/guia.css`, transformar o body em um componente `<GuiaContent />` que retorna o JSX equivalente. Os `class` viram `className`. O resto fica idêntico.

### Anexo B — Wireframes (a produzir)

Wireframes do modal, header fixo, botões CTA e estados visuais (blur, toast, etc.) podem ser produzidos pelo time de design Unfold antes do desenvolvimento, ou pelo Matheus diretamente baseado neste PRD. A decisão fica com o time.

### Anexo C — Documentação de API

- **RD Station Marketing — Conversions:** https://developers.rdstation.com/reference/post_platform-conversions
- **RD Station CRM — Deals:** https://crmsupport.rdstation.com/hc/pt-br/articles/360010797352
- **RD Station OAuth 2.0:** https://developers.rdstation.com/reference/autenticacao
- **Cloudflare Turnstile:** https://developers.cloudflare.com/turnstile/
- **Google Analytics 4 events:** https://developers.google.com/analytics/devguides/collection/ga4/event-builder

---

## Aprovação

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Produto | Gabriel Calheiros | __/__/____ | __________________ |
| Desenvolvimento | Matheus | __/__/____ | __________________ |
| Validação Feat.Work | [a definir] | __/__/____ | __________________ |

---

*Documento produzido para a parceria Unfold × Feat.Work · 2026*
