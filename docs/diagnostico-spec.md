Diagnóstico de Growth — Especificação de Implementação
Versão: 1.0 Status: Especificação fechada — pronta para implementação técnica Destinatário: Matheus (Analista de Tecnologia e Automações — Unfold) Autor da especificação: Equipe estratégica Unfold


Sumário
Visão geral e objetivo da ferramenta
Fluxo macro do usuário
Etapa 1 — Os 7 campos de qualificação
Etapa 2 — As 12 perguntas do diagnóstico
Sistema de scoring — Camada 1 (eixos do aranha)
Sistema de scoring — Camada 2 (Fit Comercial)
Camada 3 — Padrões cruzados e textos de insight
Caminhos de melhoria e regras de seleção
Tela de resultado — estrutura e conteúdo
Integrações e estrutura de dados
Exemplo end-to-end de simulação


1. Visão geral e objetivo da ferramenta
O Diagnóstico de Growth é o CTA principal e único do site institucional da Unfold para conversão de pipeline qualificado. Não é um quiz de auto-avaliação genérico — é uma micro-experiência do método UGS aplicada ao próprio prospect.

A ferramenta cumpre três funções simultâneas:

Entrega valor real antes de vender — o lead sai com um diagnóstico concreto da própria operação, com dados cruzados, gráfico de maturidade e três caminhos de melhoria prioritários.
Qualifica por profundidade, não só por dados demográficos — afasta curiosos automaticamente, prioriza acesso comercial para leads de fit alto.
Gera inteligência de mercado em formato benchmarkable — toda resposta alimenta uma base de dados estruturada sobre maturidade B2B no Brasil.

A ferramenta opera em três camadas técnicas independentes que rodam em paralelo no momento do cálculo do resultado:

Camada
O que calcula
Onde aparece
1
Score por eixo (5 eixos, 0-100)
Gráfico aranha visual no resultado
2
Score de Fit Comercial (0-100)
Apresentação do CTA de agendamento
3
Padrões cruzados acionados (P1-P8)
Insights personalizados no resultado


2. Fluxo macro do usuário
LANDING DA FERRAMENTA
        │
        ▼
ETAPA 1 — Qualificação (7 campos, ~60s)
        │
        ▼
ETAPA 2 — Diagnóstico (12 perguntas, ~5min)
  • Barra de progresso visível (X/12)
  • Microcopy de transição entre pilares
  • Sem preview do resultado
        │
        ▼
TELA DE PROCESSAMENTO (3-5s)
  "Analisando suas respostas..."
  "Cruzando dados com o método UGS..."
  "Montando seu diagnóstico..."
        │
        ▼
TELA DE RESULTADO (página única, scroll vertical)
  Bloco 1 — Cabeçalho personalizado
  Bloco 2 — Score consolidado + faixa de maturidade
  Bloco 3 — Gráfico aranha + leitura por eixo
  Bloco 4 — Três insights priorizados (padrões P1-P8)
  Bloco 5 — Três caminhos de melhoria
  Bloco 6 — CTA de agendamento (varia por faixa de Fit)
  Bloco 7 — Footer (PDF + opt-in nutrição)

Princípios do fluxo:

Lead não pode pular perguntas. Todas as 12 são obrigatórias para gerar o resultado.
Lead não vê preview do resultado em nenhum momento antes da tela final.
Resultado é público por URL única (ex: unfold.com.br/diagnostico/r/[hash]) — permite compartilhamento e gera tráfego orgânico, sem expor dados pessoais.
Lead recebe e-mail automatizado com o resultado em PDF, no e-mail informado na Etapa 1, em até 5 minutos após conclusão.


3. Etapa 1 — Os 7 campos de qualificação
A Etapa 1 tem três funções: capturar contato, qualificar estruturalmente e alimentar o cálculo das dimensões de Fit Estrutural e Fit Urgência da Camada 2.
3.1. Especificação dos campos
#
Campo
Tipo
Obrigatório
Opções / Validação
1
Nome completo
Texto livre
Sim
Mínimo 3 caracteres
2
E-mail corporativo
E-mail
Sim
Validação de formato @
3
Empresa
Texto livre
Sim
Mínimo 2 caracteres
4
Cargo
Select
Sim
Ver opções abaixo
5
Setor da empresa
Select
Sim
Ver opções abaixo
6
Faturamento mensal estimado
Select
Sim
Ver opções abaixo
7
Quando você precisa endereçar isso?
Select
Sim
Ver opções abaixo
3.2. Opções dos campos select
Campo 4 — Cargo:

CEO / Sócio / Fundador
Diretor (Marketing, Vendas, Comercial, Operações)
Gerente / Coordenador
Analista / Especialista
Outro

Campo 5 — Setor da empresa:

Construção Civil / Incorporação
Agronegócio / Agroindústria
Tecnologia / SaaS B2B
Automotivo / Concessionárias
Indústria
Serviços B2B
Outro

Campo 6 — Faturamento mensal estimado:

Até R$ 50.000
De R$ 50.000 a R$ 200.000
De R$ 200.000 a R$ 500.000
Acima de R$ 500.000
Prefiro não informar

Campo 7 — Quando você precisa endereçar isso?

Neste trimestre
Nos próximos 6 meses
Sem prazo definido, mas é prioridade
Estou apenas pesquisando
3.3. Regras de UX da Etapa 1
Todos os 7 campos aparecem em uma única tela (não fragmentar — Etapa 1 é o filtro de entrada).
Microcopy de abertura: "Para começar, precisamos entender o contexto da sua operação. Leva menos de 1 minuto."
Botão de avanço: "Iniciar diagnóstico".
Lead que sai aqui é considerado lead frio (qualificou-se até abertura, mas não completou diagnóstico).


4. Etapa 2 — As 12 perguntas do diagnóstico
A Etapa 2 contém 12 perguntas fechadas, distribuídas pelos 4 pilares do UGS. Cada pergunta tem 4 alternativas (A/B/C/D), com exceção da Q4 que tem 5 (A/B/C/D/E).

