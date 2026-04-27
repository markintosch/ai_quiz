import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin auth is enforced by middleware (cookie HMAC check on /admin/* and
// /api/admin/* — see middleware.ts). No additional rate limiting needed for
// authenticated admin endpoints.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Row {
  id:                string
  created_at:        string
  name:              string | null
  email:             string
  lang:              string
  role:              string
  seniority:         string | null
  industry:          string | null
  company_size:      string | null
  region:            string | null
  archetype:         string
  total_score:       number
  dimension_scores:  Record<string, number>
  marketing_consent: boolean
}

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(req: NextRequest) {
  const url   = new URL(req.url)
  const role  = url.searchParams.get('role') ?? 'all'

  let q = supabase
    .from('ai_benchmark_responses')
    .select('id, created_at, name, email, lang, role, seniority, industry, company_size, region, archetype, total_score, dimension_scores, marketing_consent')
    .order('created_at', { ascending: false })
    .limit(5000)

  if (role !== 'all') q = q.eq('role', role)

  const { data, error } = await q as unknown as { data: Row[] | null; error: unknown }
  if (error) return NextResponse.json({ error: 'Query failed' }, { status: 500 })

  const rows = data ?? []
  const headers = [
    'id', 'created_at', 'name', 'email', 'lang', 'role', 'seniority', 'industry',
    'company_size', 'region', 'archetype', 'total_score',
    'd_adoption', 'd_workflow', 'd_outcome', 'd_data', 'd_skill', 'd_governance',
    'marketing_consent',
  ]

  const lines = [headers.join(',')]
  for (const r of rows) {
    const d = r.dimension_scores || {}
    lines.push([
      r.id, r.created_at, r.name, r.email, r.lang, r.role, r.seniority, r.industry,
      r.company_size, r.region, r.archetype, r.total_score,
      d.adoption ?? '', d.workflow ?? '', d.outcome ?? '', d.data ?? '', d.skill ?? '', d.governance ?? '',
      r.marketing_consent,
    ].map(csvCell).join(','))
  }

  const csv = lines.join('\n')
  const stamp = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ai_benchmark_${role}_${stamp}.csv"`,
    },
  })
}
