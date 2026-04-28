'use client'

import { useEffect, useRef } from 'react'

// Module-level helpers — usable from any client component.

const SESSION_KEY = 'aibench_sid'

function uid(): string {
  // RFC4122-ish v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = uid()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

type EventOpts = {
  question_id?: string
  role?:        string
  meta?:        Record<string, unknown>
}

export function trackBenchEvent(event_type: string, opts: EventOpts = {}) {
  if (typeof window === 'undefined') return
  const session = getSessionId()
  // Fire and forget; never block the user
  try {
    fetch('/api/ai_benchmark/event', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ session_id: session, event_type, ...opts }),
      keepalive: true,
    }).catch(() => { /* ignore */ })
  } catch { /* ignore */ }
}

// Mount-fire helper. Use as <Tracker event="page_view" /> on any page.
export function Tracker({ event, role, meta }: {
  event: string
  role?: string
  meta?: Record<string, unknown>
}) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    trackBenchEvent(event, { role, meta })
  }, [event, role, meta])
  return null
}