Padrão fixo: alternativa A é sempre a menos madura; D é sempre a mais madura. Esse padrão não pode ser quebrado — a lógica de scoring depende dele.
4.1. Distribuição das perguntas
Pilar
Perguntas
Tipo
Diagnosticar
Q1, Q2
1 autoavaliativa + 1 dado
Estruturar
Q3, Q4, Q5, Q6
2 autoavaliativas + 2 dados
Operar
Q7, Q8, Q9
2 dados + 1 autoavaliativa
Evoluir
Q10, Q11, Q12
1 autoavaliativa + 2 dados

Total: 7 perguntas-dado + 5 autoavaliativas.
4.2. Microcopy de transição entre pilares
Para reduzir drop-off na ausência de preview do resultado, exibir microcopy de transição ao mudar de pilar:

Início (antes de Q1): "Vamos começar entendendo como sua operação enxerga o próprio crescimento."
Antes de Q3 (entrada em Estruturar): "Agora vamos olhar a fundação da sua operação."
Antes de Q7 (entrada em Operar): "Falta pouco. Agora sobre como sua operação executa no dia a dia."
Antes de Q10 (entrada em Evoluir): "Última parte. Vamos falar sobre como sua operação evolui."
4.3. As 12 perguntas

PILAR 1 — DIAGNOSTICAR
Q1. [Autoavaliativa] Como sua empresa identifica hoje o que está travando o crescimento?

A) Crescimento é uma questão de fazer mais — mais leads, mais campanhas, mais esforço comercial.
B) Tenho hipóteses sobre o que trava, mas confesso que são mais intuição do que análise.
C) Olhamos relatórios periodicamente e identificamos gargalos, mas falta método para priorizar o que atacar primeiro.
D) Temos um processo estruturado de leitura do funil que aponta onde estão as perdas e por que elas acontecem.



Q2. [Dado] Você consegue dizer hoje, com confiança, quanto cada canal de aquisição contribuiu para o faturamento dos últimos 12 meses?

A) Não — não temos essa visibilidade.
B) Sei aproximadamente para um ou dois canais principais; o resto é estimativa.
C) Sei para todos os canais principais, mas a leitura ainda envolve cálculo manual.
D) Sim — temos atribuição estruturada e consigo ver isso em dashboard a qualquer momento.


PILAR 2 — ESTRUTURAR
Q3. [Autoavaliativa] Como descreveria o uso de CRM na sua operação?

A) Não temos CRM, ou temos algo improvisado em planilha.
B) Temos CRM, mas o time comercial não alimenta com disciplina.
C) CRM funciona razoavelmente, mas marketing e vendas operam com bases desconectadas.
D) CRM é a engrenagem central da operação comercial — todo lead, todo deal, toda interação passa por ele.



Q4. [Dado] Dos leads gerados por marketing nos últimos 90 dias, qual percentual seu time comercial considerou qualificado para abordagem?

A) Menos de 20%
B) Entre 20% e 40%
C) Entre 40% e 60%
D) Acima de 60%
E) Não tenho como medir isso hoje

Atenção: Q4 é a única pergunta com 5 alternativas. A opção E pontua 0 (mesma que A) por significar ausência de medição.



Q5. [Autoavaliativa] Como está estruturada a passagem de lead entre marketing e vendas?

A) Não existe processo claro — leads chegam onde der.
B) Existe processo, mas depende de boa vontade de quem está envolvido.
C) Existe critério de passagem, mas a execução ainda gera fricção e perda.
D) Marketing e vendas operam com critérios claros, automação na passagem e leitura conjunta de resultado.



Q6. [Dado] Quantos canais ativos de aquisição você opera hoje (mídia paga, inbound, outbound, indicação, eventos, etc.)?

A) 1 — operamos basicamente um canal principal.
B) 2 a 3 canais.
C) 4 a 5 canais.
D) 6 ou mais canais.


PILAR 3 — OPERAR
Q7. [Dado] Quanto tempo leva, em média, entre o lead chegar e o vendedor fazer a primeira abordagem?

A) Mais de 1 dia útil.
B) Algumas horas (4-8h).
C) Em torno de 1 hora.
D) Minutos — temos roteamento automatizado.



Q8. [Dado] Qual é o ciclo médio de venda do seu negócio (do primeiro contato ao fechamento)?

A) Até 30 dias.
B) De 30 a 60 dias.
C) De 60 a 120 dias.
D) Acima de 120 dias.

Atenção lógica: em Q8, a "maturidade" D (ciclo mais longo) não significa melhor operação — significa ciclo de venda mais complexo, que é sinal de fit Unfold. A pontuação de Q8 alimenta o Fit Comercial (Camada 2), não o pilar Operar. Para fins de cálculo do eixo Operar, Q8 contribui com pontos invertidos (ver tabela em 5.2).



Q9. [Autoavaliativa] Como descreveria a operação de mídia paga da sua empresa?

A) Não rodamos mídia paga, ou rodamos pontualmente sem método.
B) Temos campanhas rodando, mas a leitura de retorno é incerta.
C) Mídia roda com método, mas ainda opera desconectada do funil comercial.
D) Mídia é uma alavanca dentro de um sistema maior — alimenta o funil, conecta com CRM e a gente sabe o que ela entrega em pipeline.


PILAR 4 — EVOLUIR
Q10. [Autoavaliativa] Qual é a postura da sua empresa em relação a teste e experimentação?

A) A gente roda o que funciona — testar é arriscar resultado.
B) Testamos quando algo não está funcionando, mas não temos rotina de experimentação.
C) Testamos com alguma frequência, mas falta método para tirar aprendizado replicável.
D) Experimentação é parte da rotina — temos hipóteses claras, métricas de teste e ciclo de aprendizado.



Q11. [Dado] Com que frequência marketing e vendas se reúnem para ler funil juntos e tomar decisões?

A) Não temos ritual desse tipo.
B) De vez em quando, sem cadência fixa.
C) Mensal.
D) Semanal ou quinzenal, com pauta estruturada.



Q12. [Dado] Nos últimos 12 meses, sua empresa estruturou e mediu quantos testes ou experimentos relevantes em marketing/vendas?

