export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  if (!(await isAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { id } = await params
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('cohort_waves')
    .select('*')
    .eq('cohort_id', id)
    .order('wave_number')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!(await isAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { id: cohort_id } = await params
  const supabase = createServiceClient()
  const body = await req.json() as { label: string; wave_date?: string | null }

  // Determine next wave_number
  const { data: existing } = await supabase
    .from('cohort_waves')
    .select('wave_number')
    .eq('cohort_id', cohort_id)
    .order('wave_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextWaveNumber = ((existing as { wave_number: number } | null)?.wave_number ?? -1) + 1

  // Close any currently open wave
  await supabase
    .from('cohort_waves')
    .update({ is_open: false })
    .eq('cohort_id', cohort_id)
    .eq('is_open', true)

  const { data, error } = await supabase
    .from('cohort_waves')
    .insert({
      cohort_id,
      wave_number: nextWaveNumber,
      label:       body.label || `Wave ${nextWaveNumber}`,
      wave_date:   body.wave_date ?? null,
      is_open:     true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
