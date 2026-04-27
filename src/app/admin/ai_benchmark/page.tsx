// FILE: src/app/admin/ai_benchmark/page.tsx
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface Row {
  id:               string
  name:             string | null
  email:            string
  lang:             string
  role:             string
  seniority:        string | null
  industry:         string | null
  company_size:     string | null
  region:           string | null
  archetype:        string
  total_score:      number
  dimension_scores: Record<string, number>
  created_at:       string
}

const PAGE_SIZE = 50

export default async function AdminAiBenchmarkPage({
  searchParams,
}: {
  searchParams: { page?: string; role?: string }
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const page  = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const roleF = searchParams.role ?? 'all'
  const from  = (page - 1) * PAGE_SIZE
  const to    = from + PAGE_SIZE - 1

  let q = supabase
    .from('ai_benchmark_responses')
    .select('id, name, email, lang, role, seniority, industry, company_size, region, archetype, total_score, dimension_scores, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (roleF !== 'all') q = q.eq('role', roleF)

  const { data, count } = await q as unknown as { data: Row[] | null; count: number | null }

  const rows = data ?? []
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Aggregates
  const byRole: Record<string, number> = {}
  const byArchetype: Record<string, number> = {}
  let avgScore = 0
  if (rows.length) {
    for (const r of rows) {
      byRole[r.role]           = (byRole[r.role] ?? 0) + 1
      byArchetype[r.archetype] = (byArchetype[r.archetype] ?? 0) + 1
      avgScore += r.total_score
    }
    avgScore = Math.round(avgScore / rows.length)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">AI-benchmark</h1>
        <p className="text-sm text-gray-600 mt-1">
          Submitted assessments — research data feeding the State of AI in Marketing &amp; Sales report.
        </p>
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total respondents" value={total.toLocaleString()} />
        <Stat label="Avg score (page)"  value={rows.length ? `${avgScore}/100` : '—'} />
        <Stat label="Marketing"        value={(byRole.marketing ?? 0).toString()} />
        <Stat label="Sales"            value={(byRole.sales ?? 0).toString()} />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Filter role:</span>
        {['all', 'marketing', 'sales', 'hybrid'].map(r => (
          <Link
            key={r}
            href={`/admin/ai_benchmark?role=${r}`}
            className={`px-3 py-1 rounded-full border ${
              roleF === r
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            {r}
          </Link>
        ))}
        <Link
          href={`/api/admin/ai_benchmark/export${roleF !== 'all' ? `?role=${roleF}` : ''}`}
          className="ml-auto text-brand-accent hover:underline"
        >
          ⬇ Export CSV
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <Th>Date</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Industry</Th>
              <Th>Size</Th>
              <Th>Region</Th>
              <Th className="text-right">Score</Th>
              <Th>Archetype</Th>
              <Th className="text-right">Open</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500 text-sm">
                  Geen submissions nog. Run the migration in Supabase SQL editor and submit a test assessment.
                </td>
              </tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <Td>{new Date(r.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' })} <span className="text-gray-400">{new Date(r.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span></Td>
                <Td>{r.name || <span className="text-gray-400">—</span>}</Td>
                <Td className="font-mono text-xs text-gray-600">{r.email}</Td>
                <Td><RoleTag role={r.role} /></Td>
                <Td>{r.industry || <span className="text-gray-400">—</span>}</Td>
                <Td>{r.company_size || <span className="text-gray-400">—</span>}</Td>
                <Td>{r.region || <span className="text-gray-400">—</span>}</Td>
                <Td className="text-right font-bold text-gray-900">{r.total_score}</Td>
                <Td><span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">{r.archetype.replace('_', ' ')}</span></Td>
                <Td className="text-right">
                  <Link href={`/ai_benchmark/results/${r.id}?lang=${r.lang}`} target="_blank" className="text-brand-accent hover:underline">↗</Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1
            return (
              <Link
                key={n}
                href={`/admin/ai_benchmark?page=${n}${roleF !== 'all' ? `&role=${roleF}` : ''}`}
                className={`px-3 py-1 rounded ${n === page ? 'bg-brand-accent text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'}`}
              >
                {n}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${className}`}>{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 text-sm text-gray-700 ${className}`}>{children}</td>
}

function RoleTag({ role }: { role: string }) {
  const colors: Record<string, string> = {
    marketing: 'bg-blue-50 text-blue-700 border-blue-200',
    sales:     'bg-green-50 text-green-700 border-green-200',
    hybrid:    'bg-purple-50 text-purple-700 border-purple-200',
  }
  const cls = colors[role] || 'bg-gray-50 text-gray-700 border-gray-200'
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${cls}`}>{role}</span>
}
