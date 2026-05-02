UNFOLD GROWTH
GROWTH INTELLIGENCE
Brief Estratégico de Arquitetura e Conteúdo do Site
Documento orientador para o desenvolvimento do site institucional da Unfold Growth — base estratégica para revisão do PRD técnico.
Versão 1.0
Maceió · 29 de abril de 2026
Autoria estratégica: Gabriel Calheiros · Partner & Diretor de Marketing
Status: Draft para alinhamento com Matheus (Analista de Automações) e equipe

1. Contexto e propósito deste documento
1.1. O que este documento é
Este é um documento de natureza estratégica, não técnica. Sua função é fornecer a base de posicionamento, narrativa e arquitetura de informação que governa o desenvolvimento do site da Unfold Growth. Ele complementa — e antecede em hierarquia — o PRD técnico produzido pelo Matheus.
O PRD descreve o como técnico do site: stack, blocos editáveis, fluxos de dados, integrações, infraestrutura. Este Brief descreve o porquê e o quê estratégico: o que cada página comunica, qual jornada o visitante percorre, quais decisões de arquitetura refletem o posicionamento da marca, e o que precisa ser preservado, descartado ou reformulado em relação ao trabalho já desenvolvido.
Os dois documentos operam em conjunto. Em qualquer ponto de divergência entre Brief e PRD, este Brief tem precedência por se tratar de fundamento estratégico anterior à decisão técnica.
1.2. Por que este documento existe agora
O PRD do Matheus foi produzido com base em uma conversa breve sobre o projeto, sem o contexto estratégico que estava sendo construído em paralelo. O resultado é um PRD tecnicamente sólido, com excelente atenção a performance, SEO, LGPD e arquitetura de dados — mas estruturado a partir da premissa de uma evolução do site da Lighthouse, não do lançamento de uma nova entidade com posicionamento próprio.
Este Brief existe para corrigir essa lacuna, dando ao Matheus o contexto que faltava no momento da produção do PRD. Ele deve ser lido antes de qualquer revisão técnica, e sua leitura é pré-requisito para a próxima versão do PRD.
1.3. Como este documento deve ser usado
Lido na íntegra pelo Matheus e pela equipe de execução (analista de marketing, designer, time de captação).
Usado como referência para a revisão da v2 do PRD técnico — revisão que o Matheus conduzirá com autonomia, à luz dos princípios estratégicos aqui estabelecidos.
Usado como contexto-base para qualquer profissional, IA ou parceiro que venha a trabalhar no site, no diagnóstico, nos copies ou em ativos de marketing relacionados.
Atualizado quando houver decisão estratégica nova de impacto. Versionado: cada alteração relevante sobe um número.
1.4. O que este documento não é
Não é uma reescrita do PRD do Matheus. O PRD técnico segue sendo de autoria dele, com autonomia plena de decisão técnica.
Não é uma especificação de design. O sistema visual definido na APR V2 (paleta, tipografia, símbolos) está aprovado e deve ser preservado.
Não é um briefing de copy final. As direções de copy aqui apresentadas são diretrizes, não textos prontos. A redação final será produzida em ciclo separado.
Não é um roadmap detalhado de execução. O roadmap apresentado na seção 10 é uma referência de janela temporal, não um cronograma vinculante.

2. Quem é a Unfold
2.1. Posicionamento central
A Unfold é uma assessoria de growth especializada em operações com vendas complexas. Sua função é estruturar e operar sistemas de crescimento que conectam marketing, vendas, CRM, automação e inteligência comercial em uma lógica integrada, previsível e orientada a resultado comercial.
A Unfold não é uma agência de marketing digital, não é uma agência de tráfego, não é uma operação de social media e não é uma consultoria genérica de revenue. Ela ocupa uma categoria específica: assessoria de growth para vendas complexas — categoria que combina o método de growth com a realidade de operações comerciais consultivas, de ticket alto e ciclo longo.
2.2. Tese de mercado
Empresas com vendas complexas não precisam de mais marketing isolado. Precisam de um sistema de crescimento mais integrado.
Esta é a tese central que organiza o posicionamento, o método, a arquitetura da oferta, a narrativa e o foco comercial da Unfold. Toda decisão de produto, conteúdo e comunicação deve ser tomada à luz dessa tese — incluindo decisões de arquitetura do site.
2.3. Diferenciação central
O diferencial da Unfold não está em oferecer mais canais, mais campanhas ou mais entregáveis. Está em aplicar método de growth à realidade operacional de empresas com vendas complexas. Em termos práticos, isso significa começar pelo diagnóstico em vez da execução; estruturar antes de escalar; tratar CRM e automação como parte da engrenagem central; integrar marketing e vendas como parte do core; operar por lógica de sistema em vez de canal.
Growth não é canal. É sistema.
2.4. Espaço mental desejado
Quando o mercado pensar na Unfold, deve associar a marca a:
Growth com método, não com hacks ou volume
Integração entre marketing e vendas, não silos
CRM e automação como parte da engrenagem, não como adereço
Clareza de funil e inteligência comercial
Previsibilidade de receita
Operação estruturada e orientada por sistema
2.5. ICP prioritário
Empresas de médio e grande porte, com ticket alto, ciclo de venda longo ou tecnicamente complexo, estrutura mínima de marketing e vendas já existente, necessidade real de CRM e automação, maturidade intermediária ou avançada, e dor concreta de integração, previsibilidade ou clareza de funil.
Verticais priorizados na Fase 1 do go-to-market:
Construção Civil e Incorporação — vertical de tração e autoridade
Agroindústria e negócios agro de vendas complexas — vertical de tração e autoridade
Tecnologia e SaaS B2B — expansão seletiva, com critério de fit alto
Automotivo e concessionárias — entrada oportunista e controlada
Empresas que claramente não são ICP (e o site deve filtrar):
Empresas que querem apenas tráfego pago como serviço
Empresas que querem apenas social media
Empresas que compram por preço
Empresas sem operação comercial mínima
Empresas que esperam agência full service

