export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!(await isAuthorised())) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id: cohortId } = await params
  const supabase = createServiceClient()
  const url = new URL(req.url)
  const waveParam = url.searchParams.get('wave') // 'all' or wave_number as string

  // Fetch cohort name
  const { data: cohort } = await supabase
    .from('cohorts')
    .select('name')
    .eq('id', cohortId)
    .single() as unknown as { data: { name: string } | null }

  // Fetch waves
  let waveQuery = supabase.from('cohort_waves').select('id, wave_number, label').eq('cohort_id', cohortId)
  if (waveParam && waveParam !== 'all') {
    waveQuery = waveQuery.eq('wave_number', parseInt(waveParam))
  }
  const { data: waves } = await waveQuery

  const waveIds = (waves ?? []).map(w => w.id)
  const waveByIdMap = new Map((waves ?? []).map(w => [w.id, { number: w.wave_number, label: w.label }]))

  if (!waveIds.length) {
    return new NextResponse('No waves found', { status: 404 })
  }

  // Fetch cohort_responses for these waves
  const { data: cohortResponses } = await supabase
    .from('cohort_responses')
    .select('wave_id, response_id')
    .in('wave_id', waveIds)

  const responseIds = (cohortResponses ?? []).map(cr => cr.response_id)
  const waveByResponseMap = new Map((cohortResponses ?? []).map(cr => [cr.response_id, cr.wave_id]))

  if (!responseIds.length) {
    return new NextResponse('No responses found', { status: 404 })
  }

  // Fetch responses + respondents
  const { data: responses } = await supabase
    .from('responses')
    .select('id, respondent_id, scores, shadow_ai_flag, shadow_ai_severity, created_at')
    .in('id', responseIds) as unknown as {
      data: Array<{
        id: string
        respondent_id: string
        scores: {
          overall: number
          dimensionScores: { dimension: string; label: string; normalized: number }[]
        }
        shadow_ai_flag: boolean
        shadow_ai_severity: string | null
        created_at: string
      }> | null
    }

  const respondentIds = Array.from(new Set((responses ?? []).map(r => r.respondent_id)))
  const { data: respondents } = await supabase
    .from('respondents')
    .select('id, name, email, job_title, company_name')
    .in('id', respondentIds) as unknown as {
      data: Array<{ id: string; name: string; email: string; job_title: string; company_name: string }> | null
    }

  const respondentMap = new Map((respondents ?? []).map(r => [r.id, r]))

  // Collect all dimension labels from first response
  const firstResp = responses?.[0]
  const dimLabels: string[] = firstResp?.scores?.dimensionScores?.map(d => d.label) ?? []

  // Build CSV
  const headers = [
    'Wave', 'Name', 'Email', 'Job Title', 'Company', 'Overall Score',
    ...dimLabels,
    'Shadow AI', 'Shadow AI Severity', 'Completion Date',
  ]

  const rows = (responses ?? []).map(r => {
    const person = respondentMap.get(r.respondent_id)
    const waveId = waveByResponseMap.get(r.id)
    const wave = waveId ? waveByIdMap.get(waveId) : null
    const dims = dimLabels.map(label => {
      const ds = r.scores?.dimensionScores?.find(d => d.label === label)
      return ds ? Math.round(ds.normalized).toString() : ''
    })
    return [
      wave ? `Wave ${wave.number} — ${wave.label}` : '',
      person?.name ?? '',
      person?.email ?? '',
      person?.job_title ?? '',
      person?.company_name ?? '',
      Math.round(r.scores?.overall ?? 0).toString(),
      ...dims,
      r.shadow_ai_flag ? 'Yes' : 'No',
      r.shadow_ai_severity ?? '',
      new Date(r.created_at).toLocaleDateString('en-GB'),
    ]
  })

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const filename = `cohort-${cohort?.name ?? cohortId}-${waveParam === 'all' ? 'all-waves' : `wave${waveParam}`}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
