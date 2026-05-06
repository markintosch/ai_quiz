'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PageKey, SannahPage } from '@/lib/sannah/types'

const PAGE_LABELS: Record<PageKey, string> = {
  homepage: 'Homepage intro',
  over_mij: 'Over mij',
  cv:       'CV',
  contact:  'Contact',
}

const PAGE_HINTS: Record<PageKey, string> = {
  homepage: 'Korte intro-tekst boven het werk-overzicht. 1-2 zinnen werkt het beste.',
  over_mij: 'Over jou als beeldend vormgever. Markdown kan: ## kop, - lijst, [link](url).',
  cv:       'CV met opleiding, exposities, publicaties. Gebruik ## voor secties.',
  contact:  'E-mail, social, adres. Markdown kan voor links.',
}

interface Props {
  pages: SannahPage[]
}

export default function SannahPagesEditor({ pages: initial }: Props) {
  const router = useRouter()
  const [pages, setPages] = useState(initial)
  const [openKey, setOpenKey] = useState<PageKey | null>(initial[0]?.page_key ?? null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(key: PageKey, patch: Partial<SannahPage>) {
    setPages(prev => prev.map(p => p.page_key === key ? { ...p, ...patch } : p))
  }

  async function saveDraft(page: SannahPage) {
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/admin/sannah/pages/${page.page_key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_body_nl: page.draft_body_nl,
          draft_body_en: page.draft_body_en,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save mislukt.')
    } finally { setBusy(false) }
  }

  async function publish(page: SannahPage) {
    if (!confirm('Concept wordt nu de live tekst op de openbare site. Doorgaan?')) return
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/admin/sannah/pages/${page.page_key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_body_nl: page.draft_body_nl,
          draft_body_en: page.draft_body_en,
          publish: true,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      update(page.page_key, { body_nl: page.draft_body_nl ?? null, body_en: page.draft_body_en ?? null })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish mislukt.')
    } finally { setBusy(false) }
  }

  return (
    <div>
      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">{error}</div>}

      <div className="flex gap-2 mb-4 border-b border-slate-200">
        {pages.map(p => {
          const dirty = (p.draft_body_nl ?? '') !== (p.body_nl ?? '') || (p.draft_body_en ?? '') !== (p.body_en ?? '')
          return (
            <button key={p.page_key} onClick={() => setOpenKey(p.page_key)}
              className={`text-sm font-semibold px-3 py-2 -mb-px border-b-2 transition-colors ${
                openKey === p.page_key
                  ? 'border-brand-accent text-brand-dark'
                  : 'border-transparent text-slate-600 hover:text-brand-dark'
              }`}>
              {PAGE_LABELS[p.page_key]}
              {dirty && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-amber-500" title="Concept verschilt van live" />}
            </button>
          )
        })}
      </div>

      {pages.filter(p => p.page_key === openKey).map(page => (
        <div key={page.page_key} className="space-y-4">
          <p className="text-xs text-slate-500 italic">{PAGE_HINTS[page.page_key]}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Concept · Nederlands</label>
              <textarea
                value={page.draft_body_nl ?? ''}
                onChange={e => update(page.page_key, { draft_body_nl: e.target.value })}
                rows={14}
                placeholder="Schrijf hier..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Concept · English</label>
              <textarea
                value={page.draft_body_en ?? ''}
                onChange={e => update(page.page_key, { draft_body_en: e.target.value })}
                rows={14}
                placeholder="Optional EN version. Empty = falls back to NL on EN site."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button onClick={() => saveDraft(page)} disabled={busy}
              className="bg-white border border-slate-300 text-brand-dark font-semibold px-4 py-2 rounded-full text-sm hover:bg-slate-50 disabled:opacity-50">
              Concept opslaan
            </button>
            <button onClick={() => publish(page)} disabled={busy}
              className="bg-brand-dark text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-brand-accent transition-colors disabled:opacity-50">
              Publiceren →
            </button>
            <span className="text-xs text-slate-500 ml-3">
              {(page.draft_body_nl ?? '') !== (page.body_nl ?? '') || (page.draft_body_en ?? '') !== (page.body_en ?? '')
                ? 'Concept is anders dan live versie.'
                : 'Concept is gelijk aan live versie.'}
            </span>
          </div>

          {(page.body_nl || page.body_en) && (
            <details className="mt-6">
              <summary className="text-xs font-semibold text-slate-600 cursor-pointer">Live versie tonen (alleen-lezen)</summary>
              <div className="mt-2 grid md:grid-cols-2 gap-4 text-xs font-mono text-slate-600">
                <pre className="p-3 rounded-lg bg-slate-50 border border-slate-200 whitespace-pre-wrap">{page.body_nl ?? '(leeg)'}</pre>
                <pre className="p-3 rounded-lg bg-slate-50 border border-slate-200 whitespace-pre-wrap">{page.body_en ?? '(leeg)'}</pre>
              </div>
            </details>
          )}
        </div>
      ))}
    </div>
  )
}