3. O que muda em relação à Lighthouse
3.1. A Unfold não é um rebrand da Lighthouse
Esta é a decisão estratégica mais importante a ser comunicada para o time técnico. A Unfold não é uma evolução visual da Agência Lighthouse. É uma nova entidade, com nova categoria, novo CNPJ, novo posicionamento e nova proposta de valor. A Lighthouse será encerrada formalmente ao longo de maio de 2026.
Essa diferença não é semântica. Ela determina decisões concretas de arquitetura do site, do conteúdo, da comunicação de transição e do legado a ser preservado. Tratar a Unfold como rebrand significa importar premissas estruturais da Lighthouse — escopos de serviço, categorias de blog, formatos de conteúdo, tom institucional — que contradizem o novo posicionamento.
3.2. O que é preservado
Há ativos da Lighthouse que se transferem para a Unfold por acordo formal. Esses ativos são:
Cases de clientes selecionados (a serem reformatados sob a narrativa UGS)
Relacionamentos comerciais ativos com os 6 clientes em operação
Autoridade pessoal acumulada do Gabriel Calheiros como liderança
Big numbers consolidados (R$ 75MM em negócios gerados, R$ 850k geridos em mídia, 25 mil conteúdos desenvolvidos) — referência de volume operacional
Certificações e parcerias institucionais (Meta Business Partner, Kommo Partners, RD Station Partners, ABRADI)
Sistema visual da Unfold conforme APR V2
3.3. O que é descartado
Há ativos da Lighthouse que não devem ser transferidos. A migração desses ativos contradiz o posicionamento da Unfold:
Categorização de serviços por canal (tráfego, social, inbound, etc.) — substituída pela arquitetura de oferta UGS
Categorias de blog do site atual (Marketing Automotivo, Marketing Digital, Marketing para Eventos, etc.) — substituídas por categorização orientada a método e vertical
Posts de blog que reforcem a percepção de agência de marketing digital generalista — boa parte da biblioteca de 78 posts
Tom institucional de agência ("fazemos tudo do início ao fim", "full service", "especialistas em performance")
Estrutura de página "Serviços" como menu de entregáveis
3.4. O que é reformulado
Há ativos que são preservados em conteúdo, mas precisam ser reapresentados sob a nova narrativa:
Cases — reescritos sob o framework UGS, com mapeamento de pilares trabalhados, ações executadas e resultados quantitativos
Big numbers — preservados mas reposicionados como prova de operação madura, não de volume de execução
Logos de clientes — preservados, mas com aprovação formal de cada cliente para uso sob a marca Unfold
Conteúdo do podcast (se houver) — avaliação caso a caso de quais episódios fazem sentido sob a nova categoria
3.5. Implicações para o site
Algumas implicações concretas que o time técnico precisa internalizar:
O site não importa a estrutura do site da Lighthouse. É um produto novo.
A migração de blog não deve ser automática. Cada post precisa ser avaliado quanto à coerência com o novo posicionamento. Se a equipe não tiver banda para essa curadoria no lançamento, o blog estreia com 5 a 10 posts novos sob a nova narrativa, e os posts antigos ficam fora — não são importados "por SEO".
Os redirects 301 que fazem sentido são apenas dos posts que sobrevivem à curadoria, mais a página inicial. URLs antigas que correspondem a categorias descartadas redirecionam para /blog (raiz) ou /404 amigável.
A comunicação institucional do lançamento é parte do escopo do projeto. Não basta substituir o domínio.

