/**
 * Schema das 13 perguntas + captura (fonte: proto_ferramenta_mapa_icp).
 * Perguntas são FIXAS (não editáveis no admin). Tipos: text | textarea | single | multi | capture.
 * Opções com `outro:true` revelam um campo de texto curto no app (PRD front-end §2).
 */

export type StepType = 'text' | 'textarea' | 'single' | 'multi' | 'capture'

export interface Step {
  id: string
  block: string
  type: StepType
  required?: boolean
  q: string
  helper?: string
  placeholder?: string
  /** [valor, rótulo] */
  options?: [string, string][]
  /** permite opção "outro" com campo livre */
  allowOutro?: boolean
}

export const STEPS: Step[] = [
  { id: 'A1', block: 'Seu negócio', type: 'text', required: true,
    q: 'O que sua empresa vende, em uma frase?',
    helper: 'Sem rodeio. A frase que você usaria numa apresentação.',
    placeholder: 'Ex.: Implantamos e operamos CRM para incorporadoras.' },
  { id: 'A2', block: 'Seu negócio', type: 'text', required: true,
    q: 'Que transformação o cliente tem ao comprar de você?',
    helper: 'O antes e o depois — o que muda na vida dele.',
    placeholder: 'Ex.: Sai de um funil cego para previsibilidade de vendas.' },
  { id: 'A3', block: 'Seu negócio', type: 'single', required: true,
    q: 'Qual o ticket médio (contrato ou projeto)?',
    options: [['<5k', 'Até R$ 5 mil'], ['5-20k', 'R$ 5 mil a 20 mil'], ['20-50k', 'R$ 20 mil a 50 mil'], ['50-200k', 'R$ 50 mil a 200 mil'], ['200k+', 'Acima de R$ 200 mil']] },
  { id: 'A4', block: 'Seu negócio', type: 'single', required: true,
    q: 'Qual o ciclo de venda típico?',
    options: [['<30d', 'Menos de 30 dias'], ['30-60d', '30 a 60 dias'], ['60-120d', '60 a 120 dias'], ['120d+', 'Mais de 120 dias']] },
  { id: 'A5', block: 'Seu negócio', type: 'single', required: true,
    q: 'Qual o modelo de venda?',
    options: [['B2B', 'B2B'], ['B2C', 'B2C'], ['Hibrido', 'Híbrido']] },

  { id: 'B1', block: 'Seus melhores clientes', type: 'textarea', required: true,
    q: 'Descreva 1 a 3 dos seus melhores clientes atuais.',
    helper: 'Setor e porte. São a âncora real do seu ICP.',
    placeholder: 'Ex.: Incorporadora média em capital do Nordeste; agroindústria de grãos com força de venda em campo.' },
  { id: 'B2', block: 'Seus melhores clientes', type: 'multi', required: true,
    q: 'Por que esses clientes fecham com você e permanecem?',
    helper: 'Selecione os principais.', allowOutro: true,
    options: [['preco', 'Preço'], ['autoridade', 'Autoridade técnica'], ['relacionamento', 'Relacionamento'], ['resultado', 'Resultado entregue'], ['urgencia', 'Urgência da dor'], ['indicacao', 'Indicação']] },
  { id: 'B3', block: 'Seus melhores clientes', type: 'textarea', required: true,
    q: 'Que tipo de cliente dá trabalho e não vale a pena?',
    helper: 'Isso vira seu anti-ICP.',
    placeholder: 'Ex.: Empresa pequena que quer resultado em 30 dias e resiste a CRM.' },

  { id: 'C1', block: 'O comitê de compra', type: 'single', required: true,
    q: 'Quantas pessoas costumam participar da decisão?',
    options: [['1', 'Uma'], ['2-3', '2 a 3'], ['4-6', '4 a 6'], ['7+', '7 ou mais']] },
  { id: 'C2', block: 'O comitê de compra', type: 'multi', required: true,
    q: 'Quais áreas ou cargos participam ou influenciam?',
    helper: 'Selecione todos que entram na conversa.', allowOutro: true,
    options: [['ceo', 'CEO / Sócio'], ['cfo', 'CFO / Financeiro'], ['cmo', 'CMO / Marketing'], ['cro', 'CRO / Comercial'], ['ti', 'CTO / CIO / TI'], ['tecnica', 'Área técnica / Operação'], ['compras', 'Compras / Procurement'], ['juridico', 'Jurídico']] },
  { id: 'C3', block: 'O comitê de compra', type: 'single', required: true,
    q: 'Quem costuma ter poder de veto (pode matar o negócio)?',
    helper: 'A pessoa que, sozinha, derruba a compra.',
    options: [['ceo', 'CEO / Sócio'], ['cfo', 'CFO / Financeiro'], ['cmo', 'CMO / Marketing'], ['cro', 'CRO / Comercial'], ['ti', 'CTO / CIO / TI'], ['tecnica', 'Área técnica / Operação'], ['compras', 'Compras / Procurement'], ['juridico', 'Jurídico']] },

  { id: 'D1', block: 'O que trava', type: 'multi', required: true,
    q: 'Qual a principal objeção ou motivo de perda?', allowOutro: true,
    options: [['preco', 'Preço'], ['timing', 'Timing'], ['prioridade', 'Prioridade interna'], ['confianca', 'Falta de confiança'], ['concorrente', 'Concorrente'], ['indecisao', 'Indecisão do comitê']] },
  { id: 'D2', block: 'O que trava', type: 'single', required: true,
    q: 'Você já tem um ICP definido hoje?',
    options: [['nao', 'Não'], ['informal', 'Informalmente'], ['documentado', 'Sim, documentado']] },

  { id: 'CAP', block: 'Última etapa', type: 'capture',
    q: 'Para onde enviamos o seu mapa?',
    helper: 'Geramos seu mapa de ICP e comitê na próxima tela — e mandamos uma cópia em PDF.' },
]

