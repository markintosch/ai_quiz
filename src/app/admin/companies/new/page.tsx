// FILE: src/app/admin/companies/new/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NewCompanyPage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(value: string) {
    setName(value)
    setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          logo_url: logoUrl.trim() || null,
          active,
        }),
      })

      if (res.ok) {
        window.location.href = '/admin/companies'
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to create company.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/companies" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Companies
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">New Company</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name <span className="text-brand-accent">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="Acme Corp"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-brand-accent">*</span>
          </label>
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm">/quiz/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              required
              placeholder="acme-corp"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo URL <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 accent-brand-accent"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Active (quiz accessible at /quiz/[slug])
          </label>
        </div>

        {error && (
          <p className="text-brand-accent text-sm">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand-accent hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Creating…' : 'Create Company'}
          </button>
          <Link
            href="/admin/companies"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
