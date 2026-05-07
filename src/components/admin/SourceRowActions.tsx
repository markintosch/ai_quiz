'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  sourceId:        string
  active:          boolean
  isSystem:        boolean
  hasUrl?:         boolean       // crawl button only useful when source has a URL
  lastCrawledAt?:  string | null
  lastCrawlStatus?: string | null
  lastCrawlPages?: number | null
  lastCrawlErrors?: number | null
}

function freshnessLabel(iso: string | null | undefined): string {
  if (!iso) return 'nog niet gecrawld'
  const ageMs    = Date.now() - new Date(iso).getTime()
  const ageHours = ageMs / (1000 * 60 * 60)
  if (ageHours < 1)  return '< 1u geleden'
  if (ageHours < 24) return `${Math.round(ageHours)}u geleden`
  const days = Math.round(ageHours / 24)
  return `${days} dag${days === 1 ? '' : 'en'} geleden`
}

const STATUS_PILL: Record<string, string> = {
  ok:        'bg-green-100 text-green-900',
  partial:   'bg-amber-100 text-amber-900',
  failed:    'bg-red-100 text-red-900',
  paywalled: 'bg-stone-100 text-stone-700',
  crawling:  'bg-sky-100 text-sky-900',
}

export default function SourceRowActions({
  sourceId, active, isSystem,
  hasUrl, lastCrawledAt, lastCrawlStatus, lastCrawlPages, lastCrawlErrors,
}: Props) {
  const router = useRouter()
  const [busy, setBusy]     = useState(false)
  const [crawling, setCrawling] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function patch(body: object) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/atelier/sources/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update mislukt.')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm('Weet je zeker dat je deze bron wil verwijderen?')) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/atelier/sources/${sourceId}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete mislukt.')
    } finally {
      setBusy(false)
    }
  }

  async function crawl() {
    setBusy(true)
    setCrawling(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/atelier/sources/${sourceId}/crawl`, { method: 'POST' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      // Crawl runs in background — schedule a refresh after ~30s so the
      // freshness pill picks up the new last_crawled_at.
      setTimeout(() => { router.refresh(); setCrawling(false) }, 30_000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crawl mislukt.')
      setCrawling(false)
    } finally {
      setBusy(false)
    }
  }

  const statusKey = crawling ? 'crawling' : (lastCrawlStatus ?? '')
  const statusPillClass = STATUS_PILL[statusKey] ?? 'bg-stone-100 text-stone-700'

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => patch({ active: !active })}
        disabled={busy}
        className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded transition-colors disabled:opacity-50 ${
          active ? 'bg-green-50 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {active ? '✓ Active' : '○ Inactive'}
      </button>
      {hasUrl && (
        <>
          <button
            onClick={crawl}
            disabled={busy || crawling}
            className="text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded bg-sky-50 text-sky-800 hover:bg-sky-100 disabled:opacity-50"
            title={`Laatst: ${freshnessLabel(lastCrawledAt)}`}
          >
            {crawling ? '⟳ Crawling…' : '↻ Crawl now'}
          </button>
          {(lastCrawledAt || crawling) && (
            <div className="flex flex-col gap-0.5 mt-0.5">
              {lastCrawlStatus && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded text-center ${statusPillClass}`}>
                  {statusKey}
                </span>
              )}
              <p className="text-[10px] text-gray-500 text-center">
                {freshnessLabel(lastCrawledAt)}
                {(lastCrawlPages ?? 0) > 0 && <> · {lastCrawlPages}p</>}
                {(lastCrawlErrors ?? 0) > 0 && <> · {lastCrawlErrors}e</>}
              </p>
            </div>
          )}
        </>
      )}
      {!isSystem && (
        <button
          onClick={remove}
          disabled={busy}
          className="text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          Delete
        </button>
      )}
      {error && <p className="text-[11px] text-red-700">{error}</p>}
    </div>
  )
}
