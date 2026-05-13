'use client'

import { useEffect } from 'react'

import { trackEvent, type EventName } from '@/lib/analytics/diagnostico-events'

interface Props {
  event: EventName
  result_hash?: string
  metadata?: Record<string, unknown>
}

/**
 * Dispara um evento de analytics no mount. Útil para páginas server-rendered
 * que precisam emitir `diagnostico_iniciado` ou `diagnostico_concluido` no client.
 */
export default function DiagnosticoTracker({ event, result_hash, metadata }: Props) {
  useEffect(() => {
    trackEvent({ event_name: event, result_hash, metadata })
  }, [event, result_hash, metadata])
  return null
}
