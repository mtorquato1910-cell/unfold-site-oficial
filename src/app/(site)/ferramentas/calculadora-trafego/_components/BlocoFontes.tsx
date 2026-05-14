'use client'

/**
 * Bloco F — Fontes (S3.5).
 *
 * Lista mínima das 6 fontes principais da Base de Benchmarks v1.0.
 * Sem CTA neste bloco. Função única: sustentar autoridade técnica.
 */

import { BENCHMARKS_ATUALIZADO_EM, BENCHMARKS_VERSAO } from '@/lib/calculadora/benchmarks'

const FONTES: { titulo: string; descricao: string }[] = [
  {
    titulo: 'Panorama de Geração de Leads no Brasil',
    descricao: 'Leadster 2025 — 2.861 sites, 3,7M de leads, 167M de acessos.',
  },
  {
    titulo: 'Google Ads Benchmarks',
    descricao: 'Conversion Brasil 2024/2025 + WordStream/LocaliQ.',
  },
  {
    titulo: 'CPL B2B Brasil',
    descricao: 'Safira Design 2026 — campanhas reais brasileiras.',
  },
  {
    titulo: 'Benchmark de Conversão SaaS B2B',
    descricao: 'Data Stone, set/2025.',
  },
  {
    titulo: 'B2B Buyer Journey',
    descricao: 'Gartner 2023-2024 — 6-10 stakeholders, 67% da jornada antes do contato com vendas.',
  },
  {
    titulo: 'Cost Per Lead Benchmarks',
    descricao: 'Flyweel 2025 — LinkedIn B2B média global.',
  },
]

export default function BlocoFontes() {
  return (
    <section className="border-t border-border/40 pt-6 mt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45 mb-3">
        Sobre os benchmarks
      </p>
      <p className="text-[12px] text-foreground/55 leading-relaxed max-w-2xl mb-4">
        Os benchmarks usados nesta calculadora foram extraídos de fontes públicas, com janela de
        2023 a 2026. Cada premissa é editável — caso sua operação tenha dados próprios, você pode
        ajustar para refletir sua realidade.
      </p>
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 mb-4">
        {FONTES.map((f) => (
          <li key={f.titulo} className="text-[12px]">
            <span className="font-medium text-foreground/75">{f.titulo}</span>
            <span className="text-foreground/45"> — {f.descricao}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-foreground/40 font-mono">
        Base de benchmarks {BENCHMARKS_VERSAO} — atualizada em {BENCHMARKS_ATUALIZADO_EM}.
      </p>
    </section>
  )
}
