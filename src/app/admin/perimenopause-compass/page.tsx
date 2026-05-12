// FILE: src/app/admin/perimenopause-compass/page.tsx
// Admin: lijst van alle Compass assessments.

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Row = {
  id:           string
  email:        string | null
  display_name: string | null
  stage:        string
  age_band:     string | null
  hrt_status:   string | null
  score_overall:number
  band:         string | null
  created_at:   string
  email_sent_at:string | null
}

const STAGE_LABEL: Record<string, string> = {
  regular_cycle:           'Regulier',
  irregular_cycle:         'Onregelmatig',
  perimenopause_diagnosed: 'Peri (vastgesteld)',
  postmenopause:           'Post',
  unknown:                 'Onbekend',
}

const BAND_COLOR: Record<string, string> = {
  thriving:    'bg-emerald-100 text-emerald-800',
  navigating:  'bg-blue-100 text-blue-800',
  struggling:  'bg-amber-100 text-amber-800',
  depleted:    'bg-rose-100 text-rose-800',
}

const STAGE_FILTERS = [
  { value: 'all',                     label: 'Alle stadia'   },
  { value: 'regular_cycle',           label: 'Regulier'      },
  { value: 'irregular_cycle',         label: 'Onregelmatig'  },
  { value: 'perimenopause_diagnosed', label: 'Peri (vast)'   },
  { value: 'postmenopause',           label: 'Postmenopauze' },
  { value: 'unknown',                 label: 'Onbekend'      },
]

export default function AdminCompassListPage() {
  const [rows,    setRows]    = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [stage,   setStage]   = useState('all')
  const [hasEmail,setHasEmail]= useState<'all'|'yes'|'no'>('all')

  async function load() {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (stage !== 'all') params.set('stage', stage)
    if (hasEmail !== 'all') params.set('email', hasEmail)
    try {
      const r = await fetch(`/api/admin/perimenopause-compass?${params}`, { cache: 'no-store' })
      const j = await r.json()
      if (!r.ok) {
        setError(j.error ?? `HTTP ${r.status}`)
        setRows([])
      } else {
        setRows(Array.isArray(j.assessments) ? j.assessments : [])
      }
    } catch (err) {
      setError(`Netwerkfout: ${err instanceof Error ? err.message : 'onbekend'}`)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [stage, hasEmail])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">Perimenopause Compass</h1>
        <p className="text-sm text-gray-600">Alle ingevulde nulmetingen, nieuwste eerst.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">Oeps:</p>
          <p className="mt-1">{error}</p>
          {error.toLowerCase().includes('does not exist') || error.toLowerCase().includes('schema cache') ? (
            <p className="mt-2 text-xs">Tip: run de SQL migratie <code className="rounded bg-red-100 px-1">supabase/migration_perimenopause_compass.sql</code> in de Supabase SQL editor.</p>
          ) : null}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
        >
          {STAGE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={hasEmail}
          onChange={(e) => setHasEmail(e.target.value as typeof hasEmail)}
          className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
        >
          <option value="all">Met & zonder e-mail</option>
          <option value="yes">Alleen met e-mail</option>
          <option value="no">Anoniem</option>
        </select>
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-600">Laden…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 py-16 text-center text-gray-600">
          Nog geen assessments in deze view.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Datum</th>
                <th className="px-4 py-3 text-left font-medium">E-mail</th>
                <th className="px-4 py-3 text-left font-medium">Stadium</th>
                <th className="px-4 py-3 text-left font-medium">Leeftijd</th>
                <th className="px-4 py-3 text-left font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">Band</th>
                <th className="px-4 py-3 text-left font-medium">Mail</th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(r.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-800">
                    {r.email ?? <span className="text-gray-400 italic">anoniem</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{STAGE_LABEL[r.stage] ?? r.stage}</td>
                  <td className="px-4 py-3 text-gray-700">{r.age_band ?? '—'}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-brand">{r.score_overall}</td>
                  <td className="px-4 py-3">
                    {r.band && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BAND_COLOR[r.band] ?? 'bg-gray-100 text-gray-700'}`}>
                        {r.band}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {r.email_sent_at ? '✓' : (r.email ? 'pending' : '—')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/perimenopause-compass/results/${r.id}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand-accent hover:underline">
                      Bekijk →
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
