// FILE: src/app/admin/cyber-compass/page.tsx
// Admin lijst voor HCSS Cyber Compass.

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Row {
  id:                string
  email:             string | null
  display_name:      string | null
  organisation_name: string | null
  organisation_size: string | null
  sector:            string | null
  language:          string
  score_overall:     number
  band:              string | null
  nis2_in_scope:     boolean | null
  ai_specialist_topic: string | null
  top_concern:       string | null
  created_at:        string
  email_sent_at:     string | null
}

const BAND_COLOR: Record<string, string> = {
  exposed:   'bg-rose-100 text-rose-800',
  aware:     'bg-amber-100 text-amber-800',
  maturing:  'bg-blue-100 text-blue-800',
  resilient: 'bg-emerald-100 text-emerald-800',
}

const BAND_FILTERS = [
  { value: 'all',       label: 'Alle bands' },
  { value: 'exposed',   label: 'Exposed' },
  { value: 'aware',     label: 'Aware' },
  { value: 'maturing',  label: 'Maturing' },
  { value: 'resilient', label: 'Resilient' },
]
const SIZE_FILTERS = [
  { value: 'all',      label: 'Alle groottes' },
  { value: '1-10',     label: '1-10' },
  { value: '11-50',    label: '11-50' },
  { value: '51-250',   label: '51-250' },
  { value: '251-1000', label: '251-1000' },
  { value: '1000+',    label: '1000+' },
]

export default function AdminCyberCompassListPage() {
  const [band,     setBand]     = useState('all')
  const [size,     setSize]     = useState('all')
  const [hasEmail, setHasEmail] = useState<'all'|'yes'|'no'>('all')
  const [nis2Only, setNis2Only] = useState(false)
  const [rows,     setRows]     = useState<Row[]>([])
  const [counts,   setCounts]   = useState({ total: 0, exposed: 0, aware: 0, maturing: 0, resilient: 0, nis2: 0, withEmail: 0 })
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    const params = new URLSearchParams()
    if (band !== 'all')     params.set('band', band)
    if (size !== 'all')     params.set('size', size)
    if (hasEmail !== 'all') params.set('email', hasEmail)
    if (nis2Only)           params.set('nis2', 'yes')
    try {
      const r = await fetch(`/api/admin/cyber-compass?${params}`, { cache: 'no-store' })
      const j = await r.json()
      if (!r.ok) {
        setError(j.error ?? `HTTP ${r.status}`); setRows([])
      } else {
        setRows(Array.isArray(j.assessments) ? j.assessments : [])
        if (j.counts) setCounts(j.counts)
      }
    } catch (err) {
      setError(`Netwerkfout: ${err instanceof Error ? err.message : 'onbekend'}`)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [band, size, hasEmail, nis2Only])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">Cyber Compass — HCSS</h1>
        <p className="text-sm text-gray-600">Alle ingevulde assessments. Leads voor Diederik (Hammer Cyber Security Services).</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">Oeps:</p>
          <p className="mt-1">{error}</p>
          {(error.toLowerCase().includes('does not exist') || error.toLowerCase().includes('schema cache')) && (
            <p className="mt-2 text-xs">Tip: run <code className="rounded bg-red-100 px-1">supabase/migration_cyber_compass.sql</code>.</p>
          )}
        </div>
      )}

      {/* Counts strip */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <CountBox label="Totaal"    value={counts.total}    color="brand"   />
        <CountBox label="Exposed"   value={counts.exposed}  color="rose"    />
        <CountBox label="Aware"     value={counts.aware}    color="amber"   />
        <CountBox label="Maturing"  value={counts.maturing} color="blue"    />
        <CountBox label="Resilient" value={counts.resilient}color="emerald" />
        <CountBox label="NIS2"      value={counts.nis2}     color="brand"   />
        <CountBox label="+E-mail"   value={counts.withEmail}color="brand"   />
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <select value={band}  onChange={(e) => setBand(e.target.value)}  className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm">
          {BAND_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={size}  onChange={(e) => setSize(e.target.value)}  className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm">
          {SIZE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={hasEmail} onChange={(e) => setHasEmail(e.target.value as typeof hasEmail)} className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm">
          <option value="all">Met & zonder e-mail</option>
          <option value="yes">Met e-mail (lead)</option>
          <option value="no">Anoniem</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" checked={nis2Only} onChange={(e) => setNis2Only(e.target.checked)} className="h-4 w-4 cursor-pointer accent-brand-accent" />
          Alleen NIS2 in scope
        </label>
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-600">Laden…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 py-16 text-center text-gray-600">
          Geen assessments in deze view.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Datum</th>
                <th className="px-4 py-3 text-left font-medium">Organisatie</th>
                <th className="px-4 py-3 text-left font-medium">E-mail</th>
                <th className="px-4 py-3 text-left font-medium">Grootte</th>
                <th className="px-4 py-3 text-left font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">Band</th>
                <th className="px-4 py-3 text-left font-medium">Specialist-onderwerp</th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(r.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {r.organisation_name ?? <span className="text-gray-400 italic">geen</span>}
                    {r.nis2_in_scope === true && <span className="ml-2 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">NIS2</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-800">
                    {r.email ?? <span className="text-gray-400 italic">anoniem</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.organisation_size ?? '—'}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-brand">{r.score_overall}</td>
                  <td className="px-4 py-3">
                    {r.band && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BAND_COLOR[r.band] ?? 'bg-gray-100 text-gray-700'}`}>
                        {r.band}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {r.ai_specialist_topic ? r.ai_specialist_topic.slice(0, 50) + (r.ai_specialist_topic.length > 50 ? '…' : '') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/HCSS/results/${r.id}?lang=${r.language ?? 'nl'}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand-accent hover:underline">
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

function CountBox({ label, value, color }: { label: string; value: number; color: 'brand'|'rose'|'amber'|'blue'|'emerald' }) {
  const cls: Record<typeof color, string> = {
    brand:   'border-brand/30 bg-brand/5',
    rose:    'border-rose-200 bg-rose-50',
    amber:   'border-amber-200 bg-amber-50',
    blue:    'border-blue-200 bg-blue-50',
    emerald: 'border-emerald-200 bg-emerald-50',
  }
  return (
    <div className={`rounded-md border p-3 ${cls[color]}`}>
      <p className="text-xs uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand">{value}</p>
    </div>
  )
}