4. Princípios estratégicos do site
Esta seção define os 10 princípios não-negociáveis que governam decisões de arquitetura, conteúdo e experiência. Toda decisão técnica posterior do PRD deve passar pelo teste destes princípios. Em qualquer escolha de arquitetura ou de copy, a pergunta a se fazer é: este princípio está sendo respeitado?
Princípio 1 — O site vende sistema, não pacote de serviços
Toda referência a entregáveis isolados ("fazemos campanhas", "gerenciamos suas redes", "otimizamos seu CRM") contradiz o posicionamento. A Unfold vende um método (UGS) que opera um sistema de growth. Os módulos e projetos especiais existem como expansões coerentes do sistema, não como menu de serviços avulsos.
Implicação prática: a página de Serviços (no PRD do Matheus) deve ser substituída por uma página de Atuação ou Método. A categorização por canal (Demand Gen, Social Performance, Inbound, Consultoria) é descartada. A arquitetura de oferta é a estrutura UGS: Diagnóstico → Assessoria principal → Módulos → Projetos especiais.
Princípio 2 — Filtra na entrada, não na saída
Site de assessoria séria afasta o cliente errado em vez de tentar convertê-lo. Atrair tráfego volumoso e qualificar tudo na conversa comercial é desperdício de tempo e desgasta a operação. O site deve ter filtros propositais — em copy, em formulários, em estrutura — que façam o prospect inadequado desistir antes de chegar até a equipe.
Implicação prática: o Diagnóstico de Growth é o exemplo prático desse princípio. CTAs devem comunicar seriedade e processo ("Solicite um Diagnóstico") em vez de facilidade ("Fale conosco"). Copy deve declarar para quem a Unfold é, e implicitamente para quem ela não é.
Princípio 3 — Profundidade nas páginas certas, enxutez no resto
Site de consultoria não precisa ter muitas páginas. Precisa ter as páginas certas, com profundidade adequada nos pontos de decisão. Inflação de páginas (Podcast, Materiais, Ferramentas como hub, Blog com 7 categorias, e por aí vai) comunica volume de produção, não autoridade técnica. A arquitetura final é de 6 páginas principais.
Implicação prática: o mapa do site é radicalmente reduzido em relação ao PRD. Página de Podcast vira seção dentro de Sobre, ou bloco dentro de Cases. Página de Materiais é descartada na v1 (entra na v2 quando houver volume). Página de Ferramentas vira navegação dentro do Diagnóstico de Growth e da Calculadora — não um hub.
Princípio 4 — Uma única ferramenta de captura primária, profunda
Múltiplas ferramentas de captura diluem a jornada e o sinal de fit. O Diagnóstico de Growth é o CTA principal e único do site para conversão de pipeline qualificado. A Calculadora de Investimento × Retorno é mantida, mas como ferramenta secundária, posicionada com clareza dentro da hierarquia de valor.
Implicação prática: o Diagnóstico aparece como CTA principal no Hero, no fim de cada página estruturante, no menu fixo e como página dedicada (/diagnostico). A Calculadora vive em /ferramentas/calculadora-trafego, é mencionada na seção de ferramentas mas não disputa atenção com o Diagnóstico no fluxo principal de conversão.
Princípio 5 — Conteúdo do site representa autoridade técnica do método
Se houver blog ou conteúdo editorial no site, ele publica autoridade técnica do UGS e da liderança da Unfold. Não publica conteúdo amplo de marketing digital, dicas de tráfego, listas genéricas ou guest posts de clientes. Isso vale tanto para o que é produzido na Unfold quanto para o que eventualmente seja migrado da Lighthouse.
Implicação prática: guest posts de clientes (escopo do PRD) são descartados. Workflow de aprovação editorial é mantido, mas para uso interno (autores Unfold com revisão de liderança), não para autores externos. Categorias do blog devem ser orientadas por método (Diagnosticar, Estruturar, Operar, Evoluir) ou por vertical (Construção, Agro, Tech, Automotivo), não por canal.
Princípio 6 — Liderança presente, não protagonista
A marca pessoal do Gabriel Calheiros é o ativo de aquisição mais forte da Unfold hoje, e essa presença deve ser preservada e ampliada — mas fora do site institucional. Dentro do site, a Unfold é protagonista. O Gabriel aparece como liderança técnica e autoria do método, em formato discreto e institucional, sem foto-de-headline, sem assinaturas em destaque, sem narrativa pessoal aspiracional.
Implicação prática: página Sobre tem um bloco de Liderança com foto profissional, nome, cargo (Partner & Diretor de Marketing) e 2-3 linhas factuais. Link sutil para o LinkedIn pessoal. Em outras páginas, presença é apenas funcional (assinatura no rodapé, contato direto). O LinkedIn é o palco da marca pessoal — não o site.
Princípio 7 — Cada página tem uma função comercial clara
Site de consultoria não é portfólio decorativo. Cada uma das 6 páginas tem um objetivo comercial mensurável e uma jornada definida. Páginas que não cabem nesse critério não entram no escopo da v1.
Implicação prática: ver mapa de páginas detalhado na seção 5. Cada página tem objetivo, jornada do visitante e blocos definidos. Páginas "institucionais por institucionalidade" (Manifesto, Cultura, Trabalhe Conosco) ou são integradas em /sobre como blocos, ou ficam fora da v1.
Princípio 8 — Stack proporcional ao problema
A escolha técnica deve servir ao produto, não o contrário. Stack pesada (CMS headless completo, multi-idioma, observabilidade nível enterprise, duas APIs de IA, captura de screenshot, fila com retry, fila de email) faz sentido para um produto digital em crescimento. Faz menos sentido para um site institucional de assessoria com 6 páginas e 1 ferramenta de captura. Cada item da stack deve ser justificado pelo retorno que entrega no produto v1.
Implicação prática: a decisão técnica final é do Matheus, e este Brief não impõe stack. Mas é direcional: avaliar se Payload + PostgreSQL + Vercel + Railway + Sentry + Upstash + Tavily + ScreenshotOne + Resend + Turnstile é realmente necessário na v1. Versões mais enxutas (Webflow + Tally + Make/Zapier + RD/Kommo + Calendly) podem entregar o mesmo resultado em menos tempo. A pergunta é: a stack escolhida prepara um produto futuro, ou está superdimensionada?
Princípio 9 — Internacionalização entra na v2
A Unfold opera no Brasil, com clientes brasileiros, em verticais brasileiros (Construção, Agro). Não há demanda internacional concreta. Implementar PT-BR + EN no lançamento é custo de desenvolvimento e de manutenção de tradução para audiência inexistente. Internacionalização é descartada da v1 e reavaliada quando houver tração internacional comprovada.
Implicação prática: next-intl, hreflang, switcher de idioma, traduções no painel — tudo descartado da v1. Estrutura preserva possibilidade de adicionar depois sem refatoração total.
Princípio 10 — Janela curta, lançamento em 5 a 7 semanas
A janela operacional da cisão da Lighthouse é apertada. O CNPJ encerra em maio de 2026. O site precisa estar no ar e operacional dentro dessa janela, não em 11 semanas como prevê o PRD original. O escopo da v1 é deliberadamente reduzido para caber nessa janela. Tudo que não for essencial à v1 entra em v2.
Implicação prática: ver roadmap revisado na seção 10.

