/**
 * Geração do mapa: chama a IA (server-side) e parseia JSON com 1 retry.
 * Fallback determinístico (ROLE_DATA) quando a IA está indisponível (mock) ou
 * falha após o retry — garante que o usuário sempre recebe um mapa utilizável.
 */
import { callAI } from '@/lib/ai/adapter'
import {
  SYSTEM_PROMPT, buildUserMessage, MAPA_ICP_MODEL, MAPA_ICP_TEMPERATURE, MAPA_ICP_MAX_TOKENS,
} from './prompt'
import { ROLE_LABEL, TICKET_LABEL, CICLO_LABEL, MODELO_LABEL, NDEC_LABEL } from './steps'
import type { MapaIcpAnswers, MapaIcpAIResult } from './types'

function extractJson(raw: string): any | null {
  if (!raw) return null
  const s = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  const first = s.indexOf('{')
  const last = s.lastIndexOf('}')
  if (first === -1 || last === -1) return null
  try {
    return JSON.parse(s.slice(first, last + 1))
  } catch {
    return null
  }
}

/** Corrige veto e garante um item por cargo de C2, conforme regras §3 do prompt. */
function normalize(parsed: MapaIcpAIResult, a: MapaIcpAnswers): MapaIcpAIResult {
  const wantRoles = (a.C2 || []).map((r) => ROLE_LABEL[r] || r)
  const byPapel = new Map((parsed.comite || []).map((c) => [c.papel, c]))
  const comite = wantRoles.map((papel) => {
    const found = byPapel.get(papel) || (parsed.comite || []).find((c) => c.papel?.includes(papel))
    const base = found || {
      papel, prioriza: '', o_que_convence: '', o_que_trava: '', angulo_mensagem: '', tem_veto: false,
    }
    return { ...base, papel, tem_veto: ROLE_LABEL[a.C3] === papel }
  })
  return { ...parsed, comite }
}

function isValid(p: any): p is MapaIcpAIResult {
  return p && p.icp_estrutural && p.anti_icp && p.maturidade_icp && Array.isArray(p.comite) && p.proximo_passo
}

export async function generateMapa(a: MapaIcpAnswers): Promise<{ result: MapaIcpAIResult; source: 'ai' | 'fallback' }> {
  const userPrompt = buildUserMessage(a)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await callAI({
        systemPrompt: SYSTEM_PROMPT, userPrompt,
        model: MAPA_ICP_MODEL, temperature: MAPA_ICP_TEMPERATURE, maxTokens: MAPA_ICP_MAX_TOKENS,
      })
      const parsed = extractJson(res.content)
      if (isValid(parsed)) return { result: normalize(parsed, a), source: 'ai' }
      console.warn(`[mapa-icp] IA retornou JSON inválido (tentativa ${attempt + 1})`)
    } catch (e) {
      console.error(`[mapa-icp] erro na IA (tentativa ${attempt + 1}):`, e)
    }
  }
  return { result: buildFallback(a), source: 'fallback' }
}

// ── Fallback determinístico (mock/falha) — porta o ROLE_DATA do protótipo ─────
const ROLE_DATA: Record<string, Omit<MapaIcpAIResult['comite'][number], 'papel' | 'tem_veto'>> = {
  ceo: { prioriza: 'Visão de longo prazo e risco do negócio', o_que_convence: 'Impacto em receita e previsibilidade', o_que_trava: 'Promessa vaga, sem lastro', angulo_mensagem: 'Conecte a solução a crescimento previsível — não a táticas.' },
  cfo: { prioriza: 'Retorno, eficiência e custo de oportunidade', o_que_convence: 'Payback claro e redução de desperdício', o_que_trava: 'Ausência de números e cenário', angulo_mensagem: 'Fale em eficiência de capital e receita que não se perde no funil.' },
  cmo: { prioriza: 'Atribuição e integração com vendas', o_que_convence: 'Prova de impacto e leitura de funil', o_que_trava: 'Virar mais uma ferramenta solta', angulo_mensagem: 'Mostre como marketing passa a conversar com o comercial.' },
  cro: { prioriza: 'Qualidade e velocidade do pipeline', o_que_convence: 'Menos lead desperdiçado, melhor passagem', o_que_trava: 'Mais volume sem qualificação', angulo_mensagem: 'Prometa pipeline melhor, não pipeline maior.' },
  ti: { prioriza: 'Governança de dados e integração', o_que_convence: 'Arquitetura clara e baixo atrito de implantação', o_que_trava: 'Ferramenta que cria dívida técnica', angulo_mensagem: 'Trate dados e integração como parte do desenho, não anexo.' },
  tecnica: { prioriza: 'Viabilidade e esforço de operação', o_que_convence: 'Processo que reduz retrabalho', o_que_trava: 'Promessa que ignora a operação real', angulo_mensagem: 'Mostre que o método respeita a rotina de quem executa.' },
  compras: { prioriza: 'Condições, risco contratual e comparabilidade', o_que_convence: 'Escopo claro e critério objetivo', o_que_trava: 'Proposta difícil de comparar', angulo_mensagem: 'Entregue clareza de escopo e critério — facilite a comparação.' },
  juridico: { prioriza: 'Risco, conformidade e dados', o_que_convence: 'Termos claros e LGPD resolvida', o_que_trava: 'Lacunas contratuais', angulo_mensagem: 'Antecipe conformidade e propriedade de dados.' },
}

const MATUR: Record<string, MapaIcpAIResult['maturidade_icp']> = {
  nao: { nivel: 'inicial', leitura: 'Seu ICP ainda é intuição. O maior ganho imediato é transformá-lo em estrutura escrita e compartilhada com o comercial.' },
  informal: { nivel: 'intermediario', leitura: 'Existe um ICP na cabeça do time, mas não documentado. Falta consistência entre marketing e vendas.' },
  documentado: { nivel: 'avancado', leitura: 'Você já tem ICP documentado. O próximo passo é refiná-lo por fit estrutural e ativá-lo no comitê de compra.' },
}

export function buildFallback(a: MapaIcpAnswers): MapaIcpAIResult {
  const modelo = MODELO_LABEL[a.A5] || '—'
  const ticket = TICKET_LABEL[a.A3] || '—'
  const ciclo = CICLO_LABEL[a.A4] || '—'
  const nDec = NDEC_LABEL[a.C1] || '—'
  const comite = (a.C2 || [])
    .filter((r) => ROLE_DATA[r])
    .map((r) => ({ papel: ROLE_LABEL[r], tem_veto: r === a.C3, ...ROLE_DATA[r] }))
  return {
    icp_estrutural: {
      resumo: `Operações ${modelo} com ticket ${ticket} e ciclo ${ciclo}, decisão por ${nDec}.`,
      atributos_fit: [`Modelo ${modelo}`, `Ticket ${ticket}`, `Ciclo ${ciclo}`, `Decisão: ${nDec}`],
    },
    anti_icp: {
      resumo: 'Contas fora do seu fit estrutural — onde o esforço comercial tende a não converter ou não permanecer.',
      sinais_desfit: ['Ticket abaixo do seu piso', 'Ciclo curto com decisão isolada', 'Resistência a processo e dados', 'Compra orientada só por preço'],
    },
    maturidade_icp: MATUR[a.D2] || { nivel: 'inicial', leitura: '' },
    comite,
    proximo_passo: 'Com o ICP claro, o passo seguinte é checar se o seu funil está pronto para atrair esse perfil — é o que o Diagnóstico de Growth mostra.',
  }
}
