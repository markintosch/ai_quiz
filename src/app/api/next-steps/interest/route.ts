export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import type { Json } from '@/types/supabase'

const VALID_SERVICE_KEYS = [
  'intro_session',
  'intro_training',
  'ai_coding',
  'clevel_training',
  'custom_project',
] as const

type ServiceKey = (typeof VALID_SERVICE_KEYS)[number]

export async function POST(req: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────────
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`interest:${ip}`, 10, 60 * 60 * 1000) // 10 per hour
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429 }
    )
  }

  let body: {
    serviceKey: string
    responseId?: string
    name: string
    email: string
    options?: Record<string, unknown>
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { serviceKey, responseId, name, email, options } = body

  // ── Validation ────────────────────────────────────────────────
  if (!serviceKey || !(VALID_SERVICE_KEYS as readonly string[]).includes(serviceKey)) {
    return NextResponse.json({ error: 'Invalid service key' }, { status: 400 })
  }
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // ── Resolve respondent_id from responseId (optional) ─────────
  let respondentId: string | null = null
  if (responseId) {
    const { data: response } = await supabase
      .from('responses')
      .select('respondent_id')
      .eq('id', responseId)
      .maybeSingle() as { data: { respondent_id: string } | null }

    respondentId = response?.respondent_id ?? null
  }

  // ── Insert interest registration ──────────────────────────────
  const { error } = await supabase
    .from('interest_registrations')
    .insert({
      service_key:   serviceKey as ServiceKey,
      respondent_id: respondentId,
      name:          name.trim(),
      email:         email.trim().toLowerCase(),
      options:       (options ?? {}) as Json,
    })

  if (error) {
    console.error('Interest registration insert error:', error)
    return NextResponse.json({ error: 'Failed to save registration' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
