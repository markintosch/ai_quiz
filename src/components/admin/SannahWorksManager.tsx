'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { SannahWork } from '@/lib/sannah/types'
import { publicImageUrl } from '@/lib/sannah/types'

interface Props {
  works: SannahWork[]
}

export default function SannahWorksManager({ works: initial }: Props) {
  const router = useRouter()
  const [works, setWorks] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setBusy(true)
    setError(null)
    try {
      for (const f of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', f)
        const res = await fetch('/api/admin/sannah/works', { method: 'POST', body: fd })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || `HTTP ${res.status}`)
        }
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload mislukt.')
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function patchWork(id: string, body: object) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/sannah/works/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      // Optimistic local state update for immediate UI feedback
      setWorks(prev => prev.map(w => w.id === id ? { ...w, ...body } as SannahWork : w))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update mislukt.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteWork(id: string) {
    if (!confirm('Werk verwijderen? Ook de afbeelding wordt verwijderd. Niet ongedaan te maken.')) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/sannah/works/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setWorks(prev => prev.filter(w => w.id !== id))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete mislukt.')
    } finally {
      setBusy(false)
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = works.findIndex(w => w.id === id)
    if (idx === -1) return
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= works.length) return
    const next = [...works]
    ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
    setWorks(next)
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/sannah/works/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: next.map(w => w.id) }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Volgorde wijzigen mislukt.')
      setWorks(initial)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={e => handleUpload(e.target.files)}
          disabled={busy}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="bg-brand-dark text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          {busy ? 'Bezig...' : '+ Werk uploaden'}
        </button>
        <p className="mt-3 text-xs text-slate-500">
          Meerdere foto&rsquo;s tegelijk kan. PNG / JPG / WebP / HEIC. Max 20 MB per stuk. Nieuwe werken zijn standaard verborgen — zet ze op &ldquo;Gepubliceerd&rdquo; om ze live te tonen.
        </p>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">{error}</div>}

      {works.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 border border-gray-200 px-6 py-12 text-center">
          <p className="text-sm text-gray-600">Nog geen werken — upload de eerste hierboven.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {works.map((w, i) => (
            <li key={w.id} className="rounded-2xl bg-white border border-slate-200 p-4 grid sm:grid-cols-[120px_1fr_auto] gap-4 items-start">
              <div className="w-[120px] h-[120px] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={publicImageUrl(w.image_path)} alt={w.title ?? ''} className="max-w-full max-h-full object-contain" />
              </div>

              <div className="space-y-2">
                <div className="grid sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    defaultValue={w.title ?? ''}
                    placeholder="Titel"
                    onBlur={e => e.target.value !== (w.title ?? '') && patchWork(w.id, { title: e.target.value || null })}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-accent focus:outline-none"
                  />
                  <input
                    type="text"
                    defaultValue={w.year ?? ''}
                    placeholder="Jaar (bv. 2024)"
                    onBlur={e => e.target.value !== (w.year ?? '') && patchWork(w.id, { year: e.target.value || null })}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-accent focus:outline-none"
                  />
                  <input
                    type="text"
                    defaultValue={w.medium ?? ''}
                    placeholder="Medium (bv. acrylverf op linnen)"
                    onBlur={e => e.target.value !== (w.medium ?? '') && patchWork(w.id, { medium: e.target.value || null })}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-accent focus:outline-none"
                  />
                </div>
                <textarea
                  defaultValue={w.description ?? ''}
                  placeholder="Korte beschrijving (optioneel)"
                  rows={2}
                  onBlur={e => e.target.value !== (w.description ?? '') && patchWork(w.id, { description: e.target.value || null })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-accent focus:outline-none"
                />
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <button
                    onClick={() => patchWork(w.id, { is_published: !w.is_published })}
                    disabled={busy}
                    className={`font-semibold px-3 py-1 rounded-full transition-colors ${
                      w.is_published ? 'bg-green-100 text-green-900 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {w.is_published ? '✓ Gepubliceerd' : '○ Concept'}
                  </button>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">positie {i + 1} van {works.length}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <button onClick={() => move(w.id, -1)} disabled={busy || i === 0}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30">↑</button>
                <button onClick={() => move(w.id, 1)} disabled={busy || i === works.length - 1}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30">↓</button>
                <button onClick={() => deleteWork(w.id)} disabled={busy}
                  className="mt-1 px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50">Verwijder</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
