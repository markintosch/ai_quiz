import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`pulse:suggest:${ip}`, 3, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek.' }, { status: 400 })
  }

  const { themeId, suggestedLabel, suggestedUrl, email } = body as Record<string, unknown>

  if (typeof themeId !== 'string' || themeId.trim() === '') {
    return NextResponse.json({ error: 'themeId is verplicht.' }, { status: 400 })
  }
  if (typeof suggestedLabel !== 'string' || suggestedLabel.trim().length === 0) {
    return NextResponse.json({ error: 'Naam is verplicht.' }, { status: 400 })
  }
  if (suggestedLabel.trim().length > 100) {
    return NextResponse.json({ error: 'Naam mag maximaal 100 tekens bevatten.' }, { status: 400 })
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { error } = await supabase.from('pulse_suggestions_v2').insert({
    theme_id: themeId.trim(),
    suggested_label: suggestedLabel.trim(),
    suggested_url: typeof suggestedUrl === 'string' && suggestedUrl.trim() !== '' ? suggestedUrl.trim() : null,
    suggested_by_email: typeof email === 'string' && email.trim() !== '' ? email.trim() : null,
  })

  if (error) {
    console.error('[pulse/suggest] DB error:', error)
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het opnieuw.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
