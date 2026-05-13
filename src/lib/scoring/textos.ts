// Textos estáticos do diagnóstico — fonte: docs/diagnostico-spec.md v1.0 §7.3, §8.3, §9.

import type {
  CodigoCaminho,
  CodigoInsight,
  CodigoPadrao,
  Eixo,
  FaixaFit,
  FaixaMaturidade,
} from './types'
import { PADRAO_NEUTRO } from './types'

// ──────────────────────────────────────────
// Textos dos padrões (insights) — §7.3
// ──────────────────────────────────────────
export interface TextoPadrao {
  titulo: string
  resumo: string // frase de abertura
  corpo: string  // texto completo
}

export const TEXTOS_PADROES: Record<CodigoPadrao, TextoPadrao> = {
  P1: {
    titulo: 'Atribuição cega',
    resumo: 'Você opera múltiplos canais sem visibilidade do que cada um entrega.',
    corpo:
      'Sua operação roda mais de 3 canais de aquisição, mas a leitura de contribuição por canal ainda depende de estimativa ou não existe. Esse é um padrão que tipicamente aparece quando o marketing escalou mais rápido que a estrutura de medição. Na prática, significa que decisões de alocação de orçamento estão sendo tomadas por intuição — e em vendas complexas, esse padrão frequentemente concentra investimento em canais que geram volume sem gerar pipeline real.',
  },
  P2: {
    titulo: 'CRM órfão',
    resumo: 'Sua empresa tem CRM, mas ele não opera como engrenagem central da operação.',
    corpo:
      'A ferramenta existe, mas a alimentação não é disciplinada e marketing e vendas não compartilham a mesma leitura de pipeline. Esse padrão tem uma consequência específica: o CRM passa a registrar atividade em vez de conduzir operação. Quando isso acontece, o investimento em automação, integração e leitura de funil para de gerar retorno proporcional — porque a base de dados que sustenta essas camadas está incompleta na origem.',
  },
  P3: {
    titulo: 'Funil sem leitura',
    resumo: 'Sua operação roda, mas não mede.',
    corpo:
      'A qualificação dos leads gerados por marketing não é medida com confiança, e marketing e vendas não têm ritual fixo de leitura conjunta de funil. Esse padrão cria um efeito específico: cada área forma a própria narrativa sobre o que está funcionando, baseada em fragmentos diferentes da operação. O resultado é decisão por percepção, não por dado — e em ciclos longos de venda, isso significa que ajustes acontecem tarde, depois que o pipeline já esfriou.',
  },
  P4: {
    titulo: 'Resposta lenta',
    resumo: 'Seu ciclo de venda é longo, mas sua resposta inicial é lenta.',
    corpo:
      'Em vendas complexas com ciclo de 60+ dias, o tempo entre lead chegar e primeira abordagem comercial é decisivo — não porque o cliente vai comprar rápido, mas porque ele está avaliando seriedade da empresa nesse primeiro contato. Quando a resposta leva mais de algumas horas, a operação perde leads que entraram no pico de intenção. O efeito não aparece como queda óbvia: aparece como pipeline que demora a esquentar e propostas que esfriam sem motivo claro.',
  },
  P5: {
    titulo: 'Cultura sem prática',
    resumo: 'Sua empresa fala em testar, mas pratica pouco.',
    corpo:
      'Há intenção declarada de operar com experimentação, mas o número de testes estruturados nos últimos 12 meses não acompanha o discurso. Esse padrão é comum em empresas que reconheceram growth como prática moderna mas ainda não construíram a base operacional que sustenta experimentação real — hipótese clara, métrica de leitura, critério de continuidade. Sem essa base, experimentação vira ação solta, e ação solta não gera aprendizado replicável.',
  },
  P6: {
    titulo: 'Mídia desconectada',
    resumo: 'Sua operação investe em mídia paga sem destino estruturado.',
    corpo:
      'Há mídia rodando, mas o CRM não opera com disciplina que sustente o que ela entrega. Esse padrão cria uma armadilha conhecida: a mídia gera leads, mas a operação comercial não consegue transformar volume em pipeline qualificado. Quando isso acontece, a tendência natural é aumentar verba para compensar a baixa conversão — o que acelera o problema em vez de resolvê-lo. Mídia em vendas complexas só rende quando o sistema que recebe o lead está pronto para tratá-lo.',
  },
  P7: {
    titulo: 'Operação madura, leitura imatura',
    resumo: 'Sua operação executa bem, mas você não sabe exatamente o que está funcionando.',
    corpo:
      'Há ritmo, disciplina e canais rodando, mas a leitura estratégica do que sustenta o resultado ainda é incompleta. Esse padrão tem um risco específico: a operação cresce, mas a empresa fica refém da execução sem entender suas próprias alavancas. Quando o mercado muda ou um canal performa pior, falta diagnóstico para reagir com critério — e a resposta acaba sendo intensificar o que vinha dando certo, mesmo quando essa não é mais a alavanca correta.',
  },
  P8: {
    titulo: 'Vendas resolvendo o que marketing não entrega',
    resumo: 'Seu time comercial está cobrindo o gap de qualificação que marketing deveria entregar.',
    corpo:
      'A qualificação dos leads e a passagem entre marketing e vendas operam sem critérios claros, o que significa que o time comercial está investindo tempo em qualificar antes de vender. Esse padrão tem um custo invisível: vendedores deixam de fechar para qualificar, propostas demoram mais para sair e o ticket médio tende a cair, porque o vendedor prioriza fechar oportunidades fáceis para compensar o tempo gasto qualificando as difíceis.',
  },
}

