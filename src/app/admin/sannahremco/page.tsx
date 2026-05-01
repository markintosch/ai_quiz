// FILE: src/app/admin/sannahremco/page.tsx
// Admin overview of all submissions to /SannahRemco.
// Generates 7-day signed URLs for any uploaded files server-side
// (bucket is private). Service-role client bypasses RLS.

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface Upload {
  path:     string
  filename: string
  size:     number
  mime:     string
}

interface BriefingRow {
  id:            string
  briefing_type: 'sannah_portfolio' | 'remco_presence'
  name:          string | null
  email:         string | null
  payload:       Record<string, unknown>
  uploads:       Upload[]
  created_at:    string
}

const BUCKET = 'sannahremco-uploads'

async function getBriefings(): Promise<{ rows: BriefingRow[]; signedUrls: Record<string, string> }> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('briefings')
    .select('id, briefing_type, name, email, payload, uploads, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/sannahremco] fetch', error)
    return { rows: [], signedUrls: {} }
  }
  const rows = (data ?? []) as BriefingRow[]

  // Sign every uploaded file's path (1 week)
  const signedUrls: Record<string, string> = {}
  const allPaths = rows.flatMap(r => (r.uploads ?? []).map(u => u.path)).filter(Boolean)
  if (allPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(allPaths, 60 * 60 * 24 * 7)
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl) signedUrls[item.path] = item.signedUrl
    }
  }
  return { rows, signedUrls }
}

export default async function AdminSannahRemcoPage() {
  const { rows, signedUrls } = await getBriefings()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark">Sannah &amp; Remco — briefings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Inzendingen van <Link href="/SannahRemco" className="text-brand-accent underline" target="_blank">/SannahRemco</Link>.
          Bucket is privé — bestanden worden via 7-daagse signed URL geserveerd.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-6 py-12 text-center">
          <p className="text-sm text-gray-600">Nog geen inzendingen.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rows.map(row => (
            <BriefingCard key={row.id} row={row} signedUrls={signedUrls} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Briefing card ─────────────────────────────────────────────────────────
function BriefingCard({ row, signedUrls }: { row: BriefingRow; signedUrls: Record<string, string> }) {
  const isPortfolio = row.briefing_type === 'sannah_portfolio'
  const dt = new Date(row.created_at).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <article className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <header className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
            isPortfolio ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
          }`}>
            {isPortfolio ? 'Sannah · Portfolio' : 'Remco · Online Presence'}
          </span>
          <h2 className="mt-2 text-lg font-bold text-brand-dark">
            {row.name || '— geen naam —'}
          </h2>
          <p className="text-sm text-gray-600">{row.email || '— geen e-mail —'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{dt}</p>
        </div>
      </header>

      <div className="px-6 py-5 space-y-5">
        {/* Payload */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">Antwoorden</h3>
          <dl className="divide-y divide-gray-100">
            {Object.entries(row.payload || {}).map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-3 py-2 text-sm">
                <dt className="text-gray-600 font-mono text-xs">{k}</dt>
                <dd className="col-span-2 text-gray-900 whitespace-pre-wrap break-words">
                  {formatValue(v)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Uploads */}
        {row.uploads && row.uploads.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">
              Bestanden ({row.uploads.length})
            </h3>
            <ul className="space-y-1">
              {row.uploads.map((u, idx) => {
                const url = signedUrls[u.path]
                return (
                  <li key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm">
                    <span className="truncate flex-1 mr-3">{u.filename}</span>
                    <span className="text-xs text-gray-500 mr-3">{Math.round(u.size / 1024)} KB</span>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-accent hover:underline text-xs font-semibold"
                      >
                        Open ↗
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Geen URL</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </article>
  )
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) {
    if (v.length === 0) return '—'
    if (typeof v[0] === 'string') return (v as string[]).join(', ')
    return JSON.stringify(v, null, 2)
  }
  if (typeof v === 'object') return JSON.stringify(v, null, 2)
  return String(v)
}
