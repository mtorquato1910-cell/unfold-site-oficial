/**
 * Seed de 2 cases fictícios para desenvolvimento.
 * Executar via API route POST /api/seed/cases (dev only).
 * Marcar como [CASE FICTÍCIO] para identificação fácil no admin.
 */

export const SEED_CASES = [
  {
    title: '[CASE FICTÍCIO] Pipeline de R$8MM em Construção Civil B2B',
    slug: 'construtora-demo-pipeline-b2b',
    client: '[CASE FICTÍCIO - Empresa Demo Construção]',
    vertical: 'construcao' as const,
    tagline: 'De 18 meses de ciclo para 6 — com pipeline de R$8MM estruturado.',
    highlights: [
      { label: 'Pipeline gerado', value: 'R$ 8MM' },
      { label: 'Redução do ciclo', value: '-67%' },
      { label: 'CPL', value: '-88%' },
      { label: 'Taxa de fechamento', value: '+3,2x' },
    ],
    challenge:
      'A construtora operava com uma equipe comercial reativa, sem processo estruturado de geração de demanda. O ciclo médio de negociação chegava a 18 meses, o CPL era desconhecido e não havia diferenciação clara frente à concorrência. Marketing e vendas funcionavam em silos, sem rastreabilidade de oportunidades.',
    solution:
      'Aplicamos o método UGS em três pilares: (1) Diagnóstico do sistema de geração de demanda — mapeamos ICP, jornada de compra e gaps de funil; (2) Estruturação do sistema — implementamos CRM, cadências de nutrição segmentadas por estágio e playbook comercial; (3) Operação e otimização — ciclos quinzenais de revisão de pipeline, ajuste de mensagens e treinamento do time.',
    pillars: [
      {
        pilar: 'diagnosticar' as const,
        descricao: 'Mapeamento completo do sistema de geração de demanda',
        acoes: [
          { acao: 'Entrevistas com clientes de alto valor para definição de ICP' },
          { acao: 'Auditoria de canais e atribuição de leads histórica' },
          { acao: 'Mapeamento da jornada de compra com 7 estágios' },
        ],
      },
      {
        pilar: 'estruturar' as const,
        descricao: 'Implementação do sistema de crescimento integrado',
        acoes: [
          { acao: 'Implantação e configuração do CRM (pipeline + automações)' },
          { acao: 'Criação de cadências de email e WhatsApp por estágio' },
          { acao: 'Desenvolvimento de playbook comercial com objeções e provas sociais' },
        ],
      },
      {
        pilar: 'operar' as const,
        descricao: 'Operação contínua e otimização por dados',
        acoes: [
          { acao: 'Ciclos quinzenais de revisão de funil e conversão' },
          { acao: 'Ajuste de mensagens por segmento a cada sprint' },
          { acao: 'Treinamento mensal do time comercial com dados reais' },
        ],
      },
    ],
    results: [
      { metrica: 'Pipeline total estruturado', valor: 'R$ 8.000.000', contexto: 'Em 9 meses de operação' },
      { metrica: 'Redução do ciclo de negociação', valor: '-67%', contexto: 'De 18 para 6 meses' },
      { metrica: 'Custo por Lead Qualificado', valor: '-88%', contexto: 'Comparado ao período anterior' },
      { metrica: 'Taxa de fechamento', valor: '+3,2x', contexto: 'No segmento de incorporadoras' },
    ],
    destacar_na_home: true,
    status: 'publicado' as const,
    published_at: '2024-03-15T00:00:00.000Z',
  },
  {
    title: '[CASE FICTÍCIO] Sistema de Geração de Demanda para Insumos Agro',
    slug: 'agro-demo-geracao-demanda',
    client: '[CASE FICTÍCIO - Empresa Demo Agro]',
    vertical: 'agro' as const,
    tagline: 'Primeiro sistema integrado de geração de demanda em empresa de insumos.',
    highlights: [
      { label: 'Leads qualificados/mês', value: '+340%' },
      { label: 'Conversão MQL→SQL', value: '42%' },
      { label: 'CAC', value: '-55%' },
      { label: 'NPS comercial', value: '71' },
    ],
    challenge:
      'A empresa de insumos agrícolas dependia 100% da rede de representantes para geração de negócios, sem nenhum canal digital estruturado. A sazonalidade criava picos de demanda não administrados, e não havia visibilidade de pipeline futuro. O marketing estava limitado à produção de material de apoio para o time de vendas.',
    solution:
      'Estruturamos do zero o sistema de geração de demanda digital integrado com a operação de campo: (1) Diagnóstico de ICP por cultura e região; (2) Criação de conteúdo técnico de alto valor para atração de agrônomos e produtores; (3) Automação de nutrição segmentada por cultura e estágio; (4) Integração CRM + ERP para rastreabilidade ponta a ponta.',
    pillars: [
      {
        pilar: 'diagnosticar' as const,
        descricao: 'ICP e jornada por segmento de cultura',
        acoes: [
          { acao: 'Pesquisa com 40 produtores e 15 agrônomos parceiros' },
          { acao: 'Mapeamento de canais de informação por segmento' },
          { acao: 'Análise da sazonalidade e janelas de compra' },
        ],
      },
      {
        pilar: 'estruturar' as const,
        descricao: 'Sistema digital integrado com operação de campo',
        acoes: [
          { acao: 'Criação de blog técnico com 24 artigos iniciais' },
          { acao: 'Fluxos de nutrição segmentados por cultura (soja, milho, café)' },
          { acao: 'Integração CRM + ERP para visibilidade de pipeline' },
        ],
      },
      {
        pilar: 'operar' as const,
        descricao: 'Operação e escala sustentável',
        acoes: [
          { acao: 'Dashboard de performance por safra e região' },
          { acao: 'Treinamento da equipe de campo em social selling' },
          { acao: 'Ciclos mensais de revisão com diretor comercial' },
        ],
      },
    ],
    results: [
      { metrica: 'Leads qualificados por mês', valor: '+340%', contexto: 'Em 6 meses pós-implementação' },
      { metrica: 'Taxa de conversão MQL para SQL', valor: '42%', contexto: 'Acima da média do setor (18%)' },
      { metrica: 'Custo de Aquisição de Cliente', valor: '-55%', contexto: 'Vs modelo anterior 100% field' },
      { metrica: 'NPS do processo comercial', valor: '71 pontos', contexto: 'Pesquisa com clientes ativos' },
    ],
    destacar_na_home: false,
    status: 'publicado' as const,
    published_at: '2024-06-20T00:00:00.000Z',
  },
]
