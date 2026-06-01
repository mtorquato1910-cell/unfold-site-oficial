/**
 * Mapeamentos slug interno → label exato dos campos personalizados RD Station.
 *
 * A API legacy `/api/1.3/conversions` exige que o valor enviado para campos
 * do tipo "Escolha única" bata 100% com o label cadastrado no painel.
 * Qualquer divergência (acento, hífen, capitalização) descarta o valor.
 *
 * Módulo puro: sem dependências externas, fácil de testar.
 */

import type { FaixaFit, FaixaMaturidade } from '@/lib/scoring/types'
import type { Modelo, Setor } from '@/lib/calculadora/types'

export type CaminhoDoLead = 'Diagnóstico' | 'Calculadora' | 'Newsletter'

/** Setor — aceita os dois slugs em uso no codebase (`servicos` em Leads, `servicos_b2b` em Calculadora). */
export function mapSetor(slug: Setor | 'servicos' | string | undefined | null): string | undefined {
  if (!slug) return undefined
  switch (slug) {
    case 'construcao':
      return 'Construção Civil / Incorporação'
    case 'agro':
      return 'Agronegócio / Agroindústria'
    case 'saas':
      return 'Tecnologia / SaaS B2B'
    case 'automotivo':
      return 'Automotivo / Concessionárias'
    case 'industria':
      return 'Indústria'
    case 'servicos_b2b':
    case 'servicos':
      return 'Serviços B2B'
    case 'outro':
      return 'Outro'
    default:
      return undefined
  }
}

export function mapFaturamento(slug: string | undefined | null): string | undefined {
  if (!slug) return undefined
  switch (slug) {
    case 'ate-50k':
      return 'Até R$ 50.000'
    case '50k-200k':
      return 'De R$ 50.000 a R$ 200.000'
    case '200k-500k':
      return 'De R$ 200.000 a R$ 500.000'
    case 'acima-500k':
      return 'Acima de R$ 500.000'
    case 'prefiro-nao-informar':
      return 'Prefiro não informar'
    default:
      return undefined
  }
}

export function mapUrgencia(slug: string | undefined | null): string | undefined {
  if (!slug) return undefined
  switch (slug) {
    case 'trimestre':
      return 'Neste trimestre'
    case '6-meses':
      return 'Nos próximos 6 meses'
    case 'sem-prazo':
      return 'Sem prazo definido, mas é prioridade'
    case 'pesquisando':
      return 'Estou apenas pesquisando'
    default:
      return undefined
  }
}

export function mapFaixaFit(slug: FaixaFit | undefined | null): string | undefined {
  if (!slug) return undefined
  switch (slug) {
    case 'fit-alto':
      return 'Fit Alto'
    case 'fit-medio':
      return 'Fit Médio'
    case 'fit-baixo':
      return 'Fit Baixo'
    case 'desfit':
      return 'Desfit'
    default:
      return undefined
  }
}

export function mapFaixaMaturidade(slug: FaixaMaturidade | undefined | null): string | undefined {
  if (!slug) return undefined
  switch (slug) {
    case 'critica':
      return 'Crítica'
    case 'em-formacao':
      return 'Em formação'
    case 'estruturada':
      return 'Estruturada'
    case 'madura':
      return 'Madura'
    default:
      return undefined
  }
}

export function mapModelo(slug: Modelo | undefined | null): string | undefined {
  if (!slug) return undefined
  return slug === 'b2b' ? 'B2B' : 'B2C'
}

/**
 * Perfil eleitoral do lead do Guia (cf_perfil_eleitoral_2026 — RF-15).
 * Os labels devem bater 100% com o campo de "escolha única" cadastrado no painel RD
 * (a API legacy descarta valores divergentes). Ver tarefa operacional S3.7.
 */
export function mapPerfilEleitoral(
  slug: 'candidato' | 'equipe-campanha' | 'setor' | 'outro' | undefined | null,
): string | undefined {
  if (!slug) return undefined
  switch (slug) {
    case 'candidato':
      return 'Sim, sou candidato ou pré-candidato'
    case 'equipe-campanha':
      return 'Sou parte de equipe de campanha'
    case 'setor':
      return 'Não, mas atuo no setor'
    case 'outro':
      return 'Outro'
    default:
      return undefined
  }
}

export function mapSimNao(value: boolean | undefined | null): string | undefined {
  if (value === undefined || value === null) return undefined
  return value ? 'Sim' : 'Não'
}

/**
 * Normaliza telefone para o formato esperado pela API legacy RD (somente dígitos).
 * Mantém apenas números; aceita formatos brasileiros com ou sem máscara.
 */
export function normalizeTelefone(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) return undefined
  return digits
}
