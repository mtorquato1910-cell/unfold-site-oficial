/**
 * Perfil eleitoral do lead (campo 4 do formulário — RF-15) e mapeamentos.
 * Módulo puro, compartilhado entre formulário (client) e endpoint (server).
 */

export type PerfilEleitoral = 'candidato' | 'equipe-campanha' | 'setor' | 'outro'

export interface PerfilOption {
  value: PerfilEleitoral
  /** Texto exibido no radio E enviado ao RD como label do cf (deve bater 100% no painel). */
  label: string
  /** Tag derivada do perfil (RF-22). */
  tag: string
}

export const PERFIL_OPTIONS: readonly PerfilOption[] = [
  { value: 'candidato', label: 'Sim, sou candidato ou pré-candidato', tag: 'perfil-candidato' },
  { value: 'equipe-campanha', label: 'Sou parte de equipe de campanha', tag: 'perfil-equipe-campanha' },
  { value: 'setor', label: 'Não, mas atuo no setor', tag: 'perfil-setor' },
  { value: 'outro', label: 'Outro', tag: 'perfil-outro' },
] as const

const BY_VALUE = new Map(PERFIL_OPTIONS.map((o) => [o.value, o]))

export function perfilLabel(value: PerfilEleitoral): string {
  return BY_VALUE.get(value)?.label ?? ''
}

export function perfilTag(value: PerfilEleitoral): string {
  return BY_VALUE.get(value)?.tag ?? 'perfil-outro'
}

/** Perfis que justificam oportunidade comercial (RF-24 — referência para automação do RD). */
export function isPerfilComercial(value: PerfilEleitoral): boolean {
  return value === 'candidato' || value === 'equipe-campanha'
}
