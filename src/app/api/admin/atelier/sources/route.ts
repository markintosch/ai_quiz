export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/atelier/sources/route.ts
// POST — add a source. Admin layout middleware protects it.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAuthorised } from '@/lib/admin/auth'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const VALID_CATEGORIES = ['reference', 'street_signal', 'ground_truth', 'web', 'inferred'] as const

interface AddBody {
  category:    typeof VALID_CATEGORIES[number]
  name:        string
  description?: string
  url?:        string
  notes?:      string
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: AddBody
  try {
    body = (await req.json()) as AddBody
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 })
  }

  if (!VALID_CATEGORIES.includes(body.category)) {
    return NextResponse.json({ error: `category moet zijn: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 })
  }
  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json({ error: 'name is verplicht (min 2 tekens).' }, { status: 400 })
  }

  const { error } = await sb.from('atelier_sources').insert({
    category:    body.category,
    name:        body.name.trim(),
    description: body.description?.trim() || null,
    url:         body.url?.trim() || null,
    notes:       body.notes?.trim() || null,
    added_by:    'admin',
    active:      true,
  })

  if (error) {
    console.error('[admin/atelier/sources POST]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
