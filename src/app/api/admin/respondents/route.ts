export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/respondents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: Record<string, unknown>
}

interface RespondentRow {
  id: string
  name: string
  email: string
  job_title: string
  company_name: string
  company_id: string | null
  cohort_id: string | null
  industry: string | null
  company_size: string | null
  source: string
  gdpr_consent: boolean
  calendly_status: string | null
  created_at: string
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const version = searchParams.get('version') ?? 'all'
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = createServiceClient()

  // Build respondents query
  let respondentsQuery = supabase
    .from('respondents')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  // Fetch total count (separate query for filtered count)
  let countQuery = supabase
    .from('respondents')
    .select('*', { count: 'exact', head: true })

  const { data: respondents, count } = await respondentsQuery as unknown as { data: RespondentRow[] | null; count: number | null }
  await countQuery

  if (!respondents) {
    return NextResponse.json({ data: [], count: 0, page, pageSize })
  }

  const respondentIds = respondents.map((r) => r.id)

  // Fetch corresponding responses
  let responsesQuery = supabase
    .from('responses')
    .select('respondent_id, id, quiz_version, scores, maturity_level')
    .in('respondent_id', respondentIds)

  if (version !== 'all') {
    responsesQuery = responsesQuery.eq('quiz_version', version)
  }

  const { data: responses } = await responsesQuery

  interface ResponseRow {
    id: string
    respondent_id: string
    quiz_version: string
    scores: unknown
    maturity_level: string
  }
  // Map responses to respondents (latest response per respondent)
  const responseMap = new Map<string, ResponseRow>()
  for (const resp of responses ?? []) {
    if (!responseMap.has(resp.respondent_id)) {
      responseMap.set(resp.respondent_id, resp)
    }
  }

  // Filter respondents if version filter applied (only keep those with a matching response)
  let filteredRespondents = respondents
  if (version !== 'all') {
    filteredRespondents = respondents.filter((r) => responseMap.has(r.id))
  }

  const data = filteredRespondents.map((r) => {
    const resp = responseMap.get(r.id)
    const scores = resp?.scores as unknown as ScoresJsonb | undefined
    return {
      ...r,
      response_id: resp?.id ?? null,
      overall_score: scores?.overall ?? null,
      maturity_level: resp?.maturity_level ?? null,
      quiz_version: resp?.quiz_version ?? null,
    }
  })

  return NextResponse.json({ data, count: count ?? 0, page, pageSize })
}
