/**
 * Modelo de conteúdo estruturado do hotsite (ADR-001 / Redesign S0).
 *
 * Separa CONTEÚDO (dado tipado) de APRESENTAÇÃO (componentes React), substituindo
 * o blob A4 de `guia-content.ts`. O texto, números, leis e fontes são preservados
 * 1:1 do material original (gate de paridade do QA antes de aposentar o A4).
 *
 * S0 — POC: apenas a "Parte 00 — O cenário" (páginas 5–7 do original) está migrada,
 * o suficiente para validar a direção visual dark premium ponta-a-ponta.
 */

export interface StatItem {
  /** Valor-herói exibido com count-up (ex.: '89%', '144M', '9h13', '2x'). */
  value: string
  /** Texto de apoio (HTML inline com <strong> preservado). */
  label: string
  /** Fonte do dado (renderizada em mono). */
  fonte: string
}

export interface StatHighlightItem {
  value: string
  /** Texto do destaque (HTML inline preservado). */
  texto: string
  fonte: string
}

export interface TimelineNode {
  data: string
  evento: string
  obs?: string
  /** Marco crítico (destaque visual). */
  destaque?: boolean
}

export interface FunnelStep {
  tag: string
  nome: string
  desc: string
  canal: string
}

export interface ChartDatum {
  label: string
  /** Valor numérico (ex.: 93 para 93%). */
  value: number
  /** Sufixo exibido (ex.: '%'). */
  suffix?: string
}

export interface CompareItem {
  termo: string
  detalhe: string
}

export type SeverityLevel = 'multa' | 'cassacao' | 'crime'

export interface SeverityItem {
  pratica: string
  consequencia: string
  nivel: SeverityLevel
}

export type GuiaBlock =
  | { kind: 'prose'; html: string }
  | { kind: 'stats'; items: StatItem[] }
  | { kind: 'highlight'; items: StatHighlightItem[] }
  | { kind: 'callout'; html: string }
  | { kind: 'chart'; titulo: string; data: ChartDatum[]; fonte: string }
  | { kind: 'timeline'; nodes: TimelineNode[]; fonte?: string }
  | { kind: 'funnel'; steps: FunnelStep[] }
  | { kind: 'compare'; variante: 'permitido' | 'vedado'; rotulo: string; itens: CompareItem[]; fonte?: string }
  | { kind: 'severity'; itens: SeverityItem[]; fonte?: string }
  | { kind: 'quote'; texto: string; fonte: string }

export interface GuiaSection {
  /** Âncora estável para navegação/SEO. */
  id: string
  /** Marcador de parte (ex.: 'Parte 00'). */
  parte?: string
  /** Overline em mono (ex.: 'Parte 00 · Seção 01'). */
  overline?: string
  /** Numeral grande translúcido de fundo (substitui número de página). */
  numeral?: string
  titulo: string
  subtitulo?: string
  blocks: GuiaBlock[]
  /** Variação de superfície para ritmo visual entre seções. */
  surface?: 'base' | 'elevated'
  /** Abertura de parte (hero curto), sem blocos de dado. */
  intro?: boolean
}

/**
 * Conteúdo do hotsite (vitrine enxuta tipo driva.io). As seções de maior impacto
 * do guia, repaginadas; o conteúdo completo das 36 páginas vive no PDF.
 * Conteúdo preservado fielmente do material original.
 */
