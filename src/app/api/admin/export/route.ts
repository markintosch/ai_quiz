export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: { triggered: boolean; severity?: string; gap: number }
}

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const companyId = searchParams.get('company_id')
  const version = searchParams.get('version') ?? 'all'

  const supabase = createServiceClient()

  let query = supabase
    .from('respondents')
    .select('*')
    .order('created_at', { ascending: false })

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data: respondents } = await query as unknown as {
    data: Array<{
      id: string
      name: string
      email: string
      job_title: string
      company_name: string
      industry: string | null
      company_size: string | null
      source: string
      gdpr_consent: boolean
      created_at: string
    }> | null
  }

  if (!respondents || respondents.length === 0) {
    return new NextResponse('No data', { status: 404 })
  }

  const respondentIds = respondents.map((r) => r.id)

  let responsesQuery = supabase
    .from('responses')
    .select('respondent_id, id, quiz_version, scores, maturity_level, created_at')
    .in('respondent_id', respondentIds)
    .order('created_at', { ascending: false })

  if (version !== 'all') {
    responsesQuery = responsesQuery.eq('quiz_version', version)
  }

  const { data: responses } = await responsesQuery

  // Latest response per respondent
  const responseMap = new Map<string, {
    id: string
    quiz_version: string
    scores: ScoresJsonb
    maturity_level: string
    created_at: string
  }>()
  for (const r of responses ?? []) {
    if (!responseMap.has(r.respondent_id)) {
      responseMap.set(r.respondent_id, {
        id: r.id,
        quiz_version: r.quiz_version,
        scores: r.scores as unknown as ScoresJsonb,
        maturity_level: r.maturity_level,
        created_at: r.created_at,
      })
    }
  }

  // Collect all dimension labels from the first scored response
  let dimensionLabels: string[] = []
  for (const resp of Array.from(responseMap.values())) {
    if (resp.scores?.dimensionScores?.length) {
      dimensionLabels = resp.scores.dimensionScores.map((ds: { label: string }) => ds.label)
      break
    }
  }

  // Build CSV headers
  const headers = [
    'Name',
    'Email',
    'Job Title',
    'Company',
    'Industry',
    'Company Size',
    'Source',
    'GDPR Consent',
    'Quiz Version',
    'Overall Score',
    'Maturity Level',
    'Shadow AI',
    ...dimensionLabels,
    'Response ID',
    'Submitted At',
    'Respondent ID',
  ]

  const rows = respondents.map((r) => {
    const resp = responseMap.get(r.id)
    const scores = resp?.scores
    const dimScores = dimensionLabels.map((label) => {
      const ds = scores?.dimensionScores?.find((d) => d.label === label)
      return ds ? String(ds.normalized) : ''
    })

    return [
      r.name,
      r.email,
      r.job_title,
      r.company_name,
      r.industry ?? '',
      r.company_size ?? '',
      r.source,
      r.gdpr_consent ? 'Yes' : 'No',
      resp?.quiz_version ?? '',
      scores?.overall != null ? String(scores.overall) : '',
      resp?.maturity_level ?? '',
      scores?.shadowAI?.triggered ? `Yes (${scores.shadowAI.severity ?? ''})` : 'No',
      ...dimScores,
      resp?.id ?? '',
      resp?.created_at ? new Date(resp.created_at).toISOString() : '',
      r.id,
    ].map(escapeCsv).join(',')
  })

  const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n')
  const filename = companyId
    ? `respondents-${companyId}-${new Date().toISOString().slice(0, 10)}.csv`
    : `respondents-all-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
