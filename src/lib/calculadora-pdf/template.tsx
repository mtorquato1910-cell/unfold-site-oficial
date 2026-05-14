/**
 * Template do PDF da Calculadora de Performance v2 (Sprint 5 / S5.3).
 *
 * Implementado com @react-pdf/renderer. Reproduz os blocos da tela em formato
 * estático (inputs + premissas + ROI + funil texto + insight + fontes).
 *
 * Importação NÃO deve acontecer em client bundle — só em route handler com
 * `dynamic import`. Por isso este arquivo é seguro de tudo (`use server` não é
 * necessário porque não chama Payload nem fetch).
 */

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  type DocumentProps,
} from '@react-pdf/renderer'
import * as React from 'react'

import { SETORES } from '@/lib/calculadora/benchmarks'
import { INSIGHTS_BY_ID } from '@/lib/calculadora/insights'
import type {
  CalculadoraInputs,
  InsightId,
  Premissas,
  Resultado,
  Setor,
} from '@/lib/calculadora/types'

const BRAND = {
  ink: '#0a1f24',
  mint: '#16a34a',
  mintSoft: '#dcfce7',
  alertSoft: '#f3e8ff',
  alertInk: '#7e22ce',
  muted: '#52525b',
  pale: '#f4f4f5',
  border: '#e4e4e7',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BRAND.ink,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  brand: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: BRAND.ink },
  brandSub: { fontSize: 8, color: BRAND.muted, marginTop: 2 },
  meta: { fontSize: 8, color: BRAND.muted, textAlign: 'right' },
  h1: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  h2: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 16, marginBottom: 6 },
  small: { fontSize: 8, color: BRAND.muted },
  row: { flexDirection: 'row', gap: 10 },
  card: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 6,
    padding: 12,
    flex: 1,
  },
  cardLabel: { fontSize: 8, color: BRAND.muted, textTransform: 'uppercase', letterSpacing: 1 },
  cardValue: { fontSize: 24, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  cardSub: { fontSize: 8, color: BRAND.muted, marginTop: 4 },
  roiPositivo: { backgroundColor: BRAND.mintSoft, color: BRAND.mint },
  roiNegativo: { backgroundColor: BRAND.alertSoft, color: BRAND.alertInk },
  table: { marginTop: 6 },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BRAND.border,
  },
  tableLabel: { color: BRAND.muted },
  tableValue: { fontFamily: 'Helvetica-Bold' },
  insightCard: {
    backgroundColor: BRAND.pale,
    padding: 14,
    borderRadius: 6,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: BRAND.mint,
  },
  insightId: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: BRAND.mint,
    letterSpacing: 1,
  },
  insightTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 4, marginBottom: 4 },
  insightLede: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  insightBody: { fontSize: 9, lineHeight: 1.4, color: BRAND.ink },
  overrideCard: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#d97706',
  },
  footer: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 24,
    fontSize: 7,
    color: BRAND.muted,
    textAlign: 'center',
    borderTopWidth: 0.5,
    borderTopColor: BRAND.border,
    paddingTop: 8,
  },
})

export interface PDFProps {
  empresa: string
  nome: string
  setor: Setor | null
  inputs: CalculadoraInputs
  premissas: Premissas
  resultado: Resultado
  insight: { principal: InsightId; override_ie: boolean }
  geradoEm: string
  url: string
}

