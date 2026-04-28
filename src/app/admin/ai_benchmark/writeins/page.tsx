// FILE: src/app/admin/ai_benchmark/writeins/page.tsx
// Moderation queue for "Other, namelijk…" write-ins. Lets Mark see what
// people are typing in free-text and decide which entries are worth
// promoting to the canonical option list (manual code edit in data.ts).

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getQuestions } from '@/products/ai_benchmark/data'

export const dynamic = 'force-dynamic'

interface WriteIn {
  id:           string
  question_id:  string
  raw_text:     string
  normalized:   string
  status:       string
  count:        number
  first_seen:   string
  last_seen:    string
}

export default async function WriteInsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const status = searchParams.status ?? 'pending'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let q = supabase
    .from('ai_benchmark_writeins')
    .select('*', { count: 'exact' })
    .order('count', { ascending: false })
    .order('last_seen', { ascending: false })
    .limit(500)

  if (status !== 'all') q = q.eq('status', status)

  const { data: rows, count } = await q as unknown as { data: WriteIn[] | null; count: number | null }
  const writeins = rows ?? []

  // Build a lookup of question text + canonical option labels for context
  const allQs = [...getQuestions('marketing'), ...getQuestions('sales'), ...getQuestions('hybrid')]
  const qTextById: Record<string, { text: string; options: { id: string; label: string }[] }> = {}
  for (const q of allQs) {
    if (!qTextById[q.id]) qTextById[q.id] = { text: q.text, options: q.options.map(o => ({ id: o.id, label: o.label })) }
  }

  // Group by question
  const byQuestion: Record<string, WriteIn[]> = {}
  for (const w of writeins) {
    ;(byQuestion[w.question_id] ||= []).push(w)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">AI-benchmark · Write-in moderation</h1>
        <p className="text-sm text-gray-600 mt-1">
          Free-text entries from "Other, namelijk…". Surfaces what respondents are typing so you can decide which to promote to the canonical option list.
        </p>
      </header>

      {/* Status filter */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Status:</span>
        {['pending', 'reviewed', 'promoted', 'merged', 'rejected', 'all'].map(s => (
          <Link
            key={s}
            href={`/admin/ai_benchmark/writeins?status=${s}`}
            className={`px-3 py-1 rounded-full border ${
              s === status
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s}
          </Link>
        ))}
        <span className="ml-auto text-gray-500 text-xs">
          {count ?? 0} entries · top 500 shown
        </span>
      </div>

      {writeins.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-500">
          Nog geen write-ins in deze status. Run{' '}
          <code className="bg-gray-100 px-1 rounded">supabase/migration_ai_benchmark_writeins.sql</code>{' '}
          als deze pagina onbedoeld leeg is.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byQuestion).map(([qid, items]) => {
            const meta = qTextById[qid]
            return (
              <div key={qid} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5">
                  <p className="text-xs font-mono font-bold text-brand-accent">{qid.toUpperCase()}</p>
                  <p className="text-sm font-semibold text-gray-900">{meta?.text ?? '—'}</p>
                </div>

                <table className="w-full text-sm">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <Th className="w-16 text-right">Count</Th>
                      <Th>Raw text</Th>
                      <Th>Normalized</Th>
                      <Th>First seen</Th>
                      <Th>Last seen</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(w => {
                      const isCanonical = !!meta?.options.find(o => o.id === w.normalized)
                      return (
                        <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <Td className="text-right font-bold text-brand-accent">{w.count}</Td>
                          <Td className="font-medium text-gray-900">{w.raw_text}</Td>
                          <Td className="font-mono text-xs text-gray-600">
                            {w.normalized}
                            {isCanonical && (
                              <span className="ml-2 text-xs text-amber-700 font-semibold">⚠ matches canonical id</span>
                            )}
                          </Td>
                          <Td className="text-xs text-gray-500">{fmtDate(w.first_seen)}</Td>
                          <Td className="text-xs text-gray-500">{fmtDate(w.last_seen)}</Td>
                          <Td>
                            <StatusBadge status={w.status} />
                          </Td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Promote a write-in by adding its normalized id + label to the relevant question in{' '}
        <code className="bg-gray-100 px-1 rounded">src/products/ai_benchmark/data.ts</code>{' '}
        (both the structure and each language&apos;s translation table). After deploying, mark the row as <code className="bg-gray-100 px-1 rounded">promoted</code>.
      </p>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${className}`}>{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 text-sm text-gray-700 ${className}`}>{children}</td>
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    pending:  'bg-amber-50 text-amber-800 border-amber-200',
    reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
    promoted: 'bg-green-50 text-green-700 border-green-200',
    merged:   'bg-purple-50 text-purple-700 border-purple-200',
    rejected: 'bg-gray-50 text-gray-500 border-gray-200',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${cls[status] || cls.pending}`}>
      {status}
    </span>
  )
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