A) Nenhum que eu consiga nomear.
B) 1 ou 2.
C) De 3 a 5.
D) Mais de 5.


5. Sistema de scoring — Camada 1 (eixos do aranha)
5.1. Pontuação base por alternativa
Cada alternativa pontua de 0 a 3:

Alternativa
Pontos
A
0
B
1
C
2
D
3
E (apenas em Q4)
0
5.2. Cálculo dos scores por eixo
Cada eixo é normalizado para escala 0-100:

score_eixo = (soma_pontos_obtidos / pontuação_máxima_possível) × 100

Eixo
Perguntas que compõem
Pontuação máxima
Observação
Diagnosticar
Q1 + Q2
6
Soma direta
Estruturar
Q3 + Q4 + Q5 + Q6
12
Soma direta
Operar
Q7 + Q9 + (3 − pontos_Q8)
9
Q8 entra invertida (ver 5.3)
Evoluir
Q10 + Q11 + Q12
9
Soma direta
5.3. Tratamento especial de Q8
Q8 mede o ciclo de venda do negócio. Ciclo longo (D = >120 dias) não significa operação imatura — significa contexto de venda complexa, que é exatamente o ICP da Unfold. Por isso:

No eixo Operar: Q8 entra invertida. Se o lead respondeu D (3 pontos brutos), contribui com 0 para Operar. Se respondeu A (0 brutos), contribui com 3.
Na Camada 2 (Fit Comercial): Q8 entra não invertida e com peso alto positivo (ciclo longo = sinal forte de fit).

Fórmula de contribuição de Q8 para Operar: contribuição_Operar = 3 − pontos_brutos_Q8
5.4. O 5º eixo: Gestão (cálculo especial)
O eixo Gestão não tem pergunta direta. É calculado por três sinais cruzados:

Sinal 1 — Vocabulário e postura (soma de Q1 + Q9 + Q10):

Faixa da soma
Pontos no Sinal 1
0-3
0
4-5
0.5
6-7
0.75
8-9
1

Sinal 2 — Coerência entre discurso e prática (cruzamento Q10 × Q12):

Combinação
Pontos no Sinal 2
Q10 = D e Q12 = A ou B
0
Q10 = D e Q12 = C ou D
1
Q10 = A ou B e Q12 = A
0.75
Q10 = A ou B e Q12 = C ou D
0.85
Q10 = C (qualquer Q12)
0.5
Q10 = A ou B e Q12 = B
0.6

Sinal 3 — Sofisticação de leitura (soma de Q2 + Q11):

Faixa da soma
Pontos no Sinal 3
0-2
0
3-4
0.5
5-6
1

Cálculo final do eixo Gestão:

score_Gestão = (sinal_1 + sinal_2 + sinal_3) × 33.33

(Resultado entre 0 e ~100.)
5.5. Faixas dos eixos
Cada eixo, após calculado, é classificado em uma faixa que governa a cor visual no gráfico aranha:

Score do eixo
Faixa
Cor sugerida (paleta APR V2)
0-25
Crítica
Navy escuro #001E29
26-50
Em formação
Purple #2E1A7F
51-75
Estruturada
Blue #93BAFB
76-100
Madura
Mint #6DF9C6
5.6. Score consolidado
O Score Consolidado exibido no Bloco 2 do resultado é a média aritmética simples dos 5 eixos:

score_consolidado = (Diagnosticar + Estruturar + Operar + Evoluir + Gestão) / 5

A faixa do Score Consolidado segue a mesma régua dos eixos individuais.


6. Sistema de scoring — Camada 2 (Fit Comercial)
A Camada 2 roda em paralelo à Camada 1 e tem função distinta: definir o roteamento do CTA de agendamento. Não tem relação visual com o aranha — é uma camada de roteamento interno.
6.1. As 4 dimensões do Fit
Dimensão
Origem
Peso
Fit Estrutural
Etapa 1 (campos 4, 5, 6) + Q8
40%
Fit de Dor
Q4 + Q5 + Q7
30%
Fit de Cabeça
Score do eixo Gestão (Camada 1)
20%
Fit de Urgência
Etapa 1 (campo 7)
10%
6.2. Cálculo do Fit Estrutural (40%)
Cada subitem pontua 0-100. O Fit Estrutural é a média dos quatro subitens.

Subitem 1 — Setor (campo 5 da Etapa 1):

Setor
Pontos
Construção Civil / Incorporação
100
Agronegócio / Agroindústria
100
Tecnologia / SaaS B2B
80
Automotivo / Concessionárias
60
Indústria
60
Serviços B2B
50
Outro
30

Subitem 2 — Cargo (campo 4 da Etapa 1):

Cargo
Pontos
CEO / Sócio / Fundador
100
Diretor
90
Gerente / Coordenador
60
Analista / Especialista
30
Outro
30

Subitem 3 — Faturamento (campo 6 da Etapa 1):

Faturamento mensal
Pontos
Acima de R$ 500.000
100
De R$ 200.000 a R$ 500.000
90
De R$ 50.000 a R$ 200.000
60
Até R$ 50.000
20
Prefiro não informar
50

Subitem 4 — Ciclo de venda (Q8 — não invertida):

Ciclo de venda
Pontos
Acima de 120 dias (D)
100
60-120 dias (C)
90
30-60 dias (B)
60
Até 30 dias (A)
30

Fórmula final:

fit_estrutural = (sub_1 + sub_2 + sub_3 + sub_4) / 4
6.3. Cálculo do Fit de Dor (30%)
Soma dos pontos brutos de Q4, Q5, Q7. Q4 com resposta E pontua 0.

Soma de Q4 + Q5 + Q7
Fit de Dor
0-3
30 (pouca dor admitida)
4-5
60
6-7
90
8-9
70 (operação muito madura, talvez não precise)