// ── Rótulos legíveis (para a mensagem da IA e o resultado) ───────────────────
export const ROLE_LABEL: Record<string, string> = {
  ceo: 'CEO / Sócio', cfo: 'CFO / Financeiro', cmo: 'CMO / Marketing', cro: 'CRO / Comercial',
  ti: 'CTO / CIO / TI', tecnica: 'Área técnica / Operação', compras: 'Compras / Procurement', juridico: 'Jurídico',
}
export const ROLE_SHORT: Record<string, string> = {
  ceo: 'CEO', cfo: 'CFO', cmo: 'CMO', cro: 'CRO', ti: 'TI', tecnica: 'OPER', compras: 'COMPRAS', juridico: 'JURÍD',
}
export const TICKET_LABEL: Record<string, string> = {
  '<5k': 'até R$ 5 mil', '5-20k': 'R$ 5–20 mil', '20-50k': 'R$ 20–50 mil', '50-200k': 'R$ 50–200 mil', '200k+': 'acima de R$ 200 mil',
}
export const CICLO_LABEL: Record<string, string> = {
  '<30d': 'menos de 30 dias', '30-60d': '30 a 60 dias', '60-120d': '60 a 120 dias', '120d+': 'mais de 120 dias',
}
export const MODELO_LABEL: Record<string, string> = { B2B: 'B2B', B2C: 'B2C', Hibrido: 'Híbrido' }
export const NDEC_LABEL: Record<string, string> = { '1': 'uma pessoa', '2-3': '2 a 3', '4-6': '4 a 6', '7+': '7 ou mais' }
export const B2_LABEL: Record<string, string> = {
  preco: 'Preço', autoridade: 'Autoridade técnica', relacionamento: 'Relacionamento', resultado: 'Resultado entregue', urgencia: 'Urgência da dor', indicacao: 'Indicação',
}
export const D1_LABEL: Record<string, string> = {
  preco: 'Preço', timing: 'Timing', prioridade: 'Prioridade interna', confianca: 'Falta de confiança', concorrente: 'Concorrente', indecisao: 'Indecisão do comitê',
}

export const LOAD_MSGS = [
  'Organizando suas respostas...',
  'Definindo o fit estrutural...',
  'Montando o anti-ICP...',
  'Mapeando o comitê de compra...',
  'Finalizando seu mapa...',
]
