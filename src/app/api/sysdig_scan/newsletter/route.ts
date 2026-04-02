import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    await supabase
      .from('sysdig_scan_leads')
      .update({ opt_newsletter: true })
      .ilike('email', email)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('newsletter opt-in error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
