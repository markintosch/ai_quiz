'use client'

import { useState } from 'react'

interface QaChatProps {
  sessionId: string
  initialHistory: Array<{ question: string; answer: string; created_at?: string }>
}

export default function QaChat({ sessionId, initialHistory }: QaChatProps) {
  const [history, setHistory] = useState(initialHistory)
  const [question, setQuestion] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (question.trim().length < 2) return
    const q = question.trim()
    setPending(true)
    setQuestion('')
    // Optimistic add
    setHistory(prev => [...prev, { question: q, answer: '…' }])
    try {
      const res = await fetch(`/api/atelier/session/${sessionId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      setHistory(prev => {
        const next = [...prev]
        next[next.length - 1] = { question: q, answer: json.answer }
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Q&A mislukt.')
      // Remove the failed turn from optimistic state
      setHistory(prev => prev.slice(0, -1))
      setQuestion(q)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mb-10">
      <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase mb-4">Vraag door over deze sessie</h2>

      {history.length > 0 && (
        <div className="space-y-4 mb-4">
          {history.map((t, i) => (
            <div key={i}>
              <div className="rounded-2xl bg-brand-dark/5 border border-brand-dark/10 px-4 py-3 mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/70 mb-1">Jij</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{t.question}</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-accent mb-1">Atelier</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{t.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">{error}</div>
      )}

      <form onSubmit={handleAsk} className="flex gap-2">
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="bv. Maak route 2 scherper · Welke ICP-trigger is het sterkst? · Wat ontbreekt nog?"
          rows={2}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || question.trim().length < 2}
          className="self-end bg-brand-dark text-white font-semibold px-5 py-3 rounded-xl hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? '…' : 'Vraag'}
        </button>
      </form>
      <p className="text-xs text-slate-500 mt-2">
        Antwoorden worden opgeslagen — komt straks ook in je session-history terug.
      </p>
    </section>
  )
}
