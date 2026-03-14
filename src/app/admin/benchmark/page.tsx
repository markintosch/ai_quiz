// FILE: src/app/admin/benchmark/page.tsx
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface ScoresJsonb {
  overall: number
  dimensionScores: { dimension: string; label: string; normalized: number }[]
  maturityLevel: string
  shadowAI: Record<string, unknown>
}

function cellStyle(score: number | null): string {
  if (score === null) return 'bg-gray-50 text-gray-400'
  if (score < 40) return 'bg-red-100 text-red-800'
  if (score < 60) return 'bg-orange-100 text-orange-800'
  if (score < 80) return 'bg-teal-100 text-teal-800'
  return 'bg-green-100 text-green-800'
}

export default async function BenchmarkPage() {
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

  // Map respondent_id -> company_id
  const respondentToCompany = new Map(
    (respondents ?? []).map((r) => [r.id, r.company_id])
  )

  // Collect all dimension labels
  const dimensionLabels: string[] = []
  for (const resp of responses ?? []) {
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

  // Accumulate per company
  type DimAccum = { total: number; count: number }
  const companyDimData = new Map<string, Map<string, DimAccum>>()

  for (const resp of responses ?? []) {
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

  // Only include companies with data
  const activeCompanies = (companies ?? []).filter((c) => companyDimData.has(c.id))

  // Build grid data
  const gridRows = activeCompanies.map((c) => {
    const dimMap = companyDimData.get(c.id)!
    const row: (number | null)[] = dimensionLabels.map((label) => {
      const accum = dimMap.get(label)
      return accum ? Math.round(accum.total / accum.count) : null
    })
    return { company: c.name, scores: row }
  })

  if (activeCompanies.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Benchmark Heatmap</h1>
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <p className="text-gray-400">No company responses yet.</p>
          <p className="text-gray-300 text-sm mt-1">
            Responses will appear here once respondents are linked to a company.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Benchmark Heatmap</h1>
      <p className="text-sm text-gray-400 mb-6">
        Average dimension scores per company. Higher is better.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: '0–39 Low', style: 'bg-red-100 text-red-800' },
          { label: '40–59 Moderate', style: 'bg-orange-100 text-orange-800' },
          { label: '60–79 Good', style: 'bg-teal-100 text-teal-800' },
          { label: '80–100 Leading', style: 'bg-green-100 text-green-800' },
        ].map((item) => (
          <span key={item.label} className={`px-3 py-1 rounded text-xs font-medium ${item.style}`}>
            {item.label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100 min-w-[160px]">
                Company
              </th>
              {dimensionLabels.map((label) => (
                <th
                  key={label}
                  className="px-4 py-3 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100 min-w-[120px] text-center"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridRows.map((row, i) => (
              <tr key={row.company} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-4 py-3 font-medium text-gray-900 border-b border-gray-50">
                  {row.company}
                </td>
                {row.scores.map((score, j) => (
                  <td
                    key={dimensionLabels[j]}
                    className={`px-4 py-3 text-center font-semibold border-b border-gray-50 ${cellStyle(score)}`}
                  >
                    {score !== null ? score : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