Atenção: a curva é em U invertido. Operação muito madura (soma 8-9) perde fit porque já tem o sistema rodando.
6.4. Cálculo do Fit de Cabeça (20%)
fit_cabeça = score_Gestão (calculado em 5.4)
6.5. Cálculo do Fit de Urgência (10%)
Resposta do campo 7 da Etapa 1
Pontos
Neste trimestre
100
Nos próximos 6 meses
75
Sem prazo definido, mas é prioridade
50
Estou apenas pesquisando
25
6.6. Score Final de Fit
score_fit = (fit_estrutural × 0.4) + (fit_dor × 0.3) + (fit_cabeça × 0.2) + (fit_urgência × 0.1)
6.7. Faixas de Fit
Score de Fit
Faixa
Comportamento do CTA
75-100
Fit Alto
CTA destacado, slot de 45 min
50-74
Fit Médio
CTA padrão, slot de 30 min
25-49
Fit Baixo
CTA discreto, slot de 20 min
0-24
Desfit
CTA discreto, slot de 20 min

Os textos exatos de cada faixa estão em 9.6.


7. Camada 3 — Padrões cruzados e textos de insight
A Camada 3 identifica os padrões acionados pelas respostas e seleciona os 3 mais relevantes para exibir no Bloco 4 do resultado.
7.1. Os 8 padrões e suas condições de acionamento
Notação: Q4 ≤ B significa "lead respondeu A ou B em Q4". Cada padrão é acionado quando todas as condições listadas forem atendidas.

#
Padrão
Condição de acionamento
Prioridade base
P1
Atribuição cega
Q2 ≤ B e Q6 ≥ C
6
P2
CRM órfão
Q3 = B e Q5 ≤ B
7
P3
Funil sem leitura
Q4 = E e Q11 ≤ B
8
P4
Resposta lenta
Q7 ≤ B e Q8 ≥ C
9
P5
Cultura sem prática
Q10 = D e Q12 ≤ B
5
P6
Mídia desconectada
Q9 ≤ B e Q3 ≤ B
6
P7
Operação madura, leitura imatura
score_Operar ≥ 60 e score_Diagnosticar ≤ 40
7
P8
Vendas resolvendo o que marketing não entrega
Q4 ≤ B e Q5 ≤ B
8
7.2. Regra de seleção dos 3 padrões prioritários
A lógica de seleção segue esta ordem:

Identificar todos os padrões acionados.
Ordenar por prioridade base (decrescente).
Em caso de empate, ordenar por impacto comercial (decrescente), usando esta hierarquia: P4 > P3 > P8 > P2 > P7 > P1 > P6 > P5.
Selecionar os 3 primeiros.

Cenário de fallback: se menos de 3 padrões forem acionados, completar com padrões adicionais usando a seguinte regra de seleção complementar:

Para cada eixo com score abaixo de 40, acionar o padrão associado mesmo que a condição rígida não tenha sido atendida.
Associação: eixo Diagnosticar → P1 ou P3; eixo Estruturar → P2 ou P8; eixo Operar → P4 ou P6; eixo Evoluir → P5 ou P7.

Cenário extremo: se nenhum padrão for acionado (lead com operação muito madura), o sistema exibe o padrão neutro positivo:

Sua operação apresenta sinais consistentes de maturidade em todas as dimensões avaliadas. Esse perfil é raro entre operações com vendas complexas no Brasil. O que normalmente diferencia empresas neste estágio é a capacidade de aprofundar leitura de dados e estruturar ciclos formais de evolução do sistema.
7.3. Os 8 textos de insight
Cada texto segue arquitetura padrão: diagnóstico em uma frase + por que acontece + consequência comercial concreta. Tom técnico, declarativo, vocabulário Unfold. Cada texto tem 70-90 palavras.



P1 — Atribuição cega

Você opera múltiplos canais sem visibilidade do que cada um entrega.

Sua operação roda mais de 3 canais de aquisição, mas a leitura de contribuição por canal ainda depende de estimativa ou não existe. Esse é um padrão que tipicamente aparece quando o marketing escalou mais rápido que a estrutura de medição. Na prática, significa que decisões de alocação de orçamento estão sendo tomadas por intuição — e em vendas complexas, esse padrão frequentemente concentra investimento em canais que geram volume sem gerar pipeline real.



P2 — CRM órfão

Sua empresa tem CRM, mas ele não opera como engrenagem central da operação.

A ferramenta existe, mas a alimentação não é disciplinada e marketing e vendas não compartilham a mesma leitura de pipeline. Esse padrão tem uma consequência específica: o CRM passa a registrar atividade em vez de conduzir operação. Quando isso acontece, o investimento em automação, integração e leitura de funil para de gerar retorno proporcional — porque a base de dados que sustenta essas camadas está incompleta na origem.



P3 — Funil sem leitura

Sua operação roda, mas não mede.

A qualificação dos leads gerados por marketing não é medida com confiança, e marketing e vendas não têm ritual fixo de leitura conjunta de funil. Esse padrão cria um efeito específico: cada área forma a própria narrativa sobre o que está funcionando, baseada em fragmentos diferentes da operação. O resultado é decisão por percepção, não por dado — e em ciclos longos de venda, isso significa que ajustes acontecem tarde, depois que o pipeline já esfriou.



P4 — Resposta lenta

Seu ciclo de venda é longo, mas sua resposta inicial é lenta.

Em vendas complexas com ciclo de 60+ dias, o tempo entre lead chegar e primeira abordagem comercial é decisivo — não porque o cliente vai comprar rápido, mas porque ele está avaliando seriedade da empresa nesse primeiro contato. Quando a resposta leva mais de algumas horas, a operação perde leads que entraram no pico de intenção. O efeito não aparece como queda óbvia: aparece como pipeline que demora a esquentar e propostas que esfriam sem motivo claro.



P5 — Cultura sem prática

Sua empresa fala em testar, mas pratica pouco.

Há intenção declarada de operar com experimentação, mas o número de testes estruturados nos últimos 12 meses não acompanha o discurso. Esse padrão é comum em empresas que reconheceram growth como prática moderna mas ainda não construíram a base operacional que sustenta experimentação real — hipótese clara, métrica de leitura, critério de continuidade. Sem essa base, experimentação vira ação solta, e ação solta não gera aprendizado replicável.



