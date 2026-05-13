/**
 * Seed das 12 perguntas oficiais do Diagnóstico de Growth v2.
 * Fonte: docs/diagnostico-spec.md §4.3
 *
 * Convenção:
 *   - `ordem` ∈ [1..12] corresponde a Q1..Q12.
 *   - As opções ficam SEMPRE em ordem A → B → C → D (e Q4 também tem E).
 *   - O `valor` segue a regra da spec §5.1: A=0, B=1, C=2, D=3, E=0.
 *   - A engine v2 deriva a letra pelo ÍNDICE da opção (não pelo valor),
 *     então a ordem é critical — alteração no admin precisa preservar isso.
 */

export const SEED_QUIZ_QUESTIONS = [
  // ── PILAR 1 — DIAGNOSTICAR ────────────────────────────────────────────
  {
    pergunta: 'Como sua empresa identifica hoje o que está travando o crescimento?',
    pilar: 'diagnosticar' as const,
    peso: 1,
    ordem: 1,
    opcoes: [
      { texto: 'Crescimento é uma questão de fazer mais — mais leads, mais campanhas, mais esforço comercial.', valor: 0 },
      { texto: 'Tenho hipóteses sobre o que trava, mas confesso que são mais intuição do que análise.', valor: 1 },
      { texto: 'Olhamos relatórios periodicamente e identificamos gargalos, mas falta método para priorizar o que atacar primeiro.', valor: 2 },
      { texto: 'Temos um processo estruturado de leitura do funil que aponta onde estão as perdas e por que elas acontecem.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q1 autoavaliativa — spec §4.3',
  },
  {
    pergunta: 'Você consegue dizer hoje, com confiança, quanto cada canal de aquisição contribuiu para o faturamento dos últimos 12 meses?',
    pilar: 'diagnosticar' as const,
    peso: 1,
    ordem: 2,
    opcoes: [
      { texto: 'Não — não temos essa visibilidade.', valor: 0 },
      { texto: 'Sei aproximadamente para um ou dois canais principais; o resto é estimativa.', valor: 1 },
      { texto: 'Sei para todos os canais principais, mas a leitura ainda envolve cálculo manual.', valor: 2 },
      { texto: 'Sim — temos atribuição estruturada e consigo ver isso em dashboard a qualquer momento.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q2 dado — alimenta também Sinal 3 do eixo Gestão',
  },

  // ── PILAR 2 — ESTRUTURAR ──────────────────────────────────────────────
  {
    pergunta: 'Como descreveria o uso de CRM na sua operação?',
    pilar: 'estruturar' as const,
    peso: 1,
    ordem: 3,
    opcoes: [
      { texto: 'Não temos CRM, ou temos algo improvisado em planilha.', valor: 0 },
      { texto: 'Temos CRM, mas o time comercial não alimenta com disciplina.', valor: 1 },
      { texto: 'CRM funciona razoavelmente, mas marketing e vendas operam com bases desconectadas.', valor: 2 },
      { texto: 'CRM é a engrenagem central da operação comercial — todo lead, todo deal, toda interação passa por ele.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q3 autoavaliativa — aciona P2 quando = B, P6 quando ≤ B',
  },
  {
    pergunta: 'Dos leads gerados por marketing nos últimos 90 dias, qual percentual seu time comercial considerou qualificado para abordagem?',
    pilar: 'estruturar' as const,
    peso: 1,
    ordem: 4,
    opcoes: [
      { texto: 'Menos de 20%', valor: 0 },
      { texto: 'Entre 20% e 40%', valor: 1 },
      { texto: 'Entre 40% e 60%', valor: 2 },
      { texto: 'Acima de 60%', valor: 3 },
      { texto: 'Não tenho como medir isso hoje', valor: 0 },
    ],
    ativo: true,
    nota_interna: 'Q4 dado — ÚNICA com 5 opções. E pontua 0 (mesma de A). Aciona P3 quando = E',
  },
  {
    pergunta: 'Como está estruturada a passagem de lead entre marketing e vendas?',
    pilar: 'estruturar' as const,
    peso: 1,
    ordem: 5,
    opcoes: [
      { texto: 'Não existe processo claro — leads chegam onde der.', valor: 0 },
      { texto: 'Existe processo, mas depende de boa vontade de quem está envolvido.', valor: 1 },
      { texto: 'Existe critério de passagem, mas a execução ainda gera fricção e perda.', valor: 2 },
      { texto: 'Marketing e vendas operam com critérios claros, automação na passagem e leitura conjunta de resultado.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q5 autoavaliativa — aciona P2 e P8 quando ≤ B',
  },
  {
    pergunta: 'Quantos canais ativos de aquisição você opera hoje (mídia paga, inbound, outbound, indicação, eventos, etc.)?',
    pilar: 'estruturar' as const,
    peso: 1,
    ordem: 6,
    opcoes: [
      { texto: '1 — operamos basicamente um canal principal.', valor: 0 },
      { texto: '2 a 3 canais.', valor: 1 },
      { texto: '4 a 5 canais.', valor: 2 },
      { texto: '6 ou mais canais.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q6 dado — aciona P1 quando ≥ C combinado com Q2 ≤ B',
  },

  // ── PILAR 3 — OPERAR ──────────────────────────────────────────────────
  {
    pergunta: 'Quanto tempo leva, em média, entre o lead chegar e o vendedor fazer a primeira abordagem?',
    pilar: 'operar' as const,
    peso: 1,
    ordem: 7,
    opcoes: [
      { texto: 'Mais de 1 dia útil.', valor: 0 },
      { texto: 'Algumas horas (4-8h).', valor: 1 },
      { texto: 'Em torno de 1 hora.', valor: 2 },
      { texto: 'Minutos — temos roteamento automatizado.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q7 dado — aciona P4 quando ≤ B (combinado com Q8 ≥ C)',
  },
  {
    pergunta: 'Qual é o ciclo médio de venda do seu negócio (do primeiro contato ao fechamento)?',
    pilar: 'operar' as const,
    peso: 1,
    ordem: 8,
    opcoes: [
      { texto: 'Até 30 dias.', valor: 0 },
      { texto: 'De 30 a 60 dias.', valor: 1 },
      { texto: 'De 60 a 120 dias.', valor: 2 },
      { texto: 'Acima de 120 dias.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q8 dado — INVERTIDA no eixo Operar (D em Q8 contribui 0 para Operar mas 100 para Fit Estrutural)',
  },
  {
    pergunta: 'Como descreveria a operação de mídia paga da sua empresa?',
    pilar: 'operar' as const,
    peso: 1,
    ordem: 9,
    opcoes: [
      { texto: 'Não rodamos mídia paga, ou rodamos pontualmente sem método.', valor: 0 },
      { texto: 'Temos campanhas rodando, mas a leitura de retorno é incerta.', valor: 1 },
      { texto: 'Mídia roda com método, mas ainda opera desconectada do funil comercial.', valor: 2 },
      { texto: 'Mídia é uma alavanca dentro de um sistema maior — alimenta o funil, conecta com CRM e a gente sabe o que ela entrega em pipeline.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q9 autoavaliativa — aciona P6 quando ≤ B (com Q3 ≤ B). Alimenta Sinal 1 da Gestão',
  },

  // ── PILAR 4 — EVOLUIR ─────────────────────────────────────────────────
  {
    pergunta: 'Qual é a postura da sua empresa em relação a teste e experimentação?',
    pilar: 'evoluir' as const,
    peso: 1,
    ordem: 10,
    opcoes: [
      { texto: 'A gente roda o que funciona — testar é arriscar resultado.', valor: 0 },
      { texto: 'Testamos quando algo não está funcionando, mas não temos rotina de experimentação.', valor: 1 },
      { texto: 'Testamos com alguma frequência, mas falta método para tirar aprendizado replicável.', valor: 2 },
      { texto: 'Experimentação é parte da rotina — temos hipóteses claras, métricas de teste e ciclo de aprendizado.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q10 autoavaliativa — aciona P5 quando = D (combinado com Q12 ≤ B). Alimenta Sinais 1 e 2 da Gestão',
  },
  {
    pergunta: 'Com que frequência marketing e vendas se reúnem para ler funil juntos e tomar decisões?',
    pilar: 'evoluir' as const,
    peso: 1,
    ordem: 11,
    opcoes: [
      { texto: 'Não temos ritual desse tipo.', valor: 0 },
      { texto: 'De vez em quando, sem cadência fixa.', valor: 1 },
      { texto: 'Mensal.', valor: 2 },
      { texto: 'Semanal ou quinzenal, com pauta estruturada.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q11 dado — alimenta Sinal 3 da Gestão',
  },
  {
    pergunta: 'Nos últimos 12 meses, sua empresa estruturou e mediu quantos testes ou experimentos relevantes em marketing/vendas?',
    pilar: 'evoluir' as const,
    peso: 1,
    ordem: 12,
    opcoes: [
      { texto: 'Nenhum que eu consiga nomear.', valor: 0 },
      { texto: '1 ou 2.', valor: 1 },
      { texto: 'De 3 a 5.', valor: 2 },
      { texto: 'Mais de 5.', valor: 3 },
    ],
    ativo: true,
    nota_interna: 'Q12 dado — aciona P5 quando ≤ B (com Q10 = D). Alimenta Sinal 2 da Gestão',
  },
]

// Insights legados (v0) — Sprint 4 substitui pelos textos da spec §7.3 carregados via textos.ts.
export const SEED_INSIGHTS = [
  {
    titulo: '[LEGADO v0] Alto Fit',
    nivel_fit: 'alto' as const,
    pilar: 'geral' as const,
    headline: 'Sua operação comercial está madura para escalar',
    corpo: 'Você demonstra maturidade nos pilares do método UGS. O próximo passo é implementar ciclos de otimização contínua.',
    cta_texto: 'Agendar conversa estratégica',
    ativo: true,
    nota_interna: '[LEGADO] Sprint 4 troca pelo texto-padrão por faixa Fit.',
  },
  {
    titulo: '[LEGADO v0] Médio Fit',
    nivel_fit: 'medio' as const,
    pilar: 'geral' as const,
    headline: 'Você tem boas bases, mas existem gaps críticos',
    corpo: 'Sua operação tem alguns processos definidos, mas existem lacunas que limitam previsibilidade.',
    cta_texto: 'Quero entender meus gaps',
    ativo: true,
    nota_interna: '[LEGADO]',
  },
  {
    titulo: '[LEGADO v0] Baixo Fit',
    nivel_fit: 'baixo' as const,
    pilar: 'geral' as const,
    headline: 'Sua operação comercial precisa de uma reformulação',
    corpo: 'Os resultados mostram que a operação ainda é muito reativa.',
    cta_texto: 'Iniciar diagnóstico completo',
    ativo: true,
    nota_interna: '[LEGADO]',
  },
]