5. Mapa de páginas final
5.1. Estrutura geral
O site da Unfold é composto por 6 páginas principais e 1 página-produto (o Diagnóstico de Growth). Páginas utilitárias padrão (política de privacidade, termos, 404) acompanham, mas não entram no fluxo de conversão.
URL
Página
Objetivo principal
/
Home
Comunicar tese, posicionamento, prova social e direcionar para o Diagnóstico
/metodo
Método (UGS)
Aprofundar o método proprietário e diferenciar de agências/consultorias genéricas
/atuacao
Atuação
Mostrar profundidade vertical em Construção, Agro, Tecnologia e Automotivo
/cases
Cases
Provar resultado real através de cases reescritos sob o framework UGS
/sobre
Sobre
Dar rosto institucional à marca, com presença discreta da liderança
/diagnostico
Diagnóstico de Growth
CTA único principal — converter intenção em lead qualificado via diagnóstico guiado em 2 etapas
/ferramentas/calculadora-trafego
Calculadora
Ferramenta secundária — captura lead com perfil mais tático, alimenta nutrição
5.2. Detalhamento por página
5.2.1. Home (/)
Objetivo único: converter visitante qualificado para o Diagnóstico de Growth depois de comunicar tese, método e prova social em menos de 90 segundos.
Estrutura sequencial (top → bottom):
Header fixo — logo, navegação principal (Método, Atuação, Cases, Sobre), CTA secundário Solicite um Diagnóstico no canto direito
Hero — headline carregando a tese, subheadline explicando o quê e como, CTA primário de Diagnóstico
Big numbers — três números (R$ 75MM, R$ 850k, 25k conteúdos) como prova quantitativa
Logos de clientes — 11 logos selecionados, harmonizados em monocromia
Tese e problema do mercado — as 5 dores reformatadas em bloco visual, encerrando com transição para o método
UGS em destaque — bloco visual com os 4 pilares + CTA Conheça o método completo
Verticais de atuação — 4 blocos (Construção, Agro, Tech, Automotivo) com micro-ângulo + CTA por vertical
Cases destaque — 3 cases em grid com resultado quantitativo + CTA Ver todos
Certificações e parcerias — Meta, Kommo, RD, ABRADI em discreto
CTA final forte — bloco de conversão dedicado com headline forte + Diagnóstico
Footer — contato, endereço, redes sociais, link para LinkedIn da liderança
Princípio de copy: cada seção deve poder ser lida isoladamente e ainda assim gerar vontade de clicar no CTA. Visitantes B2B sérios escaneiam, não leem em sequência. Não construa dependência linear.
5.2.2. Método (/metodo)
Objetivo: transformar curiosidade em convicção. Esta é a página que um prospect vai ler inteira quando estiver avaliando seriamente contratar. É a página que mais reforça posicionamento e mais diferencia a Unfold de agências e de consultorias genéricas.
Estrutura:
Hero da página — título Unfold Growth System ®, subtítulo posicional
Tese do método — texto curto e afiado, no formato de manifesto
Os 4 pilares em profundidade — uma seção por pilar (Diagnosticar, Estruturar, Operar, Evoluir), cada uma com pergunta central, função, o que acontece dentro, output esperado
Diagrama integrador do UGS — visual mostrando como os 4 pilares se conectam em sistema único
O que o UGS não é — bloco de diferenciação (não é growth hacks, não é tráfego com outro nome, não é metodologia genérica)
Como o UGS conecta marketing, vendas, CRM e automação — diagrama das 4 camadas operando integradas
Quando faz sentido aplicar o UGS — bloco de qualificação que espelha as dores do ICP
CTA de Diagnóstico
Direcional visual: esta é a página onde o UGS como ativo visual brilha. Deve ter pelo menos 1-2 diagramas bem desenhados mostrando o sistema em funcionamento. Não é decoração — é evidência de que existe método real.
5.2.3. Atuação (/atuacao)
Objetivo: mostrar profundidade vertical sem criar 4 páginas separadas. Uma única página com 4 abas ou seções âncoradas.
Estrutura:
Hero — título e parágrafo institucional sobre atuação em vendas complexas
Seletor de vertical — tabs ou cards clicáveis com destaque para Construção e Agro
Seção por vertical (4 vezes, mesma estrutura) — ângulo específico, principais dores, como a Unfold aborda, mini-cases ou logos, CTA contextualizado
Nota de rodapé sobre verticais não listados (indústria, outros segmentos B2B)
Por que uma página única: quatro páginas separadas comunicariam generalismo. Uma página com seções profundas comunica especialização com abrangência, e é muito mais fácil de manter.
5.2.4. Cases (/cases)
Objetivo: provar que o método gera resultado. É aqui que o prospect em estágio final de avaliação vai passar mais tempo.
Estrutura:
Hero — título, subtítulo com big numbers
Grid de cases — 4 a 6 cards com logo, vertical, headline de resultado quantitativo
Página individual de case (/cases/[slug]) — contexto inicial, pilares trabalhados, ações executadas, resultados, depoimento, CTA
Filtro por vertical — opcional para v1, pode entrar em v2
Nota crítica: os cases herdados da Lighthouse precisam ser reescritos no framework UGS. Não basta colar dados antigos com a nova marca. Cada caso precisa mapear os pilares trabalhados e as ações executadas dentro do método. Isso é trabalho de conteúdo, listado no checklist da seção 8.
5.2.5. Sobre (/sobre)
Objetivo: dar rosto institucional à Unfold sem virar showcase pessoal. É aqui que a ponte discreta com a marca pessoal acontece.
Estrutura:
Hero — título institucional
Por que a Unfold existe — narrativa curta, 2-3 parágrafos
No que acreditamos — 5-6 princípios em formato de lista
Liderança — bloco discreto com foto profissional, nome, cargo, 2-3 linhas factuais, link para LinkedIn
Time — opcional, formato de cargos sem fotos individuais é suficiente
Certificações e parcerias
Onde estamos — endereço físico em Maceió, atuação nacional
CTA discreto de Diagnóstico
5.2.6. Diagnóstico de Growth (/diagnostico)
Objetivo: converter intenção em lead qualificado. É a página mais importante para o pipeline.
Estrutura:
Hero — título Diagnóstico de Growth, subtítulo explicando o que é
O que você vai receber — 3 bullets curtos
Para quem faz sentido — filtro propositivo declarando ICP
Formulário da Etapa 1 (7 campos)
O que acontece depois — linha do tempo visual
FAQ curto — 4-5 perguntas objetivas
Footer reduzido — sem navegação completa
Especificação detalhada do diagnóstico em duas etapas (Etapa 1: 7 campos de qualificação; Etapa 2: 12 perguntas guiadas mapeadas nos 4 pilares do UGS) está documentada em material separado já produzido. O Matheus deve ter acesso a esse material para a especificação técnica final do componente.

6. Diagnóstico de Growth — resumo estratégico
6.1. O que é
O Diagnóstico de Growth é o CTA principal único do site para captura de leads qualificados. É uma experiência guiada em duas etapas que entrega ao prospect um panorama estruturado da própria operação, classificada nos 4 pilares do UGS, e convida (com filtro) a uma conversa com a equipe.
6.2. Por que é estratégico
Três funções simultâneas que um formulário simples não cumpre:
Entrega valor antes de vender. O prospect que termina o diagnóstico recebe, no mínimo, um espelho estruturado da própria operação. Isso é uma micro-experiência do UGS — ele sente o método antes de contratar.
Qualifica por profundidade, não só por dados. Quem responde 12 perguntas sobre a própria operação está comprometido. Afasta curiosos automaticamente.
Gera inteligência de mercado. Cada diagnóstico preenchido é dado sobre o estado do mercado B2B em vendas complexas. Em 6 meses, base própria de benchmarking.
6.3. Estrutura geral
A experiência opera em duas etapas:
Etapa 1 — Qualificação rápida (~60 segundos)
Formulário de 7 campos:
Nome completo
E-mail corporativo (validação automática bloqueando domínios pessoais)
Empresa
Cargo
Setor (single-select com 7 opções: Construção, Agro, Tech/SaaS, Indústria, Automotivo, Serviços B2B, Outro)
Faturamento anual aproximado (faixas)
Uso atual de CRM ou plataforma de automação de marketing
Ao submeter: lead capturado no CRM com tags de origem e setor. Usuário direcionado para Etapa 2.
Etapa 2 — Diagnóstico guiado (~5-7 minutos)
12 perguntas agrupadas nos 4 pilares do UGS, em formato gamificado tipo Typeform (uma pergunta por tela, progresso visível). Estrutura:
Pilar 1 — Diagnosticar (3 perguntas): ticket médio, ciclo de vendas, gargalo principal percebido
Pilar 2 — Estruturar (3 perguntas): relação marketing-vendas, qualificação de leads, uso de CRM
Pilar 3 — Operar (3 perguntas): canais ativos, proporção marketing vs. relacionamento, rotina de análise
Pilar 4 — Evoluir (3 perguntas): estágio, prioridade dos próximos 6 meses, avaliação de assessoria
Tela final — Resultado personalizado
Resultado em três blocos:
Panorama visual — classificação da empresa nos 4 pilares (Em construção, Em operação, Em otimização)
Insight curto e personalizado — 3-5 linhas que variam conforme combinação de respostas (8-12 variações pré-escritas)
CTAs — calendário integrado para agendar conversa, ou receber diagnóstico completo por e-mail
O calendário aparece para todos os perfis (decisão estratégica), mas a apresentação varia conforme score de fit: fit alto vê calendário em destaque, fit médio vê botão padrão, fit baixo vê calendário disponível mas não em destaque.
6.4. Scoring matrix
Cada resposta da Etapa 2 tem peso pré-definido que alimenta nota de 0 a 10 em cada pilar. Faixas:
0 a 3.9: Em construção
4.0 a 6.9: Em operação
7.0 a 10: Em otimização
Score de fit comercial calculado adicionalmente, combinando faturamento, ticket, prontidão (Pilar 4) e gap de estrutura (Pilar 2). Define qual versão da tela final o usuário vê.
Especificação completa da scoring matrix (tabelas de pontos por resposta, fórmulas, exemplos de cálculo) está documentada em material separado de produto, já produzido. O Matheus deve receber esse material para implementação.
6.5. Implicações para o PRD
Pontos do PRD original (seção 5.2 Diagnóstico de Maturidade Digital) que precisam ser revistos:
Nome — passa a ser Diagnóstico de Growth, não Diagnóstico de Maturidade Digital
Estrutura — 12 perguntas em 4 pilares do UGS, não em 4 dimensões genéricas (Aquisição/Conversão/Retenção/Dados)
Especificação — fluxo, perguntas, opções de resposta e scoring matrix já produzidos em material à parte. Não precisa ser inventado.
Tela final — 8-12 variações de insight personalizadas (lógica condicional simples, não IA em tempo real)
Calendário — integrado para todos os perfis, com apresentação variável conforme score de fit

