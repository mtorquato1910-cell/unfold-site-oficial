# Sprint 3 — Resultado Público v2 (URL hash + Gráfico Aranha)

**Story ID:** DIAG-S3
**Spec fonte:** `docs/diagnostico-spec.md` §9
**Plano completo:** `docs/sprints-diagnostico-v2.md` (Sprint 3)
**Status:** pending
**Estimativa:** 2 sessões
**Depende de:** DIAG-S1

## Goal

Substituir resultado por JWT pela URL pública por hash (`/diagnostico/r/{hash}`) e implementar os 7 blocos da spec §9, incluindo gráfico aranha (5 eixos) com cores APR V2.

## User Stories

- Como lead, preciso compartilhar minha URL de resultado sem expor dados pessoais.
- Como lead, preciso ver um gráfico aranha visual com leitura por eixo, para entender meus pontos fortes e gaps.
- Como sistema, preciso renderizar o CTA de agendamento variando por faixa de Fit (Alto/Médio/Baixo/Desfit).

## Tasks

- [ ] **T3.1** Hook `afterChange` em `DiagnosticoResults` para gerar `url_resultado_hash` (nanoid 12 chars, índice único)
- [ ] **T3.2** Nova rota `src/app/(site)/diagnostico/r/[hash]/page.tsx` (server component, busca por hash, 404 se não existir)
- [ ] **T3.3** Manter `/diagnostico/resultado/[token]` como redirect para `/r/{hash}` por 30 dias
- [ ] **T3.4** Criar `DiagnosticoResultadoV2.tsx` com 7 blocos
- [ ] **T3.5** Criar `GraficoAranha.tsx` com Recharts `RadarChart` + cores APR V2
- [ ] **T3.6** Criar `InsightCard.tsx` (numeração ❶❷❸ + título do padrão + texto completo)
- [ ] **T3.7** Criar `CaminhoCard.tsx` (alavanca / por que / como a Unfold endereça)
- [ ] **T3.8** Criar `CTAAgendamento.tsx` com texto/slot variando por faixa Fit + placeholder Calendly
- [ ] **T3.9** Configurar OG tags + `robots: noindex` na rota de hash

## Definition of Done

- [ ] URL `/diagnostico/r/{hash}` carrega para qualquer resultado salvo (sem auth)
- [ ] Compartilhar URL no WhatsApp/LinkedIn mostra OG image + título
- [ ] Gráfico aranha renderiza 5 eixos com cor proporcional à faixa
- [ ] CTA muda visualmente por faixa Fit
- [ ] HTML público não contém email, telefone, IP

## QA Gates

| ID | Critério |
|---|---|
| G3.1 | Caso Roberto: tela com "Olá, Roberto", score 22, aranha [17,33,11,33,17], insights P4/P8/P2, caminhos C3/C4/C2, CTA "Quer aprofundar..." |
| G3.2 | `/diagnostico/r/inexistente` → 404 (não 500) |
| G3.3 | Lighthouse desktop: Performance ≥ 85, A11y ≥ 95 |
| G3.4 | Screen reader navega o aranha (alt text com texto-equivalente) |

## File List

_(preenchida durante execução)_
