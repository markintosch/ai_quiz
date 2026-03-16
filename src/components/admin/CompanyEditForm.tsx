// FILE: src/components/admin/CompanyEditForm.tsx
'use client'

import { useState } from 'react'
import { QUESTIONS } from '@/data/questions'

const DIMENSION_LABELS: Record<string, string> = {
  strategy_vision: 'Strategy & Vision',
  current_usage: 'Current Usage',
  data_readiness: 'Data Readiness',
  talent_culture: 'Talent & Culture',
  governance_risk: 'Governance & Risk',
  opportunity_awareness: 'Opportunity Awareness',
}

const FULL_ONLY_QUESTIONS = QUESTIONS.filter((q) => !q.lite)
const GROUPED = FULL_ONLY_QUESTIONS.reduce<Record<string, typeof FULL_ONLY_QUESTIONS>>((acc, q) => {
  if (!acc[q.dimension]) acc[q.dimension] = []
  acc[q.dimension].push(q)
  return acc
}, {})

interface ProductOption {
  id: string
  key: string
  name: string
}

interface Company {
  id: string
  name: string
  slug: string
  logo_url: string | null
  active: boolean
  brand_color?: string | null
  welcome_message?: string | null
  excluded_question_codes?: string[] | null
  product_id?: string | null
}

interface CompanyEditFormProps {
  company: Company
  products?: ProductOption[]
}

export default function CompanyEditForm({ company, products = [] }: CompanyEditFormProps) {
  const [name, setName] = useState(company.name)
  const [slug, setSlug] = useState(company.slug)
  const [logoUrl, setLogoUrl] = useState(company.logo_url ?? '')
  const [active, setActive] = useState(company.active)
  const [brandColor, setBrandColor] = useState(company.brand_color ?? '#E8611A')
  const [welcomeMessage, setWelcomeMessage] = useState(company.welcome_message ?? '')
  const [productId, setProductId] = useState(company.product_id ?? '')
  const [excluded, setExcluded] = useState<Set<string>>(
    new Set(company.excluded_question_codes ?? [])
  )
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function toggleQuestion(code: string) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          logo_url: logoUrl.trim() || null,
          active,
          brand_color: brandColor,
          welcome_message: welcomeMessage.trim() || null,
          excluded_question_codes: Array.from(excluded),
          product_id: productId || null,
        }),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Failed to update company.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const includedCount = FULL_ONLY_QUESTIONS.length - excluded.size

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-sm">/quiz/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            required
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Logo URL <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <input
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      {/* Product assignment */}
      {products.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assessment product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white"
          >
            <option value="">— Not assigned —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Branding */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Branding</p>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <p className="text-sm text-gray-700">Accent colour</p>
            <p className="text-xs text-gray-500">Used on CTA buttons in the assessment</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200"
            />
            <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Welcome message <span className="text-gray-500 text-xs">(optional — shown above the assessment)</span>
          </label>
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            rows={3}
            placeholder="e.g. Welcome to the Acme Corp AI readiness assessment. This takes about 15 minutes…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none"
          />
        </div>
      </div>

      {/* Question selection */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-gray-700">Custom question set</p>
          <span className="text-xs text-gray-500">
            {includedCount}/{FULL_ONLY_QUESTIONS.length} full questions included
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          The 7 lite questions are always included. Uncheck any to skip them in the full assessment.
        </p>

        <div className="space-y-4">
          {Object.entries(GROUPED).map(([dim, qs]) => (
            <div key={dim}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
                {DIMENSION_LABELS[dim] ?? dim}
              </p>
              <div className="space-y-1.5">
                {qs.map((q) => (
                  <label key={q.code} className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!excluded.has(q.code)}
                      onChange={() => toggleQuestion(q.code)}
                      className="mt-0.5 w-4 h-4 accent-brand-accent flex-shrink-0"
                    />
                    <span className={`text-xs leading-relaxed ${excluded.has(q.code) ? 'text-gray-300 line-through' : 'text-gray-600'}`}>
                      <span className="font-mono text-gray-400 mr-1">{q.code}</span>
                      {q.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active */}
      <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
        <input
          id="edit-active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="w-4 h-4 accent-brand-accent"
        />
        <label htmlFor="edit-active" className="text-sm font-medium text-gray-700">
          Active (assessment accessible at /quiz/{slug})
        </label>
      </div>

      {error && <p className="text-brand-accent text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">Changes saved successfully.</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-brand-accent hover:bg-red-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
      >
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
