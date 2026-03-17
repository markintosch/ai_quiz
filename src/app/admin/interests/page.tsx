export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'
import { redirect } from 'next/navigation'

const SERVICE_LABELS: Record<string, string> = {
  intro_session:   'Introduction session',
  intro_training:  'Online intro to AI',
  ai_coding:       'Hands-on AI coding',
  clevel_training: 'C-level training',
  custom_project:  'Custom project',
}

const SERVICE_COLORS: Record<string, string> = {
  intro_session:   'bg-blue-50 text-blue-700',
  intro_training:  'bg-purple-50 text-purple-700',
  ai_coding:       'bg-green-50 text-green-700',
  clevel_training: 'bg-amber-50 text-amber-700',
  custom_project:  'bg-brand-accent/10 text-brand-accent',
}

const ALL_KEYS = Object.keys(SERVICE_LABELS)

interface InterestRow {
  id: string
  service_key: string
  name: string
  email: string
  respondent_id: string | null
  options: Record<string, unknown>
  created_at: string
}

export default async function InterestsPage({
  searchParams,
}: {
  searchParams: { service?: string }
}) {
  if (!(await isAuthorised())) redirect('/admin/login')

  const supabase = createServiceClient()
  const serviceFilter = searchParams.service ?? 'all'

  let query = supabase
    .from('interest_registrations')
    .select('id, service_key, name, email, respondent_id, options, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (serviceFilter !== 'all') {
    query = query.eq('service_key', serviceFilter as 'intro_session' | 'intro_training' | 'ai_coding' | 'clevel_training' | 'custom_project')
  }

  const { data: rows, error } = await query as {
    data: InterestRow[] | null
    error: { message: string } | null
  }

  if (error) {
    return <p className="text-red-600">Error loading interests: {error.message}</p>
  }

  const interests = rows ?? []

  // Count per service for filter tabs
  const { data: countRows } = await supabase
    .from('interest_registrations')
    .select('service_key') as { data: { service_key: string }[] | null }

  const counts: Record<string, number> = { all: (countRows ?? []).length }
  for (const r of countRows ?? []) {
    counts[r.service_key] = (counts[r.service_key] ?? 0) + 1
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Post-assessment service registrations — {counts.all ?? 0} total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/interests"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            serviceFilter === 'all'
              ? 'bg-brand text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({counts.all ?? 0})
        </a>
        {ALL_KEYS.map(key => (
          <a
            key={key}
            href={`/admin/interests?service=${key}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              serviceFilter === key
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {SERVICE_LABELS[key]} ({counts[key] ?? 0})
          </a>
        ))}
      </div>

      {/* Table */}
      {interests.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">No registrations yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Date
                </th>
                <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Service
                </th>
                <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Name
                </th>
                <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Email
                </th>
                <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Linked
                </th>
                <th className="text-left py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {interests.map(row => {
                const date = new Date(row.created_at)
                const dateStr = date.toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
                const timeStr = date.toLocaleTimeString('en-GB', {
                  hour: '2-digit', minute: '2-digit',
                })
                const optionsSummary = Object.entries(row.options ?? {})
                  .filter(([, v]) => v !== undefined && v !== '')
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
                  .join(' · ')

                return (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">
                      <span>{dateStr}</span>
                      <span className="ml-1 text-gray-400 text-xs">{timeStr}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${SERVICE_COLORS[row.service_key] ?? 'bg-gray-100 text-gray-600'}`}>
                        {SERVICE_LABELS[row.service_key] ?? row.service_key}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-900 font-medium">{row.name}</td>
                    <td className="py-3 pr-4 text-gray-600">{row.email}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">
                      {row.respondent_id ? (
                        <span className="text-green-600 font-medium">✓ Known</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-500 text-xs max-w-xs truncate">
                      {optionsSummary || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
