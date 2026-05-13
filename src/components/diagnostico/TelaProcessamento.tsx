'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

// Microcopy de processamento — spec §2 (fluxo macro).
const MENSAGENS = [
  'Analisando suas respostas...',
  'Cruzando dados com o método UGS...',
  'Montando seu diagnóstico...',
]

export default function TelaProcessamento() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => Math.min(i + 1, MENSAGENS.length - 1))
    }, 1100) // troca a cada 1.1s, segura 3.3s no total
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
        <p className="font-display text-xl md:text-2xl text-foreground/85 transition-opacity duration-500">
          {MENSAGENS[idx]}
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          {MENSAGENS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                i <= idx ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
