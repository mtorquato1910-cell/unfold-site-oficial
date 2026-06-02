'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartDatum } from '../../_content/guia-data'

/**
 * Gráfico de barras horizontal (estilo Driva). Monta só ao entrar na viewport
 * para animar no scroll (recharts anima no mount). O DADO TABULAR fica sempre
 * no DOM (tabela sr-only) para SEO e leitores de tela. SVG 100% responsivo.
 */
export function DataChart({
  titulo,
  data,
  fonte,
}: {
  titulo: string
  data: ChartDatum[]
  fonte: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || show) return
    const io = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [show])

  const suffix = data[0]?.suffix ?? ''

  return (
    <figure className="r-chart" ref={ref}>
      <figcaption className="r-chart-title">{titulo}</figcaption>

      <div className="r-chart-canvas" aria-hidden="true">
        {show && (
          <ResponsiveContainer width="100%" height={Math.max(180, data.length * 56)}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
              barCategoryGap="28%"
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={92}
                tick={{ fill: '#a8b0bc', fontSize: 13, fontFamily: 'var(--font-guia-mono)' }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={1100}>
                {data.map((_, i) => (
                  <Cell key={i} fill="#6df9c6" />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => `${v}${suffix}`}
                  fill="#f2f4f7"
                  fontSize={14}
                  fontWeight={700}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Dado acessível sempre no DOM (SEO + leitores de tela). */}
      <table className="sr-only">
        <caption>{titulo}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.value}{suffix}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption className="r-chart-fonte">{fonte}</figcaption>
    </figure>
  )
}