export const TEXTO_PADRAO_NEUTRO: TextoPadrao = {
  titulo: 'Operação madura',
  resumo: 'Sua operação apresenta sinais consistentes de maturidade em todas as dimensões avaliadas.',
  corpo:
    'Esse perfil é raro entre operações com vendas complexas no Brasil. O que normalmente diferencia empresas neste estágio é a capacidade de aprofundar leitura de dados e estruturar ciclos formais de evolução do sistema.',
}

export function textoPadrao(codigo: CodigoInsight): TextoPadrao {
  if (codigo === PADRAO_NEUTRO) return TEXTO_PADRAO_NEUTRO
  return TEXTOS_PADROES[codigo]
}

// ──────────────────────────────────────────
// Textos dos caminhos de melhoria — §8.3
// ──────────────────────────────────────────
export interface TextoCaminho {
  titulo: string
  alavanca: string
  por_que_para_voce: string
  como_unfold_endereca: string
}

export const TEXTOS_CAMINHOS: Record<CodigoCaminho, TextoCaminho> = {
  C1: {
    titulo: 'Estruturar leitura de funil e atribuição por canal',
    alavanca:
      'Antes de aumentar volume, é necessário ganhar clareza sobre o que cada canal entrega — não em sessões ou cliques, mas em pipeline e receita. Isso passa por estruturar atribuição por canal, definir métricas de funil etapa a etapa e criar um ritual semanal de leitura conjunta entre marketing e vendas.',
    por_que_para_voce:
      'Sua pontuação em Diagnosticar e Evoluir indica que sua operação ainda toma decisões com base em percepção, não em sistema. Estruturar leitura é a alavanca que destrava todas as outras.',
    como_unfold_endereca:
      'Esse é o ponto de partida do Unfold Growth System. O primeiro pilar do método — Diagnosticar — existe exatamente para resolver esse gargalo antes de qualquer outra ação.',
  },
  C2: {
    titulo: 'Reorganizar CRM como engrenagem central da operação',
    alavanca:
      'Um CRM operacional não é uma ferramenta que registra interações — é o sistema que conduz decisões comerciais. Reorganizar essa camada passa por redesenhar pipelines com lógica de funil, definir critérios de movimento entre etapas, configurar automações que reduzam atrito comercial e estabelecer disciplina de alimentação que torne os dados confiáveis.',
    por_que_para_voce:
      'Sua operação tem ferramenta, mas a estrutura ainda não opera como base de inteligência comercial. Sem isso, qualquer investimento em automação ou mídia acaba operando em cima de uma fundação frágil.',
    como_unfold_endereca:
      'CRM e automação fazem parte do core do método UGS — não como camada técnica isolada, mas como engrenagem do sistema de crescimento.',
  },
  C3: {
    titulo: 'Acelerar e roteirizar a resposta comercial',
    alavanca:
      'Em vendas complexas, velocidade de primeira resposta é a métrica mais alta no funil que ninguém olha. Acelerar isso passa por roteamento automatizado de leads, definição clara de quem responde a quê, integração entre canal de entrada e CRM, e cadência de follow-up estruturada nos primeiros dias.',
    por_que_para_voce:
      'Com ciclo de venda longo, cada hora perdida no primeiro contato tem efeito desproporcional. Sua resposta atual está fora do que seu próprio ciclo permite.',
    como_unfold_endereca:
      'O pilar Operar do UGS opera diretamente nessa camada — automação aplicada à conversão e integração marketing-vendas como parte da engrenagem.',
  },
  C4: {
    titulo: 'Alinhar critérios de qualificação entre marketing e vendas',
    alavanca:
      'O alinhamento entre marketing e vendas não se resolve com mais reuniões — resolve-se com critérios documentados de qualificação (SQL/MQL), regras claras de passagem, automação que sustenta esses critérios e ritual fixo de leitura conjunta. Sem isso, marketing entrega o que acha que vendas precisa, e vendas filtra o que acha que vai fechar.',
    por_que_para_voce:
      'Suas respostas indicam que esse alinhamento ainda opera no informal. Em vendas complexas, isso significa perda contínua de oportunidade na passagem — geralmente a maior fonte de desperdício do funil.',
    como_unfold_endereca:
      'Integração marketing-vendas é o que o método UGS chama de engrenagem central — não é entregável separado, é a lógica que conecta todos os pilares.',
  },
  C5: {
    titulo: 'Implementar ciclos curtos de teste e leitura',
    alavanca:
      'Cultura de teste real não nasce de intenção — nasce de ritual. Implementar ciclos curtos significa estruturar hipóteses claras, definir critérios de sucesso antes do teste, executar em janelas curtas (2-4 semanas) e ter ritual fixo de leitura de resultado e decisão de continuidade.',
    por_que_para_voce:
      'Sua empresa reconhece teste como prática, mas a prática real ainda é esparsa. Estruturar ritmo é o que diferencia experimentação produtiva de ação solta.',
    como_unfold_endereca:
      'O pilar Evoluir do UGS opera exatamente nessa camada — ciclos contínuos de leitura, hipótese, teste e ajuste como parte da operação recorrente, não como projeto pontual.',
  },
}

