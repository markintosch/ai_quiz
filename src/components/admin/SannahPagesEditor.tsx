'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { PageKey, SannahPage, SannahPageImage } from '@/lib/sannah/types'
import { publicImageUrl } from '@/lib/sannah/types'

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

          {/* ── Image uploader (geldt voor zowel NL als EN) ─────────── */}
          <PageImagesEditor
            page={page}
            onUpdate={imgs => update(page.page_key, { images: imgs })}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Per-page image uploader (taal-onafhankelijk) ──────────────────────────

function PageImagesEditor({ page, onUpdate }: {
  page: SannahPage
  onUpdate: (images: SannahPageImage[]) => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const images = page.images ?? []

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return
    setBusy(true); setError(null)
    try {
      let nextImages = [...images]
      for (const f of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', f)
        const res = await fetch(`/api/admin/sannah/pages/${page.page_key}/images`, {
          method: 'POST',
          body: fd,
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || `HTTP ${res.status}`)
        }
        const body = await res.json()
        nextImages = body.images ?? nextImages
      }
      onUpdate(nextImages)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload mislukt.')
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function remove(path: string) {
    if (!confirm('Foto verwijderen?')) return
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/admin/sannah/pages/${page.page_key}/images?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const body = await res.json()
      onUpdate(body.images ?? images.filter(i => i.path !== path))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verwijderen mislukt.')
    } finally { setBusy(false) }
  }

  return (
    <div className="mt-6 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
            Foto&apos;s op deze pagina
            <span className="ml-2 font-normal text-slate-500 normal-case">
              {images.length} / 6 · taal-onafhankelijk
            </span>
          </h4>
          <p className="text-xs text-slate-500 italic mt-0.5">
            Worden naast de tekst getoond (rechts op desktop). Maakt de pagina persoonlijker.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={e => upload(e.target.files)}
          disabled={busy || images.length >= 6}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy || images.length >= 6}
          className="bg-white border border-slate-300 text-brand-dark font-semibold px-3 py-1.5 rounded-full text-xs hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? 'Bezig...' : '+ Foto uploaden'}
        </button>
      </div>

      {error && <p className="text-xs text-red-700 mb-2">{error}</p>}

      {images.length === 0 ? (
        <p className="text-sm text-slate-500 italic">Geen foto&apos;s — optioneel.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {images.map(img => (
            <div key={img.path} className="relative w-32 h-32 rounded-lg overflow-hidden bg-slate-100 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicImageUrl(img.path)} alt={img.alt ?? ''} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(img.path)}
                disabled={busy}
                className="absolute top-1 right-1 bg-white/90 hover:bg-white text-red-700 text-xs font-semibold px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Verwijder
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