P6 — Mídia desconectada

Sua operação investe em mídia paga sem destino estruturado.

Há mídia rodando, mas o CRM não opera com disciplina que sustente o que ela entrega. Esse padrão cria uma armadilha conhecida: a mídia gera leads, mas a operação comercial não consegue transformar volume em pipeline qualificado. Quando isso acontece, a tendência natural é aumentar verba para compensar a baixa conversão — o que acelera o problema em vez de resolvê-lo. Mídia em vendas complexas só rende quando o sistema que recebe o lead está pronto para tratá-lo.



P7 — Operação madura, leitura imatura

Sua operação executa bem, mas você não sabe exatamente o que está funcionando.

Há ritmo, disciplina e canais rodando, mas a leitura estratégica do que sustenta o resultado ainda é incompleta. Esse padrão tem um risco específico: a operação cresce, mas a empresa fica refém da execução sem entender suas próprias alavancas. Quando o mercado muda ou um canal performa pior, falta diagnóstico para reagir com critério — e a resposta acaba sendo intensificar o que vinha dando certo, mesmo quando essa não é mais a alavanca correta.



P8 — Vendas resolvendo o que marketing não entrega

Seu time comercial está cobrindo o gap de qualificação que marketing deveria entregar.

A qualificação dos leads e a passagem entre marketing e vendas operam sem critérios claros, o que significa que o time comercial está investindo tempo em qualificar antes de vender. Esse padrão tem um custo invisível: vendedores deixam de fechar para qualificar, propostas demoram mais para sair e o ticket médio tende a cair, porque o vendedor prioriza fechar oportunidades fáceis para compensar o tempo gasto qualificando as difíceis.


8. Caminhos de melhoria e regras de seleção
Os caminhos de melhoria são exibidos no Bloco 5 do resultado, abaixo dos insights. Cada caminho tem três componentes: a alavanca, por que é prioritário para o lead, e como a Unfold endereça.
8.1. Mapeamento padrão → caminho
Padrão (P)
Caminho prioritário (C)
Caminhos secundários acionáveis
P1
C1
C5
P2
C2
C4
P3
C1
C4
P4
C3
C2
P5
C5
—
P6
C2
C3
P7
C1
C5
P8
C4
C2
8.2. Regra de seleção dos 3 caminhos exibidos
Para cada um dos 3 padrões selecionados, identificar o caminho prioritário.
Deduplicar: se dois padrões apontam para o mesmo caminho prioritário, o segundo padrão usa seu caminho secundário.
Se ainda restar duplicação após o passo 2, usar caminho complementar conforme o eixo mais fraco (mesma lógica de fallback de 7.2).
Total: sempre 3 caminhos distintos.
8.3. Os 5 caminhos de melhoria — textos completos


C1 — Estruturar leitura de funil e atribuição por canal

A alavanca. Antes de aumentar volume, é necessário ganhar clareza sobre o que cada canal entrega — não em sessões ou cliques, mas em pipeline e receita. Isso passa por estruturar atribuição por canal, definir métricas de funil etapa a etapa e criar um ritual semanal de leitura conjunta entre marketing e vendas.

Por que é prioritário para você. Sua pontuação em Diagnosticar e Evoluir indica que sua operação ainda toma decisões com base em percepção, não em sistema. Estruturar leitura é a alavanca que destrava todas as outras.

Como a Unfold endereça. Esse é o ponto de partida do Unfold Growth System. O primeiro pilar do método — Diagnosticar — existe exatamente para resolver esse gargalo antes de qualquer outra ação.



C2 — Reorganizar CRM como engrenagem central da operação

A alavanca. Um CRM operacional não é uma ferramenta que registra interações — é o sistema que conduz decisões comerciais. Reorganizar essa camada passa por redesenhar pipelines com lógica de funil, definir critérios de movimento entre etapas, configurar automações que reduzam atrito comercial e estabelecer disciplina de alimentação que torne os dados confiáveis.

Por que é prioritário para você. Sua operação tem ferramenta, mas a estrutura ainda não opera como base de inteligência comercial. Sem isso, qualquer investimento em automação ou mídia acaba operando em cima de uma fundação frágil.

Como a Unfold endereça. CRM e automação fazem parte do core do método UGS — não como camada técnica isolada, mas como engrenagem do sistema de crescimento.



C3 — Acelerar e roteirizar a resposta comercial

A alavanca. Em vendas complexas, velocidade de primeira resposta é a métrica mais alta no funil que ninguém olha. Acelerar isso passa por roteamento automatizado de leads, definição clara de quem responde a quê, integração entre canal de entrada e CRM, e cadência de follow-up estruturada nos primeiros dias.

Por que é prioritário para você. Com ciclo de venda longo, cada hora perdida no primeiro contato tem efeito desproporcional. Sua resposta atual está fora do que seu próprio ciclo permite.

Como a Unfold endereça. O pilar Operar do UGS opera diretamente nessa camada — automação aplicada à conversão e integração marketing-vendas como parte da engrenagem.



C4 — Alinhar critérios de qualificação entre marketing e vendas

A alavanca. O alinhamento entre marketing e vendas não se resolve com mais reuniões — resolve-se com critérios documentados de qualificação (SQL/MQL), regras claras de passagem, automação que sustenta esses critérios e ritual fixo de leitura conjunta. Sem isso, marketing entrega o que acha que vendas precisa, e vendas filtra o que acha que vai fechar.

Por que é prioritário para você. Suas respostas indicam que esse alinhamento ainda opera no informal. Em vendas complexas, isso significa perda contínua de oportunidade na passagem — geralmente a maior fonte de desperdício do funil.

Como a Unfold endereça. Integração marketing-vendas é o que o método UGS chama de engrenagem central — não é entregável separado, é a lógica que conecta todos os pilares.



C5 — Implementar ciclos curtos de teste e leitura

A alavanca. Cultura de teste real não nasce de intenção — nasce de ritual. Implementar ciclos curtos significa estruturar hipóteses claras, definir critérios de sucesso antes do teste, executar em janelas curtas (2-4 semanas) e ter ritual fixo de leitura de resultado e decisão de continuidade.

