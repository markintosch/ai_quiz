// FILE: src/app/admin/arena/page.tsx
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface SessionRow {
  id: string
  join_code: string
  host_name: string
  status: string
  question_count: number
  time_per_q: number
  started_at: string | null
  created_at: string
  company_id: string | null
}

interface CompanyRow { id: string; name: string }

export default async function ArenaPage() {
  const supabase = createServiceClient()

  const { data: sessions } = await supabase
    .from('arena_sessions')
    .select('id, join_code, host_name, status, question_count, time_per_q, started_at, created_at, company_id')
    .order('created_at', { ascending: false })
    .limit(100) as { data: SessionRow[] | null }

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name') as { data: CompanyRow[] | null }

  const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]))

  // Participant counts
  const { data: participantCounts } = await supabase
    .from('arena_participants')
    .select('session_id')

  const countMap = new Map<string, number>()
  for (const p of participantCounts ?? []) {
    if (p.session_id) countMap.set(p.session_id, (countMap.get(p.session_id) ?? 0) + 1)
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      lobby:     'bg-yellow-100 text-yellow-700',
      active:    'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-600',
    }
    return map[status] ?? 'bg-gray-100 text-gray-500'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cloud Arena</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live quiz game sessions</p>
        </div>
        <Link
          href="/admin/arena/new"
          className="bg-brand-accent hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Session
        </Link>
      </div>

      {(!sessions || sessions.length === 0) ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No sessions yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Host</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Players</th>
                <th className="text-left px-4 py-3">Qs / Time</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-brand text-base tracking-widest">
                    {s.join_code}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{s.host_name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.company_id ? (companyMap.get(s.company_id) ?? '—') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{countMap.get(s.id) ?? 0}</td>
                  <td className="px-4 py-3 text-gray-500">{s.question_count}Q / {s.time_per_q}s</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/arena/${s.join_code}`}
                      className="text-brand-accent hover:underline font-medium text-sm"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
