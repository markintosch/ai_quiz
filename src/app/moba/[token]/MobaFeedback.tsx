'use client'

import { useState } from 'react'

// Feedback free-field shown at the end of the demo walk-through, so the
// evaluator (opdrachtgever) can say what's missing or should change.
export function MobaFeedback() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send() {
    if (!message.trim()) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/moba/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error ?? 'Versturen mislukt')
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Versturen mislukt')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
          <span className="text-xl">✓</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Dank je wel</h3>
        <p className="text-sm text-gray-600">Je feedback is doorgestuurd naar Mark.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-accent mb-1">Jouw reactie</p>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Wat vind je hiervan?</h3>
      <p className="text-sm text-gray-500 mb-4">
        Welke thema's mis je, of wat zou anders moeten? Een paar zinnen is genoeg. Dit gaat
        rechtstreeks naar Mark.
      </p>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={4}
        maxLength={4000}
        placeholder="Bijv. 'Ik zou ook iets over prijsstrategie willen toevoegen' of 'thema 3 en 5 overlappen wat mij betreft'…"
        className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent placeholder-gray-400"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={send}
        disabled={sending || !message.trim()}
        className="mt-4 px-6 py-2.5 bg-brand-accent text-white font-semibold rounded-xl disabled:opacity-40 hover:bg-orange-700 transition-all"
      >
        {sending ? 'Versturen…' : 'Verstuur feedback'}
      </button>
    </div>
  )
}
