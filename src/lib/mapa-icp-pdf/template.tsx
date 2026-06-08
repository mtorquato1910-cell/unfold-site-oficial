/**
 * Template do PDF do Radar de Comitê de Compra (Mapa de ICP).
 *
 * Implementado com @react-pdf/renderer. Reproduz os 5 blocos da tela em
 * formato estático: ICP estrutural, anti-ICP, maturidade, mapa do comitê
 * (um bloco de texto por decisor — sem SVG) e próximo passo + URL.
 *
 * Importação NÃO deve acontecer em client bundle — só em route handler com
 * `dynamic import`. Espelha o estilo de `calculadora-pdf/template.tsx`.
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

import type { MapaIcpAIResult } from '@/lib/mapa-icp/types'

const BRAND = {
  navy: '#001E29',
  ink: '#0a1f24',
  mint: '#16a34a',
  mintSoft: '#dcfce7',
  vetoSoft: '#fef3c7',
  vetoInk: '#b45309',
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
  brand: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: BRAND.navy },
  brandSub: { fontSize: 8, color: BRAND.muted, marginTop: 2 },
  meta: { fontSize: 8, color: BRAND.muted, textAlign: 'right' },
  h1: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  h2: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 16, marginBottom: 6 },
  small: { fontSize: 8, color: BRAND.muted },
  sectionLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: BRAND.mint,
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 4,
  },
  panel: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 6,
    padding: 12,
  },
  panelTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  body: { fontSize: 9, lineHeight: 1.4, color: BRAND.ink },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  chip: {
    fontSize: 8,
    backgroundColor: BRAND.pale,
    color: BRAND.ink,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  levelBadge: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: BRAND.mint,
    backgroundColor: BRAND.mintSoft,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  comCard: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  comCardVeto: {
    borderLeftWidth: 3,
    borderLeftColor: BRAND.vetoInk,
  },
  comHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  comRole: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  vetoBadge: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.vetoInk,
    backgroundColor: BRAND.vetoSoft,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  comRow: { marginBottom: 4 },
  comK: { fontSize: 7, textTransform: 'uppercase', letterSpacing: 0.5, color: BRAND.muted },
  comV: { fontSize: 9, color: BRAND.ink, marginTop: 1 },
  nextCard: {
    backgroundColor: BRAND.pale,
    padding: 14,
    borderRadius: 6,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: BRAND.mint,
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

export interface MapaIcpPDFProps {
  nome: string
  empresa: string
  result: MapaIcpAIResult
  geradoEm: string
  url: string
}

export function MapaIcpPDF(props: MapaIcpPDFProps): React.ReactElement<DocumentProps> {
  const { nome, empresa, result, geradoEm, url } = props
  const comite = result.comite || []

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.brand}>UNFOLD GROWTH</Text>
            <Text style={styles.brandSub}>Radar de Comitê de Compra — mapa de ICP</Text>
          </View>
          <View>
            <Text style={styles.meta}>Gerado em {geradoEm}</Text>
            {empresa ? <Text style={styles.meta}>{empresa}</Text> : null}
          </View>
        </View>

        <Text style={styles.h1}>
          {nome ? `${nome}, seu` : 'Seu'} mapa de ICP & comitê
        </Text>
        <Text style={styles.small}>{result.icp_estrutural.resumo}</Text>

        {/* 1. ICP estrutural */}
        <Text style={styles.sectionLabel}>ICP estrutural</Text>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Quem realmente vale o seu pipeline</Text>
          <Text style={styles.body}>{result.icp_estrutural.resumo}</Text>
          {result.icp_estrutural.atributos_fit?.length > 0 && (
            <View style={styles.chipsWrap}>
              {result.icp_estrutural.atributos_fit.map((x, i) => (
                <Text style={styles.chip} key={i}>
                  {x}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* 2. Anti-ICP */}
        <Text style={styles.sectionLabel}>Anti-ICP</Text>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Onde não gastar pipeline</Text>
          <Text style={styles.body}>{result.anti_icp.resumo}</Text>
          {result.anti_icp.sinais_desfit?.length > 0 && (
            <View style={styles.chipsWrap}>
              {result.anti_icp.sinais_desfit.map((x, i) => (
                <Text style={styles.chip} key={i}>
                  {x}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* 3. Maturidade */}
        <Text style={styles.sectionLabel}>Maturidade do seu ICP</Text>
        <View style={styles.panel}>
          <Text style={styles.levelBadge}>Nível {result.maturidade_icp.nivel}</Text>
          <Text style={styles.body}>{result.maturidade_icp.leitura}</Text>
        </View>

        {/* 4. Mapa do comitê — um bloco por decisor */}
        <Text style={styles.sectionLabel}>Mapa do comitê de compra</Text>
        {comite.map((c, i) => (
          <View
            key={i}
            style={c.tem_veto ? [styles.comCard, styles.comCardVeto] : styles.comCard}
            wrap={false}
          >
            <View style={styles.comHead}>
              <Text style={styles.comRole}>{c.papel}</Text>
              {c.tem_veto ? <Text style={styles.vetoBadge}>VETO</Text> : null}
            </View>
            <View style={styles.comRow}>
              <Text style={styles.comK}>Prioriza</Text>
              <Text style={styles.comV}>{c.prioriza}</Text>
            </View>
            <View style={styles.comRow}>
              <Text style={styles.comK}>O que convence</Text>
              <Text style={styles.comV}>{c.o_que_convence}</Text>
            </View>
            <View style={styles.comRow}>
              <Text style={styles.comK}>O que trava</Text>
              <Text style={styles.comV}>{c.o_que_trava}</Text>
            </View>
            <View style={styles.comRow}>
              <Text style={styles.comK}>Poder de veto</Text>
              <Text style={styles.comV}>
                {c.tem_veto ? 'Sim — pode derrubar a compra' : 'Influencia, não veta'}
              </Text>
            </View>
            <View style={styles.comRow}>
              <Text style={styles.comK}>Ângulo de mensagem</Text>
              <Text style={styles.comV}>{c.angulo_mensagem}</Text>
            </View>
          </View>
        ))}

        {/* 5. Próximo passo */}
        <Text style={styles.sectionLabel}>Próximo passo</Text>
        <View style={styles.nextCard}>
          <Text style={styles.body}>{result.proximo_passo}</Text>
        </View>

        <Text style={[styles.small, { marginTop: 14 }]}>
          Acesse este mapa a qualquer momento em: {url}
        </Text>

        <Text style={styles.footer} fixed>
          Unfold Growth · Radar de Comitê de Compra · mapa-{geradoEm}
        </Text>
      </Page>
    </Document>
  )
}

export default MapaIcpPDF