Por que é prioritário para você. Sua empresa reconhece teste como prática, mas a prática real ainda é esparsa. Estruturar ritmo é o que diferencia experimentação produtiva de ação solta.

Como a Unfold endereça. O pilar Evoluir do UGS opera exatamente nessa camada — ciclos contínuos de leitura, hipótese, teste e ajuste como parte da operação recorrente, não como projeto pontual.


9. Tela de resultado — estrutura e conteúdo
9.1. Bloco 1 — Cabeçalho personalizado
Conteúdo dinâmico:

Olá, [Nome].
Aqui está o diagnóstico da sua operação.

Tipografia display grande (Relicus).
Espaço em branco generoso ao redor.
Sem decoração visual além da tipografia.
9.2. Bloco 2 — Score consolidado + faixa de maturidade
Conteúdo:

Score consolidado em destaque numérico grande (formato "X / 100").
Nome da faixa abaixo do número (Crítica / Em formação / Estruturada / Madura).
Frase descritiva da faixa (uma linha):

Faixa
Frase descritiva
Crítica
Sua operação ainda opera em modo de tentativa, sem base estrutural para sustentar crescimento previsível.
Em formação
Sua operação tem fundação, mas ainda opera com gaps estruturais que limitam previsibilidade.
Estruturada
Sua operação tem método em vários pontos, mas ainda opera com gaps que limitam evolução contínua.
Madura
Sua operação opera com método consistente. As alavancas agora são de aprofundamento, não de construção.
9.3. Bloco 3 — Gráfico aranha + leitura por eixo
Gráfico aranha (5 eixos):

Diagnosticar
Estruturar
Operar
Evoluir
Gestão

Cada vértice mostra nome do eixo + score numérico. Linhas e área preenchidas usam cor proporcional à média dos 5 eixos.

Leitura por eixo (abaixo do aranha):

Para cada eixo, exibir bloco com:

Nome do eixo + score numérico
Nome da faixa
Frase descritiva específica (uma linha)

Frases descritivas por eixo e faixa:

Eixo
Crítica
Em formação
Estruturada
Madura
Diagnosticar
Sua leitura do próprio funil é praticamente inexistente.
Sua capacidade de ler o próprio funil ainda é incompleta.
Você lê o funil, mas a profundidade ainda permite ajustes pontuais.
Você lê o funil com profundidade e usa essa leitura para decidir.
Estruturar
A base operacional (CRM, funil, passagem) ainda não existe.
A base operacional ainda não sustenta crescimento.
A base existe, com gaps específicos que ainda limitam integração.
A base está madura e sustenta o sistema de crescimento.
Operar
A execução é improvisada e reativa.
A execução existe, mas opera sem ritmo.
Sua execução é razoável, mas tem gaps específicos.
Sua execução opera com disciplina e ritmo.
Evoluir
Sua operação não evolui — ela só reage.
Você reconhece evolução, mas a prática ainda é esparsa.
Sua operação evolui, mas o ritmo ainda é inconsistente.
Sua operação evolui com ciclos claros de aprendizado.
Gestão
A leitura como liderança ainda trata growth como esforço, não como sistema.
Sua leitura como liderança está em formação.
Sua leitura como liderança está adiante da sua operação.
Sua leitura como liderança é madura e orienta o sistema.
9.4. Bloco 4 — Três insights priorizados
Exibir os 3 textos de insight selecionados (ver seção 7) em cards verticais, numerados (❶ ❷ ❸).

Cada card contém:

Numeração visual
Título do padrão (em destaque)
Texto completo do insight

Espaço entre cards para respiração visual.
9.5. Bloco 5 — Três caminhos de melhoria
Exibir os 3 caminhos selecionados (ver seção 8) em blocos verticais.

Cada bloco contém:

Numeração visual (correspondente ao insight)
Título do caminho
Os três componentes do caminho (A alavanca / Por que é prioritário para você / Como a Unfold endereça)
9.6. Bloco 6 — CTA de agendamento
Conteúdo varia por faixa de Fit (calculada na Camada 2):

Faixa
Headline
Microcopy
Slot Calendly
Fit Alto
Vamos discutir esse diagnóstico em profundidade
Agende uma conversa estratégica com a equipe da Unfold para destrinchar seus resultados e desenhar prioridades.
45 minutos
Fit Médio
Quer aprofundar a leitura do seu diagnóstico?
Agende uma conversa para discutir os pontos sinalizados e avaliar como endereçar.
30 minutos
Fit Baixo
Quer conversar sobre os pontos do diagnóstico?
Reserve um momento para discutirmos o que apareceu no seu diagnóstico e os primeiros passos.
20 minutos
Desfit
Vamos conversar sobre seus próximos passos?
Reserve um momento para discutirmos o resultado e direções iniciais que fazem sentido pro seu estágio atual.
20 minutos

O calendário (Calendly ou equivalente) deve estar embedado na própria página de resultado — não em link externo. Isso reduz fricção e mantém o lead no contexto.
9.7. Bloco 7 — Footer
Conteúdo:

Botão "Baixar diagnóstico em PDF" (gera PDF com todo o resultado, mesmo layout)
Botão "Compartilhar resultado por e-mail"
Bloco de opt-in para nutrição:

Receba conteúdos exclusivos sobre como estruturar operações
de crescimento em vendas complexas.
[Campo de e-mail] [Botão: Inscrever-se]

O e-mail informado na Etapa 1 pode ser pré-preenchido no campo de opt-in (mas o lead precisa clicar "Inscrever-se" para confirmar — opt-in formal).


10. Integrações e estrutura de dados
10.1. Estrutura de dados do lead (CRM)
Cada lead que conclui o Diagnóstico deve ser registrado no CRM com os seguintes campos. Os campos marcados com asterisco (*) são essenciais para automações.

Identificação:

nome_completo (texto) *
email (texto) *
empresa (texto)
cargo (select)
setor (select)
faturamento_faixa (select)
urgencia (select) *

Respostas brutas (12 campos):