7. Calculadora de Investimento × Retorno em Tráfego
7.1. Decisão estratégica
A Calculadora será mantida no escopo da v1, conforme decisão estratégica. Esta seção define como ela se posiciona dentro da arquitetura geral e do posicionamento da Unfold, para evitar que ela se torne ruído narrativo no site.
7.2. Posicionamento da ferramenta dentro do site
A Calculadora é uma ferramenta secundária, não primária. Sua função é capturar leads com perfil de operação mais tática (já investem em mídia, querem dimensionamento) e alimentar nutrição. Não disputa atenção com o Diagnóstico no fluxo principal de conversão.
Hierarquia clara dentro do site:
Diagnóstico de Growth: CTA principal único. Aparece no Hero, no menu fixo, no fim de cada página estruturante.
Calculadora: ferramenta secundária. Aparece em /ferramentas/calculadora-trafego (URL própria), pode ser mencionada em Atuação por vertical, mas não compete com o Diagnóstico no Hero ou na navegação principal.
7.3. Fluxo e especificação
A especificação técnica definida no PRD original (seção 5.1) é mantida com pequenos ajustes:
Fluxo multi-step preservado (Identificação, Contexto, Metas, Operação)
Lógica de IA preservada (Claude com web search habilitado, prompt versionado, retorno em JSON estruturado)
Resultado preservado (investimento recomendado, leads esperados, clientes/mês, faturamento projetado, payback, diagnóstico textual)
Rate limiting e cache preservados
Side-effects de CRM preservados
7.4. Ajuste estratégico de copy
Para evitar conflito com o posicionamento Growth não é canal — é sistema, o copy da página da Calculadora deve enquadrar a ferramenta como leitura inicial de um aspecto operacional, não como entrega de uma estratégia completa de crescimento. Algumas direções:
Headline da página deve evitar promessas como descubra como crescer com tráfego ou estratégia completa de tráfego pago
Subheadline pode posicionar como ponto de partida tático, não plano completo. Exemplo direcional: Dimensione o investimento em tráfego para sustentar uma meta comercial. É um cálculo inicial — sua estratégia completa pede mais que isso.
Resultado deve ter, ao final, um bloco que explicite o limite da ferramenta e ofereça ponte para o Diagnóstico de Growth: Esse cálculo te dá um número. Mas tráfego é só uma das engrenagens. Para entender o sistema completo de crescimento da sua operação, faça o Diagnóstico de Growth.
Evitar linguagem de descoberta milagrosa (descubra agora, em 2 minutos), preferir linguagem técnica (calcule, dimensione, projete)
7.5. Pontos de atenção
Riscos a monitorar pós-lançamento:
Volume de leads da Calculadora vs. volume do Diagnóstico — se a Calculadora gerar muito mais lead, é sinal de que está consumindo atenção que deveria ir para o Diagnóstico, e a hierarquia precisa ser revista
Taxa de conversão lead Calculadora → cliente Unfold — se for muito menor que do Diagnóstico, confirma que o perfil de lead da Calculadora é menos qualificado, e deve entrar em fluxo de nutrição mais longo
Custos de IA — monitorar custo médio por lead capturado pela Calculadora, ajustar prompts e rate limits conforme necessário

