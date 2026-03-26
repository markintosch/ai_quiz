'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export default function NewThemePage() {
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    editorial_intro: '',
    linked_episode_url: '',
    presub_open_at: '',
    presub_close_at: '',
    opens_at: '',
    closes_at: '',
    disclaimer_text: '',
    published: false,
  })

  const [slugEdited, setSlugEdited] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugEdited ? prev.slug : slugify(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/pulse/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = (await res.json()) as { theme?: { id: string }; error?: string }
      if (!res.ok) {
        setError(json.error ?? 'Er ging iets mis.')
        setSubmitting(false)
        return
      }
      router.push(`/admin/pulse/themes/${json.theme!.id}`)
    } catch {
      setError('Er ging iets mis.')
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/pulse" className="text-gray-500 hover:text-gray-700 text-sm">
          ← Pulse
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Nieuw thema</h1>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div>
          <label className={labelCls}>Titel *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={inputCls}
            placeholder="bijv. Nederlandse Festivals 2026"
          />
        </div>

        <div>
          <label className={labelCls}>Slug *</label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => {
              setSlugEdited(true)
              setForm((prev) => ({ ...prev, slug: e.target.value }))
            }}
            className={inputCls}
            placeholder="bijv. festivals-2026"
          />
          <p className="text-xs text-gray-400 mt-1">URL: /pulse/{form.slug || '...'}</p>
        </div>

        <div>
          <label className={labelCls}>Beschrijving</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Redactionele intro</label>
          <textarea
            value={form.editorial_intro}
            onChange={(e) => setForm((prev) => ({ ...prev, editorial_intro: e.target.value }))}
            rows={4}
            className={inputCls}
            placeholder="Editoriale toelichting bij het thema..."
          />
        </div>

        <div>
          <label className={labelCls}>Gekoppelde aflevering URL</label>
          <input
            type="url"
            value={form.linked_episode_url}
            onChange={(e) => setForm((prev) => ({ ...prev, linked_episode_url: e.target.value }))}
            className={inputCls}
            placeholder="https://3voor12.vpro.nl/..."
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Fasering</h2>
          <div className="grid grid-cols-2 gap-4">
            {([
              ['presub_open_at', 'Suggesties openen'],
              ['presub_close_at', 'Suggesties sluiten'],
              ['opens_at', 'Meting opent'],
              ['closes_at', 'Meting sluit'],
            ] as [keyof typeof form, string][]).map(([key, label]) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input
                  type="datetime-local"
                  value={form[key] as string}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Disclaimer tekst</label>
          <textarea
            value={form.disclaimer_text}
            onChange={(e) => setForm((prev) => ({ ...prev, disclaimer_text: e.target.value }))}
            rows={2}
            className={inputCls}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={form.published}
            onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
            className="w-4 h-4"
          />
          <label htmlFor="published" className="text-sm text-gray-700">
            Direct publiceren (zichtbaar voor bezoekers)
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Opslaan...' : 'Thema aanmaken →'}
          </button>
          <Link
            href="/admin/pulse"
            className="px-6 py-2 border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
          >
            Annuleer
          </Link>
        </div>
      </form>
    </div>
  )
}