q1 até q12 (cada um: enum A/B/C/D ou A/B/C/D/E para Q4)

Scores calculados (Camada 1):

score_diagnosticar (numérico 0-100)
score_estruturar (numérico 0-100)
score_operar (numérico 0-100)
score_evoluir (numérico 0-100)
score_gestao (numérico 0-100)
score_consolidado (numérico 0-100)
faixa_consolidada (enum: Crítica / Em formação / Estruturada / Madura)

Scores calculados (Camada 2):

fit_estrutural (numérico 0-100)
fit_dor (numérico 0-100)
fit_cabeca (numérico 0-100)
fit_urgencia (numérico 0-100)
score_fit (numérico 0-100) *
faixa_fit (enum: Fit Alto / Fit Médio / Fit Baixo / Desfit) *

Padrões acionados (Camada 3):

padroes_acionados (array de strings: ["P1", "P3", "P4"]) — todos os acionados
padroes_exibidos (array de strings: ["P3", "P4", "P1"]) — os 3 selecionados, na ordem exibida
caminhos_exibidos (array de strings: ["C1", "C3", "C2"]) — os 3 caminhos exibidos

Metadados:

data_inicio (datetime — começou Etapa 1)
data_conclusao (datetime — finalizou Etapa 2)
tempo_total_segundos (numérico)
url_resultado_publico (texto — hash único)
agendou (booleano)
slot_agendado (datetime — se agendou)
10.2. Automações principais necessárias
Automação 1 — E-mail de resultado:

Disparo: imediato após conclusão da Etapa 2.
Conteúdo: link para a URL pública do resultado + PDF anexo.
Plataforma: marketing automation.

Automação 2 — Lead scoring + tag:

Disparo: imediato após cálculo do score_fit.
Ação: aplicar tag de faixa de Fit no CRM (fit_alto, fit_medio, fit_baixo, desfit).
Roteamento subsequente conforme tag.

Automação 3 — Roteamento para vendas (apenas Fit Alto e Médio):

Disparo: imediato após aplicação da tag.
Ação: criar oportunidade no pipeline comercial + notificar Gabriel via canal interno (e-mail/Slack/WhatsApp).
Conteúdo da notificação: nome, empresa, faixa de fit, score consolidado, padrões acionados, link para resultado completo.

Automação 4 — Fluxo de nutrição (Fit Baixo e Desfit):

Disparo: 24h após conclusão, se o lead não agendou.
Ação: entrada em fluxo de nutrição educativa (sequência de e-mails com conteúdos de autoridade).

Automação 5 — Reengajamento de drop-off Etapa 2:

Disparo: 1h após preencher Etapa 1 sem completar Etapa 2.
Ação: e-mail com link para retomar (token de sessão preserva respostas).

Automação 6 — Reengajamento de quem agendou e cancelou:

Disparo: ao detectar cancelamento via webhook do calendário.
Ação: e-mail oferecendo remarcar + entrada em nutrição leve.
10.3. Eventos para mensuração
Para análise de performance da ferramenta, capturar eventos:

Evento
Quando dispara
diagnostico_iniciado
Lead clicou para iniciar Etapa 1
etapa_1_concluida
Lead completou os 7 campos
etapa_2_pergunta_X
Lead respondeu cada pergunta (X = 1 a 12)
diagnostico_concluido
Lead viu a tela de resultado
pdf_baixado
Lead clicou no botão de baixar PDF
resultado_compartilhado
Lead clicou em compartilhar
opt_in_nutricao
Lead confirmou opt-in para nutrição
agendamento_iniciado
Lead abriu o calendário embedado
agendamento_concluido
Lead confirmou o slot

Esses eventos alimentam o funil interno da ferramenta e devem ser visíveis em dashboard de acompanhamento.


11. Exemplo end-to-end de simulação
Este exemplo serve como caso de teste para validar a implementação. Lead fictício, respostas reais, cálculo passo a passo.
11.1. Perfil do lead fictício
Etapa 1 — respostas:

Nome: Roberto Almeida
E-mail: roberto.almeida@construsigma.com.br
Empresa: ConstruSigma
Cargo: CEO / Sócio / Fundador
Setor: Construção Civil / Incorporação
Faturamento mensal: De R$ 200.000 a R$ 500.000
Urgência: Nos próximos 6 meses

Etapa 2 — respostas: | Pergunta | Resposta | |:---:|:---:| | Q1 | B | | Q2 | A | | Q3 | B | | Q4 | A | | Q5 | B | | Q6 | C | | Q7 | A | | Q8 | D | | Q9 | B | | Q10 | D | | Q11 | A | | Q12 | A |
11.2. Cálculo da Camada 1 (scores dos eixos)
Pontos brutos por pergunta:

Q
Resposta
Pontos brutos
Q1
B
1
Q2
A
0
Q3
B
1
Q4
A
0
Q5
B
1
Q6
C
2
Q7
A
0
Q8
D
3 (não usado direto em Operar)
Q9
B
1
Q10
D
3
Q11
A
0
Q12
A
0

Cálculo dos 4 eixos do UGS:

Diagnosticar: Q1 (1) + Q2 (0) = 1 pontos / 6 máximo = 16.7 → faixa Crítica
Estruturar: Q3 (1) + Q4 (0) + Q5 (1) + Q6 (2) = 4 pontos / 12 máximo = 33.3 → faixa Em formação
Operar: Q7 (0) + Q9 (1) + (3 − Q8) = 0 + 1 + (3 − 3) = 1 / 9 máximo = 11.1 → faixa Crítica
Evoluir: Q10 (3) + Q11 (0) + Q12 (0) = 3 / 9 máximo = 33.3 → faixa Em formação

Cálculo do eixo Gestão:

Sinal 1 (Q1 + Q9 + Q10 = 1+1+3 = 5): faixa 4-5 → 0.5 pontos
Sinal 2 (Q10=D e Q12=A): "discurso vazio" → 0 pontos
Sinal 3 (Q2 + Q11 = 0+0 = 0): faixa 0-2 → 0 pontos
Soma: 0.5 + 0 + 0 = 0.5
Score Gestão: 0.5 × 33.33 = 16.7 → faixa Crítica