// ──────────────────────────────────────────
// Frases descritivas — Score consolidado §9.2
// ──────────────────────────────────────────
export const FRASE_FAIXA_CONSOLIDADA: Record<FaixaMaturidade, string> = {
  critica:
    'Sua operação ainda opera em modo de tentativa, sem base estrutural para sustentar crescimento previsível.',
  'em-formacao':
    'Sua operação tem fundação, mas ainda opera com gaps estruturais que limitam previsibilidade.',
  estruturada:
    'Sua operação tem método em vários pontos, mas ainda opera com gaps que limitam evolução contínua.',
  madura:
    'Sua operação opera com método consistente. As alavancas agora são de aprofundamento, não de construção.',
}

export const LABEL_FAIXA: Record<FaixaMaturidade, string> = {
  critica: 'Crítica',
  'em-formacao': 'Em formação',
  estruturada: 'Estruturada',
  madura: 'Madura',
}

// ──────────────────────────────────────────
// Frases por eixo × faixa — §9.3
// ──────────────────────────────────────────
export const FRASES_EIXOS: Record<Eixo, Record<FaixaMaturidade, string>> = {
  diagnosticar: {
    critica: 'Sua leitura do próprio funil é praticamente inexistente.',
    'em-formacao': 'Sua capacidade de ler o próprio funil ainda é incompleta.',
    estruturada: 'Você lê o funil, mas a profundidade ainda permite ajustes pontuais.',
    madura: 'Você lê o funil com profundidade e usa essa leitura para decidir.',
  },
  estruturar: {
    critica: 'A base operacional (CRM, funil, passagem) ainda não existe.',
    'em-formacao': 'A base operacional ainda não sustenta crescimento.',
    estruturada: 'A base existe, com gaps específicos que ainda limitam integração.',
    madura: 'A base está madura e sustenta o sistema de crescimento.',
  },
  operar: {
    critica: 'A execução é improvisada e reativa.',
    'em-formacao': 'A execução existe, mas opera sem ritmo.',
    estruturada: 'Sua execução é razoável, mas tem gaps específicos.',
    madura: 'Sua execução opera com disciplina e ritmo.',
  },
  evoluir: {
    critica: 'Sua operação não evolui — ela só reage.',
    'em-formacao': 'Você reconhece evolução, mas a prática ainda é esparsa.',
    estruturada: 'Sua operação evolui, mas o ritmo ainda é inconsistente.',
    madura: 'Sua operação evolui com ciclos claros de aprendizado.',
  },
  gestao: {
    critica: 'A leitura como liderança ainda trata growth como esforço, não como sistema.',
    'em-formacao': 'Sua leitura como liderança está em formação.',
    estruturada: 'Sua leitura como liderança está adiante da sua operação.',
    madura: 'Sua leitura como liderança é madura e orienta o sistema.',
  },
}

export const LABEL_EIXO: Record<Eixo, string> = {
  diagnosticar: 'Diagnosticar',
  estruturar: 'Estruturar',
  operar: 'Operar',
  evoluir: 'Evoluir',
  gestao: 'Gestão',
}

// ──────────────────────────────────────────
// CTA de agendamento — §9.6
// ──────────────────────────────────────────
export interface TextoCTA {
  headline: string
  microcopy: string
  slot_minutos: 20 | 30 | 45
}

export const CTA_POR_FAIXA: Record<FaixaFit, TextoCTA> = {
  'fit-alto': {
    headline: 'Vamos discutir esse diagnóstico em profundidade',
    microcopy:
      'Agende uma conversa estratégica com a equipe da Unfold para destrinchar seus resultados e desenhar prioridades.',
    slot_minutos: 45,
  },
  'fit-medio': {
    headline: 'Quer aprofundar a leitura do seu diagnóstico?',
    microcopy:
      'Agende uma conversa para discutir os pontos sinalizados e avaliar como endereçar.',
    slot_minutos: 30,
  },
  'fit-baixo': {
    headline: 'Quer conversar sobre os pontos do diagnóstico?',
    microcopy:
      'Reserve um momento para discutirmos o que apareceu no seu diagnóstico e os primeiros passos.',
    slot_minutos: 20,
  },
  desfit: {
    headline: 'Vamos conversar sobre seus próximos passos?',
    microcopy:
      'Reserve um momento para discutirmos o resultado e direções iniciais que fazem sentido pro seu estágio atual.',
    slot_minutos: 20,
  },
}

export const LABEL_FAIXA_FIT: Record<FaixaFit, string> = {
  'fit-alto': 'Fit Alto',
  'fit-medio': 'Fit Médio',
  'fit-baixo': 'Fit Baixo',
  desfit: 'Desfit',
}
