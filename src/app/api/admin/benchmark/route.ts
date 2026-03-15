// FILE: src/app/api/admin/benchmark/route.ts
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: Record<string, unknown>
}

export async function GET() {
  const supabase = createServiceClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('active', true)
    .order('name', { ascending: true })

  const { data: respondents } = await supabase
    .from('respondents')
    .select('id, company_id')
    .not('company_id', 'is', null)

  const { data: responses } = await supabase
    .from('responses')
    .select('respondent_id, scores')

  if (!companies || !respondents || !responses) {
    return NextResponse.json({ companies: [], dimensions: [], data: {} })
  }

  // Map respondent_id -> company_id
  const respondentToCompany = new Map(
    respondents.map((r) => [r.id, r.company_id])
  )

  // Collect all dimension labels (from first response that has them)
  const dimensionLabels: string[] = []
  for (const resp of responses) {
    const scores = resp.scores as unknown as ScoresJsonb
    if (scores?.dimensionScores?.length > 0) {
      for (const ds of scores.dimensionScores) {
        if (!dimensionLabels.includes(ds.label)) {
          dimensionLabels.push(ds.label)
        }
      }
      break
    }
  }

  // Accumulate dimension scores per company
  type DimAccum = { total: number; count: number }
  const companyDimData = new Map<string, Map<string, DimAccum>>()

  for (const resp of responses) {
    const companyId = respondentToCompany.get(resp.respondent_id)
    if (!companyId) continue

    const scores = resp.scores as unknown as ScoresJsonb
    if (!scores?.dimensionScores) continue

    if (!companyDimData.has(companyId)) {
      companyDimData.set(companyId, new Map())
    }
    const dimMap = companyDimData.get(companyId)!

    for (const ds of scores.dimensionScores) {
      const existing = dimMap.get(ds.label) ?? { total: 0, count: 0 }
      dimMap.set(ds.label, {
        total: existing.total + ds.normalized,
        count: existing.count + 1,
      })
    }
  }

  // Build output — only include companies with at least one response
  const companyNames: string[] = []
  const benchmarkData: Record<string, Record<string, number | null>> = {}

  for (const company of companies) {
    const dimMap = companyDimData.get(company.id)
    if (!dimMap) continue

    companyNames.push(company.name)
    benchmarkData[company.name] = {}

    for (const label of dimensionLabels) {
      const accum = dimMap.get(label)
      benchmarkData[company.name][label] = accum
        ? Math.round(accum.total / accum.count)
        : null
    }
  }

  return NextResponse.json({
    companies: companyNames,
    dimensions: dimensionLabels,
    data: benchmarkData,
  })
}