Score consolidado: (16.7 + 33.3 + 11.1 + 33.3 + 16.7) / 5 = 22.2 → faixa Crítica

Resumo visual para o aranha:

Eixo
Score
Faixa
Diagnosticar
16.7
Crítica
Estruturar
33.3
Em formação
Operar
11.1
Crítica
Evoluir
33.3
Em formação
Gestão
16.7
Crítica
11.3. Cálculo da Camada 2 (Fit Comercial)
Fit Estrutural (40%):

Subitem Setor: Construção = 100
Subitem Cargo: CEO = 100
Subitem Faturamento: R$ 200-500k = 90
Subitem Ciclo (Q8 = D): >120 dias = 100
Fit Estrutural: (100 + 100 + 90 + 100) / 4 = 97.5

Fit de Dor (30%):

Q4 + Q5 + Q7 = 0 + 1 + 0 = 1
Faixa 0-3 → Fit de Dor = 30

Fit de Cabeça (20%):

= score Gestão = 16.7

Fit de Urgência (10%):

"Nos próximos 6 meses" = 75

Score de Fit Final:

(97.5 × 0.4) + (30 × 0.3) + (16.7 × 0.2) + (75 × 0.1)
= 39.0 + 9.0 + 3.34 + 7.5
= 58.84 → faixa Fit Médio
11.4. Cálculo da Camada 3 (padrões acionados)
Verificando cada padrão:

#
Padrão
Condição
Acionado?
P1
Atribuição cega
Q2 ≤ B (A ≤ B ✓) e Q6 ≥ C (C ≥ C ✓)
SIM
P2
CRM órfão
Q3 = B (B ✓) e Q5 ≤ B (B ✓)
SIM
P3
Funil sem leitura
Q4 = E (A ✗)
NÃO
P4
Resposta lenta
Q7 ≤ B (A ✓) e Q8 ≥ C (D ✓)
SIM
P5
Cultura sem prática
Q10 = D (✓) e Q12 ≤ B (A ✓)
SIM
P6
Mídia desconectada
Q9 ≤ B (B ✓) e Q3 ≤ B (B ✓)
SIM
P7
Operação madura, leitura imatura
score_Operar ≥ 60 (11.1 ✗)
NÃO
P8
Vendas resolvendo...
Q4 ≤ B (A ✓) e Q5 ≤ B (B ✓)
SIM

Padrões acionados: P1, P2, P4, P5, P6, P8.

Aplicação da regra de seleção (7.2):

Ordenando por prioridade base (decrescente):

P4 (9), P8 (8), P2 (7), P1 (6), P6 (6), P5 (5)

Os 3 selecionados são: P4, P8, P2.
11.5. Seleção dos caminhos
Aplicando mapeamento da seção 8.1:

Padrão
Caminho prioritário
P4
C3
P8
C4
P2
C2

Sem duplicações. Caminhos exibidos: C3, C4, C2.
11.6. O que o lead vê na tela de resultado
Bloco 1:

Olá, Roberto.
Aqui está o diagnóstico da sua operação.

Bloco 2:

Score: 22 / 100
Faixa: Crítica
Frase: "Sua operação ainda opera em modo de tentativa, sem base estrutural para sustentar crescimento previsível."

Bloco 3 — Aranha + leitura:

Aranha visual com vértices em:

Diagnosticar (17)
Estruturar (33)
Operar (11)
Evoluir (33)
Gestão (17)

Leitura por eixo:

Diagnosticar (17) — Crítica: Sua leitura do próprio funil é praticamente inexistente.
Estruturar (33) — Em formação: A base operacional ainda não sustenta crescimento.
Operar (11) — Crítica: A execução é improvisada e reativa.
Evoluir (33) — Em formação: Você reconhece evolução, mas a prática ainda é esparsa.
Gestão (17) — Crítica: A leitura como liderança ainda trata growth como esforço, não como sistema.

Bloco 4 — Três insights:

❶ Resposta lenta (texto P4 — sobre tempo de resposta em ciclo longo) ❷ Vendas resolvendo o que marketing não entrega (texto P8) ❸ CRM órfão (texto P2)

Bloco 5 — Três caminhos:

❶ C3 — Acelerar e roteirizar a resposta comercial ❷ C4 — Alinhar critérios de qualificação entre marketing e vendas ❸ C2 — Reorganizar CRM como engrenagem central da operação

Bloco 6 — CTA (Fit Médio):

Headline: "Quer aprofundar a leitura do seu diagnóstico?"
Microcopy: "Agende uma conversa para discutir os pontos sinalizados e avaliar como endereçar."
Slot: 30 minutos

Bloco 7 — Footer:

Botões PDF + Compartilhar
Opt-in pré-preenchido com roberto.almeida@construsigma.com.br
11.7. Leitura analítica do caso (para o time interno entender)
Roberto representa um lead clássico de fit alto estruturalmente, mas com cabeça em formação.

Por que é fit: CEO de construtora médio-grande porte, ciclo longo, urgência média — alinha 100% com ICP primário da Unfold.
Por que não é Fit Alto pelo cálculo: o Fit de Dor está em apenas 30 (ele não admite tanta dor quanto sua operação realmente sofre) e o Fit de Cabeça está em 17 (a contradição entre falar de teste e não testar penaliza).
O que isso ensina: o lead se vê mais maduro do que é. A conversa comercial precisa começar apresentando o diagnóstico como espelho honesto, não como crítica. O insight do P5 (cultura sem prática) seria o mais delicado de exibir — fica de fora dos 3 selecionados, o que protege a relação no primeiro contato.
Roteamento comercial: Fit Médio → call de 30 min com Gabriel.


Fim da especificação
Qualquer dúvida na implementação que envolva decisão estratégica (não apenas técnica) deve ser escalada antes de ser resolvida no implementador. O documento é fonte única — em caso de divergência com outras fontes, este documento prevalece para os componentes do Diagnóstico de Growth.

Versão 1.0 — Especificação fechada.
