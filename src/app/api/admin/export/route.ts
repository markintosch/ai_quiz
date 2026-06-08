export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'

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
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const companyId = searchParams.get('company_id')
  const version = searchParams.get('version') ?? 'all'
  const product = searchParams.get('product') ?? 'all'

  const AI_MATURITY_KEY = 'ai_maturity'

  const supabase = createServiceClient()

  // When a product is selected, restrict to respondents who took that assessment.
  let allowedIds: string[] | null = null
  if (product !== 'all') {
    let idsQuery = supabase.from('responses').select('respondent_id')
    if (product === AI_MATURITY_KEY) {
      idsQuery = idsQuery.or(`product_key.eq.${AI_MATURITY_KEY},product_key.is.null`)
    } else {
      idsQuery = idsQuery.eq('product_key', product)
    }
    const { data: idRows } = await idsQuery
    allowedIds = Array.from(new Set((idRows ?? []).map((r) => (r as { respondent_id: string }).respondent_id)))
  }

  let query = supabase
    .from('respondents')
    .select('*')
    .order('created_at', { ascending: false })

  if (companyId) {
    query = query.eq('company_id', companyId)
  }
  if (allowedIds) {
    query = query.in('id', allowedIds.length ? allowedIds : ['none'])
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
    .select('respondent_id, id, quiz_version, scores, maturity_level, created_at, product_key')
    .in('respondent_id', respondentIds)
    .order('created_at', { ascending: false })

  if (version !== 'all') {
    responsesQuery = responsesQuery.eq('quiz_version', version)
  }
  if (product === AI_MATURITY_KEY) {
    responsesQuery = responsesQuery.or(`product_key.eq.${AI_MATURITY_KEY},product_key.is.null`)
  } else if (product !== 'all') {
    responsesQuery = responsesQuery.eq('product_key', product)
  }

  const { data: responses } = await responsesQuery

  // Latest response per respondent
  const responseMap = new Map<string, {
    id: string
    quiz_version: string
    scores: ScoresJsonb
    maturity_level: string
    created_at: string
    product_key: string | null
  }>()
  for (const r of responses ?? []) {
    if (!responseMap.has(r.respondent_id)) {
      responseMap.set(r.respondent_id, {
        id: r.id,
        quiz_version: r.quiz_version,
        scores: r.scores as unknown as ScoresJsonb,
        maturity_level: r.maturity_level,
        created_at: r.created_at,
        product_key: (r as { product_key: string | null }).product_key ?? null,
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
    'Assessment',
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
      resp?.product_key ?? AI_MATURITY_KEY,
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
  const scope = companyId ?? (product !== 'all' ? product : 'all')
  const filename = `respondents-${scope}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