8. Estratégia de conteúdo do site
8.1. Princípios gerais de copy
Antes de qualquer copy específica de página, alguns princípios de tom e voz que devem ser respeitados em todo o site:
Tom técnico, não comercial. Consultor sênior falando com par, não vendedor convencendo cliente.
Frases curtas, parágrafos curtos. Visitantes B2B escaneiam.
Sem jargão de coach, sem clichê de marketing digital, sem hype de growth hacks.
Sentenças declarativas. Evitar perguntas retóricas ("Você sabia que...?", "Já parou pra pensar?").
Sem auto-elogio aspiracional. Não escrever "somos os melhores em X". Mostrar com fato.
Sem promessa numérica genérica ("3x mais leads", "até 200% de crescimento"). Provas vêm de cases reais com contexto.
Verbos no presente, voz ativa. Não "é feito", e sim "fazemos".
Vocabulário próprio repetido. Termos como sistema, método, integração, previsibilidade, estrutura, operação devem aparecer com frequência. Termos como engajamento, presença, alcance, visibilidade devem ser raros.
8.2. Direcionais por página
8.2.1. Home — direcional de copy
Headline: deve carregar a tese central com uma única frase declarativa. Direcionais possíveis:
Organizamos crescimento em operações com vendas complexas.
Estruturamos sistemas de crescimento para empresas de vendas complexas.
Crescimento com método, integração e previsibilidade.
Critério: a headline deve ser específica o suficiente para diferenciar a Unfold de qualquer agência, e geral o suficiente para abranger todos os ICPs prioritários.
Subheadline: deve explicar o quê e o como de forma operacional. Direcional:
Assessoria de growth que conecta marketing, vendas, CRM e automação em um sistema integrado, previsível e orientado a resultado comercial.
CTA do Hero: Solicite um Diagnóstico de Growth
Bloco de problema do mercado: as 5 dores devem aparecer como afirmações curtas, não como perguntas. Não é "Seu CRM está mal utilizado?", é "CRM mal utilizado". O visitante reconhece a dor sem precisar admitir.
CTA final: bloco de conversão com headline de transição forte. Direcional:
Você já tem marketing e vendas. Falta o sistema que conecta tudo.
8.2.2. Método — direcional de copy
Hero: título Unfold Growth System, subtítulo posicional curto. Direcional:
Nosso método para estruturar crescimento em empresas com vendas complexas.
Tese do método: parágrafo curto e afiado. Direcional:
Crescimento não é a soma de ações isoladas de marketing. É o resultado da organização de um sistema. O Unfold Growth System organiza esse sistema em quatro movimentos integrados — diagnosticar, estruturar, operar e evoluir — conectando marketing, vendas, CRM e automação em uma lógica única.
Cada um dos 4 pilares deve ser apresentado com a mesma estrutura:
Pergunta central — a pergunta que o pilar responde
Função — o que o pilar faz
O que acontece dentro — atividades concretas
Output esperado — o que o pilar entrega ao próximo
Bloco O que o UGS não é: declaração direta. Direcional:
UGS não é growth hacks. Não é tráfego com outro nome. Não é metodologia genérica de marketing. É um método que organiza a operação comercial em sistema, voltado especificamente para empresas com vendas complexas.
8.2.3. Atuação — direcional de copy
Hero: título institucional. Direcional:
Como atuamos em operações de vendas complexas.
Para cada vertical, o ângulo específico deve declarar a dor central daquele setor sem genericamente listar serviços. Direcionais já validados no consolidado estratégico:
Construção: o gargalo não está apenas em gerar contatos, mas em reduzir atrito entre captação, validação técnica e avanço comercial. Foco: funil, CRM, sales enablement, previsibilidade, comitê de compra.
Agro: crescimento não pode depender apenas de relação presencial, memória comercial e esforço de campo desorganizado. Foco: CRM, inteligência comercial, previsibilidade, organização da captação, eficiência da força de vendas.
Tecnologia: o problema não é apenas gerar pipeline, mas evitar que dados, CRM, marketing e revenue motions operem em silos. Foco: dados, eficiência, integração, automação, operação orientada por indicadores.
Automotivo: o problema não é só captar lead rápido, mas transformar captação em atendimento estruturado, CRM ativo e melhor aproveitamento comercial. Foco: CRM, esteiras de resposta, tempo de atendimento, qualidade do lead, integração com operação.
8.2.4. Cases — direcional de copy
Hero: título com tese implícita. Direcional:
Resultados gerados por sistema, não por sorte.
Estrutura de cada case (página individual):
Identificação — cliente, vertical, período de trabalho
Contexto inicial — onde a operação estava (1-2 parágrafos descritivos, sem floreio)
O que foi estruturado — quais pilares do UGS, quais ações concretas (mapeamento explícito ao método)
Resultados — números reais com contexto (taxa de crescimento, ticket, pipeline, conversão)
Depoimento — opcional, somente quando autêntico e relevante
CTA — sempre Diagnóstico
Princípios de redação de case:
Sempre mapear ações ao UGS. Sem isso, o case vira descrição de serviço de agência.
Números com contexto. "+340% em pipeline" não significa nada se não houver volume base e período.
Descrever o problema do cliente em vocabulário do cliente, e a solução em vocabulário Unfold.
8.2.5. Sobre — direcional de copy
Hero: título institucional. Direcional:
Uma assessoria de growth para empresas que levam crescimento a sério.
Por que a Unfold existe: 2-3 parágrafos curtos. Direcional:
A Unfold existe porque muitas empresas já investem em marketing e vendas, mas ainda operam crescimento de forma fragmentada. Marketing isolado não resolve. Tráfego isolado não resolve. Mais ferramentas, sem método, não resolvem. O nosso papel é organizar a operação com clareza, integração e estrutura — transformando esforço disperso em sistema.
Bloco Liderança: foto profissional, nome, cargo, 2-3 linhas factuais. Sem auto-elogio. Sem "apaixonado por growth". Direcional:
Gabriel Calheiros — Partner & Diretor de Marketing. [X] anos estruturando operações de growth e vendas complexas para empresas em [verticais relevantes]. Liderança técnica do Unfold Growth System.
8.2.6. Diagnóstico — direcional de copy
Hero: título e subtítulo claros. Direcional:
Diagnóstico de Growth — uma análise estruturada do seu sistema de crescimento atual, baseada nos 4 pilares do Unfold Growth System.
O que você vai receber: 3 bullets concretos.
Classificação da sua operação nos 4 pilares do UGS (Diagnosticar, Estruturar, Operar, Evoluir)
Identificação do pilar que mais trava seu crescimento hoje
Recomendações iniciais de estrutura e priorização
Para quem faz sentido: declaração direta de ICP. Direcional:
Empresas com marketing e vendas já rodando. Ticket médio acima de R$ 5 mil. Ciclo de vendas consultivo. Operação B2B com vendas complexas.
8.3. Tratamento dos cases herdados
Os cases herdados da Lighthouse não devem ser migrados em massa. Cada case precisa passar por:
Aprovação formal do cliente para uso sob a marca Unfold (negociação que o GC conduz)
Reescrita no framework UGS — mapear quais pilares foram trabalhados, quais ações concretas, quais resultados em qual contexto
Validação dos números — garantir que os resultados podem ser publicados (alguns clientes exigem ocultar valores absolutos)
Curadoria final — selecionar 4 a 6 cases prioritários para v1, restantes ficam para v2
8.4. Decisão sobre o blog
Recomendação para v1: o blog não estreia com a importação dos 78 posts da Lighthouse. Estreia com 5 a 10 posts novos da Unfold, todos sob a nova narrativa, organizados por categoria coerente com o método (pilares do UGS) ou por vertical.
Posts da Lighthouse que sobrevivem à curadoria são reformatados (novo SEO, nova categoria, novos CTAs internos) e migrados individualmente. Posts que não sobrevivem ou ficam fora ou são arquivados (acessíveis por URL antiga até serem desindexados).
Categorias propostas para o blog Unfold:
Diagnosticar — conteúdo sobre análise de operação, leitura de funil, identificação de gargalos
Estruturar — conteúdo sobre CRM, qualificação, integração marketing-vendas, processos
Operar — conteúdo sobre canais, rotinas, indicadores
Evoluir — conteúdo sobre otimização, expansão, casos de evolução
Por vertical (opcional) — Construção, Agro, Tech, Automotivo, com conteúdo específico de cada
Notas adicionais sobre o blog:
Workflow de aprovação editorial é mantido para uso interno (autores Unfold com revisão de liderança), não para autores externos / guest posts
Cadência inicial sugerida: 1-2 posts por mês de alta qualidade, não 1-2 por semana de baixa qualidade
Cada post deve ter CTA contextualizado para o Diagnóstico, não "fale conosco" genérico

