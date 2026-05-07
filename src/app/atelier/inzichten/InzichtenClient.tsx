// FILE: src/app/atelier/inzichten/InzichtenClient.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Client component for the Inzichten tab. Receives the available ICPs from
// the server wrapper (page.tsx) so the user can pick one as audience-context
// for the keyword-driven card generation.

'use client'

import { useState } from 'react'

export interface IcpOption {
  id:               string
  label:            string  // human-readable: "Industry · Role" or request_keywords
  business_type:    string | null
  is_starter:       boolean
}

interface Props {
  icpOptions: IcpOption[]
}

interface InsightCard {
  headline:       string
  body:           string
  confidence:     'observed' | 'web' | 'inferred'
  evidence_label: string | null
  evidence_url:   string | null
}

interface ApiResponse {
  keywords: string
  cards:    InsightCard[]
  meta: {
    retrieved_count: number
    used_web_search: boolean
    latency_ms:      number
    icp_used:        string | null
  }
}

const CONFIDENCE_STYLE: Record<InsightCard['confidence'], { label: string; bg: string; text: string }> = {
  observed: { label: 'Uit eigen sessies',     bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-900' },
  web:      { label: 'Web-bron',              bg: 'bg-sky-50 border-sky-200',         text: 'text-sky-900' },
  inferred: { label: 'Atelier-synthese',      bg: 'bg-amber-50 border-amber-200',     text: 'text-amber-900' },
}

const CONF_PILL: Record<InsightCard['confidence'], string> = {
  observed: 'bg-emerald-100 text-emerald-900',
  web:      'bg-sky-100 text-sky-900',
  inferred: 'bg-amber-100 text-amber-900',
}

export default function InzichtenClient({ icpOptions }: Props) {
  const [keywords, setKeywords] = useState('')
  const [icpId, setIcpId]       = useState<string>('')   // '' = no ICP context
  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState('')
  const [data, setData]         = useState<ApiResponse | null>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (busy || keywords.trim().length < 2) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/atelier/insights/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          keywords: keywords.trim(),
          icpId:    icpId || undefined,
        }),
      })
      const json = await res.json() as ApiResponse | { error?: string }
      if (!res.ok || !('cards' in json)) {
        setError((json as { error?: string }).error || 'Inzichten konden niet gegenereerd worden.')
        setData(null)
      } else {
        setData(json)
      }
    } catch {
      setError('Er ging iets mis. Probeer over een minuut opnieuw.')
    } finally {
      setBusy(false)
    }
  }

  const selectedIcp = icpOptions.find(o => o.id === icpId) ?? null

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Inzichten</h1>
          <p className="text-slate-600">
            Vul keywords in (bv. <em>&quot;Gen Z duurzaamheid&quot;</em>) en krijg 10–15 &quot;wist je dat&quot;-cards. Optioneel: kies een ICP zodat de cards specifiek voor die doelgroep worden geframed. Elke card vertelt waar de claim vandaan komt.
          </p>
        </header>

        {/* Input */}
        <form onSubmit={handleGenerate} className="mb-8 space-y-3">
          {/* ICP context selector */}
          {icpOptions.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Doelgroep-context (optioneel)
              </label>
              <select
                value={icpId}
                onChange={e => setIcpId(e.target.value)}
                disabled={busy}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 bg-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
              >
                <option value="">— Geen ICP, alleen keywords —</option>
                {icpOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                    {opt.business_type ? ` · ${opt.business_type.toUpperCase()}` : ''}
                    {opt.is_starter ? ' · starter' : ''}
                  </option>
                ))}
              </select>
              {selectedIcp && (
                <p className="mt-1 text-xs text-slate-500">
                  Cards worden gegrond op &quot;{selectedIcp.label}&quot; en zijn pijnpunten/triggers/jobs.
                </p>
              )}
            </div>
          )}

          {/* Keywords */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Keywords
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="Bv. duurzaamheid mainstream consumer fitness"
                maxLength={200}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-base focus:outline-none focus:border-brand-accent transition-colors"
                disabled={busy}
              />
              <button
                type="submit"
                disabled={busy || keywords.trim().length < 2}
                className="px-6 py-3 rounded-xl bg-brand-dark text-white font-semibold hover:bg-brand-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {busy ? 'Bezig…' : 'Genereer inzichten →'}
              </button>
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          {busy && (
            <p className="mt-2 text-sm text-slate-500 italic">
              Doorzoekt eigen sessies en het web. Eén ronde duurt typisch 30–80 seconden.
            </p>
          )}
        </form>

        {/* Results meta */}
        {data && (
          <div className="mb-6 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
            <span>
              <strong className="text-brand-dark">{data.cards.length} cards</strong> voor{' '}
              <strong className="text-brand-dark">&quot;{data.keywords}&quot;</strong>
              {data.meta.icp_used && <> · gegrond op ICP <strong className="text-brand-dark">{data.meta.icp_used}</strong></>}
            </span>
            <span>
              {data.meta.retrieved_count} corpus-treffers · {data.meta.used_web_search ? 'web-search aan' : 'web-search niet beschikbaar'} · {(data.meta.latency_ms / 1000).toFixed(1)}s
            </span>
          </div>
        )}

        {/* Cards */}
        {data && (
          <div className="grid gap-4 md:grid-cols-2">
            {data.cards.map((card, i) => {
              const style = CONFIDENCE_STYLE[card.confidence]
              const pill  = CONF_PILL[card.confidence]
              return (
                <article key={i} className={`rounded-2xl border ${style.bg} p-5`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Wist je dat
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${pill}`}>
                      {style.label}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold leading-snug mb-2 ${style.text}`}>
                    {card.headline}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    {card.body}
                  </p>
                  {(card.evidence_label || card.evidence_url) && (
                    <p className="text-xs text-slate-500 pt-3 border-t border-stone-200/70">
                      bron:{' '}
                      {card.evidence_url ? (
                        <a href={card.evidence_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent underline">
                          {card.evidence_label || card.evidence_url} ↗
                        </a>
                      ) : (
                        <span>{card.evidence_label}</span>
                      )}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {!data && !busy && !error && (
          <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center">
            <p className="text-slate-600 mb-1">Nog geen inzichten gegenereerd.</p>
            <p className="text-xs text-slate-500">
              Tip: hoe specifieker je keywords, hoe scherper de cards. <em>&quot;Gen Z&quot;</em> is goed; <em>&quot;Gen Z fitness Nederland 2025&quot;</em> nog beter. Plus: kies een ICP voor doelgroep-context.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
