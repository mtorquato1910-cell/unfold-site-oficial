/**
 * ResultadoMapa — renderização (server-safe) do resultado do Radar de Comitê.
 *
 * Extraído de MontarClient para ser reutilizado na página pública /r/[token].
 * Sem hooks de cliente (o SVG é estático). Os CTAs/eventos que dependem de
 * `'use client'` (Diagnóstico, PDF, analytics) são passados via `footer`.
 */

import type { ComiteItem, MapaIcpAIResult } from '@/lib/mapa-icp/types'
import { ROLE_SHORT } from '@/lib/mapa-icp/steps'
import styles from '../montar/montar.module.css'

export interface ResultadoMapaProps {
  result: MapaIcpAIResult
  nome?: string
  token?: string
  /** Bloco de ações/CTAs renderizado ao final (client-side no MontarClient). */
  footer?: React.ReactNode
}

export default function ResultadoMapa({ result, nome, footer }: ResultadoMapaProps) {
  const comite = result.comite || []

  return (
    <div className={`${styles.screen} ${styles.result}`}>
      <span className={styles.eyebrow}>Seu mapa de ICP &amp; comitê</span>
      <h1>{nome ? `${nome}, seu` : 'Seu'} mapa está pronto.</h1>
      <p className={styles.sub}>{result.icp_estrutural.resumo}</p>

      {/* 1. ICP estrutural */}
      <div className={styles.block}>
        <div className={styles.blockHead}>ICP estrutural</div>
        <div className={styles.panel}>
          <h3>Quem realmente vale o seu pipeline</h3>
          <p>{result.icp_estrutural.resumo}</p>
          {result.icp_estrutural.atributos_fit?.length > 0 && (
            <div className={styles.chips}>
              {result.icp_estrutural.atributos_fit.map((x, idx) => (
                <span className={styles.chip} key={idx}>
                  {x}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Anti-ICP */}
      <div className={styles.block}>
        <div className={styles.blockHead}>Anti-ICP</div>
        <div className={styles.panel}>
          <h3>Onde não gastar pipeline</h3>
          <p>{result.anti_icp.resumo}</p>
          {result.anti_icp.sinais_desfit?.length > 0 && (
            <div className={styles.chips}>
              {result.anti_icp.sinais_desfit.map((x, idx) => (
                <span className={styles.chip} key={idx}>
                  {x}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Maturidade */}
      <div className={styles.block}>
        <div className={styles.blockHead}>Maturidade do seu ICP</div>
        <div className={styles.panel}>
          <span className={styles.level}>Nível {result.maturidade_icp.nivel}</span>
          <p>{result.maturidade_icp.leitura}</p>
        </div>
      </div>

      {/* 4. Mapa do comitê */}
      <div className={styles.block}>
        <div className={styles.blockHead}>Mapa do comitê de compra</div>
        <div className={styles.mapWrap}>
          <div className={styles.map}>
            <CommitteeSVG comite={comite} />
          </div>
          <div className={styles.comCards}>
            {comite.map((c, idx) => (
              <CommitteeCard key={idx} item={c} />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Próximo passo + ações (footer client-side) */}
      <div className={styles.nextStep}>
        <span className={`${styles.eyebrow} ${styles.eyebrowCenter}`}>Próximo passo</span>
        <h3>
          Seu ICP está claro. Seu <em>funil</em> está pronto para atraí-lo?
        </h3>
        <p>{result.proximo_passo}</p>
        {footer}
      </div>
    </div>
  )
}

// ─── Cartão de decisor ──────────────────────────────────────────────────────────
function CommitteeCard({ item }: { item: ComiteItem }) {
  return (
    <div className={styles.comCard}>
      <div className={styles.ccHead}>
        <span className={styles.ccRole}>{item.papel}</span>
        {item.tem_veto && <span className={styles.vetoBadge}>VETO</span>}
      </div>
      <div className={styles.ccGrid}>
        <div className={styles.ccItem}>
          <div className={styles.k}>Prioriza</div>
          <div className={styles.v}>{item.prioriza}</div>
        </div>
        <div className={styles.ccItem}>
          <div className={styles.k}>O que convence</div>
          <div className={styles.v}>{item.o_que_convence}</div>
        </div>
        <div className={styles.ccItem}>
          <div className={styles.k}>O que trava</div>
          <div className={styles.v}>{item.o_que_trava}</div>
        </div>
        <div className={styles.ccItem}>
          <div className={styles.k}>Veto</div>
          <div className={styles.v}>
            {item.tem_veto ? 'Sim — pode derrubar a compra' : 'Influencia, não veta'}
          </div>
        </div>
      </div>
      <div className={styles.ccAngle}>
        <div className={styles.k}>Ângulo de mensagem</div>
        <div className={styles.v}>{item.angulo_mensagem}</div>
      </div>
    </div>
  )
}

// ─── SVG radial do comitê (porte de committeeSVG do protótipo) ───────────────────
function shortFor(papel: string): string {
  for (const [id, label] of Object.entries({
    ceo: 'CEO',
    cfo: 'CFO',
    cmo: 'CMO',
    cro: 'CRO',
    ti: 'TI',
    tecnica: 'Operação',
    compras: 'Compras',
    juridico: 'Jurídico',
  })) {
    if (papel.toLowerCase().includes(label.toLowerCase()) || papel.toLowerCase().includes(id)) {
      return ROLE_SHORT[id] || label
    }
  }
  return papel.slice(0, 8).toUpperCase()
}

function CommitteeSVG({ comite }: { comite: ComiteItem[] }) {
  const cx = 150
  const cy = 150
  const R = 108
  const n = comite.length || 1

  return (
    <svg viewBox="0 0 300 300" role="img" aria-label="Mapa radial do comitê de compra">
      {comite.map((_c, idx) => {
        const ang = ((-90 + (360 / n) * idx) * Math.PI) / 180
        const x = cx + R * Math.cos(ang)
        const y = cy + R * Math.sin(ang)
        return <line key={`e${idx}`} className={styles.cedge} x1={cx} y1={cy} x2={x} y2={y} />
      })}
      <circle className={styles.ccenter} cx={cx} cy={cy} r={26} />
      <text className={styles.ccenterT} x={cx} y={cy + 3} textAnchor="middle">
        DECISÃO
      </text>
      {comite.map((c, idx) => {
        const ang = ((-90 + (360 / n) * idx) * Math.PI) / 180
        const x = cx + R * Math.cos(ang)
        const y = cy + R * Math.sin(ang)
        return (
          <g key={`n${idx}`}>
            <rect
              className={`${styles.cnode} ${c.tem_veto ? styles.cnodeVeto : ''}`}
              x={x - 30}
              y={y - 15}
              width={60}
              height={30}
              rx={3}
            />
            <text className={styles.ctext} x={x} y={y + 3} textAnchor="middle">
              {shortFor(c.papel)}
              {c.tem_veto ? ' ✦' : ''}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