9. Decisões sobre o legado da Lighthouse
9.1. Comunicação institucional da transição
A transição Lighthouse → Unfold precisa ser comunicada formalmente para os públicos de relacionamento. Isso é parte do escopo do projeto, não acontece automaticamente quando o site sobe.
Plano sugerido de comunicação:
Clientes ativos (6 contas): comunicação 1-1 anterior ao lançamento público, com nova proposta de contrato sob a Unfold e explicação da transição
Parceiros estratégicos (Meta, Kommo, RD, ABRADI, fornecedores audiovisuais): comunicação direta antes do lançamento, garantindo migração de credenciais e parcerias
Mercado e prospects em pipeline: lançamento público coordenado — post da liderança no LinkedIn, e-mail para base, comunicado formal
Imprensa setorial (se aplicável): release com tese da nova marca para veículos relevantes
9.2. Domínio e SEO
Decisões sobre o domínio agencialighthouse.com:
Manter o domínio ativo por pelo menos 6-12 meses pós-lançamento da Unfold, com redirect 301 para unfoldgrowth.com.br (ou para a página de transição interna)
Página de transição opcional: site da Lighthouse exibe banner explicando a evolução para Unfold, com link direto. Reduz churn de tráfego em buscas por marca antiga
Redirects 301 individuais apenas dos posts/páginas que sobrevivem à curadoria. URLs descartadas redirecionam para a raiz ou para 404 amigável
9.3. Infraestrutura digital
Inventário a fazer e migrar:
Domínios — agencialighthouse.com (manter), unfoldgrowth.com.br (ativar como principal)
E-mails — migração de @agencialighthouse.com para @unfoldgrowth.com.br para todo o time, com forward por 6 meses
Redes sociais — avaliação caso a caso. LinkedIn da Lighthouse pode ser convertido para a Unfold (preserva seguidores). Instagram, se houver, idem
Google Business Profile — atualizar nome, endereço, categoria
Diretórios setoriais (Reclame Aqui, parceiros) — atualizar
Contas de mídia (Meta Business, Google Ads, LinkedIn Ads) — migrar BMs para a Unfold ou criar novas conforme estratégia
CRM atual (se houver) — exportar dados, importar na nova ferramenta da Unfold
Ferramentas de marketing (RD Station, Kommo, etc.) — renovação de contrato sob CNPJ Unfold
9.4. Cases — workflow de migração
Para cada case herdado, o workflow é:
Lista inicial — selecionar os 8 a 10 cases mais relevantes para os verticais prioritários
Aprovação do cliente — contato formal explicando a transição e pedindo autorização
Coleta de dados atualizados — números reais de resultado, contexto inicial, ações executadas
Reescrita UGS — mapear ao método, escrever em tom Unfold
Aprovação editorial — revisão da liderança
Publicação — entrar no /cases sob a nova marca
Estimativa de esforço: 2-3 horas por case bem feito. Para 4-6 cases na v1, ~12-18 horas de trabalho de conteúdo. Pode ser feito em paralelo ao desenvolvimento técnico do site.

10. Roadmap revisado
10.1. Janela e contexto
O CNPJ da Lighthouse é encerrado em maio de 2026. O site da Unfold precisa estar operacional dentro dessa janela. O roadmap original do PRD prevê 11 semanas, o que extrapola a janela disponível. Roadmap revisado prevê 5 a 7 semanas, com escopo enxuto da v1.
Fase
Semana
Entregas principais
F1
1
Setup técnico, design tokens, decisão final de stack, decisão de CRM, conteúdo institucional draft (Home, Sobre, Método)
F2
2
Páginas estáticas (Home, Sobre, Método, Atuação) — build + copy refinada + integração com identidade visual
F3
3
Página de Cases + reescrita dos 4-6 cases prioritários no framework UGS + aprovação dos clientes
F4
4
Diagnóstico de Growth — Etapa 1 e Etapa 2 (lógica condicional, scoring matrix, variações de insight, calendário integrado)
F5
5
Calculadora + integração CRM (Kommo/RD) + fluxos de e-mail + nutrição básica + LGPD + analytics
F6
6
QA + Lighthouse + redirects + soft launch para liderança, parceiros estratégicos e clientes ativos (validação privada)
F7
7
Ajustes pós-soft-launch + lançamento público coordenado (LinkedIn da liderança + comunicação de transição + ativação)
10.2. O que entra na v2
Tudo que está no PRD original e que foi descartado ou adiado neste Brief é candidato à v2 do site, conforme tração e prioridade do GTM:
Blog completo com migração curada da Lighthouse
Página de Podcast (se a estratégia priorizar esse canal)
Hub de Materiais ricos (e-books, templates, planilhas) com fluxo de captura próprio
Auditoria de LP com IA (se houver demanda comprovada)
Internacionalização (PT-BR + EN)
Páginas individuais por vertical (em vez de seções na página /atuacao)
Filtros avançados em Cases e Blog
10.3. Marcos críticos
Pontos de não-negociação no cronograma:
Soft launch deve acontecer antes do encerramento formal do CNPJ Lighthouse
Comunicação 1-1 com os 6 clientes ativos deve acontecer antes do soft launch
Reescrita dos cases deve estar concluída antes do go-live público (não pode ir ao ar com cases incompletos)
Diagnóstico de Growth deve ter pelo menos 10 testes end-to-end de QA antes do go-live