function brl(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}
function roi(n: number): string {
  const s = n >= 0 ? '+' : ''
  return `${s}${Math.round(n)}%`
}
function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`
}

export function CalculadoraPDF(props: PDFProps): React.ReactElement<DocumentProps> {
  const setorLabel = props.setor
    ? SETORES.find((s) => s.value === props.setor)?.label || props.setor
    : '—'
  const insight = INSIGHTS_BY_ID[props.insight.principal]
  const override = props.insight.override_ie ? INSIGHTS_BY_ID['I-E'] : null
  const roiPositivo = props.resultado.roi_no_periodo >= 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.brand}>UNFOLD GROWTH</Text>
            <Text style={styles.brandSub}>Calculadora de Performance — resultado</Text>
          </View>
          <View>
            <Text style={styles.meta}>Gerado em {props.geradoEm}</Text>
            <Text style={styles.meta}>{props.empresa}</Text>
          </View>
        </View>

        <Text style={styles.h1}>{props.empresa}</Text>
        <Text style={styles.small}>
          {props.nome} · Setor: {setorLabel} · Modelo:{' '}
          {props.inputs.modelo.toUpperCase()} · Janela: {props.inputs.periodo} meses · CRM
          funcional: {props.inputs.crm_funcional ? 'Sim' : 'Não'}
        </Text>

        <Text style={styles.h2}>Resultado</Text>
        <View style={styles.row}>
          <View style={[styles.card, roiPositivo ? styles.roiPositivo : styles.roiNegativo]}>
            <Text style={styles.cardLabel}>ROI no período</Text>
            <Text style={[styles.cardValue, roiPositivo ? styles.roiPositivo : styles.roiNegativo]}>
              {roi(props.resultado.roi_no_periodo)}
            </Text>
            <Text style={styles.cardSub}>Receita: {brl(props.resultado.receita_no_periodo)}</Text>
          </View>
          <View style={[styles.card, props.resultado.roi_total >= 0 ? styles.roiPositivo : styles.roiNegativo]}>
            <Text style={styles.cardLabel}>ROI total (com pipeline)</Text>
            <Text
              style={[
                styles.cardValue,
                props.resultado.roi_total >= 0 ? styles.roiPositivo : styles.roiNegativo,
              ]}
            >
              {roi(props.resultado.roi_total)}
            </Text>
            <Text style={styles.cardSub}>Pipeline: {brl(props.resultado.receita_em_pipeline)}</Text>
          </View>
        </View>

        <Text style={styles.h2}>Funil</Text>
        <View style={styles.table}>
          <Row label="Investimento total" value={brl(props.resultado.investimento_total)} />
          <Row label="Leads gerados" value={Math.round(props.resultado.leads_gerados).toLocaleString('pt-BR')} />
          <Row
            label={`MQLs (taxa qualif: ${pct(props.premissas.taxa_qualificacao)})`}
            value={Math.round(props.resultado.mqls).toLocaleString('pt-BR')}
          />
          <Row
            label={`Clientes fechados (conv MQL→Cliente: ${pct(props.premissas.conversao_mql_cliente)})`}
            value={`~${Math.round(props.resultado.clientes_fechados).toLocaleString('pt-BR')}`}
          />
          <Row label="No período" value={`~${Math.round(props.resultado.clientes_no_periodo)}`} />
          <Row
            label="Em pipeline futuro"
            value={`~${Math.round(props.resultado.clientes_em_pipeline)}`}
          />
          <Row label="Fator temporal" value={pct(props.resultado.fator_temporal)} />
        </View>

        <Text style={styles.h2}>Premissas aplicadas</Text>
        <View style={styles.table}>
          <Row label="CPL médio (R$/lead)" value={`R$ ${props.premissas.cpl.toFixed(0)}`} />
          <Row
            label="Taxa de qualificação"
            value={pct(props.premissas.taxa_qualificacao)}
          />
          <Row
            label="Conversão MQL → Cliente"
            value={pct(props.premissas.conversao_mql_cliente)}
          />
          <Row label="Ciclo médio de venda" value={`${props.premissas.ciclo_dias} dias`} />
          <Row label="Ticket médio" value={brl(props.inputs.ticket_medio)} />
          <Row label="Investimento mensal" value={brl(props.inputs.investimento_mensal)} />
          <Row label="Canais" value={props.inputs.canais.join(' + ').toUpperCase()} />
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightId}>Leitura {insight.id}</Text>
          <Text style={styles.insightTitle}>{insight.titulo}</Text>
          <Text style={styles.insightLede}>{insight.manchete}</Text>
          <Text style={styles.insightBody}>{insight.corpo}</Text>
        </View>

        {override && (
          <View style={styles.overrideCard}>
            <Text style={styles.insightId}>Observação adicional · I-E</Text>
            <Text style={styles.insightLede}>{override.manchete}</Text>
            <Text style={styles.insightBody}>{override.corpo}</Text>
          </View>
        )}

        <Text style={[styles.small, { marginTop: 14 }]}>
          Acesse este resultado a qualquer momento em: {props.url}
        </Text>
        <Text style={[styles.small, { marginTop: 4 }]}>
          Fontes: Leadster Panorama 2025, Conversion, Safira Design, Data Stone, WordStream,
          Gartner. Base de benchmarks v1.0 — atualizada em maio/2026.
        </Text>

        <Text style={styles.footer} fixed>
          Unfold Growth · Calculadora de Performance · resultado-{props.geradoEm}
        </Text>
      </Page>
    </Document>
  )
}

function Row({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableLabel}>{label}</Text>
      <Text style={styles.tableValue}>{value}</Text>
    </View>
  )
}

export default CalculadoraPDF
