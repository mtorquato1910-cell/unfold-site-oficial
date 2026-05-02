/**
 * Seed de 12 quiz-questions e 3 insights-variations fictícios para desenvolvimento.
 * Executar via POST /api/seed/diagnostico (dev only).
 * Marcar como [PERGUNTA EXEMPLO - SUBSTITUIR] para identificação fácil.
 */

const OPCOES_PADRAO = [
  { texto: 'Não fazemos isso', valor: 0 },
  { texto: 'Fazemos de forma informal', valor: 1 },
  { texto: 'Temos um processo básico', valor: 2 },
  { texto: 'Temos um processo bem definido', valor: 3 },
  { texto: 'Temos um processo estruturado e otimizado', valor: 4 },
]

export const SEED_QUIZ_QUESTIONS = [
  // Pilar: Diagnosticar (3 perguntas)
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Como sua empresa identifica e mapeia o perfil ideal de cliente (ICP)?',
    pilar: 'diagnosticar' as const,
    peso: 2,
    ordem: 1,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR] Substituir pela pergunta real do Gabriel',
  },
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Como você avalia a previsibilidade do seu pipeline de vendas?',
    pilar: 'diagnosticar' as const,
    peso: 3,
    ordem: 2,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Qual é o nível de rastreabilidade das suas métricas de topo de funil?',
    pilar: 'diagnosticar' as const,
    peso: 2,
    ordem: 3,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
  // Pilar: Estruturar (3 perguntas)
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Como está estruturado o processo de qualificação de leads na sua empresa?',
    pilar: 'estruturar' as const,
    peso: 3,
    ordem: 4,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Qual é o nível de adoção e uso do CRM pela equipe comercial?',
    pilar: 'estruturar' as const,
    peso: 2,
    ordem: 5,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Como sua empresa documenta e padroniza o playbook de vendas?',
    pilar: 'estruturar' as const,
    peso: 2,
    ordem: 6,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
  // Pilar: Operar (6 perguntas — peso extra para equilibrar)
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Com que frequência sua equipe realiza revisões estruturadas de pipeline?',
    pilar: 'operar' as const,
    peso: 2,
    ordem: 7,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Como é feito o treinamento e onboarding de novos vendedores?',
    pilar: 'operar' as const,
    peso: 1,
    ordem: 8,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Qual é o nível de alinhamento entre as áreas de marketing e vendas?',
    pilar: 'operar' as const,
    peso: 2,
    ordem: 9,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Como sua empresa mede e acompanha a taxa de conversão por etapa do funil?',
    pilar: 'operar' as const,
    peso: 3,
    ordem: 10,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Como é feita a geração de demanda outbound na sua empresa?',
    pilar: 'operar' as const,
    peso: 2,
    ordem: 11,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
  {
    pergunta: '[PERGUNTA EXEMPLO - SUBSTITUIR] Qual é o processo de feedback e melhoria contínua do seu time comercial?',
    pilar: 'operar' as const,
    peso: 1,
    ordem: 12,
    opcoes: OPCOES_PADRAO,
    ativo: true,
    nota_interna: '[PERGUNTA EXEMPLO - SUBSTITUIR]',
  },
]

export const SEED_INSIGHTS = [
  {
    titulo: '[INSIGHT EXEMPLO - SUBSTITUIR] Alto Fit — Pronto para escalar',
    nivel_fit: 'alto' as const,
    pilar: 'geral' as const,
    headline: 'Sua operação comercial está madura para escalar',
    corpo: '[INSIGHT EXEMPLO - SUBSTITUIR] Você demonstra maturidade nos três pilares do método UGS. Sua empresa já tem a base necessária para uma aceleração estruturada de crescimento. O próximo passo é implementar ciclos de otimização contínua e escalar o que já funciona com consistência.',
    cta_texto: 'Quero agendar minha conversa estratégica',
    ativo: true,
    nota_interna: '[INSIGHT EXEMPLO - SUBSTITUIR] Substituir pelo insight real validado com o Gabriel',
  },
  {
    titulo: '[INSIGHT EXEMPLO - SUBSTITUIR] Médio Fit — Oportunidades claras',
    nivel_fit: 'medio' as const,
    pilar: 'geral' as const,
    headline: 'Você tem boas bases, mas existem gaps críticos',
    corpo: '[INSIGHT EXEMPLO - SUBSTITUIR] Sua operação comercial já tem alguns processos definidos, mas ainda existem lacunas importantes que limitam sua previsibilidade e crescimento. O método UGS pode ajudar a identificar e estruturar exatamente esses pontos de alavanca.',
    cta_texto: 'Quero entender meus gaps com um especialista',
    ativo: true,
    nota_interna: '[INSIGHT EXEMPLO - SUBSTITUIR]',
  },
  {
    titulo: '[INSIGHT EXEMPLO - SUBSTITUIR] Baixo Fit — Diagnóstico urgente',
    nivel_fit: 'baixo' as const,
    pilar: 'geral' as const,
    headline: 'Sua operação comercial precisa de uma reformulação',
    corpo: '[INSIGHT EXEMPLO - SUBSTITUIR] Os resultados do seu diagnóstico mostram que a operação comercial ainda é muito reativa e informal. Isso cria imprevisibilidade no pipeline, dificulta escala e aumenta o custo por aquisição. A boa notícia: com a estrutura certa, os resultados aparecem rapidamente.',
    cta_texto: 'Quero iniciar meu diagnóstico completo',
    ativo: true,
    nota_interna: '[INSIGHT EXEMPLO - SUBSTITUIR]',
  },
]