11. Pontos do PRD original que precisam de revisão
Esta seção é o checklist de pontos do PRD v1.0 que precisam ser ajustados na v2 à luz deste Brief. Está organizada por seção do PRD, em formato de Recomendação para revisão. O Matheus tem autonomia técnica plena para decidir como incorporar (ou questionar) cada item — esta é uma sugestão estratégica, não uma imposição.
11.1. Seção 1 (Visão e Contexto)
Reescrever 1.1 e 1.2 explicitando: a Unfold é uma nova entidade, não um rebrand da Lighthouse. O encerramento do CNPJ Lighthouse acontece em maio de 2026.
Revisar 1.3 (Objetivos): adicionar Comunicar transição com sucesso e preservar relacionamentos comerciais como objetivo formal. A métrica seria conversão dos 6 clientes ativos para contratos Unfold.
Revisar 1.4 (Não-objetivos): explicitar que internacionalização (PT-BR + EN) sai do escopo da v1.
11.2. Seção 4 (Arquitetura de Informação)
Reescrever 4.1 (Mapa do Site) com a estrutura de 6 páginas + Diagnóstico + Calculadora. Remover páginas /servicos (todas as variações), /materiais, /podcast, /ferramentas como hub. Estes ficam para v2.
Reescrever 4.2.1 (Home) com a estrutura de blocos definida na seção 5.2.1 deste Brief.
Substituir 4.2.4 (Serviços) por 4.2.4 (Atuação por vertical) com a estrutura de seção única e abas verticais.
Reescrever 4.2.7 (Materiais) — fora da v1.
Reescrever 4.2.8 (Ferramentas) — passa a ser apenas a Calculadora em URL própria, com link direto. Não é hub.
11.3. Seção 5 (Funcionalidades)
Reescrever 5.1 (Calculadora) com os ajustes de copy descritos na seção 7.4 deste Brief. Estrutura técnica preservada.
Reescrever 5.2 (Diagnóstico) — passa a se chamar Diagnóstico de Growth, com 12 perguntas em 4 pilares do UGS conforme especificação detalhada já produzida em material à parte.
Remover 5.3 (Auditoria de LP com IA) — descartada da v1.
Remover ou adiar 5.4 (Materiais ricos) — fora da v1.
Reescrever 5.7 (Blog com Guest Posts) — workflow editorial mantido para uso interno; guest posts de clientes externos descartados. Categorias revistas conforme seção 8.4 deste Brief.
Adiar 5.9 (Multi-idioma) — fora da v1.
11.4. Seção 8 (Requisitos Não-Funcionais)
Esta seção do PRD está bem dimensionada e pode ser preservada quase integralmente. Ajustes pontuais:
8.6 (Observabilidade) — Sentry + alertas pode ser dimensionado proporcionalmente ao tráfego inicial. Plano enterprise é overkill para v1.
8.5 (LGPD) — preservar inteiramente. Bem coberto.
8.2 (SEO) — preservar, com nota de que redirects 301 são pontuais (apenas dos URLs preservados), não automáticos para os 78 posts.
11.5. Seção 10 (Migração e Conteúdo Inicial)
Reescrever 10.1 — não há importação automática de blog. Migração é curada, posts são reescritos e individualmente reaprovados.
Reescrever 10.2 — adicionar reescrita de cases no framework UGS como item explícito, com estimativa de esforço.
11.6. Seção 11 (Roadmap)
Substituir o roadmap de 11 semanas pelo roadmap revisado de 7 semanas (seção 10 deste Brief).
11.7. Pontos preservados sem revisão
Essas seções do PRD estão bem estruturadas e devem ser preservadas em sua maior parte. Servem de fundação técnica sólida e refletem boa engenharia:
Seção 2 (Identidade Visual) — preservada integralmente, alinhada com a APR V2
Seção 3 (Stack Técnica) — preservar com revisão crítica conforme Princípio 8 deste Brief: a stack escolhida prepara um produto futuro, ou está superdimensionada para a v1? A decisão final é do Matheus.
Seção 5.10 (CRM com adapter pattern) — preservada, é boa arquitetura
Seção 5.8 (Painel Admin) — preservada com escopo reduzido às collections que fazem sentido na v1 (Páginas, Cases, Diagnóstico/AIPrompts, Calculadora/AIPrompts, Leads, Mídia, Globais)
Seção 8 (Requisitos Não-Funcionais) — preservada quase integralmente
Seção 12 (Riscos e Mitigações) — preservada
Seção 13 (Métricas e KPIs) — preservada com adição dos KPIs estratégicos descritos na seção 13 deste Brief

12. Apêndice — definições e referências
12.1. Glossário Unfold
UGS — Unfold Growth System: método proprietário da Unfold para estruturar crescimento em empresas com vendas complexas. Quatro pilares integrados: Diagnosticar, Estruturar, Operar, Evoluir.
Diagnóstico de Growth: ferramenta de captura principal do site. Experiência guiada em duas etapas (qualificação rápida + 12 perguntas mapeadas no UGS). Entrega panorama personalizado e direciona para conversa comercial.
Vendas complexas: modelo de venda B2B com ticket médio alto, ciclo longo (geralmente 60+ dias), múltiplos decisores e processo consultivo. Caracteriza o ICP da Unfold.
Sistema de growth: estrutura integrada que conecta marketing, vendas, CRM, automação e inteligência comercial em uma lógica única, em oposição a operações fragmentadas em silos.
Arquitetura de oferta: estrutura comercial da Unfold em 4 camadas — Diagnóstico (entrada) → Assessoria principal (núcleo) → Módulos de crescimento (expansão) → Projetos especiais (ativos pontuais).
12.2. Documentos relacionados
Este Brief é parte de um conjunto de documentos estratégicos da Unfold. Para contexto completo, consultar:
Plataforma Estratégica e Comercial Consolidada da Unfold — documento mestre de posicionamento, tese, ICP e arquitetura de oferta
Pitch e Portfólio Comercial da Unfold — material de apresentação comercial, com narrativa de vendas e provas
APR V2 — Identidade Visual da Unfold — sistema visual aprovado (paleta, tipografia, símbolos, padrões gráficos)
Especificação detalhada do Diagnóstico de Growth — fluxo, 12 perguntas, scoring matrix, 9 variações de insight (em material de produto separado)
PRD v1.0 do Site Unfold — autoria do Matheus, versão técnica que este Brief governa estrategicamente
12.3. Histórico de versões deste Brief
Versão 1.0 — 29 de abril de 2026. Documento original, base para revisão da v2 do PRD.
Próximas atualizações esperadas: pós-revisão do PRD pelo Matheus (adicionar pontos de alinhamento), pós-soft-launch (incorporar aprendizados), pós-go-live (ajustes para v2).

— FIM DO BRIEF ESTRATÉGICO —