export const GUIA_SECTIONS_POC: GuiaSection[] = [
  {
    id: 'capa',
    overline: 'Guia Executivo · 2026 · Unfold × Feat.Work',
    titulo: 'Guia de anúncios digitais para as Eleições de 2026',
    subtitulo:
      'Regras, plataformas, riscos e oportunidades da operação política online.',
    intro: true,
    surface: 'base',
    blocks: [],
  },
  {
    id: 'parte-00',
    parte: 'Parte 00',
    numeral: '00',
    titulo: 'O cenário',
    subtitulo:
      'A dimensão do digital no Brasil e seu impacto sobre o voto. Os números que mostram por que essa peça precisa existir.',
    intro: true,
    surface: 'base',
    blocks: [],
  },
  {
    id: 'digital-em-numeros',
    overline: 'Parte 00 · Seção 01',
    numeral: '01',
    titulo: 'O digital no Brasil em números',
    subtitulo:
      'A penetração da internet e das redes sociais no Brasil deixou de ser tendência e virou infraestrutura. Antes de discutir regras eleitorais, vale calibrar a dimensão do terreno em que a campanha vai operar.',
    surface: 'elevated',
    blocks: [
      {
        kind: 'stats',
        items: [
          {
            value: '89%',
            label:
              'da população brasileira é usuária de internet (indicador ampliado) — equivalente a <strong>166 milhões de pessoas</strong>.',
            fonte: 'TIC Domicílios 2024 · CGI.br / NIC.br / Cetic.br',
          },
          {
            value: '60%',
            label:
              'acessam a internet <strong>exclusivamente pelo celular</strong> — proporção que sobe para 86% nas classes DE.',
            fonte: 'TIC Domicílios 2024 · CGI.br',
          },
          {
            value: '9h13',
            label:
              'é o tempo médio diário do brasileiro online. O Brasil é o <strong>2º país do mundo</strong> em tempo de uso, atrás apenas da África do Sul.',
            fonte: 'Digital 2024 · We Are Social / Meltwater',
          },
          {
            value: '3h37',
            label:
              'é o tempo médio diário gasto nas redes sociais. O Brasil é o <strong>3º país do mundo</strong> em tempo dedicado a redes.',
            fonte: 'Digital 2024 · We Are Social / Meltwater',
          },
          {
            value: '93%',
            label:
              'dos brasileiros conectados usam <strong>WhatsApp</strong>, com Instagram (91%) e Facebook (83%) logo atrás. TikTok já alcança 65%.',
            fonte: 'Data Report 2024 Brasil · We Are Social / Meltwater',
          },
          {
            value: '144M',
            label:
              'de brasileiros são usuários ativos de redes sociais — mais da metade da população do país.',
            fonte: 'Digital 2024 · We Are Social / Meltwater',
          },
        ],
      },
      {
        kind: 'callout',
        html: '<strong>Implicação para a campanha:</strong> em 2026, quase 9 em cada 10 brasileiros estão conectados e passam mais de um terço do seu tempo de vigília online. A campanha que ignorar o digital não economiza recurso — abandona o ambiente onde a decisão de voto é cada vez mais formada.',
      },
    ],
  },
  {
    id: 'impacto-sobre-o-voto',
    overline: 'Parte 00 · Seção 02',
    numeral: '02',
    titulo: 'O impacto sobre o voto',
    subtitulo:
      'Dados de penetração, por si, não definem peso eleitoral. Mas estudos pós-eleitorais e pesquisas oficiais confirmam: o digital não apenas alcança o eleitor — ele molda decisão de voto.',
    surface: 'base',
    blocks: [
      {
        kind: 'highlight',
        items: [
          {
            value: '2x',
            texto:
              'O uso de Facebook, WhatsApp e YouTube como fontes de informação política <strong>quase dobrou as chances</strong> de uma pessoa votar em Bolsonaro em 2018 — com peso comparável ao de variáveis como ideologia de direita e valores religiosos.',
            fonte:
              'Estudo Eleitoral Brasileiro · Dados — Revista de Ciências Sociais (2022) · Mundim, Vasconcellos e Okado',
          },
          {
            value: '45%',
            texto:
              'dos brasileiros afirmaram já ter <strong>decidido o voto</strong> levando em consideração informações vistas em redes sociais. 80% reconhecem grande influência das redes sobre a opinião política.',
            fonte: 'Pesquisa DataSenado · Instituto de Pesquisa do Senado Federal (2019)',
          },
          {
            value: '56%',
            texto:
              'dos eleitores brasileiros afirmaram que mídias sociais tiveram <strong>algum grau de influência</strong> na escolha do candidato a presidente em 2018 — 36% relataram muita influência.',
            fonte: 'Pesquisa IBOPE Inteligência (2018)',
          },
          {
            value: '79%',
            texto:
              'dos brasileiros usam <strong>WhatsApp como fonte de informação</strong> — incluindo política. O aplicativo é a principal porta de entrada de notícia no país.',
            fonte: 'DataSenado em parceria com Câmara e Senado Federal (2019)',
          },
        ],
      },
      {
        kind: 'callout',
        html: '<strong>Conclusão operacional:</strong> a campanha digital em 2026 não é canal complementar. É o canal onde a maior parte do eleitorado encontra informação política, forma opinião e decide voto. Operar com competência nesse ambiente é condição de competitividade — operar mal pode custar a eleição ou o mandato.',
      },
    ],
  },
  {
    id: 'plataformas-penetracao',
    overline: 'Parte 02 · Panorama',
    numeral: '03',
    titulo: 'Onde o eleitor está',
    subtitulo:
      'Penetração das principais plataformas entre os brasileiros conectados — a base para decidir onde concentrar mídia e conteúdo orgânico.',
    surface: 'elevated',
    blocks: [
      {
        kind: 'chart',
        titulo: 'Uso de plataformas entre brasileiros conectados',
        data: [
          { label: 'WhatsApp', value: 93, suffix: '%' },
          { label: 'Instagram', value: 91, suffix: '%' },
          { label: 'Facebook', value: 83, suffix: '%' },
          { label: 'TikTok', value: 65, suffix: '%' },
        ],
        fonte: 'Data Report 2024 Brasil · We Are Social / Meltwater',
      },
    ],
  },
  {
    id: 'calendario-2026',
    overline: 'Parte 01 · Seção 03',
    numeral: '04',
    titulo: 'Calendário 2026 das eleições',
    subtitulo:
      'As datas que organizam a operação digital de campanha. Imprimir, marcar no calendário interno, compartilhar com toda a equipe.',
    surface: 'base',
    blocks: [
      {
        kind: 'timeline',
        fonte: 'Fonte: Resolução TSE nº 23.760/2026 (Calendário Eleitoral 2026)',
        nodes: [
          { data: '15 · Maio', evento: 'Início da arrecadação por financiamento coletivo', obs: 'Pré-candidatos podem captar recursos via plataformas autorizadas.' },
          { data: '05 · Julho', evento: 'Início da propaganda intrapartidária', obs: 'Pré-candidatos buscam indicação dentro do partido. Vedado rádio, TV e outdoor.' },
          { data: '20 · Julho', evento: 'Início das convenções partidárias', obs: 'Convenções escolhem candidaturas. Direito de resposta começa para candidatos escolhidos.' },
          { data: '05 · Agosto', evento: 'Fim das convenções partidárias' },
          { data: '16 · Agosto', evento: 'Início oficial da propaganda eleitoral · Início do impulsionamento pago', obs: 'Candidato pode pedir voto. Mídia paga na Meta libera.', destaque: true },
          { data: '13 · Setembro', evento: 'Prazo para envio da prestação parcial de contas' },
          { data: '01 · Outubro', evento: 'Último dia para circulação paga ou impulsionada na internet', obs: 'Resolução 23.610, art. 29, §11.', destaque: true },
          { data: '01 — 04 · Out', evento: 'Blackout de 72h para conteúdo sintético com imagem/voz de candidato', obs: 'Proibido mesmo se rotulado.' },
          { data: '04 · Outubro', evento: '1º TURNO', destaque: true },
          { data: '05 · Outubro', evento: 'Fim do blackout de IA · Reabertura para candidaturas que avançam ao 2º turno' },
          { data: '25 · Outubro', evento: 'EVENTUAL 2º TURNO', destaque: true },
        ],
      },
    ],
  },
  {
    id: 'quem-paga-midia',
    overline: 'Parte 01 · Seção 05',
    numeral: '05',
    titulo: 'Quem pode contratar mídia eleitoral',
    subtitulo:
      'Esta é uma das fronteiras mais policiadas pela Justiça Eleitoral. Confundir quem paga é um dos caminhos mais diretos para irregularidade na prestação de contas.',
    surface: 'base',
    blocks: [
      {
        kind: 'quote',
        texto:
          'O impulsionamento somente será permitido se contratado diretamente com o provedor de aplicação pela candidata, candidato, partido, federação, coligação ou seus representantes.',
        fonte: 'Resolução TSE nº 23.610/2019, art. 29 · com redação da Res. 23.755/2026',
      },
      {
        kind: 'callout',
        html: '<strong>Atenção:</strong> quando um apoiador paga para impulsionar um conteúdo do candidato, mesmo com boa intenção, configura uso de recurso de origem não identificada (RONI). RONI pode levar à reprovação das contas e à inelegibilidade do candidato.',
      },
    ],
  },
  {
    id: 'praticas-permitidas',
    overline: 'Parte 02 · Seção 01',
    numeral: '06',
    titulo: 'O que pode ser feito',
    subtitulo:
      'As práticas digitais permitidas em campanha eleitoral, desde que respeitadas as condições específicas de cada uma.',
    surface: 'elevated',
    blocks: [
      {
        kind: 'compare',
        variante: 'permitido',
        rotulo: 'Permitido',
        fonte: 'Fontes: Resolução TSE nº 23.610/2019 · Lei nº 9.504/1997 · LGPD (Lei nº 13.709/2018)',
        itens: [
          { termo: 'Impulsionar posts na Meta', detalhe: 'Apenas entre 16/08 e 01/10. Anunciante verificado pela Meta. Pagamento da conta de campanha. Criativo com "Propaganda Eleitoral" + CNPJ/CPF visível.' },
          { termo: 'Anúncios em vídeo na Meta', detalhe: 'Mesmas condições do impulsionamento. Rótulo legível durante todo o vídeo.' },
          { termo: 'Click-to-WhatsApp via Meta', detalhe: 'Permitido para iniciar conversa. Depois, conversa deve ser humana ou bot identificado, sem disparo em massa.' },
          { termo: 'Anúncios de geração de leads', detalhe: 'Permitido com base legal LGPD documentada, finalidade explícita, opt-in claro.' },
          { termo: 'Segmentação geográfica', detalhe: 'Permitido e recomendado. Coerência com circunscrição eleitoral.' },
          { termo: 'Remarketing', detalhe: 'Permitido sobre visitantes lícitos do site. Pixel da Meta declarado em política de privacidade.' },
        ],
      },
      {
        kind: 'severity',
        fonte: 'Base: Resolução TSE nº 23.610/2019 · Res. 23.755/2026 · LGPD',
        itens: [
          { pratica: 'Apoiador paga impulsionamento do candidato', consequencia: 'Recurso de origem não identificada (RONI) → reprovação de contas e inelegibilidade.', nivel: 'cassacao' },
          { pratica: 'Disparo em massa no WhatsApp', consequencia: 'O terreno mais arriscado: prática vedada, sujeita a multa e investigação.', nivel: 'multa' },
          { pratica: 'Deepfake com imagem/voz de candidato', consequencia: 'Nova linha vermelha: pode cassar mandato e configurar crime eleitoral.', nivel: 'crime' },
          { pratica: 'Compra de listas / uso de dados sem base legal', consequencia: 'Violação da LGPD aplicada a campanhas → caminho direto à cassação.', nivel: 'cassacao' },
        ],
      },
    ],
  },
  {
    id: 'funil-eleitoral',
    overline: 'Parte 03 · Seção',
    numeral: '07',
    titulo: 'Funil eleitoral em seis etapas',
    subtitulo:
      'A jornada do eleitor digital pode ser pensada como funil, com etapas claras de objetivo, canal e tipo de conteúdo. Cada etapa tem seu lugar e seu momento.',
    surface: 'base',
    blocks: [
      {
        kind: 'funnel',
        steps: [
          { tag: 'Etapa 01', nome: 'Reconhecimento', desc: 'Eleitor descobre quem é o candidato.', canal: 'Meta (paga) + orgânico em todas as redes. Vídeos curtos, foto + texto, Reels e Stories.' },
          { tag: 'Etapa 02', nome: 'Construção de reputação', desc: 'Eleitor passa a considerar o candidato confiável.', canal: 'Meta + YouTube + assessoria. Testemunhos, registros de eventos, conteúdo institucional, biografia.' },
          { tag: 'Etapa 03', nome: 'Educação sobre propostas', desc: 'Eleitor entende o que o candidato propõe.', canal: 'Meta (formatos longos), YouTube, site. Carrosséis, vídeos por tema, guia em PDF.' },
          { tag: 'Etapa 04', nome: 'Engajamento e comunidade', desc: 'Eleitor passa de audiência a comunidade ativa.', canal: 'Meta (mensagens), WhatsApp (voluntariado), TikTok (lives). Perguntas e respostas, conversa direta.' },
          { tag: 'Etapa 05', nome: 'Mobilização', desc: 'Apoiador se transforma em ação concreta.', canal: 'Meta (Click-to-WA), WhatsApp (base cadastrada), e-mail. Convites para eventos, mutirões.' },
          { tag: 'Etapa 06', nome: 'Conversão política', desc: 'Eleitor decide o voto.', canal: 'Meta (remarketing), WhatsApp (base), e-mail final. Vídeos finais, recapitulação, mensagem em primeira pessoa.' },
        ],
      },
    ],
  },
]

/** Alias usado pela página de produção (mesmo conteúdo da vitrine). */
export const GUIA_SECTIONS = GUIA_SECTIONS_POC
